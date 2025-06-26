import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;

// Tambahkan pengecekan saat aplikasi dimulai
if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET tidak didefinisikan di dalam file .env');
}

export function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Token dibutuhkan atau format salah (gunakan Bearer Token)' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa' });
  }
}
