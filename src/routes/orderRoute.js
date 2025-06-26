// src/routes/orderRoute.js
import { Router } from 'express';
import OrderController from '../controllers/orderController.js';
import { authenticate } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validateAdmin.js';
import {
  validateCreateOrder,
  validateCreateOrderFromCart,
  validateUpdateStatus,
  validateUpdateStatusByUser,
  validateManualOrder,
} from '../middleware/validateOrder.js';

const router = Router();

router.post('/', authenticate, validateCreateOrder, OrderController.createOrder);
router.post(
  '/from-cart',
  authenticate,
  validateCreateOrderFromCart,
  OrderController.createOrderFromCart
);
router.post(
  '/manual',
  authenticate,
  validateAdmin,
  validateManualOrder,
  OrderController.createManualOrder
); // Pesanan manual (hanya untuk admin)
router.get('/all', authenticate, validateAdmin, OrderController.getAllOrders); // Lihat semua pesanan (hanya untuk admin)
router.get('/', authenticate, OrderController.getUserOrders); // Lihat riwayat pesanan
router.get('/:id', authenticate, OrderController.getSingleOrder); // Lihat detail satu pesanan

// Rute untuk Midtrans
router.post('/:orderId/create-payment', authenticate, OrderController.createMidtransTransaction);

router.post('/midtrans-notification', OrderController.handleMidtransNotification);

router.patch(
  '/:orderId/user-status',
  authenticate,
  validateUpdateStatusByUser,
  OrderController.updateOrderStatusByUser
);

// Rute khusus untuk Admin
router.patch(
  '/:id/status',
  authenticate,
  validateAdmin,
  validateUpdateStatus,
  OrderController.updateOrderStatus
);

export default router;
