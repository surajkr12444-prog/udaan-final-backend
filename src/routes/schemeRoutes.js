import { Router } from 'express';
import { getScheme, listSchemes } from '../controllers/schemeController.js';

const router = Router();
router.get('/', listSchemes);
router.get('/:id', getScheme);
export default router;
