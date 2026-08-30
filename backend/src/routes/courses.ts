import express, { Response } from 'express';
import { store } from '../db/store';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// ─── GET ALL COURSES (with filters) ───────────────────────────────────────────
// Public: defaults to published only.
// Admin/Instructor with ?status=all can see every course.
router.get('/', (req, res) => {
  const { category, difficulty, search, status } = req.query;

  // If no status supplied by a non-privileged caller, only show published.
  // Admin/Instructor callers explicitly pass status=all to see everything.
  const statusFilter = (status as string) || 'published';

  const courses = store.getCourses({
    category: category as string,
    difficulty: difficulty as string,
    search: search as string,
    status: statusFilter
  });
  res.json({ courses });
});

// ─── MY ENROLLED COURSES ──────────────────────────────────────────────────────
router.get('/enrolled/me', authenticate, (req: AuthRequest, res: Response): void => {
  const enrollments = store.getUserEnrollments(req.user!.id);
  const enrolledCourses = enrollments.map(e => {
    const course = store.getCourseById(e.courseId);
    return { ...course, enrollment: e };
  }).filter(c => !!c.id);

  res.json({ enrolledCourses });
});

// ─── ADMIN / INSTRUCTOR ENROLLMENT VIEWS ─────────────────────────────────────
router.get('/admin/enrollments', authenticate, authorize(['ADMIN']), (req: AuthRequest, res: Response): void => {
  const enrollments = store.getAllEnrollments();
  const enriched = enrollments.map(e => {
    const user = store.getUserById(e.userId);
    const course = store.getCourseById(e.courseId);
    return {
      id: e.id,
      studentId: e.userId,
      studentName: user?.name || 'Unknown Student',
      studentEmail: user?.email || 'Unknown Email',
      courseId: e.courseId,
      courseTitle: course?.title || 'Unknown Course',
      enrolledAt: e.enrolledAt,
      progressPercentage: e.progressPercentage,
      status: e.progressPercentage === 100 ? 'Completed' : 'Enrolled'
    };
  });
  res.json({ enrollments: enriched });
});

router.get('/instructor/enrollments', authenticate, authorize(['INSTRUCTOR', 'ADMIN']), (req: AuthRequest, res: Response): void => {
  const enrollments = store.getAllEnrollments();
  const enriched = enrollments.map(e => {
    const user = store.getUserById(e.userId);
    const course = store.getCourseById(e.courseId);
    return {
      id: e.id,
      studentId: e.userId,
      studentName: user?.name || 'Unknown Student',
      studentEmail: user?.email || 'Unknown Email',
      courseId: e.courseId,
      courseTitle: course?.title || 'Unknown Course',
      instructorId: course?.instructorId,
      enrolledAt: e.enrolledAt,
      progressPercentage: e.progressPercentage,
      status: e.progressPercentage === 100 ? 'Completed' : 'Enrolled'
    };
  }).filter(e => {
    if (req.user!.role === 'ADMIN') return true;
    return e.instructorId === req.user!.id;
  });

  res.json({ enrollments: enriched });
});

// ─── GET SINGLE COURSE ────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const course = store.getCourseById(req.params.id);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  res.json({ course });
});

// ─── ENROLL IN A COURSE ───────────────────────────────────────────────────────
router.post('/:id/enroll', authenticate, (req: AuthRequest, res: Response): void => {
  const course = store.getCourseById(req.params.id);
  if (!course) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  if (course.status !== 'published') {
    res.status(403).json({ error: 'This course is not yet available for enrollment.' });
    return;
  }

  const { name, email } = req.body;
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Please enter your full name.' });
    return;
  }
  if (!email || !email.trim() || !email.includes('@')) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  // Check duplicate enrollment
  const existingEnrollment = store.getEnrollment(req.user!.id, req.params.id);
  if (existingEnrollment) {
    res.status(400).json({ error: 'You are already enrolled in this course.' });
    return;
  }

  // Update user name/email if changed during confirmation
  const user = store.getUserById(req.user!.id);
  if (user) {
    store.updateUser(user.id, {
      name: name.trim(),
      email: email.trim().toLowerCase()
    });
  }

  const enrollment = store.enrollStudent(req.user!.id, req.params.id);
  res.json({ message: 'Enrolled successfully', enrollment });
});

// ─── LESSON PROGRESS ──────────────────────────────────────────────────────────
router.post('/:id/lessons/:lessonId/progress', authenticate, (req: AuthRequest, res: Response): void => {
  const { markComplete } = req.body;
  const enrollment = store.updateLessonProgress(
    req.user!.id,
    req.params.id,
    req.params.lessonId,
    Boolean(markComplete)
  );

  if (!enrollment) {
    res.status(400).json({ error: 'Failed to update lesson progress' });
    return;
  }

  res.json({ message: 'Progress updated', enrollment });
});

