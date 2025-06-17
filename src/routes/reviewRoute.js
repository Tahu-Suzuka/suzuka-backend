import { Router } from 'express';
import ReviewController from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadReview } from '../middleware/upload.js'; // Impor middleware upload ulasan

const router = Router({ mergeParams: true }); // mergeParams penting untuk dapat :orderId

// Rute ini akan menjadi /orders/:orderId/reviews
router.post(
    '/',
    authenticate,
    uploadReview,
    ReviewController.createReview
);

export default router;