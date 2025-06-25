import { Router } from 'express';
import CategoryController from '../controllers/categoryController.js';
import { validateCreateCategory, validateUpdateCategory } from '../middleware/validateCategory.js';
import { authenticate } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validateAdmin.js';
import { uploadCategory } from '../middleware/upload.js';

const router = Router();
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

router.post(
    '/', 
    authenticate, 
    validateAdmin, 
    uploadCategory,
    validateCreateCategory,
    CategoryController.createCategory
);

router.put(
    '/:id', 
    authenticate, 
    validateAdmin,
    uploadCategory, 
    validateUpdateCategory,
    CategoryController.updateCategory
);

router.delete('/:id', authenticate, validateAdmin, CategoryController.deleteCategory);

export default router;