import { Router } from 'express';
import AdminController from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validateAdmin.js';

const router = Router();

router.get('/dashboard/stats', authenticate, validateAdmin, AdminController.getDashboardStats);

export default router;
