import "../configs/database.js";
import crypto from "crypto";
import { Product } from "../models/productModel.js";

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

    async getAll() {
        const products = await Product.findAll();
        return products;
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
    async getByCategory(category) {
        const products = await Product.findAll({
            where: {
                category: category,
            },
        });
        return products;
    }

    async getByName(name) {
        const products = await Product.findAll({
            where: {
                product_name: name,
            },
        });
        return products;
    }
}

export { ProductService };