import { Router } from 'express';
import { emailLogin, emailSignup, googleLogin, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.post('/signup', emailSignup);
router.post('/login', emailLogin);
router.post('/google', googleLogin);
router.get('/me', requireAuth, me);
export default router;
