import '../src/configs/database.js';
import { User } from '../src/models/userModel.js';
import { ProductVariation } from '../src/models/productVariationModel.js';
import { Order } from '../src/models/orderModel.js';
import { OrderItem } from '../src/models/orderItemModel.js';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../src/configs/database.js';

// Fungsi pembantu untuk membuat tanggal di masa lalu
const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const seedOrders = async () => {
  try {
    console.log('Memulai proses seeding pesanan...');

    // 1. Ambil data yang dibutuhkan (user dan variasi produk)
    const user = await User.findOne({ where: { email: 'jack@suzuka.com' } });
    const variations = await ProductVariation.findAll();

    if (!user || variations.length < 2) {
      console.error('Pastikan user "jack@suzuka.com" dan minimal 2 variasi produk sudah ada.');
      return;
    }

    const t = await sequelize.transaction();

    try {
      // Data Pesanan yang akan dibuat
      const ordersToCreate = [
        // Pesanan hari ini
        {
          orderDate: new Date(),
          items: [{ variation: variations[0], quantity: 2 }],
        },
        // Pesanan 3 hari yang lalu (minggu ini)
        {
          orderDate: daysAgo(3),
          items: [{ variation: variations[1], quantity: 1 }],
        },
        // Pesanan 15 hari yang lalu (bulan ini)
        {
          orderDate: daysAgo(15),
          items: [
            { variation: variations[0], quantity: 5 },
            { variation: variations[1], quantity: 3 },
          ],
        },
        // Pesanan 40 hari yang lalu (bulan lalu)
        {
          orderDate: daysAgo(40),
          items: [{ variation: variations[0], quantity: 10 }],
        },
        // Pesanan setahun yang lalu
        {
          orderDate: daysAgo(370),
          items: [{ variation: variations[1], quantity: 4 }],
        },
      ];

      console.log('Membuat data pesanan...');
      for (const orderData of ordersToCreate) {
        let subtotal = 0;
        orderData.items.forEach(item => {
          subtotal += item.variation.price * item.quantity;
        });

        const serviceFee = 4000;
        const shipPrice = 10000;
        const totalPayment = subtotal + serviceFee + shipPrice;

        const newOrder = await Order.create({
          id: uuidv4(),
          userId: user.id,
          subtotal,
          shipPrice,
          serviceFee,
          totalPayment,
          orderStatus: 'Selesai', // Kita buat statusnya langsung 'Selesai'
          paymentMethod: 'qris',
          orderDate: orderData.orderDate, // Gunakan tanggal yang sudah kita tentukan
          createdAt: orderData.orderDate,
          updatedAt: orderData.orderDate,
        }, { transaction: t });

        const orderItemsToCreate = orderData.items.map(item => ({
          id: uuidv4(),
          orderId: newOrder.id,
          productVariationId: item.variation.id,
          quantity: item.quantity,
          price: item.variation.price,
        }));
        
        await OrderItem.bulkCreate(orderItemsToCreate, { transaction: t });
        console.log(`- Pesanan pada tanggal ${orderData.orderDate.toISOString().split('T')[0]} berhasil dibuat.`);
      }

      await t.commit();
      console.log('\nProses seeding pesanan berhasil diselesaikan.');

    } catch (err) {
        await t.rollback();
        console.error('\nTerjadi kesalahan saat transaksi seeding pesanan:', err);
    }

  } catch (err) {
    console.error('\nTerjadi kesalahan umum:', err);
  } finally {
    await sequelize.close();
    console.log('Keluar dari skrip seeder pesanan.');
  }
};

seedOrders();