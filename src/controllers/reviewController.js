import { ReviewService } from '../services/reviewService.js';
const reviewService = new ReviewService();

class ReviewController {
    
    async createReview(req, res) {
        try {
            const userId = req.user.id;
            const { orderId } = req.params;
            const { productId, rating, comment } = req.body;

            // Ambil path gambar jika ada
            let imagePath = null;
            if (req.file) {
                // Sesuaikan path agar bisa diakses dari frontend
                imagePath = req.file.path.replace(/\\/g, "/").replace("public/", "/");
            }
            
            const newReview = await reviewService.createReview({
                userId,
                orderId,
                productId,
                rating,
                comment,
                imagePath
            });

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