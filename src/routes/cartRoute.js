import { Router } from 'express';
import cartController from '../controllers/cartController.js';
import { authenticate } from '../middleware/auth.js';
import { validateAddItem, validateUpdateItem } from '../middleware/validateCart.js';

const router = Router();

// Semua rute di bawah ini memerlukan autentikasi
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/', validateAddItem, cartController.addItem);
router.delete('/', cartController.clearCart);
router.patch('/', validateUpdateItem, cartController.updateItems);
router.delete('/:id', cartController.removeItem);

export default router;
