import "../configs/database.js";
import { User } from "../models/userModel.js";
import { sendOtpEmail } from "../utils/mailer.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateJwtToken } from "../utils/jwt.js"; // Tambahkan ini


const JWT_SECRET = process.env.JWT_SECRET || "secret_key";
const SALT_ROUNDS = 10;

export class AuthService {
  async register(data) {
    const { email, password } = data;

    const exists = await User.findOne({ where: { email } });
    if (exists) throw new Error("Email sudah terdaftar");

    const passwordValid = /^(?=.*\d).{8,}$/.test(password);
    if (!passwordValid) {
      throw new Error("Password harus minimal 8 karakter dan mengandung angka");
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({ ...data, password: hash, otp });

    await sendOtpEmail(email, otp);

    user.password = undefined;
    user.otp = undefined;
    return user;
  }

  async login({ email, password }) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("Email / password salah");

    if (!user.isVerified) {
    throw new Error("Akun Anda belum diverifikasi. Silakan cek email Anda untuk OTP.");
    }

    const match = await bcrypt.compare(password, user.password);a
    if (!match) throw new Error("Email / password salah");

    const token = generateJwtToken(user);

  return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }
  
   async loginWithGoogle({ email, name }) {
    let user = await User.findOne({ where: { email } });

    if (!user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user = await User.create({
        email,
        name,
        isVerified: false,
        otp,
        role: "customer"
      });
      await sendOtpEmail(email, otp);
      return {
        isNew: true,
        message: "Akun berhasil dibuat. Silakan verifikasi OTP yang dikirim ke email.",
        user
      };
    }

    if (!user.isVerified) {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = newOtp;
      await user.save();
      await sendOtpEmail(email, newOtp);
      return {
        isNew: false,
        isVerified: false,
        message: "Akun belum diverifikasi. OTP baru dikirim ke email.",
        user
      };
    }

    const token = generateJwtToken(user);

    return {
      isNew: false,
      isVerified: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }
  
  async verifyOtp({ email, otp }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User tidak ditemukan");

  if (user.otp !== otp) {
    throw new Error("OTP tidak sesuai");
  }

  user.isVerified = true;
  user.otp = null; // Hapus OTP setelah diverifikasi
  await user.save();

  return { message: "Email berhasil diverifikasi" };
}

async resendOtp(email) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User tidak ditemukan");
  if (user.isVerified) throw new Error("Email sudah terverifikasi");

  const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = newOtp;
  await user.save();

  await sendOtpEmail(email, newOtp);

  return { message: "OTP baru telah dikirim ke email Anda" };
}

// Di file AuthService
async forgotPassword(email) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("Email tidak ditemukan");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  await user.save();

  await sendOtpEmail(email, otp);

  return { message: "OTP untuk reset password telah dikirim ke email Anda" };
}

async resetPassword({ email, otp, newPassword }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("Email tidak ditemukan");

  if (user.otp !== otp) throw new Error("OTP tidak sesuai");

  const passwordValid = /^(?=.*\d).{8,}$/.test(newPassword);
  if (!passwordValid) {
    throw new Error("Password harus minimal 8 karakter dan mengandung angka");
  }

  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.password = hash;
  user.otp = null;
  await user.save();

  return { message: "Password berhasil direset" };
}


}
