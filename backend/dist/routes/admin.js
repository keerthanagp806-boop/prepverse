"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const store_1 = require("../db/store");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get platform analytics overview
router.get('/analytics', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN', 'INSTRUCTOR']), (req, res) => {
    const users = store_1.store.getUsers();
    const courses = store_1.store.getCourses();
    const assessments = store_1.store.getAssessments();
    const problems = store_1.store.getCodingProblems();
    const companies = store_1.store.getCompanies();
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
router.get('/users', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN']), (req, res) => {
    const users = store_1.store.getUsers().map(({ password: _, ...u }) => u);
    res.json({ users });
});
// Update user role or status
router.put('/users/:id/role', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN']), (req, res) => {
    const { role } = req.body;
    if (!['STUDENT', 'INSTRUCTOR', 'ADMIN'].includes(role)) {
        res.status(400).json({ error: 'Invalid role' });
        return;
    }
    const updated = store_1.store.updateUser(req.params.id, { role });
    if (!updated) {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    store_1.store.logAction({
        userId: req.user.id,
        userName: req.user?.id || 'Admin',
        role: req.user.role,
        action: 'USER_ROLE_UPDATED',
        resourceType: 'User',
        resourceId: req.params.id,
        details: `Updated role to ${role}`
    });
    const { password: _, ...userWithoutPass } = updated;
    res.json({ user: userWithoutPass });
});
// Approve / Reject Course
router.put('/courses/:id/status', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN']), (req, res) => {
    const { status } = req.body; // 'published' | 'pending_approval' | 'draft' | 'archived'
    const updated = store_1.store.updateCourse(req.params.id, { status });
    if (!updated) {
        res.status(404).json({ error: 'Course not found' });
        return;
    }
    store_1.store.logAction({
        userId: req.user.id,
        userName: req.user?.id || 'Admin',
        role: req.user.role,
        action: 'COURSE_STATUS_UPDATED',
        resourceType: 'Course',
        resourceId: req.params.id,
        details: `Status set to ${status}`
    });
    res.json({ course: updated });
});
// Get Audit Logs
router.get('/audit-logs', auth_1.authenticate, (0, auth_1.authorize)(['ADMIN']), (req, res) => {
    const logs = store_1.store.getAuditLogs();
    res.json({ logs });
});
exports.default = router;
