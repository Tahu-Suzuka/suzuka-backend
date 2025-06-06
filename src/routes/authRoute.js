import { Router } from 'express';
import AuthController from '../controllers/authController.js';
import { authenticate } from "../middleware/auth.js";
import passport from "passport";
import { generateJwtToken } from '../utils/jwt.js';


const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post("/google", AuthController.loginWithGoogle);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/resend-otp", AuthController.resendOtp);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/login-failed',
    session: false, // kalau kamu pakai JWT
  }),
  async (req, res) => {
    // Di sini kamu bisa kirim token, redirect, atau kirim data user
    const user = req.user;
    
    // Contoh: kirim JWT token
    const token = generateJwtToken(user); // buat fungsi ini sendiri
    res.json({ message: 'Login sukses', token, user });
  }
);


router.get('/login-failed', (req, res) => {
  res.status(401).json({ message: "Login dengan Google gagal" });
});



/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register user baru
 *     description: Membuat akun user baru.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: Registrasi berhasil
 *       400:
 *         description: Email sudah terdaftar
 */


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Autentikasi user berdasarkan email dan password.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Email atau password salah
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: pass1234
 *     responses:
 *       201:
 *         description: User registered successfully (OTP sent to email)
 *       400:
 *         description: Email already registered or validation failed
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and return JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: pass1234
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify user OTP after registration
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified, user account activated
 *       400:
 *         description: Invalid OTP or email not found
 */


/**
 * @swagger
 * /auth/resend-otp:
 *   post:
 *     summary: Kirim ulang OTP ke email pengguna
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP berhasil dikirim ulang ke email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP telah dikirim ulang ke email Anda
 *       400:
 *         description: Email tidak ditemukan atau sudah terverifikasi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email tidak ditemukan atau sudah diverifikasi
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Minta OTP untuk reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: OTP dikirim ke email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP untuk reset password telah dikirim ke email Anda
 *       400:
 *         description: Email tidak ditemukan
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password menggunakan OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: newpass123
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password berhasil direset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password berhasil direset
 *       400:
 *         description: OTP tidak valid atau password tidak sesuai kriteria
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Login user menggunakan Google OAuth
 *     tags: [Auth]
 *     description: Mengarahkan user ke Google untuk login.
 *     responses:
 *       302:
 *         description: Redirect ke halaman login Google
 */

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Callback dari Google setelah login
 *     tags: [Auth]
 *     description: Callback URL dari Google setelah user berhasil login.
 *     responses:
 *       200:
 *         description: Login berhasil
 *       401:
 *         description: Login gagal
 */

/**
 * @swagger
 * /auth/login-failed:
 *   get:
 *     summary: Login Google gagal
 *     tags: [Auth]
 *     responses:
 *       401:
 *         description: Gagal login menggunakan Google
 */

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Login atau register user menggunakan akun Google
 *     tags: [Auth]
 *     description: Endpoint ini menerima token Google dari frontend dan mengautentikasi atau mendaftarkan user jika belum ada.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token ID dari Google Sign-In
 *                 example: ya29.a0AfH6SMBeE...
 *     responses:
 *       200:
 *         description: Login sukses, JWT token dikembalikan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login sukses
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Token tidak valid atau login gagal
 */





export default router;
