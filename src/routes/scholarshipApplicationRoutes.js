import { Router } from 'express';
import {
  listScholarshipApplications,
  saveScholarshipApplication,
  updateScholarshipApplication
} from '../controllers/scholarshipApplicationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/', listScholarshipApplications);
router.post('/', saveScholarshipApplication);
router.patch('/:id', updateScholarshipApplication);
export default router;
