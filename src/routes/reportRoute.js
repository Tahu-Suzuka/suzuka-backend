import { Router } from 'express';
import ReportController from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validateAdmin.js';

const router = Router();

router.get('/orders', authenticate, validateAdmin, ReportController.generateOrderReport);

export default router;