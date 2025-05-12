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
            const data = req.body;
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
                const products = await productService.getAll();
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
            try {
                const { id } = req.params;
                const data = req.body;
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
        async getProductByCategory(req, res) {
            try {
                const { category } = req.params;
                const products = await productService.getByCategory(category);
                if (!products || products.length === 0) {
                    return res.status(404).json({
                        message: `Produk dengan kategori ${category} tidak ditemukan`,
                    });
                }
                res.status(200).json({
                    message: "Berhasil mengambil data produk",
                    data: products,
                });
            } catch (error) {
                res.status(500).json({
                    message: error.message || "Gagal mengambil data produk",
                });
            }
        }
        async getProductByName(req, res) {
            try {
                const { name } = req.params;
                const products = await productService.getByName(name);
                if (!products || products.length === 0) {
                    return res.status(404).json({
                        message: `Produk dengan nama ${name} tidak ditemukan`,
                    });
                }
                res.status(200).json({
                    message: "Berhasil mengambil data produk",
                    data: products,
                });
            } catch (error) {
                res.status(500).json({
                    message: error.message || "Gagal mengambil data produk",
                });
            }
        }
}

export default new ProductController();
