import sequelize from '../configs/database.js';
import { Order } from '../models/orderModel.js';
import { OrderItem } from '../models/orderItemModel.js';
import { Product } from '../models/productModel.js';
import { User } from '../models/userModel.js';
import { Cart } from '../models/cartModel.js';
import { VoucherService } from './voucherService.js';
import snap from '../utils/midtrans.js';

const voucherService = new VoucherService();

class OrderService {
 async createOrder(userId, orderData) {
        const user = await User.findByPk(userId);
        if (!user) throw new Error("User tidak ditemukan.");
        if (!user.address || !user.phone) throw new Error("Harap lengkapi alamat dan nomor HP Anda di profil sebelum melanjutkan checkout.");

        // Ambil voucherCode juga
        const { items, note, shipPrice = 0, voucherCode } = orderData; 

        if (!items || items.length === 0) {
            throw new Error("Data 'items' dibutuhkan untuk membuat pesanan.");
        }

        const t = await sequelize.transaction();
        try {
            let subtotal = 0;
            const productPromises = items.map(async (item) => {
                const product = await Product.findByPk(item.productId);
                if (!product) throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
                subtotal += product.price * item.quantity;
                return { ...item, price: product.price };
            });

            // itemsWithPrice sekarang berisi productId, quantity, dan price
            const itemsWithPrice = await Promise.all(productPromises);
            
            let discountAmount = 0;
            if (voucherCode) {
                const voucher = await voucherService.getAndValidateVoucher(voucherCode);
                if (subtotal < voucher.minPurchase) throw new Error(`Minimum pembelian untuk voucher ${voucherCode} tidak terpenuhi.`);
                switch (voucher.type) {
                    case 'POTONGAN_HARGA': discountAmount = voucher.value; break;
                    case 'PERSENTASE':
                        let calcDiscount = subtotal * (voucher.value / 100);
                        discountAmount = voucher.maxDiscount && calcDiscount > voucher.maxDiscount ? voucher.maxDiscount : calcDiscount;
                        break;
                    case 'POTONGAN_ONGKIR':
                        discountAmount = voucher.value > shipPrice ? shipPrice : voucher.value;
                        break;
                }
            }

            let totalPayment = (subtotal + shipPrice) - discountAmount;
            if (totalPayment < 0) totalPayment = 0;
            
            const newOrder = await Order.create({
                userId, subtotal, shipPrice, discountAmount,
                voucherCode: voucherCode || null,
                totalPayment, note,
            }, { transaction: t });
            
            const orderItemsPromises = itemsWithPrice.map(item => {
                return OrderItem.create({
                    orderId: newOrder.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price, 
                }, { transaction: t });
            });
            
            await Promise.all(orderItemsPromises);
            await t.commit();
            return Order.findByPk(newOrder.id, { include: [{ model: OrderItem, as: 'items', include: ['product'] }] });

        } catch (error) {
            await t.rollback();
            throw new Error(`Gagal membuat pesanan: ${error.message}`);
        }
    }

      async createOrderFromCart(userId, orderData) {
        const user = await User.findByPk(userId);
        
        if (!user) {
            throw new Error("User tidak ditemukan.");
        }

        if (!user.address || !user.phone) {
            throw new Error("Harap lengkapi alamat dan nomor HP Anda di profil sebelum melanjutkan checkout.");
        }

        const { note, shipPrice = 0, voucherCode } = orderData;
        const cartItems = await Cart.findAll({ where: { userId }, include: ['product'] });

        if (!cartItems || cartItems.length === 0) {
            throw new Error("Keranjang belanja kosong.");
        }

        const t = await sequelize.transaction();

        try {
            let subtotal = 0;
            cartItems.forEach(cartItem => {
                subtotal += cartItem.product.price * cartItem.quantity;
            });

            let discountAmount = 0;
            if (voucherCode) {
                const voucher = await voucherService.getAndValidateVoucher(voucherCode);
                if (subtotal < voucher.minPurchase) {
                    throw new Error(`Minimum pembelian untuk voucher ${voucherCode} tidak terpenuhi.`);
                }
                switch (voucher.type) {
                    case 'POTONGAN_HARGA':
                        discountAmount = voucher.value;
                        break;
                    case 'PERSENTASE':
                        let calculatedDiscount = subtotal * (voucher.value / 100);
                        discountAmount = voucher.maxDiscount && calculatedDiscount > voucher.maxDiscount 
                            ? voucher.maxDiscount 
                            : calculatedDiscount;
                        break;
                    case 'POTONGAN_ONGKIR':
                        discountAmount = voucher.value > shipPrice ? shipPrice : voucher.value;
                        break;
                }
            }

            let totalPayment = (subtotal + shipPrice) - discountAmount;
            if (totalPayment < 0) {
                totalPayment = 0;
            }

            const newOrder = await Order.create({
                userId,
                subtotal,
                shipPrice,
                discountAmount,
                voucherCode: voucherCode || null,
                totalPayment,
                note,
            }, { transaction: t });

            const orderItemsPromises = cartItems.map(cartItem => {
                return OrderItem.create({
                    orderId: newOrder.id,
                    productId: cartItem.productId,
                    quantity: cartItem.quantity,
                    price: cartItem.product.price,
                }, { transaction: t });
            });

            await Promise.all(orderItemsPromises);
            await Cart.destroy({ where: { userId } }, { transaction: t });
            await t.commit();

            return Order.findByPk(newOrder.id, {
                include: [{
                    model: OrderItem,
                    as: 'items',
                    include: ['product']
                }]
            });

        } catch (error) {
            await t.rollback();
            throw new Error(`Gagal membuat pesanan: ${error.message}`);
        }
    }

