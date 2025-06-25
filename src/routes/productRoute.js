import { Router } from 'express';
import ProductController from '../controllers/productController.js';
import { authenticate } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validateAdmin.js';
import { uploadProduct } from '../middleware/upload.js';
import { validateCreateProduct, validateUpdateProduct } from '../middleware/validateProduct.js';

const router = Router();

router.post(
    '/', 
    authenticate, 
    validateAdmin, 
    uploadProduct, 
    validateCreateProduct,
    ProductController.createProduct
);

router.put(
    '/:id', 
    authenticate, 
    validateAdmin,
    uploadProduct, 
    validateUpdateProduct,
    ProductController.updateProduct
);

router.delete('/:id', authenticate, validateAdmin, ProductController.deleteProduct);

router.get('/', ProductController.getAllProducts);
router.get('/search', ProductController.searchProducts);
router.get('/:id', ProductController.getProductById);

export default router;
