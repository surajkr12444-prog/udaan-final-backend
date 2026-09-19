import { Router } from 'express';
import { getScholarship, listScholarships, matchScholarships } from '../controllers/scholarshipController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
router.get('/', listScholarships);
router.post('/match', optionalAuth, matchScholarships);
router.get('/:id', getScholarship);
export default router;
