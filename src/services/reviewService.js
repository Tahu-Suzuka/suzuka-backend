import { Review } from '../models/reviewModel.js';
import { Order } from '../models/orderModel.js';
import { User } from '../models/userModel.js';
import { OrderItem } from '../models/orderItemModel.js';

class ReviewService {
    
    async createReview(data) {
        const { userId, orderId, productId, rating, comment, imagePath } = data;

        // 1. Validasi: Cek status pesanan
        const order = await Order.findOne({ where: { id: orderId, userId: userId } });
        if (!order) {
            throw new Error("Pesanan tidak ditemukan atau bukan milik Anda.");
        }
        if (order.orderStatus !== 'Selesai') {
            throw new Error("Anda hanya bisa memberi ulasan untuk pesanan yang sudah Selesai.");
        }

        // 2. Validasi: Pastikan produk yang diulas ada di dalam pesanan tersebut
        const orderItem = await OrderItem.findOne({ where: { orderId, productId } });
        if (!orderItem) {
            throw new Error("Produk ini tidak ditemukan dalam pesanan Anda.");
        }

        // 3. Validasi: Cegah ulasan ganda untuk produk yang sama dari pesanan yang sama
        const existingReview = await Review.findOne({ where: { userId, productId, orderId } });
        if (existingReview) {
            throw new Error("Anda sudah pernah memberikan ulasan untuk produk ini dari pesanan ini.");
        }

        // 4. Jika semua validasi lolos, buat ulasan baru
        const newReview = await Review.create({
            rating,
            comment,
            image: imagePath, // Path gambar dari middleware upload
            userId,
            productId,
            orderId
        });

        return newReview;
    }

   async getReviewsForProduct(productId) {
        const reviews = await Review.findAll({ 
            where: { productId },
            include: [{ 
                model: User, 
                as: 'user', 
                // Hanya ambil nama dan gambar user, jangan sertakan info sensitif
                attributes: ['name', 'image'] 
            }],
            order: [['createdAt', 'DESC']] // Urutkan dari yang terbaru
        });
        return reviews;
    }
}

export { ReviewService };