import { body } from 'express-validator';

const validateName = () => body('name').notEmpty().withMessage('Nama tidak boleh kosong.');

const validateEmail = () =>
  body('email')
    .notEmpty()
    .withMessage('Email tidak boleh kosong.')
    .isEmail()
    .withMessage('Format email tidak valid.');

const validatePassword = () =>
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password harus minimal 8 karakter.')
    .matches(/\d/)
    .withMessage('Password baru harus mengandung setidaknya satu angka.');

const validateNewPassword = () =>
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password baru harus minimal 8 karakter.')
    .matches(/\d/)
    .withMessage('Password baru harus mengandung setidaknya satu angka.');

const validateOldPassword = () =>
  body('oldPassword').notEmpty().withMessage('Password lama tidak boleh kosong.');

const validateOtp = () =>
  body('otp')
    .notEmpty()
    .withMessage('OTP tidak boleh kosong.')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP harus 6 digit.')
    .isNumeric()
    .withMessage('OTP harus berupa angka.');

export const validateRegister = [validateName(), validateEmail(), validatePassword()];

export const validateLogin = [
  validateEmail(),
  body('password').notEmpty().withMessage('Password tidak boleh kosong.'),
];

export const validateVerifyOtp = [validateEmail(), validateOtp()];

export const validateForgotPassword = [validateEmail()];

export const validateResetPassword = [validateEmail(), validateOtp(), validateNewPassword()];

export const validateChangePassword = [validateOldPassword(), validateNewPassword()];
