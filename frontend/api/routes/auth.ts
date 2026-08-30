import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../_lib/models';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'prepverse_super_secret_jwt_key_2026';

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role, branch, graduationYear, cgpa } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required.' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({ error: 'A user with this email already exists.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: role || 'STUDENT',
      branch: branch || 'Computer Science & Engineering',
      graduationYear: graduationYear || 2026,
      cgpa: cgpa ? Number(cgpa) : 8.0,
      skills: ['Python', 'Problem Solving', 'Data Structures']
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userObj = newUser.toObject();
    delete userObj.password;
    res.status(201).json({ token, user: userObj });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userObj = user.toObject();
    delete userObj.password;
    res.json({ token, user: userObj });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Demo Fast Switch (For seamless testing across Student, Instructor, and Admin)
router.post('/demo-login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body; // 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
    const targetRole = role || 'STUDENT';
    const user = await User.findOne({ role: targetRole });

    if (!user) {
      res.status(404).json({ error: `No demo account found for role ${targetRole}` });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userObj = user.toObject();
    delete userObj.password;
    res.json({ token, user: userObj });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Demo login failed' });
  }
});

// Current Authenticated User Profile
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ id: req.user!.id });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ user: userObj });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile
router.put('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ id: req.user!.id });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { name, email, avatar, branch, graduationYear, cgpa, skills } = req.body;

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        res.status(400).json({ error: 'A user with this email address already exists.' });
        return;
      }
    }

    user.name = name !== undefined ? name : user.name;
    user.email = email !== undefined ? email.toLowerCase() : user.email;
    user.avatar = avatar !== undefined ? avatar : user.avatar;
    user.branch = branch !== undefined ? branch : user.branch;
    user.graduationYear = graduationYear !== undefined ? (graduationYear ? Number(graduationYear) : undefined) : user.graduationYear;
    user.cgpa = cgpa !== undefined ? (cgpa ? Number(cgpa) : undefined) : user.cgpa;
    user.skills = skills !== undefined ? skills : user.skills;
    
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    res.json({ user: userObj });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
