import { Router } from 'express';
import cartController from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Semua rute di bawah ini memerlukan autentikasi
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/', cartController.addItem);
router.delete('/', cartController.clearCart);
router.patch('/:id', cartController.updateItem);
router.delete('/:id', cartController.removeItem);

export default router;