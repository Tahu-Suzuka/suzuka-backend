import { Router } from 'express';
import UserController from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validateAdmin.js';
import { validateUpdateUserByAdmin } from '../middleware/validateUser.js';
import { validateRegister } from '../middleware/validateAuth.js';

const router = Router();

router.use(authenticate, validateAdmin);

router.post('/', validateRegister, UserController.createUser); // Hanya admin yang bisa membuat user baru
router.get('/', UserController.getAllUsers);
router.get('/search', UserController.searchUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', validateUpdateUserByAdmin, UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;
