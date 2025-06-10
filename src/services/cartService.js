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

    async addItemToCart({ userId, productId, quantity }) {
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new Error('Produk tidak ditemukan');
        }

        // Menggunakan model Cart
        const existingItem = await Cart.findOne({
            where: { userId, productId },
        });

        if (existingItem) {
            existingItem.quantity += quantity;
            await existingItem.save();
            return existingItem;
        } else {
            // Menggunakan model Cart
            const newItem = await Cart.create({
                userId,
                productId,
                quantity,
            });
            return newItem;
        }
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