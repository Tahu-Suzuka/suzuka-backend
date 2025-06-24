import { Router } from 'express';
import ReviewController from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadReview } from '../middleware/upload.js'; 
import { validateCreateReview } from '../middleware/validateReview.js';

const router = Router({ mergeParams: true }); 

router.get(
    '/',
    ReviewController.getAllReviews
);

router.get(
    '/product/:productId',
    ReviewController.getProductReviews
);

router.post(
    '/',
    authenticate,
    uploadReview, 
    validateCreateReview, 
    ReviewController.createReview
);

export default router;