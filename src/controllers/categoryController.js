import { CategoryService } from "../services/categoryService.js";
import { Category } from "../models/categoryModel.js";
import { validationResult } from "express-validator";

const categoryService = new CategoryService(Category);

class CategoryController {
    async createCategory(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        try {
            const data = req.body;
            if (req.file) {
                const imagePath = req.file.path.replace(/\\/g, "/").replace("public/", "/");
                data.image = imagePath;
            }

            const category = await categoryService.create(data);
            res.status(201).json({
                message: "Berhasil membuat kategori baru",
                data: category,
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || "Gagal membuat kategori",
            });
        }
    }
    async getAllCategories(req, res) {
        try {
            const categories = await categoryService.getAll();
            res.status(200).json({
                message: "Berhasil mengambil data semua kategori",
                data: categories,
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || "Gagal mengambil data kategori",
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
                message: "Berhasil mengambil data kategori",
                data: category,
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || "Gagal mengambil data kategori",
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
            const data = req.body;
            if (req.file) {
                const imagePath = req.file.path.replace(/\\/g, "/").replace("public/", "/");
                data.image = imagePath;
            }

            const category = await categoryService.update(id, data);
            if (!category) {
                return res.status(404).json({
                    message: `Kategori dengan ID ${id} tidak ditemukan`,
                });
            }
            res.status(200).json({
                message: "Berhasil memperbarui kategori",
                data: category,
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || "Gagal memperbarui kategori",
            });
        }
    }
    async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            const category = await categoryService.delete(id);
            if (!category) {
                return res.status(404).json({
                    message: `Kategori dengan ID ${id} tidak ditemukan`,
                });
            }
            res.status(200).json({
                message: "Berhasil menghapus kategori",
                data: category,
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || "Gagal menghapus kategori",
            });
        }
    }
}

export default new CategoryController();