import { User, Course, Enrollment, Assessment, AssessmentAttempt, CodingProblem, CodingSubmission, Company, AuditLog } from './models';
import { v4 as uuidv4 } from 'uuid';

class MongoStore {
  // --- Users ---
  async getUsers() { return User.find({}); }
  async getUserById(id: string) { return User.findOne({ id }); }
  async getUserByEmail(email: string) { return User.findOne({ email: email.toLowerCase() }); }
  async createUser(user: any) { return User.create(user); }
  async updateUser(id: string, updates: any) { return User.findOneAndUpdate({ id }, updates, { new: true }); }

  // --- Courses & LMS ---
  async getCourses(filter?: { category?: string; difficulty?: string; search?: string; status?: string }) {
    const query: any = {};
    if (filter?.status && filter.status !== 'all') query.status = filter.status;
    if (filter?.category && filter.category !== 'all') query.category = filter.category;
    if (filter?.difficulty && filter.difficulty !== 'all') query.difficulty = filter.difficulty;
    
    let courses = await Course.find(query).lean();
    
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      courses = courses.filter(c => 
        (c.title && c.title.toLowerCase().includes(q)) || 
        (c.description && c.description.toLowerCase().includes(q)) || 
        (c.instructorName && c.instructorName.toLowerCase().includes(q))
      );
    }
    return courses;
  }
  async getCourseById(id: string) { return Course.findOne({ id }).lean(); }
  async createCourse(course: any) { return Course.create(course); }
  async updateCourse(id: string, updates: any) { 
    updates.updatedAt = new Date();
    return Course.findOneAndUpdate({ id }, updates, { new: true }).lean(); 
  }
  async deleteCourse(id: string) { 
    const res = await Course.deleteOne({ id });
    return res.deletedCount > 0;
  }

  // --- Enrollments & Progress ---
  async enrollStudent(userId: string, courseId: string) {
    const existing = await Enrollment.findOne({ userId, courseId });
    if (existing) return existing;
    return Enrollment.create({ userId, courseId });
  }
  async getEnrollment(userId: string, courseId: string) { return Enrollment.findOne({ userId, courseId }).lean(); }
  async getUserEnrollments(userId: string) { return Enrollment.find({ userId }).lean(); }
  async getAllEnrollments() { return Enrollment.find({}).lean(); }
  
  async updateLessonProgress(userId: string, courseId: string, lessonId: string, markComplete: boolean) {
    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) return null;
    
    enrollment.lastAccessedLessonId = lessonId;
    enrollment.lastAccessedAt = new Date();
    
    if (markComplete) {
      if (!enrollment.completedLessonIds) enrollment.completedLessonIds = [];
      if (!enrollment.completedLessonIds.includes(lessonId)) {
        enrollment.completedLessonIds.push(lessonId);
      }
    }
    
    const course = await Course.findOne({ id: courseId });
    if (course) {
      let totalLessons = 0;
      course.modules?.forEach((m: any) => { totalLessons += (m.lessons?.length || 0); });
      if (totalLessons > 0) {
        enrollment.progressPercentage = Math.round((enrollment.completedLessonIds.length / totalLessons) * 100);
      }
    }
    
    await enrollment.save();
    return enrollment;
  }

  // --- Assessments & Attempts ---
  async getAssessments() { return Assessment.find({}).lean(); }
  async getAssessmentById(id: string) { return Assessment.findOne({ id }).lean(); }
  async createAssessment(assessment: any) { return Assessment.create(assessment); }
  async updateAssessment(id: string, updates: any) { return Assessment.findOneAndUpdate({ id }, updates, { new: true }).lean(); }
  async deleteAssessment(id: string) { 
    const res = await Assessment.deleteOne({ id });
    return res.deletedCount > 0;
  }

  // Attempts
  async getAttemptById(id: string) { return AssessmentAttempt.findOne({ id }).lean(); }
  async getUserAttempts(userId: string) { return AssessmentAttempt.find({ userId }).lean(); }
  async startAssessmentAttempt(attempt: any) { return AssessmentAttempt.create(attempt); }
  async updateAttempt(id: string, updates: any) { return AssessmentAttempt.findOneAndUpdate({ id }, updates, { new: true }).lean(); }
  
  async saveAttemptAnswer(userId: string, assessmentId: string, questionId: string, optionIndex: number) {
    const attempt = await AssessmentAttempt.findOne({ userId, assessmentId, status: 'IN_PROGRESS' });
    if (!attempt) return null;
    attempt.answers.set(questionId, optionIndex);
    await attempt.save();
    return attempt;
  }

  async recordIntegrityEvent(userId: string, assessmentId: string, event: any) {
    const attempt = await AssessmentAttempt.findOne({ userId, assessmentId, status: 'IN_PROGRESS' });
    if (!attempt) return null;
    attempt.integrityEvents.push(event);
    if (event.type === 'TAB_SWITCH') {
      attempt.tabSwitchCount = (attempt.tabSwitchCount || 0) + 1;
    }
    await attempt.save();
    return attempt;
  }

  async submitAttempt(userId: string, assessmentId: string) {
    const attempt = await AssessmentAttempt.findOne({ userId, assessmentId, status: 'IN_PROGRESS' });
    if (!attempt) return null;
    // For now just mark submitted to unblock TS
    attempt.status = 'SUBMITTED';
    attempt.actualSubmittedAt = new Date();
    await attempt.save();
    return attempt;
  }

  // --- Coding Problems ---
  async getCodingProblems() { return CodingProblem.find({}).lean(); }
  async getCodingProblemById(id: string) { return CodingProblem.findOne({ id }).lean(); }
  async getCodingProblemBySlug(slug: string) { return CodingProblem.findOne({ slug }).lean(); }
  async createCodingProblem(problem: any) { return CodingProblem.create(problem); }
  async updateCodingProblem(id: string, updates: any) { return CodingProblem.findOneAndUpdate({ id }, updates, { new: true }).lean(); }
  async deleteCodingProblem(id: string) { 
    const res = await CodingProblem.deleteOne({ id });
    return res.deletedCount > 0;
  }

  // Submissions
  async getUserSubmissions(userId: string, problemId?: string) { 
    const query: any = { userId };
    if (problemId) query.problemId = problemId;
    return CodingSubmission.find(query).lean(); 
  }
  async saveSubmission(submission: any) { return CodingSubmission.create(submission); }
  async getSubmissionsByProblem(problemId: string) { return CodingSubmission.find({ problemId }).lean(); }

  // --- Placement / Companies ---
  async getCompanies() { return Company.find({}).lean(); }
  async getCompanyById(id: string) { return Company.findOne({ id }).lean(); }
  async createCompany(company: any) { return Company.create(company); }
  async updateCompany(id: string, updates: any) { return Company.findOneAndUpdate({ id }, updates, { new: true }).lean(); }
  async deleteCompany(id: string) { 
    const res = await Company.deleteOne({ id });
    return res.deletedCount > 0;
  }

  // --- Audit Logs ---
  async getAuditLogs() { return AuditLog.find({}).sort({ timestamp: -1 }).lean(); }
  async addAuditLog(log: any) { return AuditLog.create(log); }

  // --- Placement ---
  async getPlacementReadiness(userId: string) {
    const enrollments = await this.getUserEnrollments(userId);
    const submissions = await this.getUserSubmissions(userId);
    const attempts = await this.getUserAttempts(userId);

    const completedCourses = enrollments.filter(e => e.progressPercentage === 100).length;
    const totalProblemsSolved = submissions.filter(s => s.status === 'Accepted').length;
    
    let avgAssessmentScore = 0;
    if (attempts.length > 0) {
      avgAssessmentScore = attempts.reduce((acc, curr) => acc + curr.percentage, 0) / attempts.length;
    }

    return {
      completedCourses,
      totalProblemsSolved,
      avgAssessmentScore: Math.round(avgAssessmentScore),
      overallReadiness: Math.min(100, Math.round((completedCourses * 20) + (totalProblemsSolved * 2) + (avgAssessmentScore * 0.4)))
    };
  }
}

export const store = new MongoStore();
