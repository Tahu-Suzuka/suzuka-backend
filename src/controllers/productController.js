import { ProductService } from "../services/productService.js";
import { Product } from "../models/productModel.js";
import { validationResult } from "express-validator";

const productService = new ProductService(Product);

class ProductController {
     async createProduct(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
        
            const adminId = req.user.id;
            const data = { ...req.body, userId: adminId };

            if (req.file) {
              const imagePath = req.file.path.replace(/\\/g, "/").replace("public/", "/");
              data.image = imagePath;
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
                    // req.query akan berisi semua parameter dari URL (?key=value&key2=value2)
                    const result = await productService.getAll(req.query);
                    res.status(200).json({
                        message: "Berhasil mengambil data semua produk",
                        data: result,
                    });
                } catch (error) {
                    res.status(500).json({
                        message: error.message || "Gagal mengambil data produk",
                    });
                }
            }

async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;

            if (req.file) {
                const existingProduct = await productService.getById(id);
                if (existingProduct && existingProduct.image) {
                    const oldImagePath = path.join('public', existingProduct.image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                const imagePath = req.file.path.replace(/\\/g, "/").replace("public/", "/");
                data.image = imagePath;
            }

            const product = await productService.update(id, data);
            if (!product) {
                return res.status(404).json({
                    message: `Produk dengan ID ${id} tidak ditemukan`,
                });
            }
            res.status(200).json({
                message: "Berhasil memperbarui produk",
                data: product,
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || "Gagal memperbarui produk",
            });
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
