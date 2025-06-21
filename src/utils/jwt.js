// File: src/utils/jwt.js

import jwt from "jsonwebtoken";
import 'dotenv/config'; // Memastikan variabel .env selalu terbaca

// --- PERBAIKAN DI SINI ---
// Paksa untuk menggunakan JWT_SECRET dari .env dan hilangkan fallback
const JWT_SECRET = process.env.JWT_SECRET;

// Tambahkan pengecekan saat aplikasi dimulai
if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET tidak didefinisikan di dalam file .env");
}

export function generateJwtToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// ... (fungsi lain seperti verify dan decode bisa dihapus jika tidak digunakan di tempat lain)