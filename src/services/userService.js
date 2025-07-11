import { Op } from 'sequelize';
import sequelize from '../configs/database.js';
import crypto from 'crypto';
import { User } from '../models/userModel.js';
import { Order } from '../models/orderModel.js';

import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;

class UserService {
  constructor() {}

  async create(data) {
    const { name, email, password, address, phone } = data;

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email,
      password: hash,
      address,
      phone,
      isVerified: true,
      role: 'user', 
    });
    return user;
  }

 async getAll(page = 1, limit = 8) {
  const offset = (page - 1) * limit;

  const { count, rows: users } = await User.findAndCountAll({
    attributes: { exclude: ['password'] }, // Jangan tampilkan password
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  const totalPages = Math.ceil(count / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: count,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    }
  };
}

  async searchByName(query) {
    if (!query) {
      return [];
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [{ name: { [Op.like]: `%${query}%` } }],
      },
      limit: 10,
      attributes: ['id', 'name'],
    });
    return users;
  }

  async getById(id) {
    const res = await User.findByPk(id);
    return res;
  }

  async update(id, data) {
    const model = await User.findByPk(id);
    const res = await model.update(data);
    return res;
  }

  async updateProfile(userId, data) {
    const { name, address, phone, image } = data;

    const user = await User.findByPk(userId);
    if (!user) throw new Error('User tidak ditemukan');

    user.name = name || user.name;
    user.address = address || user.address;
    user.phone = phone || user.phone;
    user.image = image || user.image; // Asumsi 'image' adalah URL/path ke file

    await user.save();

    user.password = undefined;
    user.otp = undefined;
    user.googleId = undefined;

    return user;
  }

  async delete(id) {
    const model = await User.findByPk(id);
    await model.destroy();
    return {};
  }
}

export { UserService };
