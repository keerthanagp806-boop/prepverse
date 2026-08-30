"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const store_1 = require("../db/store");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'prepverse_super_secret_jwt_key_2026';
// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role, branch, graduationYear, cgpa } = req.body;
        if (!email || !password || !name) {
            res.status(400).json({ error: 'Email, password, and name are required.' });
            return;
        }
        const existingUser = store_1.store.getUserByEmail(email);
        if (existingUser) {
            res.status(400).json({ error: 'A user with this email already exists.' });
            return;
        }
        const salt = bcryptjs_1.default.genSaltSync(10);
        const hashedPassword = bcryptjs_1.default.hashSync(password, salt);
        const newUser = store_1.store.createUser({
            email,
            password: hashedPassword,
            name,
            role: role || 'STUDENT',
            branch: branch || 'Computer Science & Engineering',
            graduationYear: graduationYear || 2026,
            cgpa: cgpa ? Number(cgpa) : 8.0,
            skills: ['Python', 'Problem Solving', 'Data Structures']
        });
        const token = jsonwebtoken_1.default.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...userWithoutPass } = newUser;
        res.status(201).json({ token, user: userWithoutPass });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Registration failed' });
    }
});
// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required.' });
            return;
        }
        const user = store_1.store.getUserByEmail(email);
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password.' });
            return;
        }
        const isMatch = bcryptjs_1.default.compareSync(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid email or password.' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...userWithoutPass } = user;
        res.json({ token, user: userWithoutPass });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Login failed' });
    }
});
// Demo Fast Switch (For seamless testing across Student, Instructor, and Admin)
router.post('/demo-login', async (req, res) => {
    try {
        const { role } = req.body; // 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
        const targetRole = role || 'STUDENT';
        const user = store_1.store.getUsers().find(u => u.role === targetRole);
        if (!user) {
            res.status(404).json({ error: `No demo account found for role ${targetRole}` });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...userWithoutPass } = user;
        res.json({ token, user: userWithoutPass });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Demo login failed' });
    }
});
// Current Authenticated User Profile
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const user = store_1.store.getUserById(req.user.id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const { password: _, ...userWithoutPass } = user;
        res.json({ user: userWithoutPass });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update Profile
router.put('/me', auth_1.authenticate, async (req, res) => {
    try {
        const user = store_1.store.getUserById(req.user.id);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const { name, email, avatar, branch, graduationYear, cgpa, skills } = req.body;
        if (email && email.toLowerCase() !== user.email.toLowerCase()) {
            const existing = store_1.store.getUserByEmail(email);
            if (existing) {
                res.status(400).json({ error: 'A user with this email address already exists.' });
                return;
            }
        }
        const updated = store_1.store.updateUser(req.user.id, {
            name: name !== undefined ? name : user.name,
            email: email !== undefined ? email : user.email,
            avatar: avatar !== undefined ? avatar : user.avatar,
            branch: branch !== undefined ? branch : user.branch,
            graduationYear: graduationYear !== undefined ? (graduationYear ? Number(graduationYear) : undefined) : user.graduationYear,
            cgpa: cgpa !== undefined ? (cgpa ? Number(cgpa) : undefined) : user.cgpa,
            skills: skills !== undefined ? skills : user.skills
        });
        if (!updated) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const { password: _, ...userWithoutPass } = updated;
        res.json({ user: userWithoutPass });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
