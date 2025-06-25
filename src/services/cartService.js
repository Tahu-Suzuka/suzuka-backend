import sequelize from '../configs/database.js';
import { Cart } from '../models/cartModel.js';
import { Product } from '../models/productModel.js';
import { ProductVariation } from '../models/productVariationModel.js';

export class CartService {

    async getCart(userId) {
        const carts = await Cart.findAll({
            where: { userId },
            include: [{
                model: ProductVariation,
                as: 'variation',
                // Ambil juga data produk induknya
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['product_name', 'mainImage']
                }]
            }],
            order: [['createdAt', 'ASC']],
        });

        const totalPayment = carts.reduce((total, item) => {
            return total + (item.variation.price * item.quantity);
        }, 0);

        return { carts, totalPayment };
    }

     async addItemToCart({ userId, items }) {
        const addedItems = [];
        for (const item of items) {
            const { variationId, quantity } = item;
            if (!variationId || !quantity) continue;

            // Cek apakah variasi produk ada
            const variation = await ProductVariation.findByPk(variationId);
            if (!variation) throw new Error(`Variasi produk dengan ID ${variationId} tidak ditemukan.`);

            const existingItem = await Cart.findOne({ where: { userId, productVariationId: variationId } });

            if (existingItem) {
                existingItem.quantity += quantity;
                await existingItem.save();
                addedItems.push(existingItem);
            } else {
                const newItem = await Cart.create({
                    userId,
                    productVariationId: variationId,
                    quantity,
                });
                addedItems.push(newItem);
            }
        }
        return addedItems;
    }
    
    async updateItemQuantity({ userId, items }) {
        const t = await sequelize.transaction();
         try {
            for (const item of items) {
                // Gunakan variationId untuk mencari item, bukan productId
                const { variationId, quantity } = item;

                const cartItem = await Cart.findOne({
                    where: { userId, productVariationId: variationId }, // <-- Perbaikan di sini
                    transaction: t
                });

                // Hanya proses jika itemnya memang ada di keranjang
                if (cartItem) {
                    if (quantity <= 0) {
                        // Hapus item jika kuantitasnya 0 atau kurang
                        await cartItem.destroy({ transaction: t });
                    } else {
                        // Update kuantitasnya
                        cartItem.quantity = quantity;
                        await cartItem.save({ transaction: t });
                    }
                }
            }
            // Jika semua proses dalam loop berhasil, commit transaksi
            await t.commit();
        } catch (error) {
            // Jika ada satu saja error, batalkan semua perubahan
            await t.rollback();
            throw new Error(`Gagal memperbarui keranjang: ${error.message}`);
        }
    }

    async removeItemFromCart({ userId, cartId }) {
        // Menggunakan model Cart dan parameter cartId
        const item = await Cart.findOne({ where: { id: cartId, userId } });
        if (!item) {
            throw new Error('Item keranjang tidak ditemukan');
        }

        await item.destroy();
        return { message: 'Item berhasil dihapus dari keranjang' };
    }

    async clearCart(userId) {
        // Menggunakan model Cart
        await Cart.destroy({ where: { userId } });
        return { message: 'Keranjang berhasil dikosongkan' };
    }
}