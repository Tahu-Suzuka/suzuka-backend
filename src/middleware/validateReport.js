import { query } from 'express-validator';

const validateStartDate = () =>
    query('startDate')
        .notEmpty()
        .withMessage('Parameter startDate tidak boleh kosong.')
        .isISO8601()
        .withMessage('Format startDate harus YYYY-MM-DD.');

const validateEndDate = () =>
    query('endDate')
        .notEmpty()
        .withMessage('Parameter endDate tidak boleh kosong.')
        .isISO8601()
        .withMessage('Format endDate harus YYYY-MM-DD.')
        .custom((value, { req }) => {
            if (new Date(value) < new Date(req.query.startDate)) {
                throw new Error('Tanggal akhir harus setelah atau sama dengan tanggal mulai.');
            }
            return true;
        });

export const validateGetReport = [
    validateStartDate(),
    validateEndDate()
];