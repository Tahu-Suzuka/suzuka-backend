import { body } from 'express-validator';

const validateCategoryName = () =>
  body('category_name')
    .trim()
    .notEmpty()
    .withMessage('Nama kategori tidak boleh kosong')
    .isString()
    .withMessage('Nama kategori harus berupa teks')
    .isLength({ min: 3 })
    .withMessage('Nama kategori harus terdiri dari minimal 3 karakter');

export const validateCreateCategory = [validateCategoryName()];

export const validateUpdateCategory = [
  validateCategoryName().optional({ checkFalsy: false }),

  body('id').not().exists().withMessage('ID Kategori tidak dapat diubah.'),
];
