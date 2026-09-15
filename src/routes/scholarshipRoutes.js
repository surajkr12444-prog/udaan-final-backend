import { Router } from 'express';
import { getScholarship, listScholarships, matchScholarships } from '../controllers/scholarshipController.js';

const router = Router();
router.get('/', listScholarships);
router.post('/match', matchScholarships);
router.get('/:id', getScholarship);
export default router;
