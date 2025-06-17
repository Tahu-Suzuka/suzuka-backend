// src/routes/orderRoute.js
import { Router } from 'express';
import OrderController from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validateAdmin.js';
import reviewRouter from './reviewRoute.js';

const router = Router();

router.post('/', authenticate, OrderController.createOrder); // Buat pesanan baru
router.post('/from-cart', authenticate, OrderController.createOrderFromCart); // Buat pesanan dari keranjang
router.get('/', authenticate, OrderController.getUserOrders); // Lihat riwayat pesanan
router.get('/:id', authenticate, OrderController.getSingleOrder); // Lihat detail satu pesanan

// Rute untuk Midtrans
router.post(
    '/:orderId/create-payment',
    authenticate,
    OrderController.createMidtransTransaction
);

router.post('/midtrans-notification', OrderController.handleMidtransNotification);



// Rute khusus untuk Admin
router.patch(
    '/:id/status', 
    authenticate, 
    validateAdmin, 
    OrderController.updateOrderStatus
); // Update status pesanan

router.use('/:orderId/reviews', reviewRouter); 

// Testing routes - bisa dihapus setelah masalah teratasi


export default router;