import { uploadToGCS } from '../configs/gcs.js';

/**
 * Middleware untuk memproses gambar sebelum sampai di controller.
 * @param {string} folder - Folder di bucket GCS tempat gambar disimpan.
 * @param {Object} fields - Konfigurasi field untuk memetakan gambar.
 */
export const processUploads = (folder, fields = null) => async (req, res, next) => {
  try {
    if (req.files && Object.keys(req.files).length > 0 && fields) {
      // Untuk upload.fields() (seperti product)
      for (const field of fields) {
        const fieldFiles = req.files[field.name];
        
        if (fieldFiles && fieldFiles.length > 0) {
          if (field.single) {
            // Untuk single file dalam fields (mainImage)
            const url = await uploadToGCS(fieldFiles[0], `${folder}/${field.path}`);
            const targetFieldName = field.fieldName || field.name;
            req.body[targetFieldName] = url;
          } else {
            // Untuk multiple files (additionalImages)
            for (let i = 0; i < fieldFiles.length; i++) {
              const url = await uploadToGCS(fieldFiles[i], `${folder}/${field.path}`);
              req.body[`additionalImage${i + 1}`] = url;
            }
          }
        }
      }
    } else if (req.file && fields && fields.length > 0) {
      // Untuk upload.single() (seperti category)
      const field = fields[0]; // Ambil konfigurasi pertama untuk single upload
      const url = await uploadToGCS(req.file, `${folder}/${field.path}`);
      const targetFieldName = field.fieldName || field.name;
      req.body[targetFieldName] = url;
    } else if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // Untuk upload.array() (seperti review)
      for (let i = 0; i < req.files.length; i++) {
        const url = await uploadToGCS(req.files[i], folder);
        req.body[`image${i + 1}`] = url; // image1, image2 sesuai dengan field di database
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
