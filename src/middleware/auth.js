// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  console.log('Auth header:', header); // Debug log
  
  if (!header) return res.status(401).json({ message: "Token dibutuhkan" });

  const token = header.split(" ")[1];
  console.log('Extracted token:', token ? 'Present' : 'Missing'); // Debug log
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    console.log('Token payload:', payload); // Debug log
    req.user = payload; // tersedia di controller selanjutnya
    next();
  } catch (error) {
    console.log('Token verification error:', error.message); // Debug log
    res.status(401).json({ message: "Token tidak valid" });
  }
}
