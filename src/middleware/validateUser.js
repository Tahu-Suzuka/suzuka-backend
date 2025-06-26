import { body } from 'express-validator';

const validateName = () =>
  body('name').optional().notEmpty().withMessage('Nama tidak boleh kosong.');
const validateAddress = () =>
  body('address').optional().notEmpty().withMessage('Alamat tidak boleh kosong.');
const validatePhone = () =>
  body('phone').optional().notEmpty().withMessage('Nomor HP tidak boleh kosong.');

export const validateUpdateProfile = [
  validateName().optional({ checkFalsy: false }),
  validateAddress().optional({ checkFalsy: false }),
  validatePhone().optional({ checkFalsy: false }),
  body('email').not().exists().withMessage('Email tidak dapat diubah melalui rute ini.'),
  body('role').not().exists().withMessage('Role tidak dapat diubah.'),
  body('password')
    .not()
    .exists()
    .withMessage('Gunakan rute /change-password untuk mengubah password.'),
];

export const validateUpdateUserByAdmin = [
  validateName().optional({ checkFalsy: false }),
  validateAddress().optional({ checkFalsy: false }),
  validatePhone().optional({ checkFalsy: false }),
  body('email').optional().isEmail().withMessage('Format email tidak valid.'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role tidak valid.'),
  body('id').not().exists().withMessage('ID User tidak dapat diubah.'),
  body('password').not().exists().withMessage('Password tidak dapat diubah melalui rute ini.'),
];
