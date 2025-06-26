import multer from 'multer';
import { bucket } from '../configs/gcs.js';
import path from 'path';

// Filter untuk hanya menerima file gambar
const imageFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpg|jpeg|png)$/i;
  const isExtensionAllowed = allowedExtensions.test(file.originalname);
  const isMimeTypeAllowed = file.mimetype.startsWith('image/');
  
  if (isExtensionAllowed && isMimeTypeAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Format gambar tidak valid. Hanya JPG, JPEG, PNG yang diperbolehkan.'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5MB
});

export const uploadProfile = upload.single('profile_picture');
export const uploadProduct = upload.fields([
  { name: 'mainImage', maxCount: 1 }, // Hanya satu file untuk mainImage
  { name: 'additionalImages', maxCount: 3 }, // Maksimal 3 file untuk additionalImages
]);
export const uploadReview = upload.array('review_images', 2); // Maksimal 2 gambar
export const uploadCategory = upload.single('category_image');

// Fungsi untuk mengunggah file ke GCS
const uploadToGCS = async (file, folder = 'uploads') => {
  const timestamp = Date.now();
  const extension = path.extname(file.originalname);
  const fileName = `${folder}/${timestamp}-${file.originalname}`;

  const blob = bucket.file(fileName);
  const blobStream = blob.createWriteStream({
    resumable: false,
    contentType: file.mimetype,
    predefinedAcl: 'publicRead', // Memberikan akses publik
  });

  return new Promise((resolve, reject) => {
    blobStream
      .on('error', (err) => reject(err))
      .on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        resolve(publicUrl);
      })
      .end(file.buffer);
  });
};

export { upload, uploadToGCS };
