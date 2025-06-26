import { Router } from 'express';
import ReportController from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validateAdmin.js';
import { validateGetReport } from '../middleware/validateReport.js';

const router = Router();

router.get(
  '/product-sales/',
  authenticate,
  validateAdmin,
  validateGetReport,
  ReportController.getProductSalesReport
);

// Mengunduh laporan dalam format PDF
router.get(
  '/product-sales/pdf',
  authenticate,
  validateAdmin,
  validateGetReport,
  ReportController.generateProductSalesReport
);

router.get('/processing/', authenticate, validateAdmin, ReportController.getProcessingReport);

router.get(
  '/processing/pdf',
  authenticate,
  validateAdmin,
  ReportController.generateProcessingReport
);

export default router;
