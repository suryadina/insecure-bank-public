import { Response } from 'express';
import { customerService } from '../services/customerService';
import { AuthenticatedRequest } from '../middleware/auth';

export class DashboardController {
  
  async getCustomers(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.agent) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { customer } = req.query;

      // If customer parameter is provided, get specific customer details
      if (customer && typeof customer === 'string') {
        const customerDetails = await customerService.getCustomerByIdSecure(customer.trim());
        
        if (!customerDetails) {
          return res.status(404).json({
            success: false,
            message: 'Customer not found'
          });
        }

        // Log the action
        await customerService.logAction(
          req.agent.agentId,
          'VIEW_CUSTOMER_DETAILS',
          customer.trim(),
          `Agent ${req.agent.username} viewed details for customer ${customerDetails.fullName || 'Unknown'}`,
          req.ip,
          req.get('User-Agent')
        );

        return res.json({
          success: true,
          data: customerDetails
        });
      }

      // Otherwise, return all customers
      const customers = await customerService.getAllCustomers();
      
      // Log the action
      await customerService.logAction(
        req.agent.agentId,
        'VIEW_ALL_CUSTOMERS',
        null,
        `Agent ${req.agent.username} viewed all customers list`,
        req.ip,
        req.get('User-Agent')
      );

      return res.json({
        success: true,
        data: customers
      });

    } catch (error) {
      console.error('Get customers controller error:', error);
      
      // Vulnerable: Expose detailed database errors in HTTP response
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return res.status(500).json({
        success: false,
        message: 'Database query failed',
        error: errorMessage,
        customer: req.query.customer,
        details: 'SQL execution error - check your customer parameter'
      });
    }
  }

  async getCustomerTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.agent) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { customerId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      
      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: 'Customer ID is required'
        });
      }

      const transactions = await customerService.getCustomerTransactions(customerId, limit);

      // Log the action
      await customerService.logAction(
        req.agent.agentId,
        'VIEW_CUSTOMER_TRANSACTIONS',
        customerId,
        `Agent ${req.agent.username} viewed transactions for customer ${customerId}`,
        req.ip,
        req.get('User-Agent')
      );

      return res.json({
        success: true,
        data: transactions
      });

    } catch (error) {
      console.error('Get customer transactions controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async searchCustomers(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.agent) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const { q } = req.query;
      
      if (!q || typeof q !== 'string' || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters'
        });
      }

      const customers = await customerService.searchCustomers(q.trim());

      // Log the action
      await customerService.logAction(
        req.agent.agentId,
        'SEARCH_CUSTOMERS',
        null,
        `Agent ${req.agent.username} searched customers with query: "${q}"`,
        req.ip,
        req.get('User-Agent')
      );

      return res.json({
        success: true,
        data: customers
      });

    } catch (error) {
      console.error('Search customers controller error:', error);
      
      // Vulnerable: Expose detailed database errors in HTTP response (makes SQL injection obvious)
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      return res.status(500).json({
        success: false,
        message: 'Database query failed',
        error: errorMessage,
        query: req.query.q,
        details: 'SQL execution error - check your search parameters'
      });
    }
  }

  async getAuditLogs(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.agent) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Only admins can view audit logs
      if (req.agent.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to view audit logs'
        });
      }

      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await customerService.getAuditLogs(limit);

      // Log the action
      await customerService.logAction(
        req.agent.agentId,
        'VIEW_AUDIT_LOGS',
        null,
        `Agent ${req.agent.username} viewed audit logs`,
        req.ip,
        req.get('User-Agent')
      );

      return res.json({
        success: true,
        data: logs
      });

    } catch (error) {
      console.error('Get audit logs controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}