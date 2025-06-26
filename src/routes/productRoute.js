import { Router } from 'express';
import ProductController from '../controllers/productController.js';
import { authenticate } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validateAdmin.js';
import { uploadProduct } from '../middleware/upload.js';
import { processUploads } from '../middleware/processUploads.js';
import { validateCreateProduct, validateUpdateProduct } from '../middleware/validateProduct.js';

const router = Router();

const uploadConfig = [
  { name: 'mainImage', path: 'main', single: true },
  { name: 'additionalImages', path: 'additional', single: false },
];

router.post(
  '/',
  authenticate,
  validateAdmin,
  uploadProduct, // Middleware multer
  processUploads('products', uploadConfig), // Proses upload ke GCS
  validateCreateProduct,
  ProductController.createProduct
);

router.put(
  '/:id',
  authenticate,
  validateAdmin,
  uploadProduct, // Middleware multer
  processUploads('products', uploadConfig), // Proses upload ke GCS
  validateUpdateProduct,
  ProductController.updateProduct
);
router.delete('/:id', authenticate, validateAdmin, ProductController.deleteProduct);

router.get('/', ProductController.getAllProducts);
router.get('/search', ProductController.searchProducts);
router.get('/:id', ProductController.getProductById);

export default router;
