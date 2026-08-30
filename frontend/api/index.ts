import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import authRoutes from './routes/auth';
import coursesRoutes from './routes/courses';
import assessmentRoutes from './routes/assessments';
import codingRoutes from './routes/coding';
import companyRoutes from './routes/companies';
import placementRoutes from './routes/placement';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload';

dotenv.config();

import connectToDatabase from './_lib/db/mongodb';

const app = express();

// Connect to MongoDB before handling requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('Failed to connect to DB', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'PrepVerse API Engine (Serverless)',
    timestamp: new Date().toISOString()
  });
});

// Route Endpoints
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', coursesRoutes);
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/coding', codingRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/placement', placementRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/upload', uploadRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
