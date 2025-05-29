import { User } from "../models/userModel.js";
import crypto from "crypto";

class UserService {
  constructor() {}

  async create(data) {
    const id = crypto.randomUUID();
    const user = await User.create({
      id,   
      ...data,
    });
    return user;
  }

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

  async delete(id) {
    const model = await User.findByPk(id);
    await model.destroy();
    return {};
  }
}

export { UserService };
