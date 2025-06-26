import { Router } from 'express';
import ReviewController from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadReview } from '../middleware/upload.js';
import { processUploads } from '../middleware/processUploads.js';
import { validateCreateReview } from '../middleware/validateReview.js';

const router = Router({ mergeParams: true });

router.get('/', ReviewController.getAllReviews);

router.get('/product/:productId', ReviewController.getProductReviews);

router.post(
  '/', 
  authenticate, 
  uploadReview, // Middleware multer (array upload)
  processUploads('reviews'), // Proses upload ke GCS - tanpa config karena untuk array
  validateCreateReview, 
  ReviewController.createReview
);

export default router;
