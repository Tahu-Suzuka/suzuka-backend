import { Voucher } from '../models/voucherModel.js';
import { Op } from 'sequelize';

class VoucherService {
  constructor() {}

  async create(data) {
    const newVoucher = await Voucher.create(data);
    return newVoucher;
  }

  async findAll() {
    const vouchers = await Voucher.findAll();
    return vouchers;
  }

  async findById(id) {
    const voucher = await Voucher.findByPk(id);
    return voucher;
  }

  async update(id, data) {
    const voucher = await this.findById(id);
    if (!voucher) {
      return null;
    }
    const updatedVoucher = await voucher.update(data);
    return updatedVoucher;
  }

  async delete(id) {
    const voucher = await this.findById(id);
    if (!voucher) {
      return null;
    }
    await voucher.destroy();
    return voucher;
  }

  async getAndValidateVoucher(code) {
    const voucher = await Voucher.findOne({ where: { code } });

    if (!voucher) {
      throw new Error('Voucher tidak ditemukan.');
    }
    if (!voucher.isActive) {
      throw new Error('Voucher sudah tidak aktif.');
    }
    if (voucher.usageCount >= voucher.usageLimit) {
      throw new Error('Kuota penggunaan voucher sudah habis.');
    }
    const now = new Date();
    if (now < voucher.validFrom || now > voucher.validUntil) {
      throw new Error('Voucher sudah kedaluwarsa atau belum berlaku.');
    }

    return voucher;
  }
}

export { VoucherService };
