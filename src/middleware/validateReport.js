import { query } from 'express-validator';

export const validateGetReport = [
  // Tambahkan validasi untuk parameter 'period' yang baru
  query('period')
    .optional()
    .isIn(['today', 'week', 'month', 'year'])
    .withMessage('Nilai parameter period tidak valid. Gunakan: today, week, month, atau year.'),

  // Buat startDate dan endDate menjadi opsional, tapi jika ada, harus valid
  query('startDate').optional().isISO8601().withMessage('Format startDate harus YYYY-MM-DD.'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Format endDate harus YYYY-MM-DD.')
    .custom((value, { req }) => {
      if (req.query.startDate && new Date(value) < new Date(req.query.startDate)) {
        throw new Error('Tanggal akhir harus setelah atau sama dengan tanggal mulai.');
      }
      return true;
    }),
];
