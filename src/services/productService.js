import "../configs/database.js";
import crypto from "crypto";
import { Product } from "../models/productModel.js";
import { Op } from "sequelize";
import { ProductVariation } from "../models/productVariationModel.js";
import sequelize from "../configs/database.js";
import { Category } from "../models/categoryModel.js";

class ProductService {
    constructor() {}

   async create(data) {
        const { variations, ...productData } = data; 
        const t = await sequelize.transaction();

        try {
            const id = crypto.randomUUID();
            const product = await Product.create({ id, ...productData }, { transaction: t });

            const variationsToCreate = variations.map(v => ({
                ...v,
                productId: product.id
            }));
            
            // 3. Buat semua variasi sekaligus
            await ProductVariation.bulkCreate(variationsToCreate, { transaction: t });

            // 4. Jika semua berhasil, commit transaksi
            await t.commit();
            return this.getById(product.id);

        } catch (error) {
            // Jika ada error, batalkan semua yang sudah dibuat
            await t.rollback();
            throw new Error(`Gagal membuat produk dengan variasi: ${error.message}`);
        }
    }

     async getAll(options = {}) {
        const { category, sort_by } = options;
        
        const where = {};
        let order = [];

        if (category) { 
            where.categoryId = category; 
        }

        if (sort_by && !sort_by.startsWith('price_')) {
            const [field, direction] = sort_by.split('_');
            if (['product_name', 'createdAt'].includes(field) && ['asc', 'desc'].includes(direction)) {
                order.push([field, direction.toUpperCase()]);
            }
        }

        const products = await Product.findAll({
            where,
            order, 
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'category_name']
                },
                {
                    model: ProductVariation,
                    as: 'variations',
                    attributes: ['id', 'name', 'price']
                }
            ]
        });
        
        if (sort_by === 'price_asc' || sort_by === 'price_desc') {
            products.sort((a, b) => {
                const priceA = a.variations.length ? Math.min(...a.variations.map(v => v.price)) : Infinity;
                const priceB = b.variations.length ? Math.min(...b.variations.map(v => v.price)) : Infinity;

                if (sort_by === 'price_asc') {
                    return priceA - priceB;
                } else {
                    return priceB - priceA;
                }
            });
        }
        
        return products;
    }
    

  async getById(id) {
        const product = await Product.findByPk(id, {
            include: [{ 
                model: ProductVariation, 
                as: 'variations',
                attributes: ['id', 'name', 'price']
            }]
        });
        return product;
    }
    async update(id, data) {
        // Pisahkan data variasi dari data produk utama
        const { variations, ...productData } = data;
        
        const t = await sequelize.transaction();
        try {
            // 1. Cari produk yang akan diupdate
            const product = await Product.findByPk(id, { transaction: t });
            if (!product) {
                // Jika produk tidak ada, batalkan transaksi dan lempar error
                await t.rollback();
                return null;
            }

            // 2. Update data produk induk (nama, deskripsi, dll.)
            await product.update(productData, { transaction: t });

            // 3. Jika ada data 'variations' yang dikirim, proses variasinya
            if (variations && Array.isArray(variations)) {
                // Hapus semua variasi lama yang terhubung dengan produk ini
                await ProductVariation.destroy({
                    where: { productId: id },
                    transaction: t
                });

                // Siapkan data variasi baru untuk dibuat
                const variationsToCreate = variations.map(v => ({
                ...v,
                productId: product.id
            }));

                // Buat kembali semua variasi dengan data yang baru
                await ProductVariation.bulkCreate(variationsToCreate, { transaction: t });
            }

            // 4. Jika semua berhasil, commit transaksi
            await t.commit();

            // 5. Ambil kembali data produk yang paling update beserta variasinya untuk dikirim sebagai respons
            return this.getById(id);

        } catch (error) {
            // Jika ada satu saja error, batalkan semua perubahan
            await t.rollback();
            throw new Error(`Gagal memperbarui produk: ${error.message}`);
        }
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
            return this.getAll(); 
        }

        const products = await Product.findAll({
            where: {
                product_name: {
                    [Op.like]: `%${query}%` // Mencari produk yang namanya mengandung query
                }
            },
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'category_name']
                },
                {
                    model: ProductVariation,
                    as: 'variations',
                    attributes: ['id', 'name', 'price']
                }
            ]
        });
        return products;
    }
}

export { ProductService };