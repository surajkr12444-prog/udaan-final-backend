import { Router } from 'express';
import {
  listApplications,
  saveApplication,
  updateApplication
} from '../controllers/applicationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/', listApplications);
router.post('/', saveApplication);
router.patch('/:id', updateApplication);
export default router;
