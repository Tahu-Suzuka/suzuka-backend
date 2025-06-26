import { body } from 'express-validator';
import { ProductVariation } from '../models/productVariationModel.js';

const validateItemsArray = () =>
  body('items')
    .isArray({ min: 1 })
    .withMessage('Input harus berupa array "items" yang tidak kosong.');

const validateVariationIdInArray = () =>
  body('items.*.variationId')
    .notEmpty()
    .withMessage('variationId tidak boleh kosong.')
    .isUUID()
    .withMessage('Format variationId tidak valid.')
    .custom(async (value) => {
      // Validasi tambahan: pastikan variasi benar-benar ada di database
      const variation = await ProductVariation.findByPk(value);
      if (!variation) {
        return Promise.reject(`Variasi dengan ID ${value} tidak ditemukan.`);
      }
    });

const validateQuantityInArray = () =>
  body('items.*.quantity')
    .notEmpty()
    .withMessage('quantity di dalam items tidak boleh kosong.')
    .isNumeric()
    .withMessage('quantity harus berupa angka positif.')
    .isInt({ min: 1 })
    .withMessage('quantity minimal harus 1.');

export const validateAddItem = [
  validateItemsArray(),
  validateVariationIdInArray(),
  validateQuantityInArray(),
];

export const validateUpdateItem = [
  validateItemsArray().optional({ checkFalsy: false }),
  validateVariationIdInArray().optional({ checkFalsy: false }),
  validateQuantityInArray().optional({ checkFalsy: false }),
];
