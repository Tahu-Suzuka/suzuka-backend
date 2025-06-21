import multer from 'multer';

export function errorHandler(err, req, res, next) {

    if (err.message === 'Format gambar tidak valid. Hanya file JPG, JPEG, PNG yang diperbolehkan.') {
    return res.status(400).json({ message: err.message });
    }
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'Ukuran gambar terlalu besar dari batas yang diizinkan.' });
        }
        return res.status(400).json({ message: err.message });
    }

    console.error('Unhandled Error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
}