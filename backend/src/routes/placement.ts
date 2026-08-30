import express, { Response } from 'express';
import { store } from '../db/store';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get Placement Readiness metrics, category percentages & recommended next steps
router.get('/readiness', authenticate, (req: AuthRequest, res: Response): void => {
  const readiness = store.getPlacementReadiness(req.user!.id);
  res.json(readiness);
});

export default router;
