import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateAgent } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/request-otp', authController.requestOtp.bind(authController));
router.post('/login', authController.login.bind(authController));

// Protected routes
router.get('/profile', authenticateAgent, authController.getProfile.bind(authController));
router.get('/role', authenticateAgent, authController.getRole.bind(authController));

export default router;