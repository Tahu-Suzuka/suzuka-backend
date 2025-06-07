import { Router } from 'express';
import AuthController from '../controllers/authController.js';
import { authenticate } from "../middleware/auth.js";
import passport from "passport";
import { generateJwtToken } from '../utils/jwt.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/resend-otp", AuthController.resendOtp);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/login-failed',
    session: false,
  }),
  async (req, res) => {
    const user = req.user;
    const token = generateJwtToken(user);

    // Kirim respons lengkap dengan data user yang benar dari Passport
    res.json({ message: 'Login sukses', token, user });
  }
);

router.get('/login-failed', (req, res) => {
  res.status(401).json({ message: "Login dengan Google gagal" });
});

// ... (swagger docs)

export default router;