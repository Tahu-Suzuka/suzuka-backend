import { Router } from 'express';
import CategoryController from '../controllers/categoryController.js';
import { validateCreateCategory, validateUpdateCategory } from '../middleware/validateCategory.js';
import { authenticate } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validateAdmin.js';
import { uploadCategory } from '../middleware/upload.js';
import { processUploads } from '../middleware/processUploads.js';

const router = Router();

const categoryUploadConfig = [
  { name: 'category_image', path: 'categories', single: true, fieldName: 'image' }
];

router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

router.post(
  '/',
  authenticate,
  validateAdmin,
  uploadCategory, // Middleware multer
  processUploads('categories', categoryUploadConfig), // Proses upload ke GCS
  validateCreateCategory,
  CategoryController.createCategory
);

router.put(
  '/:id',
  authenticate,
  validateAdmin,
  uploadCategory, // Middleware multer
  processUploads('categories', categoryUploadConfig), // Proses upload ke GCS
  validateUpdateCategory,
  CategoryController.updateCategory
);

router.delete('/:id', authenticate, validateAdmin, CategoryController.deleteCategory);

export default router;
