import { Router } from 'express';
import ReportController from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validateAdmin.js';
import { validateGetReport } from '../middleware/validateReport.js';
const router = Router();

router.get('/orders', authenticate, validateAdmin, validateGetReport, ReportController.generateOrderReport);

export default router;