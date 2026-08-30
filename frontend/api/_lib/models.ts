import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const UserSchema = new mongoose.Schema({
  id: { type: String, default: () => `usr-${uuidv4()}`, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'], default: 'STUDENT' },
  avatar: String,
  branch: String,
  graduationYear: Number,
  cgpa: Number,
  skills: [String],
  createdAt: { type: Date, default: Date.now },
});

const CourseSchema = new mongoose.Schema({
  id: { type: String, default: () => `crs-${uuidv4().slice(0, 8)}`, unique: true },
  title: String,
  description: String,
  instructorId: String,
  instructorName: String,
  category: String,
  difficulty: String,
  thumbnail: String,
  duration: String,
  objectives: [String],
  prerequisites: [String],
  rating: { type: Number, default: 5.0 },
  enrolledCount: { type: Number, default: 0 },
  status: { type: String, enum: ['published', 'draft', 'pending_approval', 'archived'], default: 'draft' },
  modules: [
    {
      id: String,
      title: String,
      description: String,
      lessons: [
        {
          id: String,
          title: String,
          durationMinutes: Number,
          content: String,
          resources: [
            {
              id: String,
              title: String,
              type: { type: String, enum: ['video', 'pdf', 'note', 'link', 'code'] },
              url: String,
              durationOrSize: String
            }
          ]
        }
      ]
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: Date,
});

const EnrollmentSchema = new mongoose.Schema({
  id: { type: String, default: () => `enr-${uuidv4().slice(0, 8)}`, unique: true },
  userId: String,
  courseId: String,
  progressPercentage: { type: Number, default: 0 },
  completedLessonIds: [String],
  lastAccessedLessonId: String,
  lastAccessedAt: { type: Date, default: Date.now },
  enrolledAt: { type: Date, default: Date.now },
});

const AssessmentSchema = new mongoose.Schema({
  id: { type: String, default: () => `asm-${uuidv4().slice(0, 8)}`, unique: true },
  title: String,
  description: String,
  category: String,
  difficulty: String,
  durationMinutes: Number,
  timerMode: String,
  questionTimerSeconds: Number,
  passingScorePercentage: Number,
  maxAttempts: Number,
  tabSwitchLimit: Number,
  instructions: [String],
  questions: [
    {
      id: String,
      questionText: String,
      codeSnippet: String,
      options: [String],
      correctIndex: Number,
      explanation: String,
      marks: Number,
      timeLimitSeconds: Number,
      topic: String,
    }
  ],
  isPublished: { type: Boolean, default: false },
  createdBy: String,
  createdAt: { type: Date, default: Date.now },
});

const AssessmentAttemptSchema = new mongoose.Schema({
  id: { type: String, default: () => `atm-${uuidv4()}`, unique: true },
  userId: String,
  assessmentId: String,
  startTime: Date,
  serverEndTime: Date,
  actualSubmittedAt: Date,
  timerMode: String,
  timeSpentSeconds: Number,
  status: String,
  answers: { type: Map, of: Number },
  tabSwitchCount: Number,
  integrityEvents: [
    {
      timestamp: Date,
      type: { type: String },
      warningCount: Number,
      details: String,
    }
  ],
  score: Number,
  totalPossibleScore: Number,
  percentage: Number,
  passed: Boolean,
  correctAnswersCount: Number,
  incorrectAnswersCount: Number,
  unansweredCount: Number,
});

const CodingProblemSchema = new mongoose.Schema({
  id: { type: String, default: () => `prob-${uuidv4().slice(0, 8)}`, unique: true },
  title: String,
  slug: String,
  description: String,
  inputFormat: String,
  outputFormat: String,
  constraints: [String],
  examples: [
    {
      input: String,
      output: String,
      explanation: String,
    }
  ],
  difficulty: String,
  topic: String,
  acceptanceRate: { type: Number, default: 0 },
  starterCode: {
    python: String,
    cpp: String,
    java: String,
    javascript: String,
  },
  privateSolution: {
    python: String,
    cpp: String,
    java: String,
    javascript: String,
  },
  testCases: [
    {
      id: String,
      input: String,
      expectedOutput: String,
      isHidden: Boolean,
      explanation: String,
    }
  ],
  status: { type: String, default: 'published' },
  createdAt: { type: Date, default: Date.now },
});

const CodingSubmissionSchema = new mongoose.Schema({
  id: { type: String, default: () => `sub-${uuidv4()}`, unique: true },
  userId: String,
  problemId: String,
  language: String,
  code: String,
  status: String,
  runtimeMs: Number,
  memoryKb: Number,
  passedTestCases: Number,
  totalTestCases: Number,
  failedTestCase: {
    input: String,
    expectedOutput: String,
    actualOutput: String,
  },
  submittedAt: { type: Date, default: Date.now },
});

const CompanySchema = new mongoose.Schema({
  id: { type: String, default: () => `cmp-${uuidv4().slice(0, 8)}`, unique: true },
  name: String,
  logo: String,
  industry: String,
  description: String,
  eligibility: {
    minCgpa: Number,
    allowedBranches: [String],
    maxBacklogs: Number,
    gradYears: [Number],
  },
  requiredSkills: [String],
  assessmentAreas: [String],
  salaryRange: String,
  preparationModules: [
    {
      category: String,
      summary: String,
      recommendedTopicIds: [String],
    }
  ],
  curatedProblemIds: [String],
});

const AuditLogSchema = new mongoose.Schema({
  id: { type: String, default: () => `aud-${uuidv4()}`, unique: true },
  userId: String,
  userName: String,
  role: String,
  action: String,
  resourceType: String,
  resourceId: String,
  details: String,
  timestamp: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema);
export const Enrollment = mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);
export const Assessment = mongoose.models.Assessment || mongoose.model('Assessment', AssessmentSchema);
export const AssessmentAttempt = mongoose.models.AssessmentAttempt || mongoose.model('AssessmentAttempt', AssessmentAttemptSchema);
export const CodingProblem = mongoose.models.CodingProblem || mongoose.model('CodingProblem', CodingProblemSchema);
export const CodingSubmission = mongoose.models.CodingSubmission || mongoose.model('CodingSubmission', CodingSubmissionSchema);
export const Company = mongoose.models.Company || mongoose.model('Company', CompanySchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
