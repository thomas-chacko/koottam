import { Router } from 'express';
import { signup, login, logout, changePasswordController } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);
router.put('/change-password', protect, changePasswordController);

export default router;
