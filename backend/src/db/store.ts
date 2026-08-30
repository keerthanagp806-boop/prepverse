import { User, Course, Assessment, AssessmentAttempt, CodingProblem, CodingSubmission, Company, AuditLog, Enrollment, IntegrityEvent } from './types';
import { getSeedData } from './seedData';
import { v4 as uuidv4 } from 'uuid';

class Store {
  private users: User[] = [];
  private courses: Course[] = [];
  private enrollments: Enrollment[] = [];
  private assessments: Assessment[] = [];
  private attempts: AssessmentAttempt[] = [];
  private codingProblems: CodingProblem[] = [];
  private submissions: CodingSubmission[] = [];
  private companies: Company[] = [];
  private auditLogs: AuditLog[] = [];

  constructor() {
    this.init();
  }

  private init() {
    const seed = getSeedData();
    this.users = seed.users;
    this.courses = seed.courses;
    this.assessments = seed.assessments;
    this.codingProblems = seed.codingProblems;
    this.companies = seed.companies;
    this.auditLogs = seed.auditLogs;

    // Seed default enrollment for student
    this.enrollments.push({
      id: 'enr-1',
      userId: 'usr-student-1',
      courseId: 'crs-dsa-mastery',
      progressPercentage: 50,
      completedLessonIds: ['les-dsa-101'],
      lastAccessedLessonId: 'les-dsa-102',
      lastAccessedAt: new Date().toISOString(),
      enrolledAt: '2026-02-10T10:00:00.000Z'
    });

    this.enrollments.push({
      id: 'enr-2',
      userId: 'usr-student-1',
      courseId: 'crs-core-cs',
      progressPercentage: 25,
      completedLessonIds: ['les-cs-101'],
      lastAccessedLessonId: 'les-cs-101',
      lastAccessedAt: new Date().toISOString(),
      enrolledAt: '2026-02-12T14:00:00.000Z'
    });

    // Seed initial submission
    this.submissions.push({
      id: 'sub-init-1',
      userId: 'usr-student-1',
      problemId: 'prob-two-sum',
      language: 'python',
      code: `def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return f"{seen[diff]},{i}"\n        seen[num] = i\n    return ""\n\nimport sys\ninput_lines = sys.stdin.read().strip().split('\\n')\nif len(input_lines) >= 2:\n    nums = list(map(int, input_lines[0].split(',')))\n    target = int(input_lines[1])\n    print(twoSum(nums, target))\n`,
      status: 'Accepted',
      runtimeMs: 48,
      memoryKb: 14200,
      passedTestCases: 4,
      totalTestCases: 4,
      submittedAt: '2026-02-15T09:30:00.000Z'
    });

    // Seed initial completed assessment attempt
    this.attempts.push({
      id: 'atm-init-1',
      userId: 'usr-student-1',
      assessmentId: 'asm-overall-dsa',
      startTime: '2026-02-14T11:00:00.000Z',
      serverEndTime: '2026-02-14T11:25:00.000Z',
      actualSubmittedAt: '2026-02-14T11:19:45.000Z',
      timerMode: 'OVERALL',
      timeSpentSeconds: 1185,
      status: 'SUBMITTED',
      answers: {
        'q-dsa-1': 2,
        'q-dsa-2': 1,
        'q-dsa-3': 1,
        'q-dsa-4': 1,
        'q-dsa-5': 0 // incorrect
      },
      tabSwitchCount: 0,
      integrityEvents: [],
      score: 16,
      totalPossibleScore: 20,
      percentage: 80,
      passed: true,
      correctAnswersCount: 4,
      incorrectAnswersCount: 1,
      unansweredCount: 0
    });
  }

