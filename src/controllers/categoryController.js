import { CategoryService } from '../services/categoryService.js';
import { Category } from '../models/categoryModel.js';
import { validationResult } from 'express-validator';
import { deleteFromGCS } from '../configs/gcs.js';

const categoryService = new CategoryService(Category);

class CategoryController {
 async createCategory(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const data = { ...req.body };

    const category = await categoryService.create(data);
    res.status(201).json({
      message: 'Berhasil membuat kategori baru',
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Gagal membuat kategori',
    });
  }
}
  async getAllCategories(req, res) {
    try {
      const categories = await categoryService.getAll();
      res.status(200).json({
        message: 'Berhasil mengambil data semua kategori',
        data: categories,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message || 'Gagal mengambil data kategori',
      });
    }
  }

  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await categoryService.getById(id);

      if (!category) {
        return res.status(404).json({
          message: `Kategori dengan ID ${id} tidak ditemukan`,
        });
      }

      res.status(200).json({
        message: 'Berhasil mengambil data kategori',
        data: category,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message || 'Gagal mengambil data kategori',
      });
    }
  }
 async updateCategory(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    const data = { ...req.body };

    // Ambil data kategori lama untuk mendapatkan URL gambar lama
    const existingCategory = await categoryService.getById(id);
    if (!existingCategory) {
      return res.status(404).json({
        message: `Kategori dengan ID ${id} tidak ditemukan`,
      });
    }

    // Jika ada gambar baru, hapus gambar lama
    if (data.image && existingCategory.image) {
      await deleteFromGCS(existingCategory.image);
    }

    const category = await categoryService.update(id, data);
    res.status(200).json({
      message: 'Berhasil memperbarui kategori',
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Gagal memperbarui kategori',
    });
  }
}
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      
      // Ambil data kategori untuk mendapatkan URL gambar sebelum dihapus
      const existingCategory = await categoryService.getById(id);
      if (!existingCategory) {
        return res.status(404).json({
          message: `Kategori dengan ID ${id} tidak ditemukan`,
        });
      }

      // Hapus gambar dari GCS jika ada
      if (existingCategory.image) {
        await deleteFromGCS(existingCategory.image);
      }

      // Hapus data kategori dari database
      const category = await categoryService.delete(id);
      res.status(200).json({
        message: 'Berhasil menghapus kategori',
        data: category,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message || 'Gagal menghapus kategori',
      });
    }
  }
}

export default new CategoryController();
