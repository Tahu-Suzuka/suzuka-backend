import { body } from 'express-validator';
import { Category } from '../models/categoryModel.js';

const validateProductName = () =>
    body('product_name')
        .notEmpty().withMessage('Nama produk tidak boleh kosong')
        .isString().withMessage('Nama produk harus berupa teks')
        .isLength({ min: 5 }).withMessage('Nama produk harus terdiri dari minimal 3 karakter');

const validateDescription = () =>
    body('description')
        .notEmpty().withMessage('Deskripsi produk tidak boleh kosong')
        .isString().withMessage('Deskripsi produk harus berupa teks')
        .isLength({ min: 10 }).withMessage('Deskripsi produk harus terdiri dari minimal 10 karakter');

const validatePrice = () =>
    body('price')
        .notEmpty().withMessage('Harga produk tidak boleh kosong')
        .isNumeric().withMessage('Harga produk harus berupa angka')

const validateCategoryId = () =>
    body('categoryId')
        .notEmpty().withMessage('ID Kategori tidak boleh kosong')
        .isString().withMessage('ID Kategori harus valid')
        .custom(async (value) => {
            const category = await Category.findByPk(value);
            if (!category) {
                return Promise.reject('Kategori tidak ditemukan');
            }
        });

export const validateCreateProduct = [
    validateProductName(),
    validateDescription(),
    validatePrice(),
    validateCategoryId()
];

export const validateUpdateProduct = [
    validateProductName().optional({ checkFalsy: false }),
    validateDescription().optional({ checkFalsy: false }),
    validatePrice().optional({ checkFalsy: false }),
    validateCategoryId().optional({ checkFalsy: false }),

    body('id')
        .not().exists().withMessage('ID Produk tidak dapat diubah.')
];
