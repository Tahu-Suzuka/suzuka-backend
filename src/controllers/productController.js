import { ProductService } from '../services/productService.js';
import { Product } from '../models/productModel.js';
import { validationResult } from 'express-validator';
import { deleteFromGCS, deleteMultipleFromGCS } from '../configs/gcs.js';

const productService = new ProductService(Product);

class ProductController {
  async createProduct(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const adminId = req.user.id;
      const data = { ...req.body };
      data.userId = adminId;

      const product = await productService.create(data);
      
      res.status(201).json({
        message: 'Berhasil membuat produk baru',
        data: product,
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        message: error.message || 'Gagal membuat produk',
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
        message: 'Berhasil mengambil data produk',
        data: product,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message || 'Gagal mengambil data produk',
      });
    }
  }

  async getAllProducts(req, res) {
    try {
      const products = await productService.getAll(req.query);

      res.status(200).json({
        message: 'Berhasil mengambil data semua produk',
        data: products,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message || 'Gagal mengambil data produk',
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
      const data = { ...req.body };

      const existingProduct = await productService.getById(id);
      if (!existingProduct) {
        return res.status(404).json({ message: `Produk dengan ID ${id} tidak ditemukan` });
      }

      // Hapus gambar lama jika ada gambar baru
      if (data.mainImage && existingProduct.mainImage) {
        await deleteFromGCS(existingProduct.mainImage);
      }
      
      // Hapus additional images lama jika ada yang baru
      const additionalImageFields = ['additionalImage1', 'additionalImage2', 'additionalImage3'];
      for (const field of additionalImageFields) {
        if (data[field] && existingProduct[field]) {
          await deleteFromGCS(existingProduct[field]);
        }
      }

      const updatedProduct = await productService.update(id, data);
      res.status(200).json({
        message: 'Berhasil memperbarui produk',
        data: updatedProduct,
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: error.message || 'Gagal memperbarui produk' });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      
      // Ambil data produk untuk mendapatkan URL gambar sebelum dihapus
      const existingProduct = await productService.getById(id);
      if (!existingProduct) {
        return res.status(404).json({
          message: `Produk dengan ID ${id} tidak ditemukan`,
        });
      }

      // Hapus semua gambar dari GCS
      const imagesToDelete = [
        existingProduct.mainImage,
        existingProduct.additionalImage1,
        existingProduct.additionalImage2,
        existingProduct.additionalImage3
      ];
      await deleteMultipleFromGCS(imagesToDelete);

      // Hapus data produk dari database
      const product = await productService.delete(id);
      res.status(200).json({
        message: 'Berhasil menghapus produk',
        data: product,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message || 'Gagal menghapus produk',
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
          data: [],
        });
      }

      res.status(200).json({
        message: 'Berhasil mengambil data produk',
        data: products,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message || 'Gagal melakukan pencarian produk',
      });
    }
  }
}

export default new ProductController();
