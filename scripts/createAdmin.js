// scripts/createAdmin.js
import "../src/configs/database.js"; // pastikan konek DB
import { User } from "../src/models/userModel.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const createAdmin = async () => {
  try {
    const email = "suzukatahu@gmail.com";
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log("Admin sudah ada.");
      return;
    }

    const hash = await bcrypt.hash("tahusuzuka", 10);
    await User.create({
      id: uuidv4(),
      name: "Admin",
      email,
      password: hash,
      role: "admin",
      isVerified: true,
    });

    console.log("Admin berhasil dibuat!");
  } catch (err) {
    console.error("Gagal membuat admin:", err.message);
  } finally {
    process.exit(); // keluar dari script
  }
};

createAdmin();
