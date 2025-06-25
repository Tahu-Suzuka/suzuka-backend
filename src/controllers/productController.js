import { ProductService } from "../services/productService.js";
import { Product } from "../models/productModel.js";
import { validationResult } from "express-validator";

const productService = new ProductService(Product);

class ProductController {
     async createProduct(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        try {
            const adminId = req.user.id;
            const data = { ...req.body, userId: adminId };

             if (req.files && req.files.length > 0) {
              const mainImageFile = req.files.find(f => f.fieldname === 'mainImage');
              const additionalImageFiles = req.files.filter(f => f.fieldname === 'additionalImages');

              if (mainImageFile) {
                data.mainImage = mainImageFile.path.replace(/\\/g, "/").replace("public/", "/");
              }
              additionalImageFiles.forEach((file, index) => {
                  data[`additionalImage${index + 1}`] = file.path.replace(/\\/g, "/").replace("public/", "/");
              });
            }

            const product = await productService.create(data);
            res.status(201).json({
                message: "Berhasil membuat produk baru",
                data: product,
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || "Gagal membuat produk",
            });
        }
    }
        async getProductById(req, res) {
            try {
                const { id } = req.params;
                const product = await productService.getById(id);
                if (!product) {
                    return res.status(404).json({
                        message: `Produk dengan ID ${id} tidak ditemukan`,
                    });
                }
                res.status(200).json({
                    message: "Berhasil mengambil data produk",
                    data: product,
                });
            } catch (error) {
                res.status(500).json({
                    message: error.message || "Gagal mengambil data produk",
                });
            }
        }

       async getAllProducts(req, res) {
        try {
            const products = await productService.getAll(req.query);
            
            res.status(200).json({
                message: "Berhasil mengambil data semua produk",
                data: products, 
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || "Gagal mengambil data produk",
            });
        }
    }

 async updateProduct(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        try {
            const { id } = req.params;
            const data = req.body; // Ambil data teks dari form (nama, harga, dll.)

            // 1. Ambil data produk yang ada untuk memeriksa gambar lama
            const existingProduct = await productService.getById(id);
            if (!existingProduct) {
                return res.status(404).json({ message: `Produk dengan ID ${id} tidak ditemukan` });
            }

            // 2. Proses file-file baru jika ada yang diunggah
           if (req.files && req.files.length > 0) {
              const mainImageFile = req.files.find(f => f.fieldname === 'mainImage');
              const additionalImageFiles = req.files.filter(f => f.fieldname === 'additionalImages');

              if (mainImageFile) {
                data.mainImage = mainImageFile.path.replace(/\\/g, "/").replace("public/", "/");
              }
              additionalImageFiles.forEach((file, index) => {
                  data[`additionalImage${index + 1}`] = file.path.replace(/\\/g, "/").replace("public/", "/");
              });
            }

            // 3. Panggil service untuk update data produk (termasuk path gambar baru)
            const updatedProduct = await productService.update(id, data);

            res.status(200).json({
                message: "Berhasil memperbarui produk",
                data: updatedProduct,
            });
        } catch (error) {
            res.status(500).json({ message: error.message || "Gagal memperbarui produk" });
        }
    }
        async deleteProduct(req, res) {
            try {
                const { id } = req.params;
                const product = await productService.delete(id);
                if (!product) {
                    return res.status(404).json({
                        message: `Produk dengan ID ${id} tidak ditemukan`,
                    });
                }
                res.status(200).json({
                    message: "Berhasil menghapus produk",
                    data: product,
                });
            } catch (error) {
                res.status(500).json({
                    message: error.message || "Gagal menghapus produk",
                });
            }
        }
        async searchProducts(req, res) {
        try {
            const { q } = req.query; 

            const products = await productService.searchByName(q);
            
            if (!products || products.length === 0) {
                return res.status(404).json({
                    message: `Produk dengan nama yang mengandung "${q}" tidak ditemukan`,
                    data: []
                });
            }

            res.status(200).json({
                message: "Berhasil mengambil data produk",
                data: products,
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || "Gagal melakukan pencarian produk",
            });
        }
    }
}

export default new ProductController();
