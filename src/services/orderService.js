import sequelize from '../configs/database.js';
import { Order } from '../models/orderModel.js';
import { OrderItem } from '../models/orderItemModel.js';
import { Product } from '../models/productModel.js';
import { User } from '../models/userModel.js';
import { Cart } from '../models/cartModel.js';
import { VoucherService } from './voucherService.js';
import { CartService } from './cartService.js';
import { ProductVariation } from '../models/productVariationModel.js';
import snap from '../utils/midtrans.js';

const voucherService = new VoucherService();
const cartService = new CartService();

class OrderService {
  async createOrder(userId, orderData) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User tidak ditemukan.');
    if (!user.address || !user.phone)
      throw new Error('Harap lengkapi alamat dan nomor HP Anda di profil.');

    // Frontend sekarang mengirim 'items' berisi variationId
    const { items, note, shipPrice = 0, voucherCode } = orderData;
    if (!items || items.length === 0) throw new Error("Data 'items' dibutuhkan.");

    const t = await sequelize.transaction();
    try {
      let subtotal = 0;
      const variationPromises = items.map(async (item) => {
        const variation = await ProductVariation.findByPk(item.variationId);
        if (!variation)
          throw new Error(`Variasi produk dengan ID ${item.variationId} tidak ditemukan.`);
        subtotal += variation.price * item.quantity;
        return { ...item, price: variation.price };
      });
      const itemsWithPrice = await Promise.all(variationPromises);
      let discountAmount = 0;
      if (voucherCode) {
        const voucher = await voucherService.getAndValidateVoucher(voucherCode);
        if (subtotal < voucher.minPurchase)
          throw new Error(`Minimum pembelian untuk voucher ${voucherCode} tidak terpenuhi.`);
        switch (voucher.type) {
          case 'POTONGAN_HARGA':
            discountAmount = voucher.value;
            break;
          case 'PERSENTASE':
            let calcDiscount = subtotal * (voucher.value / 100);
            discountAmount =
              voucher.maxDiscount && calcDiscount > voucher.maxDiscount
                ? voucher.maxDiscount
                : calcDiscount;
            break;
          case 'POTONGAN_ONGKIR':
            discountAmount = voucher.value > shipPrice ? shipPrice : voucher.value;
            break;
        }
      }

      const serviceFee = 4000;
      let totalPayment = subtotal + shipPrice + serviceFee - discountAmount;
      if (totalPayment < 0) totalPayment = 0;

      const newOrder = await Order.create(
        {
          userId,
          subtotal,
          shipPrice,
          serviceFee,
          discountAmount,
          voucherCode: voucherCode || null,
          totalPayment,
          note,
        },
        { transaction: t }
      );

      const orderItemsPromises = itemsWithPrice.map((item) =>
        OrderItem.create(
          {
            orderId: newOrder.id,
            productVariationId: item.variationId,
            quantity: item.quantity,
            price: item.price,
          },
          { transaction: t }
        )
      );

      await Promise.all(orderItemsPromises);
      await t.commit();
      return this.getOrderDetails(newOrder.id, userId);
    } catch (error) {
      await t.rollback();
      throw new Error(`Gagal membuat pesanan: ${error.message}`);
    }
  }

  async createOrderFromCart(userId, orderData) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('User tidak ditemukan.');
    if (!user.address || !user.phone)
      throw new Error('Harap lengkapi alamat dan nomor HP Anda di profil.');

    const { note, shipPrice = 0, voucherCode } = orderData;

    const { carts, totalPayment: subtotal } = await cartService.getCart(userId);
    if (!carts || carts.length === 0) throw new Error('Keranjang belanja kosong.');

    const t = await sequelize.transaction();
    try {
      let discountAmount = 0;
      if (voucherCode) {
        const voucher = await voucherService.getAndValidateVoucher(voucherCode);
        if (subtotal < voucher.minPurchase)
          throw new Error(`Minimum pembelian untuk voucher ${voucherCode} tidak terpenuhi.`);

        switch (voucher.type) {
          case 'POTONGAN_HARGA':
            discountAmount = voucher.value;
            break;
          case 'PERSENTASE':
            let calcDiscount = subtotal * (voucher.value / 100);
            discountAmount =
              voucher.maxDiscount && calcDiscount > voucher.maxDiscount
                ? voucher.maxDiscount
                : calcDiscount;
            break;
          case 'POTONGAN_ONGKIR':
            discountAmount = voucher.value > shipPrice ? shipPrice : voucher.value;
            break;
        }
      }

      const serviceFee = 4000;
      let totalPayment = subtotal + shipPrice + serviceFee - discountAmount;
      if (totalPayment < 0) totalPayment = 0;

      const newOrder = await Order.create(
        {
          userId,
          subtotal,
          shipPrice,
          serviceFee,
          discountAmount,
          voucherCode: voucherCode || null,
          totalPayment,
          note,
        },
        { transaction: t }
      );

      const orderItemsPromises = carts.map((cartItem) =>
        OrderItem.create(
          {
            orderId: newOrder.id,
            productVariationId: cartItem.productVariationId,
            quantity: cartItem.quantity,
            price: cartItem.variation.price,
          },
          { transaction: t }
        )
      );

      await Promise.all(orderItemsPromises);
      await Cart.destroy({ where: { userId } }, { transaction: t });
      await t.commit();

      return this.getOrderDetails(newOrder.id, userId);
    } catch (error) {
      await t.rollback();
      throw new Error(`Gagal membuat pesanan dari keranjang: ${error.message}`);
    }
  }

  async createManualOrder(orderData) {
    const { userId, items, note, shipPrice = 0, paymentMethod } = orderData;

    const t = await sequelize.transaction();
    try {
      let subtotal = 0;
      const variationPromises = items.map(async (item) => {
        const variation = await ProductVariation.findByPk(item.variationId);
        if (!variation) {
          throw new Error(`Variasi produk dengan ID ${item.variationId} tidak ditemukan.`);
        }
        subtotal += variation.price * item.quantity;
        return { ...item, price: variation.price };
      });
      const itemsWithPrice = await Promise.all(variationPromises);

      // Untuk pesanan manual, kita asumsikan tidak ada diskon dan status langsung 'Diproses'
      const discountAmount = 0;
      const serviceFee = 0; // Tidak ada biaya layanan untuk pesanan manual

      const totalPayment = subtotal + shipPrice + serviceFee - discountAmount; 

      const newOrder = await Order.create(
        {
          userId,
          subtotal,
          shipPrice,
          serviceFee,
          discountAmount,
          totalPayment,
          note,
          paymentMethod: paymentMethod || null,
          orderStatus: 'Diproses',
        },
        { transaction: t }
      );

      const orderItemsPromises = itemsWithPrice.map((item) =>
        OrderItem.create(
          {
            orderId: newOrder.id,
            productVariationId: item.variationId,
            quantity: item.quantity,
            price: item.price,
          },
          { transaction: t }
        )
      );

      await Promise.all(orderItemsPromises);
      await t.commit();

      return this.getOrderDetails(newOrder.id, userId);
    } catch (error) {
      await t.rollback();
      throw new Error(`Gagal membuat pesanan manual: ${error.message}`);
    }
  }

  async getOrdersByUser(userId) {
    return await Order.findAll({
      where: { userId },
      order: [['orderDate', 'DESC']],
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: ProductVariation,
              as: 'variation',
              attributes: ['id', 'name', 'price'],
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['id', 'product_name', 'mainImage'],
                },
              ],
            },
          ],
        },
      ],
    });
  }

  async getAllOrders(status) {
    // Buat objek 'where' yang akan digunakan untuk query
    const whereClause = {};

    // Jika parameter 'status' diberikan, tambahkan ke kondisi where
    if (status) {
      whereClause.orderStatus = status;
    }

    // Jalankan query dengan kondisi where yang sudah dibuat
    const orders = await Order.findAll({
      where: whereClause,
      // Sertakan juga data user untuk ditampilkan
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name'],
        },
      ],
      order: [['orderDate', 'DESC']], // Urutkan dari yang terbaru
    });

    return orders;
  }

  async getOrderDetails(orderId, userId) {
    const whereClause = { id: orderId };
    if (userId) {
      whereClause.userId = userId;
    }
    const order = await Order.findOne({
      where: { id: orderId, userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: ProductVariation,
              as: 'variation',
              attributes: ['id', 'name', 'price'],
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['id', 'product_name', 'mainImage'],
                },
              ],
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'address'],
        },
      ],
    });

    if (!order) {
      throw new Error('Pesanan tidak ditemukan atau Anda tidak memiliki akses.');
    }
    return order;
  }

  async updateOrderStatus(orderId, status) {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error('Pesanan tidak ditemukan.');

    order.orderStatus = status;
    await order.save();
    return order;
  }

  async updateOrderStatusByUser({ userId, orderId, status }) {
    const order = await Order.findOne({ where: { id: orderId, userId: userId } });
    if (!order) {
      throw new Error('Pesanan tidak ditemukan atau Anda tidak memiliki akses.');
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
    const order = await Order.findOne({ where: { id: orderId, userId: userId } });
    if (!order) throw new Error('Pesanan tidak ditemukan atau Anda tidak memiliki akses.');
    if (order.orderStatus !== 'Menunggu Pembayaran')
      throw new Error('Pesanan ini sudah diproses atau dibayar.');

    const user = await User.findByPk(userId);
    if (!user) throw new Error('User tidak ditemukan.');

    const parameter = {
      transaction_details: {
        order_id: order.id,
        gross_amount: Math.round(order.totalPayment),
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.phone,
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
      const paymentType = statusResponse.payment_type;

      const order = await Order.findByPk(orderId);
      if (!order) {
        console.error(`Webhook Gagal: Pesanan dengan ID ${orderId} tidak ditemukan.`);
        return;
      }

      if (order.orderStatus === 'Menunggu Pembayaran') {
        if (
          (transactionStatus === 'capture' && fraudStatus === 'accept') ||
          transactionStatus === 'settlement'
        ) {
          await order.update({
            orderStatus: 'Diproses',
            paymentMethod: paymentType,
          });
        } else if (
          transactionStatus === 'cancel' ||
          transactionStatus === 'expire' ||
          transactionStatus === 'deny'
        ) {
          await order.update({ orderStatus: 'Dibatalkan' });
        }
      }
    } catch (error) {
      console.error('Error saat memproses notifikasi Midtrans:', error.message);
      throw error;
    }
  }
}

export { OrderService };
