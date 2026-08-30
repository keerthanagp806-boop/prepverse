import express, { Response } from 'express';
import { store } from '../_lib/store_mongo';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get Placement Readiness metrics, category percentages & recommended next steps
router.get('/readiness', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const readiness = await store.getPlacementReadiness(req.user!.id);
  res.json(readiness);
});

export default router;
