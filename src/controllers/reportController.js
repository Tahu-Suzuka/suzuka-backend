import { ReportService } from '../services/reportService.js';
import fs from 'fs';
import { validationResult } from 'express-validator';

const reportService = new ReportService();

class ReportController {
  async generateProductSalesReport(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const filePath = await reportService.createProductSalesReportPDF(req.query);
      res.download(filePath, (err) => {
        if (err) console.error('Error saat mengirim file PDF:', err);
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      res.status(500).json({ message: error.message || 'Gagal membuat laporan.' });
    }
  }

  async getProductSalesReport(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const reportData = await reportService.getProductSalesReport(req.query);
      res
        .status(200)
        .json({ message: 'Data laporan penjualan berhasil diambil', data: reportData });
    } catch (error) {
      res.status(500).json({ message: error.message || 'Gagal mengambil data laporan.' });
    }
  }

  // --- Laporan Pesanan Diproses ---
async generateProcessingReport(req, res) {
        try {
            const filePath = await reportService.createProcessingReportPDF();
            res.download(filePath, (err) => {
                if (err) console.error('Error saat mengirim file:', err);
                fs.unlinkSync(filePath);
            });
        } catch (error) {
            res.status(500).json({ message: error.message || 'Gagal membuat laporan operasional.' });
        }
    }

    // Method untuk JSON Laporan Pesanan Diproses
    async getProcessingReport(req, res) {
        try {
            const reportData = await reportService.getProcessingReport();
            res.status(200).json({ message: "Data pesanan diproses berhasil diambil", data: reportData });
        } catch (error) {
            res.status(500).json({ message: error.message || 'Gagal mengambil data laporan.' });
        }
    }
}

export default new ReportController();
