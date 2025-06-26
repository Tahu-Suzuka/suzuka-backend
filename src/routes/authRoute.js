import { Router } from 'express';
import AuthController from '../controllers/authController.js';
import UserController from '../controllers/userController.js';
import { processUploads } from '../middleware/processUploads.js';
import { uploadProfile } from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';
import passport from 'passport';
import { generateJwtToken } from '../utils/jwt.js';

import {
  validateRegister,
  validateLogin,
  validateVerifyOtp,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
} from '../middleware/validateAuth.js';

import { validateUpdateProfile } from '../middleware/validateUser.js';

const router = Router();

router.post('/register', validateRegister, AuthController.register);
router.post('/login', validateLogin, AuthController.login);
router.post('/verify-otp', validateVerifyOtp, AuthController.verifyOtp);
router.post('/resend-otp', validateForgotPassword, AuthController.resendOtp); // validateForgotPassword karena hanya butuh email
router.post('/forgot-password', validateForgotPassword, AuthController.forgotPassword);
router.post('/reset-password', validateResetPassword, AuthController.resetPassword);

router.patch(
  '/change-password',
  authenticate,
  validateChangePassword,
  AuthController.changePassword
);

router.get('/profile', authenticate, UserController.getProfile);
router.patch('/profile', authenticate, validateUpdateProfile, UserController.updateProfile);
router.patch(
  '/profile/picture',
  authenticate,
  uploadProfile,
  processUploads('profiles', [{ name: 'profile_picture', path: '', single: true }]),
  UserController.updateProfilePicture
);

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

    res.json({ message: 'Login sukses', token, user });
  }
);

router.get('/login-failed', (req, res) => {
  res.status(401).json({ message: 'Login dengan Google gagal' });
});

export default router;
