// src/middleware/validateAdmin.js

/**
 * Middleware untuk memvalidasi apakah pengguna yang terautentikasi memiliki role 'admin'.
 * Harus dijalankan SETELAH middleware 'authenticate'.
 */
export function validateAdmin(req, res, next) {
  // req.user diharapkan sudah ada dari middleware 'authenticate'
  if (req.user && req.user.role === 'admin') {
    // Validasi berhasil, pengguna adalah admin. Lanjutkan.
    next();
  } else {
    // Validasi gagal. Kirim response 403 Forbidden (Akses Ditolak).
    res.status(403).json({ message: "Akses ditolak. Rute ini hanya untuk admin." });
  }
}