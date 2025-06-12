// src/routes/orderRoute.js
import { Router } from 'express';
import OrderController from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validateAdmin.js';

const router = Router();

router.post('/', authenticate, OrderController.createOrder); // Buat pesanan baru
router.post('/from-cart', authenticate, OrderController.createOrderFromCart); // Buat pesanan dari keranjang
router.get('/', authenticate, OrderController.getUserOrders); // Lihat riwayat pesanan
router.get('/:id', authenticate, OrderController.getSingleOrder); // Lihat detail satu pesanan

router.post('/:id/apply-voucher', authenticate, OrderController.applyVoucher);

// Rute khusus untuk Admin
router.patch(
    '/:id/status', 
    authenticate, 
    validateAdmin, 
    OrderController.updateOrderStatus
); // Update status pesanan

export default router;