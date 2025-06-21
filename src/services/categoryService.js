import "../configs/database.js";
import crypto from "crypto";
import { Category } from "../models/categoryModel.js";


class CategoryService {
    constructor() {}

    async create(data) {
        const id = crypto.randomUUID();
        const category = await Category.create({
            id,
            ...data,
        });
        return category;
    }

    async getAll() {
        const categories = await Category.findAll();
        return categories;
    }   

    async getById(id) {
        const category = await Category.findByPk(id);
        return category;
    }

    async update(id, data) {
        const category = await this.getById(id);
        if (!category) {
            return null;
        }
        const updatedCategory = await category.update(data);
        return updatedCategory;
    }
    async delete(id) {
        const category = await this.getById(id);
        if (!category) {
            return null;
        }
        await category.destroy();
        return category;
    }

}

export { CategoryService };