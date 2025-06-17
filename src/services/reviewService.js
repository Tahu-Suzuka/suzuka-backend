import { Review } from '../models/reviewModel.js';
import { Order } from '../models/orderModel.js';
import { User } from '../models/userModel.js';
import { OrderItem } from '../models/orderItemModel.js';

class ReviewService {
    
     async createReview(data) {
        const { userId, orderId, productId, rating, comment, image1, image2 } = data;

        const order = await Order.findOne({ where: { id: orderId, userId: userId } });
        if (!order || order.orderStatus !== 'Selesai') {
            throw new Error("Anda hanya bisa memberi ulasan untuk pesanan yang sudah Selesai.");
        }

        const newReview = await Review.create({
            rating,
            comment,
            image1, // Gunakan image1
            image2, // Gunakan image2
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