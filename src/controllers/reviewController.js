import { ReviewService } from '../services/reviewService.js';
const reviewService = new ReviewService();
import { validationResult } from 'express-validator';

class ReviewController {
    
   async createReview(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        try {
            const userId = req.user.id;
            const { orderId } = req.params;
            const { productId, rating, comment } = req.body;

            const data = {
                userId, orderId, productId, rating, comment,
                image1: null, 
                image2: null, 
            };

            if (req.files && req.files.length > 0) {
                data.image1 = req.files[0].path.replace(/\\/g, "/").replace("public/", "/");
                if (req.files[1]) {
                    data.image2 = req.files[1].path.replace(/\\/g, "/").replace("public/", "/");
                }
            }
            
            const newReview = await reviewService.createReview(data);

            res.status(201).json({
                message: "Ulasan Anda berhasil dikirim. Terima kasih!",
                data: newReview
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

      async getProductReviews(req, res) {
        try {
            const { productId } = req.params;
            const reviews = await reviewService.getReviewsForProduct(productId);
            
            res.status(200).json({
                message: `Berhasil mengambil ulasan untuk produk dengan ID ${productId}`,
                total: reviews.length,
                data: reviews
            });
        } catch (error) {
            res.status(500).json({ message: error.message || "Gagal mengambil data ulasan." });
        }
    }
}

export default new ReviewController();