import { body } from 'express-validator';
import { Voucher } from '../models/voucherModel.js';
import { Op } from 'sequelize'; 

const validateCode = () =>
    body('code')
        .notEmpty().withMessage('Kode voucher tidak boleh kosong.')
        .isUppercase().withMessage('Kode voucher harus menggunakan huruf kapital.')
        .not().contains(' ').withMessage('Kode voucher tidak boleh mengandung spasi.')
        // Validasi kustom untuk mengecek duplikasi kode
        .custom(async (value, { req }) => {
            const whereClause = { code: value };
            if (req.params.id) {
                whereClause.id = { [Op.ne]: req.params.id }; // Op.ne berarti 'not equal'
            }
            const existingVoucher = await Voucher.findOne({ where: whereClause });
            if (existingVoucher) {
                // Jika voucher dengan kode yang sama ditemukan, tolak request
                return Promise.reject('Kode voucher ini sudah digunakan. Silakan gunakan kode lain.');
            }
        });

const validateDescription = () =>
    body('description')
        .notEmpty().withMessage('Deskripsi tidak boleh kosong.');

const validateType = () =>
    body('type')
        .notEmpty().withMessage('Tipe voucher tidak boleh kosong.')
        .isIn(['POTONGAN_HARGA', 'PERSENTASE', 'POTONGAN_ONGKIR'])
        .withMessage('Tipe voucher tidak valid.');

const validateValue = () =>
    body('value')
        .notEmpty().withMessage('Nilai voucher tidak boleh kosong.')
        .isFloat({ min: 0 }).withMessage('Nilai voucher harus berupa angka positif.');

const validateMaxDiscount = () =>
    body('maxDiscount')
        .optional() // Tidak wajib
        .isFloat({ min: 0 }).withMessage('Nilai diskon maksimal harus berupa angka positif.');

const validateMinPurchase = () =>
    body('minPurchase')
        .notEmpty().withMessage('Minimal pembelian tidak boleh kosong.')
        .isFloat({ min: 0 }).withMessage('Minimal pembelian harus berupa angka positif.');

const validateDates = () =>
    body('validUntil')
        .notEmpty().withMessage('Tanggal kedaluwarsa tidak boleh kosong.')
        .isISO8601().withMessage('Format tanggal kedaluwarsa tidak valid.')
        .custom((value, { req }) => {
            // Validasi kustom: tanggal 'validUntil' harus setelah 'validFrom'
            if (new Date(value) <= new Date(req.body.validFrom)) {
                throw new Error('Tanggal kedaluwarsa harus setelah tanggal mulai berlaku.');
            }
            return true;
        });

const validateUsageLimit = () =>
    body('usageLimit')
        .notEmpty().withMessage('Batas penggunaan tidak boleh kosong.')
        .isInt({ min: 1 }).withMessage('Batas penggunaan minimal harus 1.');


export const validateCreateVoucher = [
    validateCode(),
    validateDescription(),
    validateType(),
    validateValue(),
    validateMaxDiscount(),
    validateMinPurchase(),
    body('validFrom').notEmpty().withMessage('Tanggal mulai berlaku tidak boleh kosong.').isISO8601().withMessage('Format tanggal mulai berlaku tidak valid.'),
    validateDates(), 
    validateUsageLimit()
];

export const validateUpdateVoucher = [
    validateCode().optional(),
    validateDescription().optional(),
    validateType().optional(),
    validateValue().optional(),
    validateMaxDiscount(),
    validateMinPurchase().optional(),
    body('validFrom').optional().isISO8601().withMessage('Format tanggal mulai berlaku tidak valid.'),
    validateDates().optional(),
    validateUsageLimit().optional(),
    body('isActive').optional().isBoolean().withMessage('Status aktif harus boolean (true/false).'),
    body('id').not().exists().withMessage('ID Voucher tidak dapat diubah.')
];