import "../configs/database.js";
import crypto from "crypto";
import { Product } from "../models/productModel.js";
import { Op } from "sequelize";
import { User } from "../models/userModel.js";
import { Category } from "../models/categoryModel.js";

class ProductService {
    constructor() {}

    async create(data) {
        const id = crypto.randomUUID();
        const product = await Product.create({
            id,
            ...data,
        });
        return product;
    }

        async getAll(options = {}) {
        const { limit = 10, page = 1, category, min_price, max_price, sort_by } = options;
        
        const offset = (page - 1) * limit;
        const where = {};
        let order = [];

        if (category) { where.categoryId = category; }
        if (min_price) { where.price = { ...where.price, [Op.gte]: min_price }; }
        if (max_price) { where.price = { ...where.price, [Op.lte]: max_price }; }
        if (sort_by) {
            const [field, direction] = sort_by.split('_');
            if (['product_name', 'price', 'createdAt'].includes(field) && ['asc', 'desc'].includes(direction)) {
                order.push([field, direction.toUpperCase()]);
            }
        }

        const { count, rows } = await Product.findAndCountAll({
            where,
            order,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'category_name']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: {
                        exclude: ['password', 'otp', 'googleId', 'isVerified']
                    }
                }
            ]
        });
        
        return {
            totalProducts: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            products: rows
        };
    }
    

    async getById(id) {
        const product = await Product.findByPk(id);
        return product;
    }

    async update(id, data) {
        const product = await this.getById(id);
        if (!product) {
            return null;
        }
        const updatedProduct = await product.update(data);
        return updatedProduct;
    }

    async delete(id) {
        const product = await this.getById(id);
        if (!product) {
            return null;
        }
        await product.destroy();
        return product;
    }

     async searchByName(query) {
        if (!query) {
            // Jika query kosong, kembalikan semua produk atau array kosong
            return this.getAll(); 
        }

        const products = await Product.findAll({
            where: {
                product_name: {
                    [Op.like]: `%${query}%` // Mencari produk yang namanya mengandung query
                }
            }
        });
        return products;
    }
}

export { ProductService };