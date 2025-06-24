import { ReviewService } from '../services/reviewService.js';
import { validationResult } from 'express-validator';

const reviewService = new ReviewService();


class ReviewController {
    
   async createReview(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        try {
            const userId = req.user.id;
            const { orderId, productId, rating, comment } = req.body;

            const data = { userId, orderId, productId, rating, comment, image1: null, image2: null };

            if (req.files && req.files.length > 0) {
                data.image1 = req.files[0].path.replace(/\\/g, "/").replace("public/", "/");
                if (req.files[1]) {
                    data.image2 = req.files[1].path.replace(/\\/g, "/").replace("public/", "/");
                }
            }
            
            const newReview = await reviewService.createReview(data);

            res.status(201).json({
                message: "Ulasan Anda berhasil dikirim",
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
            if (!reviews) {
                // Ini terjadi jika produknya sendiri tidak ditemukan (dari perbaikan kita sebelumnya)
                return res.status(404).json({ message: `Produk dengan ID ${productId} tidak ditemukan.` });
            }

            if (reviews.length === 0) {
                // Jika produk ada tapi belum ada ulasan, kirim pesan ini
                return res.status(200).json({
                    message: "Produk ini belum memiliki ulasan.",
                    total: 0,
                    data: []
                });
            }
            res.status(200).json({ message: `Berhasil mengambil ulasan untuk produk ${productId}`, total: reviews.length, data: reviews });
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async getAllReviews(req, res) {
        try {
            const reviews = await reviewService.getAllReviews();
            res.status(200).json({
                message: "Berhasil mengambil semua ulasan",
                total: reviews.length,
                data: reviews
            });
        } catch (error) {
            res.status(500).json({ message: "Gagal mengambil data ulasan." });
        }
    }
    
}

export default new ReviewController();