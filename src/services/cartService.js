import sequelize from '../configs/database.js';
import { Cart } from '../models/cartModel.js';
import { Product } from '../models/productModel.js';

export class CartService {

    async getCart(userId) {
        // Menggunakan model Cart
        const carts = await Cart.findAll({
            where: { userId },
            include: [{
                model: Product,
                as: 'product',
                attributes: ['product_name', 'price', 'main_image'],
            }],
            order: [['createdAt', 'DESC']],
        });

        const totalPayment = carts.reduce((total, item) => {
            return total + (item.product.price * item.quantity);
        }, 0);

        return { carts, totalPayment };
    }

        async addItemToCart({ userId, items }) {
        const addedItems = [];

        for (const item of items) {
            const { productId, quantity } = item;

            if (!productId || !quantity) {
                continue; 
            }

            const product = await Product.findByPk(productId);
            
            if (!product) {
                throw new Error(`Produk dengan ID ${productId} tidak ditemukan.`);
            }

            const existingItem = await Cart.findOne({
                where: { userId, productId },
            });

            if (existingItem) {
                existingItem.quantity += quantity;
                await existingItem.save();
                addedItems.push(existingItem);
            } else {
                const newItem = await Cart.create({
                    userId,
                    productId,
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
                const { productId, quantity } = item;

            const product = await Product.findByPk(productId);
            
            if (!product) {
                throw new Error(`Produk dengan ID ${productId} tidak ditemukan.`);
            }

                const cartItem = await Cart.findOne({
                    where: { userId, productId },
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