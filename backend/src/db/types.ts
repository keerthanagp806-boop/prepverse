export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  role: UserRole;
  avatar?: string;
  branch?: string;
  graduationYear?: number;
  cgpa?: number;
  skills: string[];
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'note' | 'link' | 'code';
  url: string;
  durationOrSize?: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationMinutes: number;
  content: string;
  resources: Resource[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  category: string; // e.g. 'DSA', 'Programming', 'Web Dev', 'Core CS', 'Aptitude', 'System Design', 'Java', etc.
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail: string;
  duration?: string; // e.g. "12 hours"
  objectives?: string[]; // Learning objectives
  prerequisites?: string[]; // Prerequisites
  rating: number;
  enrolledCount: number;
  status: 'published' | 'draft' | 'pending_approval' | 'archived';
  modules: Module[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progressPercentage: number;
  completedLessonIds: string[];
  lastAccessedLessonId?: string;
  lastAccessedAt: string;
  enrolledAt: string;
}

export interface AssessmentQuestion {
  id: string;
  questionText: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  marks: number;
  timeLimitSeconds?: number; // for question-level timer
  topic: string;
}

export type TimerMode = 'OVERALL' | 'QUESTION';

export interface Assessment {
  id: string;
  title: string;
  description: string;
  category: 'Aptitude' | 'Programming' | 'DSA' | 'Core CS' | 'Technical Interview' | 'Mock Placement';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  durationMinutes: number;
  timerMode: TimerMode;
  questionTimerSeconds?: number;
  passingScorePercentage: number;
  maxAttempts: number;
  tabSwitchLimit: number;
  instructions: string[];
  questions: AssessmentQuestion[];
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
}

export interface IntegrityEvent {
  timestamp: string;
  type: 'TAB_SWITCH' | 'WINDOW_BLUR' | 'VISIBILITY_HIDDEN';
  warningCount: number;
  details: string;
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  assessmentId: string;
  startTime: string;
  serverEndTime: string;
  actualSubmittedAt?: string;
  timerMode: TimerMode;
  timeSpentSeconds: number;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT' | 'TERMINATED_VIOLATION';
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  tabSwitchCount: number;
  integrityEvents: IntegrityEvent[];
  score: number;
  totalPossibleScore: number;
  percentage: number;
  passed: boolean;
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  unansweredCount: number;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  explanation?: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  slug: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: 'Arrays' | 'Strings' | 'LinkedList' | 'Trees' | 'Dynamic Programming' | 'Graphs' | 'Sorting';
  acceptanceRate: number;
  starterCode: {
    python: string;
    cpp: string;
    java: string;
    javascript: string;
  };
  privateSolution?: {
    python: string;
    cpp: string;
    java: string;
    javascript: string;
  };
  testCases: TestCase[];
  status?: 'published' | 'draft' | 'archived';
  createdAt: string;
}

export interface CodingSubmission {
  id: string;
  userId: string;
  problemId: string;
  language: 'python' | 'cpp' | 'java' | 'javascript';
  code: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  runtimeMs: number;
  memoryKb: number;
  passedTestCases: number;
  totalTestCases: number;
  failedTestCase?: {
    input: string;
    expectedOutput: string;
    actualOutput: string;
  };
  submittedAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  description: string;
  eligibility: {
    minCgpa: number;
    allowedBranches: string[];
    maxBacklogs: number;
    gradYears: number[];
  };
  requiredSkills: string[];
  assessmentAreas: string[];
  salaryRange: string;
  preparationModules: {
    category: string;
    summary: string;
    recommendedTopicIds: string[];
  }[];
  curatedProblemIds: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details: string;
  timestamp: string;
}
