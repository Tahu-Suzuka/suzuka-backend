import { ReportService } from '../services/reportService.js';
import fs from 'fs';
import { validationResult } from 'express-validator';

const reportService = new ReportService();

class ReportController {
    async generateOrderReport(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({ message: 'Parameter startDate dan endDate dibutuhkan.' });
            }

            const filePath = await reportService.createOrderReportPDF(startDate, endDate);

            // Kirim file sebagai attachment dan hapus setelah dikirim
            res.download(filePath, (err) => {
                if (err) {
                    console.error('Error saat mengirim file:', err);
                }
                // Hapus file dari server setelah didownlaod
                fs.unlinkSync(filePath);
            });
            
        } catch (error) {
            res.status(500).json({ message: error.message || 'Gagal membuat laporan.' });
        }
    }
}

export default new ReportController();