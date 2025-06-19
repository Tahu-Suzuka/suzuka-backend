import { Router } from 'express';
import ProductController from '../controllers/productController.js';
import { authenticate } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validateAdmin.js';
import { uploadProduct } from '../middleware/upload.js';
import ReviewController from '../controllers/reviewController.js';

const router = Router();

router.post('/', authenticate, validateAdmin, uploadProduct, ProductController.createProduct);
router.put('/:id', authenticate, validateAdmin, uploadProduct, ProductController.updateProduct);
router.delete('/:id', authenticate, validateAdmin, ProductController.deleteProduct);

router.get('/', ProductController.getAllProducts);
router.get('/search', ProductController.searchProducts);
router.get('/:id', ProductController.getProductById);

router.get('/:productId/reviews', ReviewController.getProductReviews);



export default router;