     async createManualOrder(orderData) {
        // userId, items, note, dan shipPrice diambil dari orderData (req.body)
        const { userId, items, note, shipPrice = 0 } = orderData;

        const t = await sequelize.transaction();
        try {
            let subtotal = 0;
            // Kita perlu mengambil harga dari setiap produk untuk menghitung subtotal
            const productPromises = items.map(async (item) => {
                const product = await Product.findByPk(item.productId);
                // Validasi di middleware sudah memastikan produk ada, tapi ini adalah pengaman tambahan
                if (!product) throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
                subtotal += product.price * item.quantity;
                // Kembalikan item beserta harganya untuk disimpan di order_items
                return { ...item, price: product.price };
            });
            const itemsWithPrice = await Promise.all(productPromises);

            // Untuk pesanan manual, kita asumsikan tidak ada diskon
            const discountAmount = 0;
            const totalPayment = subtotal + shipPrice;

            const newOrder = await Order.create({
                userId, // <-- userId pelanggan dari body request
                subtotal,
                shipPrice,
                discountAmount,
                totalPayment,
                note,
                orderStatus: 'Diproses' 
            }, { transaction: t });

            const orderItemsPromises = itemsWithPrice.map(item => OrderItem.create({
                orderId: newOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
            }, { transaction: t }));

            await Promise.all(orderItemsPromises);
            await t.commit();
            
            return Order.findByPk(newOrder.id, { include: ['items'] });
        } catch (error) {
            await t.rollback();
            throw new Error(`Gagal membuat pesanan manual: ${error.message}`);
        }
    }

    async getOrdersByUser(userId) {
        const orders = await Order.findAll({
            where: { userId },
            order: [['orderDate', 'DESC']],
             include: [{
                model: OrderItem,
                as: 'items',
                include: [{ 
                    model: Product,
                    as: 'product',
                    attributes: ['product_name', 'main_image', 'price']
                }]
            }]
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
                    attributes: ['id', 'product_name', 'main_image', 'price']
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

    async updateOrderStatusByUser({ userId, orderId, status }) {
    const order = await Order.findOne({ where: { id: orderId, userId: userId } });
    if (!order) {
        throw new Error("Pesanan tidak ditemukan atau Anda tidak memiliki akses.");
    }

    if (status === 'Dibatalkan') {
        // Syarat: Hanya bisa batal jika status 'Menunggu Pembayaran'
        if (order.orderStatus !== 'Menunggu Pembayaran') {
            throw new Error('Pesanan ini sudah dibayar atau diproses dan tidak dapat dibatalkan.');
        }
        order.orderStatus = 'Dibatalkan';

    } else if (status === 'Selesai') {
        // Syarat: Hanya bisa selesai jika status 'Dikirim'
        if (order.orderStatus !== 'Dikirim') {
            throw new Error('Hanya pesanan yang sudah dikirim yang dapat diselesaikan.');
        }
        order.orderStatus = 'Selesai';
    }

    await order.save();
    return order;
}
    
 async createMidtransTransaction(orderId, userId) {
        const order = await Order.findOne({ where: { id: orderId, userId: userId }});
        if (!order) throw new Error("Pesanan tidak ditemukan atau Anda tidak memiliki akses.");
        if (order.orderStatus !== 'Menunggu Pembayaran') throw new Error("Pesanan ini sudah diproses atau dibayar.");

        const user = await User.findByPk(userId);
        if (!user) throw new Error("User tidak ditemukan.");

        const parameter = {
            transaction_details: {
                order_id: order.id,
                gross_amount: Math.round(order.totalPayment)
            },
            customer_details: {
                first_name: user.name,
                email: user.email,
                phone: user.phone
            },
        };

        const transaction = await snap.createTransaction(parameter);
        return transaction.token;
    }

    async handlePaymentNotification(notificationPayload) {
        try {
            const statusResponse = await snap.transaction.notification(notificationPayload);
            const orderId = statusResponse.order_id;
            const transactionStatus = statusResponse.transaction_status;
            const fraudStatus = statusResponse.fraud_status;

            const order = await Order.findByPk(orderId);
            if (!order) {
                console.error(`Webhook Gagal: Pesanan dengan ID ${orderId} tidak ditemukan.`);
                return;
            }

            if (order.orderStatus === 'Menunggu Pembayaran') {
                if ((transactionStatus === 'capture' && fraudStatus === 'accept') || transactionStatus === 'settlement') {
                    await order.update({ orderStatus: 'Diproses' });
                } else if (transactionStatus === 'cancel' || transactionStatus === 'expire' || transactionStatus === 'deny') {
                    await order.update({ orderStatus: 'Dibatalkan' });
                }
            }
        } catch (error) {
           console.error("Error saat memproses notifikasi Midtrans:", error.message);
            throw error;
        }
    }
}

export { OrderService };