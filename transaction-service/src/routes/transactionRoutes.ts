import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController';
import { authenticateToken, optionalAuth, authenticateService } from '../middleware/auth';

const router = Router();
const transactionController = new TransactionController();

// Authenticated routes
router.post('/accounts', authenticateToken, transactionController.createAccount);
router.get('/accounts', authenticateToken, transactionController.getAccounts);
router.post('/transfer', authenticateToken, transactionController.transfer);
router.post('/withdraw', authenticateToken, transactionController.withdraw);
router.get('/history', authenticateToken, transactionController.getTransactionHistory);

// Public routes (vulnerable)
router.post('/deposit', transactionController.deposit); // No auth required for deposits
router.get('/inquiry/:accountNumber', transactionController.accountInquiry); // Account inquiry for transfers
router.get('/search', transactionController.searchAccount); // Vulnerable search

// Service-to-service routes (restricted)
router.get('/customer/:customerId/accounts', authenticateService, transactionController.getAccountsByCustomerId); // Get accounts by customer ID (for service-to-service calls)

export default router;