// ─── CREATE COURSE (Admin / Instructor) ───────────────────────────────────────
router.post('/', authenticate, authorize(['INSTRUCTOR', 'ADMIN']), (req: AuthRequest, res: Response): void => {
  const { title, description, category, difficulty, thumbnail, modules, duration, objectives, prerequisites } = req.body;

  if (!title || !title.trim()) {
    res.status(400).json({ error: 'Course title is required.' });
    return;
  }
  if (!description || !description.trim()) {
    res.status(400).json({ error: 'Course description is required.' });
    return;
  }
  if (!category || !category.trim()) {
    res.status(400).json({ error: 'Course category is required.' });
    return;
  }

  // Resolve the instructor name from the store so it's always accurate
  const instructor = store.getUserById(req.user!.id);
  const instructorName = instructor?.name || 'Faculty Member';

  const course = store.createCourse({
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    difficulty: difficulty || 'Beginner',
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516116211227-bbc13c0d8f07?w=600&auto=format&fit=crop&q=80',
    instructorId: req.user!.id,
    instructorName,
    duration: duration || '',
    objectives: Array.isArray(objectives) ? objectives : [],
    prerequisites: Array.isArray(prerequisites) ? prerequisites : [],
    status: 'draft', // All new courses start as draft — Admin publishes explicitly
    modules: Array.isArray(modules) ? modules : []
  });

  store.logAction({
    userId: req.user!.id,
    userName: instructorName,
    role: req.user!.role,
    action: 'COURSE_CREATED',
    resourceType: 'Course',
    resourceId: course.id,
    details: `Created course "${course.title}" (status: draft)`
  });

  res.status(201).json({ course, message: 'Course created successfully as draft.' });
});

// ─── UPDATE COURSE (Admin or the owning Instructor) ───────────────────────────
router.put('/:id', authenticate, authorize(['INSTRUCTOR', 'ADMIN']), (req: AuthRequest, res: Response): void => {
  const existing = store.getCourseById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Course not found.' });
    return;
  }

  // Instructors can only edit their OWN courses; Admins can edit any
  if (req.user!.role === 'INSTRUCTOR' && existing.instructorId !== req.user!.id) {
    res.status(403).json({ error: 'You are not authorized to edit this course.' });
    return;
  }

  const { title, description, category, difficulty, thumbnail, modules, duration, objectives, prerequisites } = req.body;

  if (title !== undefined && !title.trim()) {
    res.status(400).json({ error: 'Course title cannot be empty.' });
    return;
  }

  const updates: any = { updatedAt: new Date().toISOString() };
  if (title !== undefined) updates.title = title.trim();
  if (description !== undefined) updates.description = description.trim();
  if (category !== undefined) updates.category = category.trim();
  if (difficulty !== undefined) updates.difficulty = difficulty;
  if (thumbnail !== undefined) updates.thumbnail = thumbnail;
  if (duration !== undefined) updates.duration = duration;
  if (objectives !== undefined) updates.objectives = Array.isArray(objectives) ? objectives : [];
  if (prerequisites !== undefined) updates.prerequisites = Array.isArray(prerequisites) ? prerequisites : [];
  if (modules !== undefined) updates.modules = Array.isArray(modules) ? modules : existing.modules;

  const updated = store.updateCourse(req.params.id, updates);

  const actor = store.getUserById(req.user!.id);
  store.logAction({
    userId: req.user!.id,
    userName: actor?.name || req.user!.id,
    role: req.user!.role,
    action: 'COURSE_UPDATED',
    resourceType: 'Course',
    resourceId: req.params.id,
    details: `Updated course "${updated?.title}"`
  });

  res.json({ course: updated, message: 'Course updated successfully.' });
});

// ─── DELETE COURSE (Admin only) ───────────────────────────────────────────────
router.delete('/:id', authenticate, authorize(['ADMIN']), (req: AuthRequest, res: Response): void => {
  const existing = store.getCourseById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Course not found.' });
    return;
  }

  store.deleteCourse(req.params.id);

  const actor = store.getUserById(req.user!.id);
  store.logAction({
    userId: req.user!.id,
    userName: actor?.name || req.user!.id,
    role: req.user!.role,
    action: 'COURSE_DELETED',
    resourceType: 'Course',
    resourceId: req.params.id,
    details: `Deleted course "${existing.title}"`
  });

  res.json({ message: `Course "${existing.title}" has been deleted.` });
});

// ─── PUBLISH COURSE (Admin only) ──────────────────────────────────────────────
router.post('/:id/publish', authenticate, authorize(['ADMIN']), (req: AuthRequest, res: Response): void => {
  const existing = store.getCourseById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Course not found.' });
    return;
  }
  if (existing.status === 'published') {
    res.status(400).json({ error: 'Course is already published.' });
    return;
  }

  const updated = store.updateCourse(req.params.id, {
    status: 'published',
    publishedAt: new Date().toISOString()
  });

  const actor = store.getUserById(req.user!.id);
  store.logAction({
    userId: req.user!.id,
    userName: actor?.name || req.user!.id,
    role: req.user!.role,
    action: 'COURSE_PUBLISHED',
    resourceType: 'Course',
    resourceId: req.params.id,
    details: `Published course "${updated?.title}"`
  });

  res.json({ course: updated, message: `Course "${updated?.title}" is now published and visible to students.` });
});

// ─── UNPUBLISH COURSE (Admin only) ────────────────────────────────────────────
router.post('/:id/unpublish', authenticate, authorize(['ADMIN']), (req: AuthRequest, res: Response): void => {
  const existing = store.getCourseById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'Course not found.' });
    return;
  }
  if (existing.status !== 'published') {
    res.status(400).json({ error: 'Course is not currently published.' });
    return;
  }

  const updated = store.updateCourse(req.params.id, { status: 'draft' });

  const actor = store.getUserById(req.user!.id);
  store.logAction({
    userId: req.user!.id,
    userName: actor?.name || req.user!.id,
    role: req.user!.role,
    action: 'COURSE_UNPUBLISHED',
    resourceType: 'Course',
    resourceId: req.params.id,
    details: `Unpublished course "${updated?.title}" — reverted to draft`
  });

  res.json({ course: updated, message: `Course "${updated?.title}" has been unpublished.` });
});

export default router;
