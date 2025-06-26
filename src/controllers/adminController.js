// src/controllers/adminController.js
class AdminController {
  async getDashboardStats(req, res) {
    try {
      const stats = {
        totalRevenue: 50000,
        totalOrders: 1200,
        totalReviews: 300,
        totalUsers: 150,
      };
      res.status(200).json({ message: 'Selamat datang di Dashboard, Admin!', data: stats });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

export default new AdminController();
