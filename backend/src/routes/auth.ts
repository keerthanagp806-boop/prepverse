import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { store } from '../db/store';
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

    const existingUser = store.getUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'A user with this email already exists.' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = store.createUser({
      email,
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

    const { password: _, ...userWithoutPass } = newUser;
    res.status(201).json({ token, user: userWithoutPass });
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

    const user = store.getUserByEmail(email);
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

    const { password: _, ...userWithoutPass } = user;
    res.json({ token, user: userWithoutPass });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// Demo Fast Switch (For seamless testing across Student, Instructor, and Admin)
router.post('/demo-login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { role } = req.body; // 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
    const targetRole = role || 'STUDENT';
    const user = store.getUsers().find(u => u.role === targetRole);

    if (!user) {
      res.status(404).json({ error: `No demo account found for role ${targetRole}` });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPass } = user;
    res.json({ token, user: userWithoutPass });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Demo login failed' });
  }
});

// Current Authenticated User Profile
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = store.getUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const { password: _, ...userWithoutPass } = user;
    res.json({ user: userWithoutPass });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile
router.put('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = store.getUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { name, email, avatar, branch, graduationYear, cgpa, skills } = req.body;

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = store.getUserByEmail(email);
      if (existing) {
        res.status(400).json({ error: 'A user with this email address already exists.' });
        return;
      }
    }

    const updated = store.updateUser(req.user!.id, {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
