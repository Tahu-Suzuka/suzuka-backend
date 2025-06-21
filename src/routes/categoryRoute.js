import { Router } from 'express';
import CategoryController from '../controllers/categoryController.js';
import { validateCreateCategory, validateUpdateCategory } from '../middleware/validateCategory.js';
import { authenticate } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validateAdmin.js';

const router = Router();
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

router.post(
    '/', 
    authenticate, 
    validateAdmin, 
    validateCreateCategory,
    CategoryController.createCategory
);

router.put(
    '/:id', 
    authenticate, 
    validateAdmin, 
    validateUpdateCategory,
    CategoryController.updateCategory
);

router.delete('/:id', authenticate, validateAdmin, CategoryController.deleteCategory);

export default router;