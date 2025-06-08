import sequelize from '../configs/database.js';
import { Order } from '../models/orderModel.js';
import { OrderItem } from '../models/orderItemModel.js';
import { Product } from '../models/productModel.js';
import { User } from '../models/userModel.js';

export class OrderService {
    async createOrder(userId, orderData) {
        const { items, note, shipPrice = 10000 } = orderData; 

        if (!items || items.length === 0) {
            throw new Error("Keranjang belanja kosong.");
        }

        const t = await sequelize.transaction();

        try {
            let totalPriceOfProducts = 0;

            const productPromises = items.map(async (item) => {
                const product = await Product.findByPk(item.productId);
                if (!product) {
                    throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
                }
                totalPriceOfProducts += product.price * item.quantity;
                return { ...item, price: product.price }; // Simpan harga saat ini
            });

            const itemsWithPrice = await Promise.all(productPromises);
            
            // 2. Buat record di tabel 'Orders'
            const newOrder = await Order.create({
                userId,
                shipPrice,
                totalPayment: totalPriceOfProducts + shipPrice,
                note,
            }, { transaction: t });

            // 3. Buat record di tabel 'OrderItems' untuk setiap produk
            const orderItemsPromises = itemsWithPrice.map(item => {
                return OrderItem.create({
                    orderId: newOrder.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price, // Gunakan harga yang sudah divalidasi
                }, { transaction: t });
            });
            
            await Promise.all(orderItemsPromises);

            await t.commit();
            
            // Kembalikan data order lengkap
            return Order.findByPk(newOrder.id, {
                include: [{
                    model: OrderItem,
                    as: 'items',
                    include: ['product']
                }]
            });

        } catch (error) {
            // Jika ada kesalahan, batalkan semua perubahan
            await t.rollback();
            throw new Error(`Gagal membuat pesanan: ${error.message}`);
        }
    }

    async getOrdersByUser(userId) {
        const orders = await Order.findAll({
            where: { userId },
            order: [['orderDate', 'DESC']],
            include: ['items'] // Sertakan item di setiap order
        });
        return orders;
    }

    async getOrderDetails(orderId, userId) {
        const order = await Order.findOne({
            where: { id: orderId, userId }, // Pastikan user hanya bisa lihat order miliknya
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'product_name', 'image']
                }]
            }, {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }]
        });

        if (!order) {
            throw new Error("Pesanan tidak ditemukan atau Anda tidak memiliki akses.");
        }
        return order;
    }
    
    async updateOrderStatus(orderId, status) {
        const order = await Order.findByPk(orderId);
        if (!order) throw new Error("Pesanan tidak ditemukan.");

        order.orderStatus = status;
        await order.save();
        return order;
    }
}
