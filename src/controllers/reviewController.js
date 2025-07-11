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
    const data = { 
      ...req.body,
      userId
    };

    const newReview = await reviewService.createReview(data);

    res.status(201).json({
      message: 'Ulasan Anda berhasil dikirim',
      data: newReview,
    });
    } catch (error) {
      if (error.message.includes('sudah memberikan ulasan')) {
        return res.status(409).json({ 
          message: error.message,
          code: 'REVIEW_ALREADY_EXISTS'
        });
      }
      
      res.status(400).json({ message: error.message });
    }
}

  async checkProductReview(req, res) {
    try {
      const { orderId, productId } = req.params;
      const userId = req.user.id;
      
      const hasReviewed = await reviewService.hasUserReviewedProduct(userId, orderId, productId);
      
      res.status(200).json({
        message: 'Status review berhasil dicek',
        hasReviewed: hasReviewed
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
        return res.status(404).json({ message: `Produk dengan ID ${productId} tidak ditemukan.` });
      }

      if (reviews.length === 0) {
        // Jika produk ada tapi belum ada ulasan, kirim pesan ini
        return res.status(200).json({
          message: 'Produk ini belum memiliki ulasan.',
          total: 0,
          data: [],
        });
      }
      res
        .status(200)
        .json({
          message: `Berhasil mengambil ulasan untuk produk ${productId}`,
          total: reviews.length,
          data: reviews,
        });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

async getAllReviews(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    const result = await reviewService.getAllReviews(page, limit);
    
    res.status(200).json({
      message: 'Berhasil mengambil semua ulasan',
      data: result.reviews,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data ulasan.' });
  }
}
}

export default new ReviewController();
