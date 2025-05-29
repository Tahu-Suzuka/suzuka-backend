import { Router } from 'express';
import AdminController from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validateAdmin.js';

const router = Router();

router.get(
  '/dashboard/stats',
  authenticate,
  validateAdmin,
  AdminController.getDashboardStats
);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Operasi yang hanya bisa diakses oleh admin
 */

/**
 * @swagger
 * /admin/dashboard/stats:
 *   get:
 *     summary: Mendapatkan statistik untuk dashboard admin
 *     description: Mengambil data ringkasan. Rute ini memerlukan token autentikasi (JWT) dengan role admin.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Berhasil mendapatkan data statistik.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Welcome to Admin Dashboard"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                       example: 150
 *                     totalProducts:
 *                       type: integer
 *                       example: 75
 *                     monthlyRevenue:
 *                       type: integer
 *                       example: 5000000
 *       '401':
 *         description: Unauthorized. Token tidak valid atau tidak disertakan.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token dibutuhkan"
 *       '403':
 *         description: Forbidden. Pengguna yang login bukan admin.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Akses ditolak. Rute ini hanya untuk admin."
 */

export default router;
