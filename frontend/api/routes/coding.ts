import express, { Response } from 'express';
import { store } from '../_lib/store_mongo';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { executeCode } from '../services/codeRunner';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'prepverse_super_secret_jwt_key_2026';

// Helper to check if request has admin/instructor privileges optionally
function checkPrivilegedUser(req: express.Request): { id: string; role: string } | null {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    if (decoded.role === 'ADMIN' || decoded.role === 'INSTRUCTOR') {
      return decoded;
    }
  } catch (e) {}
  return null;
}

// ─── LIST ALL CODING PROBLEMS ───────────────────────────────────────────────
router.get('/problems', async (req, res) => {
  const { topic, difficulty, search, status } = req.query;
  
  // Determine if caller is privileged
  const caller = checkPrivilegedUser(req);
  const statusFilter = (caller && status === 'all') ? 'all' : 'published';

  const problems = await store.getCodingProblems({
    topic: topic as string,
    difficulty: difficulty as string,
    search: search as string,
    status: statusFilter
  });

  // Return safe public views (strip solutions and hidden test case details)
  const safeProblems = problems.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    difficulty: p.difficulty,
    topic: p.topic,
    acceptanceRate: p.acceptanceRate,
    status: p.status,
    totalTestCases: p.testCases.length
  }));

  res.json({ problems: safeProblems });
});

// ─── GET PROBLEM DETAILS (STUDENT FACE) ──────────────────────────────────────
router.get('/problems/:idOrSlug', async (req, res) => {
  const problem = await store.getCodingProblemById((req.params.idOrSlug as string));
  if (!problem) {
    res.status(404).json({ error: 'Coding problem not found' });
    return;
  }

  // Double check: if it is draft/archived, only ADMIN/INSTRUCTOR can view it
  if (problem.status !== 'published') {
    const caller = checkPrivilegedUser(req);
    if (!caller) {
      res.status(403).json({ error: 'This coding problem is currently not available.' });
      return;
    }
  }

  // Filter only public test cases for the student
  const publicTestCases = problem.testCases.filter((tc: any) => !tc.isHidden);

  // Strip the privateSolution so it is never exposed in client JSON
  const { privateSolution, ...safeProblem } = problem;

  res.json({
    problem: {
      ...safeProblem,
      testCases: publicTestCases,
      totalTestCasesCount: problem.testCases.length
    }
  });
});

// ─── GET FULL DETAILS FOR EDITING (ADMIN / INSTRUCTOR ONLY) ──────────────────
router.get('/problems/:id/admin', authenticate, authorize(['ADMIN', 'INSTRUCTOR']), async (req: AuthRequest, res: Response): Promise<void> => {
  const problem = await store.getCodingProblemById((req.params.id as string));
  if (!problem) {
    res.status(404).json({ error: 'Coding problem not found' });
    return;
  }

  res.json({ problem });
});

// ─── RUN CODE AGAINST CUSTOM INPUT ──────────────────────────────────────────
router.post('/run', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { language, code, customInput } = req.body;

    if (!language || !code) {
      res.status(400).json({ error: 'Language and code are required' });
      return;
    }

    const result = await executeCode(language, code, customInput || '');
    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Execution error' });
  }
});

// ─── SUBMIT CODE AGAINST ALL TESTS (PUBLIC + HIDDEN) ────────────────────────
router.post('/problems/:id/submit', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { language, code } = req.body;
    const problem = await store.getCodingProblemById((req.params.id as string));

    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    if (!language || !code) {
      res.status(400).json({ error: 'Language and code are required' });
      return;
    }

    // Execute against all test cases (hidden + public)
    const result = await executeCode(language, code, undefined, problem.testCases);

    // If hidden test failed, customize message to strictly match requirements
    let displayMessage = '';
    if (result.status !== 'Accepted' && result.failedTestCase?.input === '[Hidden Test Case]') {
      displayMessage = 'Some hidden test cases failed.';
    }

    const submission = await store.saveSubmission({
      userId: req.user!.id,
      problemId: problem.id,
      language,
      code,
      status: result.status,
      runtimeMs: result.runtimeMs,
      memoryKb: result.memoryKb,
      passedTestCases: result.passedTestCases,
      totalTestCases: result.totalTestCases,
      failedTestCase: result.failedTestCase
    });

    await store.logAction({
      userId: req.user!.id,
      userName: req.user?.id || 'Student',
      role: req.user!.role,
      action: 'CODING_SUBMISSION',
      resourceType: 'CodingProblem',
      resourceId: problem.id,
      details: `Problem: ${problem.title}, Status: ${submission.status} (${submission.passedTestCases}/${submission.totalTestCases} passed)`
    });

    res.json({
      submission,
      result: {
        ...result,
        displayMessage: displayMessage || undefined
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Submission error' });
  }
});

// ─── GET SUBMISSION HISTORY ──────────────────────────────────────────────────
router.get('/submissions/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { problemId } = req.query;
  const submissions = await store.getUserSubmissions(req.user!.id, problemId as string);
  const enriched = await Promise.all(submissions.map(async (s: any) => {
    const p = await store.getCodingProblemById(s.problemId);
    return {
      ...s,
      problemTitle: p?.title || 'Unknown Problem'
    };
  }));

  res.json({ submissions: enriched });
});

