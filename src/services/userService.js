import { User } from "../models/userModel.js";

class UserService {
  constructor() {}

  async getAll() {
    const res = await User.findAll();
    return res;
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
    if (!user) throw new Error("User tidak ditemukan");

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
