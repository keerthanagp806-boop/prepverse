"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const store_1 = require("../db/store");
const auth_1 = require("../middleware/auth");
const codeRunner_1 = require("../services/codeRunner");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'prepverse_super_secret_jwt_key_2026';
// Helper to check if request has admin/instructor privileges optionally
function checkPrivilegedUser(req) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token)
        return null;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (decoded.role === 'ADMIN' || decoded.role === 'INSTRUCTOR') {
            return decoded;
        }
    }
    catch (e) { }
    return null;
}
// ─── LIST ALL CODING PROBLEMS ───────────────────────────────────────────────
router.get('/problems', (req, res) => {
    const { topic, difficulty, search, status } = req.query;
    // Determine if caller is privileged
    const caller = checkPrivilegedUser(req);
    const statusFilter = (caller && status === 'all') ? 'all' : 'published';
    const problems = store_1.store.getCodingProblems({
        topic: topic,
        difficulty: difficulty,
        search: search,
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
router.get('/problems/:idOrSlug', (req, res) => {
    const problem = store_1.store.getCodingProblemById(req.params.idOrSlug);
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
    const publicTestCases = problem.testCases.filter(tc => !tc.isHidden);
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
router.get('/problems/:id/admin', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'INSTRUCTOR']), (req, res) => {
    const problem = store_1.store.getCodingProblemById(req.params.id);
    if (!problem) {
        res.status(404).json({ error: 'Coding problem not found' });
        return;
    }
    res.json({ problem });
});
// ─── RUN CODE AGAINST CUSTOM INPUT ──────────────────────────────────────────
router.post('/run', auth_1.authenticate, async (req, res) => {
    try {
        const { language, code, customInput } = req.body;
        if (!language || !code) {
            res.status(400).json({ error: 'Language and code are required' });
            return;
        }
        const result = await (0, codeRunner_1.executeCode)(language, code, customInput || '');
        res.json({ result });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Execution error' });
    }
});
// ─── SUBMIT CODE AGAINST ALL TESTS (PUBLIC + HIDDEN) ────────────────────────
router.post('/problems/:id/submit', auth_1.authenticate, async (req, res) => {
    try {
        const { language, code } = req.body;
        const problem = store_1.store.getCodingProblemById(req.params.id);
        if (!problem) {
            res.status(404).json({ error: 'Problem not found' });
            return;
        }
        if (!language || !code) {
            res.status(400).json({ error: 'Language and code are required' });
            return;
        }
        // Execute against all test cases (hidden + public)
        const result = await (0, codeRunner_1.executeCode)(language, code, undefined, problem.testCases);
        // If hidden test failed, customize message to strictly match requirements
        let displayMessage = '';
        if (result.status !== 'Accepted' && result.failedTestCase?.input === '[Hidden Test Case]') {
            displayMessage = 'Some hidden test cases failed.';
        }
        const submission = store_1.store.saveSubmission({
            userId: req.user.id,
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
        store_1.store.logAction({
            userId: req.user.id,
            userName: req.user?.id || 'Student',
            role: req.user.role,
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
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Submission error' });
    }
});
// ─── GET SUBMISSION HISTORY ──────────────────────────────────────────────────
router.get('/submissions/me', auth_1.authenticate, (req, res) => {
    const { problemId } = req.query;
    const submissions = store_1.store.getUserSubmissions(req.user.id, problemId);
    const enriched = submissions.map(s => {
        const p = store_1.store.getCodingProblemById(s.problemId);
        return {
            ...s,
            problemTitle: p?.title || 'Unknown Problem'
        };
    });
    res.json({ submissions: enriched });
});
// ─── CREATE CODING QUESTION (ADMIN / INSTRUCTOR) ─────────────────────────────
router.post('/problems', auth_1.authenticate, (0, auth_1.authorize)(['INSTRUCTOR', 'ADMIN']), (req, res) => {
    const { title, description, inputFormat, outputFormat, constraints, examples, difficulty, topic, starterCode, privateSolution, testCases, status } = req.body;
    if (!title || !description || !testCases || testCases.length === 0) {
        res.status(400).json({ error: 'Title, description, and test cases are required' });
        return;
    }
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const problem = store_1.store.createCodingProblem({
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
        testCases: testCases.map((tc, i) => ({
            id: `tc-${i + 1}`,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: Boolean(tc.isHidden),
            explanation: tc.explanation || ''
        }))
    });
    store_1.store.logAction({
        userId: req.user.id,
        userName: req.user?.id || 'Instructor',
        role: req.user.role,
        action: 'CODING_PROBLEM_CREATED',
        resourceType: 'CodingProblem',
        resourceId: problem.id,
        details: `Created problem ${problem.title} (status: ${problem.status})`
    });
    res.status(201).json({ problem, message: 'Coding problem created successfully.' });
});
// ─── UPDATE CODING QUESTION (ADMIN / INSTRUCTOR) ─────────────────────────────
router.put('/problems/:id', auth_1.authenticate, (0, auth_1.authorize)(['INSTRUCTOR', 'ADMIN']), (req, res) => {
    const existing = store_1.store.getCodingProblemById(req.params.id);
    if (!existing) {
        res.status(404).json({ error: 'Coding problem not found.' });
        return;
    }
    const { title, description, inputFormat, outputFormat, constraints, examples, difficulty, topic, starterCode, privateSolution, testCases, status } = req.body;
    const updates = {};
    if (title !== undefined) {
        updates.title = title;
        updates.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined)
        updates.description = description;
    if (inputFormat !== undefined)
        updates.inputFormat = inputFormat;
    if (outputFormat !== undefined)
        updates.outputFormat = outputFormat;
    if (constraints !== undefined)
        updates.constraints = constraints;
    if (examples !== undefined)
        updates.examples = examples;
    if (difficulty !== undefined)
        updates.difficulty = difficulty;
    if (topic !== undefined)
        updates.topic = topic;
    if (starterCode !== undefined)
        updates.starterCode = starterCode;
    if (privateSolution !== undefined)
        updates.privateSolution = privateSolution;
    if (status !== undefined)
        updates.status = status;
    if (testCases !== undefined) {
        updates.testCases = testCases.map((tc, i) => ({
            id: tc.id || `tc-${i + 1}`,
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: Boolean(tc.isHidden),
            explanation: tc.explanation || ''
        }));
    }
    const updated = store_1.store.updateCodingProblem(existing.id, updates);
    store_1.store.logAction({
        userId: req.user.id,
        userName: req.user?.id || 'Instructor',
        role: req.user.role,
        action: 'CODING_PROBLEM_UPDATED',
        resourceType: 'CodingProblem',
        resourceId: existing.id,
        details: `Updated coding problem ${existing.title}`
    });
    res.json({ problem: updated, message: 'Coding problem updated successfully.' });
});
// ─── DELETE CODING QUESTION (ADMIN ONLY) ──────────────────────────────────────
router.delete('/problems/:id', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN']), (req, res) => {
    const existing = store_1.store.getCodingProblemById(req.params.id);
    if (!existing) {
        res.status(404).json({ error: 'Coding problem not found.' });
        return;
    }
    store_1.store.deleteCodingProblem(existing.id);
    store_1.store.logAction({
        userId: req.user.id,
        userName: req.user?.id || 'Admin',
        role: req.user.role,
        action: 'CODING_PROBLEM_DELETED',
        resourceType: 'CodingProblem',
        resourceId: existing.id,
        details: `Deleted coding problem ${existing.title}`
    });
    res.json({ message: `Coding problem "${existing.title}" deleted successfully.` });
});
// ─── PUBLISH CODING QUESTION (ADMIN / INSTRUCTOR) ────────────────────────────
router.post('/problems/:id/publish', auth_1.authenticate, (0, auth_1.authorize)(['INSTRUCTOR', 'ADMIN']), (req, res) => {
    const existing = store_1.store.getCodingProblemById(req.params.id);
    if (!existing) {
        res.status(404).json({ error: 'Coding problem not found.' });
        return;
    }
    const updated = store_1.store.updateCodingProblem(existing.id, { status: 'published' });
    res.json({ problem: updated, message: `Coding problem "${existing.title}" is now published.` });
});
// ─── UNPUBLISH CODING QUESTION (ADMIN / INSTRUCTOR) ──────────────────────────
router.post('/problems/:id/unpublish', auth_1.authenticate, (0, auth_1.authorize)(['INSTRUCTOR', 'ADMIN']), (req, res) => {
    const existing = store_1.store.getCodingProblemById(req.params.id);
    if (!existing) {
        res.status(404).json({ error: 'Coding problem not found.' });
        return;
    }
    const updated = store_1.store.updateCodingProblem(existing.id, { status: 'draft' });
    res.json({ problem: updated, message: `Coding problem "${existing.title}" is reverted to draft.` });
});
exports.default = router;
