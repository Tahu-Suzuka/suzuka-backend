import { body } from 'express-validator';

const validateItemsArray = () =>
    body('items')
        .isArray({ min: 1 })
        .withMessage('Body "items" harus berupa array dan tidak boleh kosong.');

const validateProductIdInArray = () =>
    body('items.*.productId')
        .notEmpty()
        .withMessage('productId di dalam items tidak boleh kosong.');

const validateQuantityInArray = () =>
    body('items.*.quantity')
        .notEmpty().withMessage('quantity di dalam items tidak boleh kosong.')
        .isNumeric({ no_symbols: true }).withMessage('quantity harus berupa angka.')
        .isInt({ min: 1 }).withMessage('quantity minimal harus 1.');

const validateNote = () =>
    body('note')
        .optional() 
        .isString()
        .withMessage('Note harus berupa teks.');

const validateVoucherCode = () =>
    body('voucherCode')
        .optional()
        .isString()
        .withMessage('Kode voucher harus berupa teks.');

const validateStatus = () =>
    body('status')
        .notEmpty().withMessage('Status tidak boleh kosong.')
        .isIn(['Menunggu Pembayaran', 'Dibayar', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'])
        .withMessage('Nilai status tidak valid.');


export const validateCreateOrder = [
    validateItemsArray(),
    validateProductIdInArray(),
    validateQuantityInArray(),
    validateNote(),
    validateVoucherCode()
];

export const validateCreateOrderFromCart = [
    validateNote(),
    validateVoucherCode()
];

export const validateUpdateStatus = [
    validateStatus()
];