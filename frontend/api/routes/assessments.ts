import express, { Response } from 'express';
import { store } from '../_lib/store_mongo';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// List all published assessments
router.get('/', async (req, res) => {
  const { category, difficulty, search } = req.query;
  const assessments = await store.getAssessments({
    category: category as string,
    difficulty: difficulty as string,
    search: search as string
  });

  // Hide correct answers and explanations when listing
  const safeList = assessments.map(a => ({
    id: a.id,
    title: a.title,
    description: a.description,
    category: a.category,
    difficulty: a.difficulty,
    durationMinutes: a.durationMinutes,
    timerMode: a.timerMode,
    questionTimerSeconds: a.questionTimerSeconds,
    passingScorePercentage: a.passingScorePercentage,
    maxAttempts: a.maxAttempts,
    tabSwitchLimit: a.tabSwitchLimit,
    totalQuestions: a.questions.length,
    instructions: a.instructions,
    createdAt: a.createdAt
  }));

  res.json({ assessments: safeList });
});

// User's past assessment attempts history
router.get('/history/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const attempts = await store.getUserAttempts(req.user!.id);
  const enrichedAttempts = await Promise.all(attempts.map(async atm => {
    const asm = await store.getAssessmentById(atm.assessmentId);
    return {
      ...atm,
      assessmentTitle: asm?.title || 'Unknown Assessment',
      assessmentCategory: asm?.category || 'General'
    };
  }));
  enrichedAttempts.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  res.json({ attempts: enrichedAttempts });
});

// Get assessment details (for instruction screen)
router.get('/:id', async (req, res) => {
  const assessment = await store.getAssessmentById((req.params.id as string));
  if (!assessment) {
    res.status(404).json({ error: 'Assessment not found' });
    return;
  }

  // Sanitize questions: strip correct answers before test starts
  const sanitizedQuestions = assessment.questions.map((q: any) => ({
    id: q.id,
    questionText: q.questionText,
    codeSnippet: q.codeSnippet,
    options: q.options,
    marks: q.marks,
    timeLimitSeconds: q.timeLimitSeconds || assessment.questionTimerSeconds,
    topic: q.topic
  }));

  res.json({
    assessment: {
      ...assessment,
      questions: sanitizedQuestions
    }
  });
});

