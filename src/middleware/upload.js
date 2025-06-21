import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Fungsi untuk memastikan direktori ada
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Filter untuk hanya menerima file gambar
const imageFilter = (req, file, cb) => {
    const allowedExtensions = /\.(jpg|jpeg|png)$/i; 

    const isExtensionAllowed = allowedExtensions.test(path.extname(file.originalname));
    const isMimeTypeAllowed = file.mimetype.startsWith('image/');

    if (isExtensionAllowed && isMimeTypeAllowed) {
        cb(null, true);
    } else {
        cb(new Error('Format gambar tidak valid. Hanya file JPG, JPEG, PNG yang diperbolehkan.'), false);
    }
};

// Konfigurasi penyimpanan untuk FOTO PROFIL
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/images/profiles';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const userId = req.user.id;
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `profile-${userId}-${timestamp}${extension}`);
  },
});

// Konfigurasi penyimpanan untuk GAMBAR PRODUK
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/images/products';
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `product-${timestamp}${extension}`);
  },
});

const reviewStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/images/reviews'; // Simpan di folder terpisah
    ensureDir(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {

    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `review-${timestamp}${extension}`);
  },
});


export const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit 2MB (Anda sebelumnya menulis 1MB)
});

export const uploadProduct = multer({
  storage: productStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 3 }
]);

export const uploadReview = multer({
  storage: reviewStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).array('review_images', 2); 