// ─── CREATE CODING QUESTION (ADMIN / INSTRUCTOR) ─────────────────────────────
router.post('/problems', authenticate, authorize(['INSTRUCTOR', 'ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    title,
    description,
    inputFormat,
    outputFormat,
    constraints,
    examples,
    difficulty,
    topic,
    starterCode,
    privateSolution,
    testCases,
    status
  } = req.body;

  if (!title || !description || !testCases || testCases.length === 0) {
    res.status(400).json({ error: 'Title, description, and test cases are required' });
    return;
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const problem = await store.createCodingProblem({
    title,
    slug,
    description,
    inputFormat: inputFormat || '',
    outputFormat: outputFormat || '',
    constraints: constraints || [],
    examples: examples || [],
    difficulty: difficulty || 'Medium',
    topic: topic || 'Arrays',
    starterCode: starterCode || {
      python: '# Write your code here\n',
      cpp: '// Write your code here\n',
      java: '// Write your code here\n',
      javascript: '// Write your code here\n'
    },
    privateSolution: privateSolution || {
      python: '',
      cpp: '',
      java: '',
      javascript: ''
    },
    status: status || 'draft',
    testCases: testCases.map((tc: any, i: number) => ({
      id: `tc-${i + 1}`,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isHidden: Boolean(tc.isHidden),
      explanation: tc.explanation || ''
    }))
  });

  await store.logAction({
    userId: req.user!.id,
    userName: req.user?.id || 'Instructor',
    role: req.user!.role,
    action: 'CODING_PROBLEM_CREATED',
    resourceType: 'CodingProblem',
    resourceId: problem.id,
    details: `Created problem ${problem.title} (status: ${problem.status})`
  });

  res.status(201).json({ problem, message: 'Coding problem created successfully.' });
});

// ─── UPDATE CODING QUESTION (ADMIN / INSTRUCTOR) ─────────────────────────────
router.put('/problems/:id', authenticate, authorize(['INSTRUCTOR', 'ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const existing = await store.getCodingProblemById((req.params.id as string));
  if (!existing) {
    res.status(404).json({ error: 'Coding problem not found.' });
    return;
  }

  const {
    title,
    description,
    inputFormat,
    outputFormat,
    constraints,
    examples,
    difficulty,
    topic,
    starterCode,
    privateSolution,
    testCases,
    status
  } = req.body;

  const updates: any = {};
  if (title !== undefined) {
    updates.title = title;
    updates.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  if (description !== undefined) updates.description = description;
  if (inputFormat !== undefined) updates.inputFormat = inputFormat;
  if (outputFormat !== undefined) updates.outputFormat = outputFormat;
  if (constraints !== undefined) updates.constraints = constraints;
  if (examples !== undefined) updates.examples = examples;
  if (difficulty !== undefined) updates.difficulty = difficulty;
  if (topic !== undefined) updates.topic = topic;
  if (starterCode !== undefined) updates.starterCode = starterCode;
  if (privateSolution !== undefined) updates.privateSolution = privateSolution;
  if (status !== undefined) updates.status = status;
  if (testCases !== undefined) {
    updates.testCases = testCases.map((tc: any, i: number) => ({
      id: tc.id || `tc-${i + 1}`,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isHidden: Boolean(tc.isHidden),
      explanation: tc.explanation || ''
    }));
  }

  const updated = await store.updateCodingProblem(existing.id, updates);

  await store.addAuditLog({ userId: {
    userId: req.user!.id, userName: userName: req.user?.id || 'Instructor', role: role: req.user!.role, action: action: 'CODING_PROBLEM_UPDATED', resourceType: resourceType: 'CodingProblem', resourceId: resourceId: existing.id, details: details: `Updated coding problem ${existing.title}`
  } });

  res.json({ problem: updated, message: 'Coding problem updated successfully.' });
});

// ─── DELETE CODING QUESTION (ADMIN ONLY) ──────────────────────────────────────
router.delete('/problems/:id', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const existing = await store.getCodingProblemById((req.params.id as string));
  if (!existing) {
    res.status(404).json({ error: 'Coding problem not found.' });
    return;
  }

  await store.deleteCodingProblem(existing.id);

  await store.addAuditLog({ userId: {
    userId: req.user!.id, userName: userName: req.user?.id || 'Admin', role: role: req.user!.role, action: action: 'CODING_PROBLEM_DELETED', resourceType: resourceType: 'CodingProblem', resourceId: resourceId: existing.id, details: details: `Deleted coding problem ${existing.title}`
  } });

  res.json({ message: `Coding problem "${existing.title}" deleted successfully.` });
});

// ─── PUBLISH CODING QUESTION (ADMIN / INSTRUCTOR) ────────────────────────────
router.post('/problems/:id/publish', authenticate, authorize(['INSTRUCTOR', 'ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const existing = await store.getCodingProblemById((req.params.id as string));
  if (!existing) {
    res.status(404).json({ error: 'Coding problem not found.' });
    return;
  }

  const updated = await store.updateCodingProblem(existing.id, { status: 'published' });
  res.json({ problem: updated, message: `Coding problem "${existing.title}" is now published.` });
});

// ─── UNPUBLISH CODING QUESTION (ADMIN / INSTRUCTOR) ──────────────────────────
router.post('/problems/:id/unpublish', authenticate, authorize(['INSTRUCTOR', 'ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const existing = await store.getCodingProblemById((req.params.id as string));
  if (!existing) {
    res.status(404).json({ error: 'Coding problem not found.' });
    return;
  }

  const updated = await store.updateCodingProblem(existing.id, { status: 'draft' });
  res.json({ problem: updated, message: `Coding problem "${existing.title}" is reverted to draft.` });
});

export default router;
