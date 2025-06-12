import { Router } from 'express';
import VoucherController from '../controllers/voucherController.js';
import { authenticate } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validateAdmin.js';

const router = Router();

router.use(authenticate, validateAdmin);

router.post('/', VoucherController.createVoucher);
router.get('/', VoucherController.getAllVouchers);
router.get('/:id', VoucherController.getVoucherById);
router.put('/:id', VoucherController.updateVoucher);
router.delete('/:id', VoucherController.deleteVoucher);

export default router;