// Diubah dari CartItem menjadi Cart
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
                attributes: ['product_name', 'price', 'image'],
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

        // Gunakan for...of agar bisa menggunakan await di dalam loop
        for (const item of items) {
            const { productId, quantity } = item;

            if (!productId || !quantity) {
                // Lewati item yang tidak valid atau lempar error
                continue; 
            }

            const product = await Product.findByPk(productId);
            if (!product) {
                 // Anda bisa memilih untuk mengabaikan produk yang tidak ada atau mengembalikan error
                console.warn(`Produk dengan ID ${productId} tidak ditemukan, item dilewati.`);
                continue;
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
    
    // Parameter diubah dari cartItemId menjadi cartId
    async updateItemQuantity({ userId, cartId, quantity }) {
        // Menggunakan model Cart dan parameter cartId
        const item = await Cart.findOne({ where: { id: cartId, userId } });
        if (!item) {
            throw new Error('Item keranjang tidak ditemukan');
        }

        if (quantity <= 0) {
            await item.destroy();
            return null;
        } else {
            item.quantity = quantity;
            await item.save();
            return item;
        }
    }

    // Parameter diubah dari cartItemId menjadi cartId
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