import { body } from 'express-validator';
import { User } from '../models/userModel.js'; // Impor User untuk validasi
import { Product } from '../models/productModel.js';
import { ProductVariation } from '../models/productVariationModel.js';

const validateItemsArray = () =>
  body('items')
    .isArray({ min: 1 })
    .withMessage('Body "items" harus berupa array dan tidak boleh kosong.');

const validateVariationIdInArray = () =>
  body('items.*.variationId')
    .notEmpty()
    .withMessage('variationId di dalam items tidak boleh kosong.')
    .isUUID()
    .withMessage('Format variationId tidak valid.');

  const validateVariationIdForManualOrder = () =>
  body('items.*.variationId')
  .notEmpty().withMessage('variationId tidak boleh kosong.')
  .isUUID().withMessage('Format variationId tidak valid.')
  .custom(async (value) => {
    const variation = await ProductVariation.findByPk(value);
    if (!variation) {
      return Promise.reject(`Variasi produk dengan ID ${value} tidak ditemukan.`);
    }
  });

const validateQuantityInArray = () =>
  body('items.*.quantity')
    .notEmpty()
    .withMessage('quantity di dalam items tidak boleh kosong.')
    .isNumeric({ no_symbols: true })
    .withMessage('quantity harus berupa angka.')
    .isInt({ min: 1 })
    .withMessage('quantity minimal harus 1.');

const validateNote = () =>
  body('note').optional().isString().withMessage('Note harus berupa teks.');

const validateVoucherCode = () =>
  body('voucherCode').optional().isString().withMessage('Kode voucher harus berupa teks.');

const validateStatus = () =>
  body('status')
    .notEmpty()
    .withMessage('Status tidak boleh kosong.')
    .isIn(['Menunggu Pembayaran', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'])
    .withMessage('Nilai status tidak valid.');

const validateUserId = () =>
  body('userId')
    .notEmpty()
    .withMessage('userId pelanggan tidak boleh kosong.')
    .isUUID()
    .withMessage('Format userId tidak valid.')
    .custom(async (value) => {
      const user = await User.findByPk(value);
      if (!user) {
        return Promise.reject('User pelanggan dengan ID tersebut tidak ditemukan.');
      }
    });

const validateManualItems = () =>
  body('items.*.productId')
    .notEmpty()
    .withMessage('productId tidak boleh kosong.')
    .custom(async (value) => {
      const product = await Product.findByPk(value);
      if (!product) {
        return Promise.reject(`Produk dengan ID ${value} tidak ditemukan.`);
      }
    });

export const validateCreateOrder = [
  validateItemsArray(),
  validateVariationIdInArray(),
  validateQuantityInArray(),
  validateNote(),
  validateVoucherCode(),
];

export const validateCreateOrderFromCart = [validateNote(), validateVoucherCode()];

export const validateUpdateStatus = [validateStatus()];

export const validateUpdateStatusByUser = [
  body('status')
    .notEmpty()
    .withMessage('Status tidak boleh kosong.')
    .isIn(['Dibatalkan', 'Selesai'])
    .withMessage('Nilai status tidak valid.'),
];

export const validateManualOrder = [
  validateUserId(),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Input "items" harus berupa array dan tidak boleh kosong.'),
  validateVariationIdForManualOrder(),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Kuantitas produk minimal harus 1.'),
  body('shipPrice').optional().isNumeric().withMessage('Ongkos kirim harus berupa angka.'),
  body('note').optional().isString().withMessage('Note harus berupa teks.'),
  body('paymentMethod')
    .optional()
    .isIn(['Cash', 'Transfer Manual'])
    .withMessage('Metode pembayaran manual tidak valid. Hanya boleh "Cash" atau "Transfer Manual".')
];
