import { VoucherService } from '../services/voucherService.js';
import { validationResult } from 'express-validator';

const voucherService = new VoucherService();

class VoucherController {
   async createVoucher(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        try {
            const userId = req.user.id;
            const data = { ...req.body, userId: userId };
            const voucher = await voucherService.create(data);
            res.status(201).json({ message: "Berhasil membuat voucher baru", data: voucher });
        } catch (error) {
            res.status(500).json({ message: error.message || "Gagal membuat voucher" });
        }
    }

    async getAllVouchers(req, res) {
        try {
            const vouchers = await voucherService.findAll();
            res.status(200).json({
                message: "Berhasil mengambil semua data voucher",
                data: vouchers,
            });
        } catch (error) {
            res.status(500).json({ message: error.message || "Gagal mengambil data" });
        }
    }

    async getVoucherById(req, res) {
        try {
            const { id } = req.params;
            const voucher = await voucherService.findById(id);
            if (!voucher) {
                return res.status(404).json({ message: `Voucher dengan ID ${id} tidak ditemukan` });
            }
            res.status(200).json({
                message: "Berhasil mengambil data voucher",
                data: voucher,
            });
        } catch (error) {
            res.status(500).json({ message: error.message || "Gagal mengambil data" });
        }
    }

    async updateVoucher(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        try {
            const { id } = req.params;
            const data = req.body;
            const voucher = await voucherService.update(id, data);
            if (!voucher) {
                return res.status(404).json({ message: `Voucher dengan ID ${id} tidak ditemukan` });
            }
            res.status(200).json({ message: "Berhasil memperbarui voucher", data: voucher });
        } catch (error) {
            res.status(500).json({ message: error.message || "Gagal memperbarui voucher" });
        }
    }

    async deleteVoucher(req, res) {
        try {
            const { id } = req.params;
            const voucher = await voucherService.delete(id);
             if (!voucher) {
                return res.status(404).json({ message: `Voucher dengan ID ${id} tidak ditemukan` });
            }
            res.status(200).json({
                message: "Berhasil menghapus voucher",
                data: voucher,
            });
        } catch (error) {
            res.status(500).json({ message: error.message || "Gagal menghapus voucher" });
        }
    }
}

export default new VoucherController();