  // --- Users ---
  getUsers() { return this.users; }
  getUserById(id: string) { return this.users.find(u => u.id === id); }
  getUserByEmail(email: string) { return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  createUser(user: Omit<User, 'id' | 'createdAt'>) {
    const newUser: User = { ...user, id: `usr-${uuidv4()}`, createdAt: new Date().toISOString() };
    this.users.push(newUser);
    return newUser;
  }
  updateUser(id: string, updates: Partial<User>) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users[idx] = { ...this.users[idx], ...updates };
      return this.users[idx];
    }
    return null;
  }

  // --- Courses & LMS ---
  getCourses(filter?: { category?: string; difficulty?: string; search?: string; status?: string }) {
    return this.courses.filter(c => {
      // 'all' is a special admin keyword — return every course regardless of status
      if (filter?.status && filter.status !== 'all' && c.status !== filter.status) return false;
      if (filter?.category && filter.category !== 'all' && c.category !== filter.category) return false;
      if (filter?.difficulty && filter.difficulty !== 'all' && c.difficulty !== filter.difficulty) return false;
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.instructorName.toLowerCase().includes(q);
      }
      return true;
    });
  }
  getCourseById(id: string) { return this.courses.find(c => c.id === id); }
  createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'enrolledCount'>) {
    const newCourse: Course = {
      ...course,
      id: `crs-${uuidv4().slice(0, 8)}`,
      rating: 5.0,
      enrolledCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.courses.push(newCourse);
    return newCourse;
  }
  updateCourse(id: string, updates: Partial<Course>) {
    const idx = this.courses.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.courses[idx] = { ...this.courses[idx], ...updates, updatedAt: new Date().toISOString() };
      return this.courses[idx];
    }
    return null;
  }
  deleteCourse(id: string): boolean {
    const idx = this.courses.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.courses.splice(idx, 1);
      return true;
    }
    return false;
  }

  // --- Enrollments & Progress ---
  getAllEnrollments() {
    return this.enrollments;
  }
  getEnrollment(userId: string, courseId: string) {
    return this.enrollments.find(e => e.userId === userId && e.courseId === courseId);
  }
  getUserEnrollments(userId: string) {
    return this.enrollments.filter(e => e.userId === userId);
  }
  enrollStudent(userId: string, courseId: string) {
    let enrollment = this.getEnrollment(userId, courseId);
    if (!enrollment) {
      const course = this.getCourseById(courseId);
      if (course) {
        course.enrolledCount += 1;
        const firstLessonId = course.modules[0]?.lessons[0]?.id;
        enrollment = {
          id: `enr-${uuidv4().slice(0, 8)}`,
          userId,
          courseId,
          progressPercentage: 0,
          completedLessonIds: [],
          lastAccessedLessonId: firstLessonId,
          lastAccessedAt: new Date().toISOString(),
          enrolledAt: new Date().toISOString()
        };
        this.enrollments.push(enrollment);
      }
    }
    return enrollment;
  }
  updateLessonProgress(userId: string, courseId: string, lessonId: string, markComplete: boolean) {
    const enrollment = this.enrollStudent(userId, courseId);
    if (!enrollment) return null;

    const course = this.getCourseById(courseId);
    if (!course) return null;

    enrollment.lastAccessedLessonId = lessonId;
    enrollment.lastAccessedAt = new Date().toISOString();

    if (markComplete && !enrollment.completedLessonIds.includes(lessonId)) {
      enrollment.completedLessonIds.push(lessonId);
    }

    // Calculate total lessons in course
    let totalLessons = 0;
    course.modules.forEach(m => totalLessons += m.lessons.length);
    if (totalLessons > 0) {
      enrollment.progressPercentage = Math.round((enrollment.completedLessonIds.length / totalLessons) * 100);
    }

    return enrollment;
  }

  // --- Assessments ---
  getAssessments(filter?: { category?: string; difficulty?: string; search?: string }) {
    return this.assessments.filter(a => {
      if (filter?.category && a.category !== filter.category) return false;
      if (filter?.difficulty && a.difficulty !== filter.difficulty) return false;
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        return a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
      }
      return true;
    });
  }
  getAssessmentById(id: string) { return this.assessments.find(a => a.id === id); }
  createAssessment(asm: Omit<Assessment, 'id' | 'createdAt'>) {
    const newAsm: Assessment = {
      ...asm,
      id: `asm-${uuidv4().slice(0, 8)}`,
      createdAt: new Date().toISOString()
    };
    this.assessments.push(newAsm);
    return newAsm;
  }
  updateAssessment(id: string, updates: Partial<Assessment>) {
    const idx = this.assessments.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.assessments[idx] = { ...this.assessments[idx], ...updates };
      return this.assessments[idx];
    }
    return null;
  }

  // --- Assessment Attempts & Integrity ---
  getAttemptById(id: string) { return this.attempts.find(a => a.id === id); }
  getUserAttempts(userId: string) { return this.attempts.filter(a => a.userId === userId); }
  
  startAssessmentAttempt(userId: string, assessmentId: string) {
    const assessment = this.getAssessmentById(assessmentId);
    if (!assessment) throw new Error('Assessment not found');

    const pastAttempts = this.attempts.filter(a => a.userId === userId && a.assessmentId === assessmentId && a.status !== 'IN_PROGRESS');
    if (pastAttempts.length >= assessment.maxAttempts) {
      throw new Error(`Maximum attempt limit (${assessment.maxAttempts}) reached for this assessment.`);
    }

    // Check if there is already an active in-progress attempt
    const activeAttempt = this.attempts.find(a => a.userId === userId && a.assessmentId === assessmentId && a.status === 'IN_PROGRESS');
    if (activeAttempt) {
      return activeAttempt;
    }

    const now = new Date();
    const durationMs = assessment.durationMinutes * 60 * 1000;
    const serverEndTime = new Date(now.getTime() + durationMs).toISOString();

    let totalPossibleScore = 0;
    assessment.questions.forEach(q => totalPossibleScore += q.marks);

    const attempt: AssessmentAttempt = {
      id: `atm-${uuidv4().slice(0, 8)}`,
      userId,
      assessmentId,
      startTime: now.toISOString(),
      serverEndTime,
      timerMode: assessment.timerMode,
      timeSpentSeconds: 0,
      status: 'IN_PROGRESS',
      answers: {},
      tabSwitchCount: 0,
      integrityEvents: [],
      score: 0,
      totalPossibleScore,
      percentage: 0,
      passed: false,
      correctAnswersCount: 0,
      incorrectAnswersCount: 0,
      unansweredCount: assessment.questions.length
    };

    this.attempts.push(attempt);
    return attempt;
  }

  saveAttemptAnswer(attemptId: string, userId: string, questionId: string, selectedOptionIndex: number) {
    const attempt = this.getAttemptById(attemptId);
    if (!attempt || attempt.userId !== userId) throw new Error('Invalid attempt');
    if (attempt.status !== 'IN_PROGRESS') throw new Error('Attempt is already concluded');

    // Server-side timing check
    const now = new Date().getTime();
    const end = new Date(attempt.serverEndTime).getTime();
    if (now > end + 5000) { // 5s grace period
      return this.submitAttempt(attemptId, userId, 'TIMED_OUT');
    }

    attempt.answers[questionId] = selectedOptionIndex;
    return attempt;
  }

  recordIntegrityEvent(attemptId: string, userId: string, event: Omit<IntegrityEvent, 'timestamp'>) {
    const attempt = this.getAttemptById(attemptId);
    if (!attempt || attempt.userId !== userId) throw new Error('Invalid attempt');
    if (attempt.status !== 'IN_PROGRESS') return attempt;

    const assessment = this.getAssessmentById(attempt.assessmentId);
    const limit = assessment?.tabSwitchLimit || 3;

    attempt.tabSwitchCount += 1;
    const loggedEvent: IntegrityEvent = {
      ...event,
      warningCount: attempt.tabSwitchCount,
      timestamp: new Date().toISOString()
    };
    attempt.integrityEvents.push(loggedEvent);

    // If threshold reached, terminate
    if (attempt.tabSwitchCount >= limit) {
      return this.submitAttempt(attemptId, userId, 'TERMINATED_VIOLATION');
    }

    return attempt;
  }

  submitAttempt(attemptId: string, userId: string, forcedStatus?: 'SUBMITTED' | 'TIMED_OUT' | 'TERMINATED_VIOLATION') {
    const attempt = this.getAttemptById(attemptId);
    if (!attempt || attempt.userId !== userId) throw new Error('Invalid attempt');
    if (attempt.status !== 'IN_PROGRESS' && !forcedStatus) return attempt;

    const assessment = this.getAssessmentById(attempt.assessmentId);
    if (!assessment) throw new Error('Assessment not found');

    const now = new Date();
    attempt.actualSubmittedAt = now.toISOString();
    
    // Validate submission time window (plus 5s grace period)
    let finalStatus = forcedStatus || 'SUBMITTED';
    if (finalStatus === 'SUBMITTED' && now.getTime() > new Date(attempt.serverEndTime).getTime() + 5000) {
      finalStatus = 'TIMED_OUT';
    }
    attempt.status = finalStatus;

    const start = new Date(attempt.startTime).getTime();
    attempt.timeSpentSeconds = Math.min(
      Math.round((now.getTime() - start) / 1000),
      assessment.durationMinutes * 60
    );

    // Evaluation
    let score = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    assessment.questions.forEach(q => {
      const studentAns = attempt.answers[q.id];
      if (studentAns === undefined || studentAns === null) {
        unansweredCount += 1;
      } else if (studentAns === q.correctIndex) {
        score += q.marks;
        correctCount += 1;
      } else {
        incorrectCount += 1;
      }
    });

    attempt.score = score;
    attempt.percentage = attempt.totalPossibleScore > 0 ? Math.round((score / attempt.totalPossibleScore) * 100) : 0;
    attempt.passed = attempt.percentage >= assessment.passingScorePercentage && attempt.status !== 'TERMINATED_VIOLATION';
    attempt.correctAnswersCount = correctCount;
    attempt.incorrectAnswersCount = incorrectCount;
    attempt.unansweredCount = unansweredCount;

    return attempt;
  }

  // --- Coding Problems & Submissions ---
  getCodingProblems(filter?: { topic?: string; difficulty?: string; search?: string; status?: string }) {
    return this.codingProblems.filter(p => {
      // By default (or if status is not 'all'), return only published problems for students
      const reqStatus = filter?.status || 'published';
      if (reqStatus !== 'all' && p.status !== reqStatus) return false;

      if (filter?.topic && filter.topic !== 'all' && p.topic !== filter.topic) return false;
      if (filter?.difficulty && filter.difficulty !== 'all' && p.difficulty !== filter.difficulty) return false;
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      }
      return true;
    });
  }
  getCodingProblemById(idOrSlug: string) {
    return this.codingProblems.find(p => p.id === idOrSlug || p.slug === idOrSlug);
  }
  createCodingProblem(problem: Omit<CodingProblem, 'id' | 'createdAt' | 'acceptanceRate'>) {
    const newProblem: CodingProblem = {
      ...problem,
      id: `prob-${uuidv4().slice(0, 8)}`,
      acceptanceRate: 75.0,
      status: problem.status || 'published', // default to published if not specified
      createdAt: new Date().toISOString()
    };
    this.codingProblems.push(newProblem);
    return newProblem;
  }
  updateCodingProblem(id: string, updates: Partial<CodingProblem>) {
    const idx = this.codingProblems.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.codingProblems[idx] = { ...this.codingProblems[idx], ...updates };
      return this.codingProblems[idx];
    }
    return null;
  }
  deleteCodingProblem(id: string) {
    const idx = this.codingProblems.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.codingProblems.splice(idx, 1);
      return true;
    }
    return false;
  }
  getUserSubmissions(userId: string, problemId?: string) {
    return this.submissions
      .filter(s => s.userId === userId && (!problemId || s.problemId === problemId))
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }
  saveSubmission(submission: Omit<CodingSubmission, 'id' | 'submittedAt'>) {
    const newSubmission: CodingSubmission = {
      ...submission,
      id: `sub-${uuidv4().slice(0, 8)}`,
      submittedAt: new Date().toISOString()
    };
    this.submissions.push(newSubmission);
    return newSubmission;
  }

  // --- Companies & Placement Preparation ---
  getCompanies(filter?: { search?: string; industry?: string }) {
    return this.companies.filter(c => {
      if (filter?.industry && c.industry !== filter.industry) return false;
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.requiredSkills.some(s => s.toLowerCase().includes(q));
      }
      return true;
    });
  }
  getCompanyById(id: string) { return this.companies.find(c => c.id === id); }
  createCompany(company: Omit<Company, 'id'>) {
    const newCompany: Company = { ...company, id: `cmp-${uuidv4().slice(0, 8)}` };
    this.companies.push(newCompany);
    return newCompany;
  }
  updateCompany(id: string, updates: Partial<Company>) {
    const idx = this.companies.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.companies[idx] = { ...this.companies[idx], ...updates };
      return this.companies[idx];
    }
    return null;
  }

  // --- Placement Readiness Calculation Engine ---
  getPlacementReadiness(userId: string) {
    const user = this.getUserById(userId);
    const userAttempts = this.getUserAttempts(userId);
    const userSubmissions = this.getUserSubmissions(userId);
    const userEnrollments = this.getUserEnrollments(userId);

    // 1. Aptitude Score Calculation
    const aptAttempts = userAttempts.filter(a => {
      const asm = this.getAssessmentById(a.assessmentId);
      return asm?.category === 'Aptitude';
    });
    const avgAptitude = aptAttempts.length > 0
      ? Math.round(aptAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / aptAttempts.length)
      : 72; // baseline based on initial diagnostic

    // 2. Programming Score Calculation
    const acceptedProblems = new Set(userSubmissions.filter(s => s.status === 'Accepted').map(s => s.problemId));
    const totalProblems = this.codingProblems.length || 1;
    const programmingScore = Math.min(95, Math.round(50 + (acceptedProblems.size / totalProblems) * 45));

    // 3. DSA Score Calculation
    const dsaAttempts = userAttempts.filter(a => {
      const asm = this.getAssessmentById(a.assessmentId);
      return asm?.category === 'DSA';
    });
    const avgDsaAssessment = dsaAttempts.length > 0
      ? Math.round(dsaAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / dsaAttempts.length)
      : 65;
    const dsaCourse = userEnrollments.find(e => e.courseId === 'crs-dsa-mastery');
    const dsaCourseProgress = dsaCourse ? dsaCourse.progressPercentage : 30;
    const dsaScore = Math.round(avgDsaAssessment * 0.6 + dsaCourseProgress * 0.4);

    // 4. Core CS Score Calculation
    const csCourse = userEnrollments.find(e => e.courseId === 'crs-core-cs');
    const csProgress = csCourse ? csCourse.progressPercentage : 20;
    const csAttempts = userAttempts.filter(a => {
      const asm = this.getAssessmentById(a.assessmentId);
      return asm?.category === 'Core CS';
    });
    const avgCsAsm = csAttempts.length > 0
      ? Math.round(csAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / csAttempts.length)
      : 70;
    const coreCsScore = Math.round(avgCsAsm * 0.6 + csProgress * 0.4);

    // 5. Technical Interview Score
    const techInterviewScore = Math.round((programmingScore * 0.35) + (dsaScore * 0.45) + (coreCsScore * 0.20));

    // 6. HR & Behavioral Interview Score
    const hrInterviewScore = 74; // standard foundational baseline

    // Overall Readiness (Weighted Composite)
    const overallReadiness = Math.round(
      avgAptitude * 0.15 +
      programmingScore * 0.20 +
      dsaScore * 0.25 +
      coreCsScore * 0.20 +
      techInterviewScore * 0.15 +
      hrInterviewScore * 0.05
    );

    // Rule-based Recommendations
    const recommendations: string[] = [];
    if (dsaScore < 75) {
      recommendations.push('Your DSA score is below the 75% benchmark for Tier-1 companies. Practice Tree & Graph problems in the Online Compiler.');
    }
    if (coreCsScore < 70) {
      recommendations.push('Review Operating Systems Deadlocks & SQL Normalization modules to boost Core CS interview readiness.');
    }
    if (avgAptitude < 70) {
      recommendations.push('Take the TCS & Infosys National Placement Aptitude Test to improve your speed math screening percentile.');
    }
    if (acceptedProblems.size < 3) {
      recommendations.push('Solve at least 5 coding problems in the practice compiler to unlock higher company eligibility badges.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Great job! You are in the top 10th percentile for placement readiness. Try the Google & Microsoft mock assessments.');
    }

    return {
      overallReadiness,
      categories: [
        { name: 'Aptitude', score: avgAptitude, target: 85, color: '#f59e0b' },
        { name: 'Programming', score: programmingScore, target: 90, color: '#3b82f6' },
        { name: 'DSA', score: dsaScore, target: 85, color: '#8b5cf6' },
        { name: 'Core CS', score: coreCsScore, target: 80, color: '#10b981' },
        { name: 'Technical Interview', score: techInterviewScore, target: 85, color: '#06b6d4' },
        { name: 'HR Interview', score: hrInterviewScore, target: 80, color: '#ec4899' }
      ],
      stats: {
        coursesCompleted: userEnrollments.filter(e => e.progressPercentage === 100).length,
        coursesEnrolled: userEnrollments.length,
        assessmentsCompleted: userAttempts.filter(a => a.status !== 'IN_PROGRESS').length,
        codingSolved: acceptedProblems.size,
        codingAttempted: new Set(userSubmissions.map(s => s.problemId)).size,
        averageAssessmentScore: userAttempts.length > 0
          ? Math.round(userAttempts.reduce((acc, c) => acc + c.percentage, 0) / userAttempts.length)
          : 0
      },
      recommendations
    };
  }

  // --- Audit Logs ---
  getAuditLogs() {
    return this.auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  logAction(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const newLog: AuditLog = {
      ...log,
      id: `log-${uuidv4().slice(0, 8)}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.push(newLog);
    return newLog;
  }
}

export const store = new Store();
