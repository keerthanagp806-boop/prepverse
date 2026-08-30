import express, { Response } from 'express';
import { store } from '../db/store';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get platform analytics overview
router.get('/analytics', authenticate, authorize(['ADMIN', 'INSTRUCTOR']), (req: AuthRequest, res: Response): void => {
  const users = store.getUsers();
  const courses = store.getCourses();
  const assessments = store.getAssessments();
  const problems = store.getCodingProblems();
  const companies = store.getCompanies();

  const studentCount = users.filter(u => u.role === 'STUDENT').length;
  const instructorCount = users.filter(u => u.role === 'INSTRUCTOR').length;

  res.json({
    metrics: {
      totalStudents: studentCount,
      totalInstructors: instructorCount,
      totalCourses: courses.length,
      totalAssessments: assessments.length,
      totalCodingProblems: problems.length,
      totalCompanies: companies.length
    }
  });
});

// List all users
router.get('/users', authenticate, authorize(['ADMIN']), (req: AuthRequest, res: Response): void => {
  const users = store.getUsers().map(({ password: _, ...u }) => u);
  res.json({ users });
});

// Update user role or status
router.put('/users/:id/role', authenticate, authorize(['ADMIN']), (req: AuthRequest, res: Response): void => {
  const { role } = req.body;
  if (!['STUDENT', 'INSTRUCTOR', 'ADMIN'].includes(role)) {
    res.status(400).json({ error: 'Invalid role' });
    return;
  }

  const updated = store.updateUser(req.params.id, { role });
  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  store.logAction({
    userId: req.user!.id,
    userName: req.user?.id || 'Admin',
    role: req.user!.role,
    action: 'USER_ROLE_UPDATED',
    resourceType: 'User',
    resourceId: req.params.id,
    details: `Updated role to ${role}`
  });

  const { password: _, ...userWithoutPass } = updated;
  res.json({ user: userWithoutPass });
});

// Approve / Reject Course
router.put('/courses/:id/status', authenticate, authorize(['ADMIN']), (req: AuthRequest, res: Response): void => {
  const { status } = req.body; // 'published' | 'pending_approval' | 'draft' | 'archived'
  const updated = store.updateCourse(req.params.id, { status });

  if (!updated) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  store.logAction({
    userId: req.user!.id,
    userName: req.user?.id || 'Admin',
    role: req.user!.role,
    action: 'COURSE_STATUS_UPDATED',
    resourceType: 'Course',
    resourceId: req.params.id,
    details: `Status set to ${status}`
  });

  res.json({ course: updated });
});

// Get Audit Logs
router.get('/audit-logs', authenticate, authorize(['ADMIN']), (req: AuthRequest, res: Response): void => {
  const logs = store.getAuditLogs();
  res.json({ logs });
});

export default router;