// Start a new assessment attempt (or resume active attempt)
router.post('/:id/start', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const attempt = await store.startAssessmentAttempt((req.params.id as string));
    const assessment = await store.getAssessmentById((req.params.id as string))!;

    const sanitizedQuestions = assessment.questions.map((q: any) => ({
      id: q.id,
      questionText: q.questionText,
      codeSnippet: q.codeSnippet,
      options: q.options,
      marks: q.marks,
      timeLimitSeconds: q.timeLimitSeconds || assessment.questionTimerSeconds,
      topic: q.topic
    }));

    res.json({
      attempt,
      assessment: {
        ...assessment,
        questions: sanitizedQuestions
      },
      serverCurrentTime: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Auto-save student's answer for a question
router.post('/attempts/:attemptId/save-answer', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { questionId, selectedOptionIndex } = req.body;
    const attempt = await store.saveAttemptAnswer(
      (req.params.attemptId as string),
      req.user!.id,
      questionId,
      Number(selectedOptionIndex)
    );

    res.json({
      message: 'Answer saved successfully',
      attempt: {
        id: attempt.id,
        status: attempt.status,
        answers: attempt.answers
      }
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Log browser tab-switch / integrity violation
router.post('/attempts/:attemptId/integrity-event', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, details } = req.body;
    const attempt = await store.recordIntegrityEvent(
      (req.params.attemptId as string),
      req.user!.id,
      {
        type: type || 'TAB_SWITCH',
        details: details || 'Window blur / tab switch detected by browser visibility API',
        warningCount: 0
      }
    );

    const assessment = await store.getAssessmentById(attempt.assessmentId);
    const maxLimit = assessment?.tabSwitchLimit || 3;

    res.json({
      attemptId: attempt.id,
      status: attempt.status,
      tabSwitchCount: attempt.tabSwitchCount,
      tabSwitchLimit: maxLimit,
      isTerminated: attempt.status === 'TERMINATED_VIOLATION'
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Submit assessment attempt (Manual or Auto-Submit on Timeout)
router.post('/attempts/:attemptId/submit', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reason } = req.body; // 'USER_SUBMIT' | 'TIMEOUT'
    const forcedStatus = reason === 'TIMEOUT' ? 'TIMED_OUT' : 'SUBMITTED';
    const attempt = await store.submitAttempt((req.params.attemptId as string), req.user!.id, forcedStatus);

    await store.logAction({
      userId: req.user!.id,
      userName: req.user?.id || 'Student',
      role: req.user!.role,
      action: 'ASSESSMENT_SUBMITTED',
      resourceType: 'AssessmentAttempt',
      resourceId: attempt.id,
      details: `Score: ${attempt.score}/${attempt.totalPossibleScore} (${attempt.percentage}%), Status: ${attempt.status}`
    });

    res.json({
      message: 'Assessment submitted successfully',
      attempt
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get detailed result of a completed attempt
router.get('/attempts/:attemptId/result', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const attempt = await store.getAttemptById((req.params.attemptId as string));
  if (!attempt || (attempt.userId !== req.user!.id && req.user!.role === 'STUDENT')) {
    res.status(404).json({ error: 'Attempt not found or unauthorized' });
    return;
  }

  const assessment = await store.getAssessmentById(attempt.assessmentId);
  if (!assessment) {
    res.status(404).json({ error: 'Assessment not found' });
    return;
  }

  // Include full questions with explanations and correct answers for review
  const questionReview = assessment.questions.map((q: any) => ({
    id: q.id,
    questionText: q.questionText,
    codeSnippet: q.codeSnippet,
    options: q.options,
    correctIndex: q.correctIndex,
    studentAnswer: attempt.answers[q.id] !== undefined ? attempt.answers[q.id] : null,
    isCorrect: attempt.answers[q.id] === q.correctIndex,
    explanation: q.explanation,
    marks: q.marks,
    topic: q.topic
  }));

  res.json({
    attempt,
    assessmentTitle: assessment.title,
    passingScorePercentage: assessment.passingScorePercentage,
    questionReview
  });
});

// Instructor / Admin: Create assessment
router.post('/', authenticate, authorize(['INSTRUCTOR', 'ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    title,
    description,
    category,
    difficulty,
    durationMinutes,
    timerMode,
    questionTimerSeconds,
    passingScorePercentage,
    maxAttempts,
    tabSwitchLimit,
    instructions,
    questions
  } = req.body;

  if (!title || !category || !questions || questions.length === 0) {
    res.status(400).json({ error: 'Title, category, and questions are required' });
    return;
  }

  const assessment = await store.createAssessment({
    title,
    description: description || '',
    category,
    difficulty: difficulty || 'Medium',
    durationMinutes: Number(durationMinutes) || 20,
    timerMode: timerMode === 'QUESTION' ? 'QUESTION' : 'OVERALL',
    questionTimerSeconds: questionTimerSeconds ? Number(questionTimerSeconds) : 45,
    passingScorePercentage: Number(passingScorePercentage) || 65,
    maxAttempts: Number(maxAttempts) || 3,
    tabSwitchLimit: Number(tabSwitchLimit) || 3,
    isPublished: true,
    createdBy: req.user?.id || 'Instructor',
    instructions: instructions || [
      'The timer is strictly authoritative.',
      'Answers are auto-saved.',
      'Tab-switch detection is active.'
    ],
    questions: questions.map((q: any, i: number) => ({
      id: `q-${i + 1}`,
      questionText: q.questionText,
      codeSnippet: q.codeSnippet,
      options: q.options,
      correctIndex: Number(q.correctIndex) || 0,
      explanation: q.explanation || 'No explanation provided.',
      marks: Number(q.marks) || 4,
      timeLimitSeconds: q.timeLimitSeconds || (timerMode === 'QUESTION' ? 45 : undefined),
      topic: q.topic || category
    }))
  });

  await store.addAuditLog({ userId: {
    userId: req.user!.id, userName: userName: req.user?.id || 'Instructor', role: role: req.user!.role, action: action: 'ASSESSMENT_CREATED', resourceType: resourceType: 'Assessment', resourceId: resourceId: assessment.id, details: details: `Created assessment ${assessment.title}`
  } });

  res.status(201).json({ assessment });
});

export default router;
