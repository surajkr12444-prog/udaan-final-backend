import { Router } from 'express';
import { getMatchHistory, matchSchemes } from '../controllers/matchController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = Router();
router.post('/', optionalAuth, matchSchemes);
router.get('/history', requireAuth, getMatchHistory);
export default router;
