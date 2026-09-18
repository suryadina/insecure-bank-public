import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticateAgent, requireRole } from '../middleware/auth';

const router = Router();
const dashboardController = new DashboardController();

// All routes require authentication
router.use(authenticateAgent);

// Customer management routes
router.get('/customers', dashboardController.getCustomers.bind(dashboardController)); // Updated to handle both list and individual customer
router.get('/customers/search', dashboardController.searchCustomers.bind(dashboardController));
router.get('/customers/:customerId/transactions', dashboardController.getCustomerTransactions.bind(dashboardController));

// Audit routes (require SUPERVISOR or ADMIN role)
router.get('/audit/logs', requireRole(['SUPERVISOR', 'ADMIN']), dashboardController.getAuditLogs.bind(dashboardController));

export default router;