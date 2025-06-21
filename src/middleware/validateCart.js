import { body } from 'express-validator';

const validateItemsArray = () =>
    body('items')
        .isArray({ min: 1 }).withMessage('Input harus berupa array "items" yang tidak kosong.');

const validateProductIdInArray = () =>
    body('items.*.productId') // Untuk SETIAP elemen (*) di dalam array items, cari properti productId di dalamnya, lalu terapkan validasi ini
        .notEmpty().withMessage('productId di dalam items tidak boleh kosong.');

const validateQuantityInArray = () =>
    body('items.*.quantity')
        .notEmpty().withMessage('quantity di dalam items tidak boleh kosong.')
        .isNumeric().withMessage('quantity harus berupa angka positif.')
        .isInt({ min: 1 }).withMessage('quantity minimal harus 1.');


export const validateAddItem = [
    validateItemsArray(),
    validateProductIdInArray(),
    validateQuantityInArray()
];


export const validateUpdateItem = [
    validateItemsArray().optional({ checkFalsy: false }),
    validateProductIdInArray().optional({ checkFalsy: false }),
    validateQuantityInArray().optional({ checkFalsy: false })
];