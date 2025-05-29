// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Token dibutuhkan" });

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // tersedia di controller selanjutnya
    next();
  } catch {
    res.status(401).json({ message: "Token tidak valid" });
  }
}
