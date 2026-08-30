import express, { Response } from 'express';
import { store } from '../_lib/store_mongo';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get platform analytics overview
router.get('/analytics', authenticate, authorize(['ADMIN', 'INSTRUCTOR']), async (req: AuthRequest, res: Response): Promise<void> => {
  const users = await store.getUsers();
  const courses = await store.getCourses();
  const assessments = await store.getAssessments();
  const problems = await store.getCodingProblems();
  const companies = await store.getCompanies();

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
router.get('/users', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const usersRaw = await store.getUsers();
  const users = usersRaw.map(({ password: _, ...u }: any) => u);
  res.json({ users });
});

// Update user role or status
router.put('/users/:id/role', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { role } = req.body;
  if (!['STUDENT', 'INSTRUCTOR', 'ADMIN'].includes(role)) {
    res.status(400).json({ error: 'Invalid role' });
    return;
  }

  const updated = await store.updateUser((req.params.id as string), { role });
  if (!updated) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  await store.addAuditLog({ userId: {
    userId: req.user!.id, userName: userName: req.user?.id || 'Admin', role: role: req.user!.role, action: action: 'USER_ROLE_UPDATED', resourceType: resourceType: 'User', resourceId: resourceId: (req.params.id as string), details: details: `Updated role to ${role}`
  } });

  const { password: _, ...userWithoutPass } = updated;
  res.json({ user: userWithoutPass });
});

// Approve / Reject Course
router.put('/courses/:id/status', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body; // 'published' | 'pending_approval' | 'draft' | 'archived'
  const updated = await store.updateCourse((req.params.id as string), { status });

  if (!updated) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }

  await store.addAuditLog({ userId: {
    userId: req.user!.id, userName: userName: req.user?.id || 'Admin', role: role: req.user!.role, action: action: 'COURSE_STATUS_UPDATED', resourceType: resourceType: 'Course', resourceId: resourceId: (req.params.id as string), details: details: `Status set to ${status}`
  } });

  res.json({ course: updated });
});

// Get Audit Logs
router.get('/audit-logs', authenticate, authorize(['ADMIN']), async (req: AuthRequest, res: Response): Promise<void> => {
  const logs = await store.getAuditLogs();
  res.json({ logs });
});

export default router;
