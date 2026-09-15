import { Router } from 'express';
import { getProfile, upsertProfile } from '../controllers/profileController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/', getProfile);
router.post('/', upsertProfile);
router.put('/', upsertProfile);
export default router;
