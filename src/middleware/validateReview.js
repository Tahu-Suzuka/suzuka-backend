import { body } from 'express-validator';
import { Product } from '../models/productModel.js';

const validateProductId = () =>
  body('productId')
    .notEmpty()
    .withMessage('ID Produk tidak boleh kosong.')
    .isString()
    .withMessage('ID Produk harus valid.')

    .custom(async (value) => {
      const product = await Product.findByPk(value);
      if (!product) {
        return Promise.reject('Produk dengan ID tersebut tidak ditemukan.');
      }
    });

const validateRating = () =>
  body('rating')
    .notEmpty()
    .withMessage('Rating tidak boleh kosong.')
    .isNumeric()
    .withMessage('Rating harus berupa angka.')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating harus antara 1 sampai 5.');

const validateComment = () =>
  body('comment').optional().isString().withMessage('Komentar harus berupa teks.');

export const validateCreateReview = [validateProductId(), validateRating(), validateComment()];
