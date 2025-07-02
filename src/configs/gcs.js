import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = new Storage({
  keyFilename: path.join(__dirname, './gcs-key.json'),
  projectId: process.env.GCLOUD_PROJECT_ID || 'tahusuzuka',
});

// Nama bucket diambil dari environment variable
const bucketName = process.env.GCS_BUCKET_NAME || 'tahu-suzuka-bucket';
const bucket = storage.bucket(bucketName);

/**
 * Upload file ke Google Cloud Storage.
 * @param {object} file - File yang diunggah.
 * @param {string} destination - Lokasi di bucket.
 * @returns {string} - URL file yang diunggah.
 */
const uploadToGCS = async (file, destination) => {
  try {
    const fileName = `${destination}/${uuidv4()}-${path.basename(file.originalname)}`;
    const fileUpload = bucket.file(fileName);

    await fileUpload.save(file.buffer, {
      contentType: file.mimetype,
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    console.log(`File uploaded to ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to GCS:', error.message);
    throw new Error('Failed to upload file to Google Cloud Storage');
  }
};

/**
 * Hapus file dari Google Cloud Storage.
 * @param {string} fileUrl - URL lengkap file di GCS.
 * @returns {boolean} - True jika berhasil dihapus.
 */
const deleteFromGCS = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    
    const protectedImages = [
      'default/foto-profile.png',   
      'default/default-no-image.jpg'
    ];
    
    // Extract filename from URL
    const fileName = fileUrl.replace(`https://storage.googleapis.com/${bucketName}/`, '');
    
    // Skip deletion if it's a protected default image
    if (protectedImages.includes(fileName)) {
      console.log(`Skipping deletion of protected image: ${fileName}`);
      return;
    }
    
    // Delete only non-default images
    await bucket.file(fileName).delete();
    console.log(`Successfully deleted ${fileName} from GCS`);
    
  } catch (error) {
    console.error('Error deleting file from GCS:', error);
  }
};

/**
 * Hapus multiple files dari Google Cloud Storage.
 * @param {Array<string>} fileUrls - Array URL file di GCS.
 * @returns {boolean} - True jika semua berhasil dihapus.
 */
const deleteMultipleFromGCS = async (fileUrls) => {
  try {
    if (!fileUrls || fileUrls.length === 0) return true;
    
    const deletePromises = fileUrls
      .filter(url => url) 
      .map(url => deleteFromGCS(url));
    
    await Promise.allSettled(deletePromises);
    return true;
  } catch (error) {
    console.error('Error deleting multiple files from GCS:', error.message);
    return false;
  }
};

export { bucket, uploadToGCS, deleteFromGCS, deleteMultipleFromGCS };
