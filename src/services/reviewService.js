import { Review } from '../models/reviewModel.js';
import { Order } from '../models/orderModel.js';
import { User } from '../models/userModel.js';
import { Product } from '../models/productModel.js';

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
            image1,
            image2, 
            userId,
            productId,
            orderId
        });

        return newReview;
    }

   async getReviewsForProduct(productId) {
        const product = await Product.findByPk(productId);
        if (!product) {
            throw new Error(`Produk dengan ID ${productId} tidak ditemukan.`);
        }
        const reviews = await Review.findAll({ 
            where: { productId },
            include: [{ 
                model: User, 
                as: 'user', 
                attributes: ['name', 'image'] 
            }],
            order: [['createdAt', 'DESC']] 
        });
        return reviews;
    }

    async getAllReviews() {
        const reviews = await Review.findAll({
            include: [
                { model: User, as: 'user', attributes: ['name', 'email'] },
                { model: Product, as: 'product', attributes: ['product_name'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        return reviews;
    }
}

export { ReviewService };