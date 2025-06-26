import '../configs/database.js';
import { User } from '../models/userModel.js';
import { sendOtpEmail } from '../utils/mailer.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateJwtToken } from '../utils/jwt.js'; // Tambahkan ini

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const SALT_ROUNDS = 10;

export class AuthService {
  async register(data) {
    const { email, password } = data;

    const exists = await User.findOne({ where: { email } });
    if (exists) throw new Error('Email sudah terdaftar');

    // const passwordValid = /^(?=.*\d).{8,}$/.test(password);
    // if (!passwordValid) {
    //   throw new Error("Password harus minimal 8 karakter dan mengandung angka");
    // }

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
    if (!user) throw new Error('Email / password salah');

    if (!user.isVerified) {
      throw new Error('Akun Anda belum diverifikasi. Silakan cek email Anda untuk OTP.');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Email / password salah');

    const token = generateJwtToken(user);

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  async loginWithGoogle({ email, name, googleId }) {
    let user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('--- MEMBUAT USER GOOGLE BARU DENGAN isVerified: true ---');
      user = await User.create({
        googleId,
        email,
        name,
        password: 'google-oauth',
        isVerified: true, // WAJIB TRUE
        role: 'user',
      });
    }

    // Kode di bawah ini biarkan saja
    const token = generateJwtToken(user);
    const isProfileComplete = !!(user.address && user.phone);

    return {
      isNew: !user,
      token,
      isProfileComplete,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    };
  }

  async verifyOtp({ email, otp }) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('User tidak ditemukan');

    if (user.otp !== otp) {
      throw new Error('OTP tidak sesuai');
    }

    user.isVerified = true;
    user.otp = null; // Hapus OTP setelah diverifikasi
    await user.save();

    // Setelah verifikasi, langsung generate token agar user bisa login
    const token = generateJwtToken(user);

    // Cek apakah profil sudah lengkap (pasti belum untuk user baru)
    const isProfileComplete = !!(user.address && user.phone);

    return {
      message: 'Email berhasil diverifikasi',
      token, // Kirim token
      isProfileComplete, // Kirim status kelengkapan profil
    };
  }

  async resendOtp(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('User tidak ditemukan');
    if (user.isVerified) throw new Error('Email sudah terverifikasi');

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = newOtp;
    await user.save();

    await sendOtpEmail(email, newOtp);

    return { message: 'OTP baru telah dikirim ke email Anda' };
  }

  // Di file AuthService
  async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('Email tidak ditemukan');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();

    await sendOtpEmail(email, otp);

    return { message: 'OTP untuk reset password telah dikirim ke email Anda' };
  }

  async resetPassword({ email, otp, newPassword }) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('Email tidak ditemukan');

    if (user.otp !== otp) throw new Error('OTP tidak sesuai');

    //   const passwordValid = /^(?=.*\d).{8,}$/.test(newPassword);
    //   if (!passwordValid) {
    //     throw new Error("Password harus minimal 8 karakter dan mengandung angka");
    //   }

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hash;
    user.otp = null;
    await user.save();

    return { message: 'Password berhasil direset' };
  }

  async changePassword({ userId, oldPassword, newPassword }) {
    // 1. Cari pengguna berdasarkan ID dari token
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User tidak ditemukan.');

    // 2. Bandingkan password lama yang diinput dengan yang ada di database
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error('Password lama yang Anda masukkan salah.');
    }

    // 3. Validasi dan hash password baru
    const passwordValid = /^(?=.*\d).{8,}$/.test(newPassword);
    if (!passwordValid) {
      throw new Error('Password baru harus minimal 8 karakter dan mengandung angka.');
    }
    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // 4. Simpan password baru
    user.password = hash;
    await user.save();

    return { message: 'Password berhasil diubah' };
  }
}
