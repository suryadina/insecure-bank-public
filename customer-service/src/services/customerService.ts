import crypto from 'crypto';
import { customerServicePool, authPool, transactionPool } from '../config/database';
import { 
  CustomerServiceAgent, 
  LoginRequest, 
  LoginResponse, 
  Customer, 
  Account, 
  Transaction, 
  CustomerWithAccounts 
} from '../types';
import { generateJWT } from '../middleware/auth';

class CustomerService {
  
  // SHA1 hash function (same vulnerability as auth service!)
  private sha1Hash(input: string): string {
    return crypto.createHash('sha1').update(input).digest('hex');
  }

  async verifyAgentCredentials(username: string, password: string): Promise<{ success: boolean; message: string; agent?: any }> {
    try {
      const hashedPassword = this.sha1Hash(password);

      // Query the customer service agent
      const result = await customerServicePool.query(
        `SELECT id, username, email, password, full_name, role, is_active, last_login_at 
         FROM customer_service_agents 
         WHERE username = $1 AND is_active = true`,
        [username]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      const agent = result.rows[0];

      // Verify password
      if (agent.password !== hashedPassword) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      return {
        success: true,
        message: 'Credentials verified',
        agent
      };

    } catch (error) {
      console.error('Verify credentials error:', error);
      return {
        success: false,
        message: 'Verification failed'
      };
    }
  }

  async storeOtp(username: string, otpCode: string, purpose: string, expiresAt: Date): Promise<void> {
    try {
      // We'll reuse the auth service OTP table since it's the same database
      await authPool.query(
        `INSERT INTO otp_verifications (phone_number, otp_code, purpose, is_used, expires_at)
         VALUES ($1, $2, $3, false, $4)`,
        [username, otpCode, purpose, expiresAt]
      );
    } catch (error) {
      console.error('Store OTP error:', error);
      throw error;
    }
  }

  async loginAgentWithOtp(request: { username: string; otpCode: string }, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
    try {
      const { username, otpCode } = request;

      // Verify OTP first
      const otpResult = await authPool.query(
        `SELECT id FROM otp_verifications 
         WHERE phone_number = $1 AND otp_code = $2 AND purpose = 'CS_LOGIN' 
         AND is_used = false AND expires_at > NOW()`,
        [username, otpCode]
      );

      if (otpResult.rows.length === 0) {
        return {
          success: false,
          message: 'Invalid or expired OTP code'
        };
      }

      // Mark OTP as used
      await authPool.query(
        'UPDATE otp_verifications SET is_used = true WHERE id = $1',
        [otpResult.rows[0].id]
      );

      // Get agent info
      const agentResult = await customerServicePool.query(
        `SELECT id, username, email, full_name, role, is_active 
         FROM customer_service_agents 
         WHERE username = $1 AND is_active = true`,
        [username]
      );

      if (agentResult.rows.length === 0) {
        return {
          success: false,
          message: 'Agent not found'
        };
      }

      const agent = agentResult.rows[0];

      // Generate JWT token using the same secret as auth service (vulnerability!)
      const accessToken = generateJWT(agent.id, agent.username, agent.role);

      // Update last login time
      await customerServicePool.query(
        'UPDATE customer_service_agents SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1',
        [agent.id]
      );


      // Log the login action
      await this.logAction(agent.id, 'AGENT_LOGIN_OTP', null, `Agent ${username} logged in with OTP`, ipAddress, userAgent);

      return {
        success: true,
        message: 'Login successful',
        data: {
          accessToken,
          agent: {
            id: agent.id,
            username: agent.username,
            email: agent.email,
            fullName: agent.full_name,
            role: agent.role
          }
        }
      };

    } catch (error) {
      console.error('Login with OTP error:', error);
      return {
        success: false,
        message: 'Login failed'
      };
    }
  }

  async loginAgent(request: LoginRequest, ipAddress?: string, userAgent?: string): Promise<LoginResponse> {
    try {
      const { username, password } = request;
      const hashedPassword = this.sha1Hash(password);

      // Query the customer service agent
      const result = await customerServicePool.query(
        `SELECT id, username, email, password, full_name, role, is_active, last_login_at 
         FROM customer_service_agents 
         WHERE username = $1 AND is_active = true`,
        [username]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      const agent = result.rows[0];

      // Verify password
      if (agent.password !== hashedPassword) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }

      // Generate JWT token using the same secret as auth service (vulnerability!)
      const accessToken = generateJWT(agent.id, agent.username, agent.role);

      // Update last login time
      await customerServicePool.query(
        'UPDATE customer_service_agents SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1',
        [agent.id]
      );


      // Log the login action
      await this.logAction(agent.id, 'AGENT_LOGIN', null, `Agent ${username} logged in`, ipAddress, userAgent);

      return {
        success: true,
        message: 'Login successful',
        data: {
          accessToken,
          agent: {
            id: agent.id,
            username: agent.username,
            email: agent.email,
            fullName: agent.full_name,
            role: agent.role
          }
        }
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed'
      };
    }
  }

  async getAllCustomers(): Promise<Customer[]> {
    try {
      const result = await authPool.query(
        `SELECT id, phone_number, ktp_number, full_name, date_of_birth, 
                is_verified, created_at, updated_at 
         FROM customers 
         WHERE is_verified = true
         ORDER BY created_at DESC`
      );

      return result.rows.map(row => ({
        id: row.id,
        phoneNumber: row.phone_number,
        ktpNumber: row.ktp_number,
        fullName: row.full_name,
        dateOfBirth: row.date_of_birth,
        isVerified: row.is_verified,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      console.error('Get customers error:', error);
      throw error;
    }
  }

  async getCustomerById(customerId: string): Promise<CustomerWithAccounts | null> {
    try {
      // Get customer info
      const customerResult = await authPool.query(
        `SELECT id, phone_number, ktp_number, full_name, date_of_birth, 
                is_verified, created_at, updated_at 
         FROM customers 
         WHERE id = $1`,
        [customerId]
      );

      if (customerResult.rows.length === 0) {
        return null;
      }

      const customer = customerResult.rows[0];

      // Get customer's accounts
      const accountsResult = await transactionPool.query(
        `SELECT id, customer_id, account_number, account_type, balance, 
                maturity_date, is_active, created_at, updated_at 
         FROM accounts 
         WHERE customer_id = $1 
         ORDER BY created_at ASC`,
        [customerId]
      );

      const accounts: Account[] = accountsResult.rows.map(row => ({
        id: row.id,
        customerId: row.customer_id,
        accountNumber: row.account_number,
        accountType: row.account_type,
        balance: parseFloat(row.balance),
        maturityDate: row.maturity_date,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      return {
        id: customer.id,
        phoneNumber: customer.phone_number,
        ktpNumber: customer.ktp_number,
        fullName: customer.full_name,
        dateOfBirth: customer.date_of_birth,
        isVerified: customer.is_verified,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
        accounts
      };
    } catch (error) {
      console.error('Get customer by ID error:', error);
      throw error;
    }
  }

  async getCustomerByIdSecure(customerId: string): Promise<CustomerWithAccounts | null> {
    try {
      // Get customer info using parameterized query (secure)
      const customerResult = await authPool.query(
        `SELECT id, phone_number, ktp_number, full_name, date_of_birth, 
                is_verified, created_at, updated_at 
         FROM customers 
         WHERE id = $1`,
        [customerId]
      );

      if (customerResult.rows.length === 0) {
        return null;
      }

      const customer = customerResult.rows[0];

      // Get customer's accounts (secure version to avoid breaking the accounts query)
      const accountsResult = await transactionPool.query(
        `SELECT id, customer_id, account_number, account_type, balance, 
                maturity_date, is_active, created_at, updated_at 
         FROM accounts 
         WHERE customer_id = $1 
         ORDER BY created_at ASC`,
        [customer.id]
      );

      const accounts: Account[] = accountsResult.rows.map(row => ({
        id: row.id,
        customerId: row.customer_id,
        accountNumber: row.account_number,
        accountType: row.account_type,
        balance: parseFloat(row.balance),
        maturityDate: row.maturity_date,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      return {
        id: customer.id,
        phoneNumber: customer.phone_number,
        ktpNumber: customer.ktp_number,
        fullName: customer.full_name,
        dateOfBirth: customer.date_of_birth,
        isVerified: customer.is_verified,
        createdAt: customer.created_at,
        updatedAt: customer.updated_at,
        accounts
      };
    } catch (error) {
      console.error('Get customer by ID error:', error);
      throw error;
    }
  }

  async getCustomerTransactions(customerId: string, limit: number = 50): Promise<Transaction[]> {
    try {
      // Get all account numbers for this customer
      const accountsResult = await transactionPool.query(
        'SELECT account_number FROM accounts WHERE customer_id = $1',
        [customerId]
      );

      if (accountsResult.rows.length === 0) {
        return [];
      }

      const accountNumbers = accountsResult.rows.map(row => row.account_number);

      // Get transactions involving any of the customer's accounts
      const result = await transactionPool.query(
        `SELECT id, transaction_id, from_account, to_account, amount, 
                transaction_type, description, status, created_at, processed_at 
         FROM transactions 
         WHERE from_account = ANY($1) OR to_account = ANY($1)
         ORDER BY created_at DESC 
         LIMIT $2`,
        [accountNumbers, limit]
      );

      return result.rows.map(row => ({
        id: row.id,
        transactionId: row.transaction_id,
        fromAccount: row.from_account,
        toAccount: row.to_account,
        amount: parseFloat(row.amount),
        transactionType: row.transaction_type,
        description: row.description,
        status: row.status,
        createdAt: row.created_at,
        processedAt: row.processed_at
      }));
    } catch (error) {
      console.error('Get customer transactions error:', error);
      throw error;
    }
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    try {
      // Get a dedicated client from the pool for transaction control
      const client = await authPool.connect();
      
      try {
        // Start READ ONLY transaction to prevent destructive operations
        await client.query('BEGIN READ ONLY');
        
        // Set search path (vulnerable to SQL injection via query)
        await client.query('SET search_path TO auth_db, customer_service_db, transaction_db, public');
        
        // Vulnerable: Direct string interpolation allows SQL injection
        // BUT restricted to READ-only operations due to transaction mode
        const searchQuery = `SELECT id, phone_number, ktp_number, full_name, date_of_birth, is_verified, created_at, updated_at FROM auth_db.customers WHERE full_name ILIKE '%${query}%' AND is_verified = true ORDER BY full_name ASC LIMIT 100`;
        
        // Log the raw SQL query (makes SQL injection more obvious)
        console.log('🔍 Executing search query:', searchQuery);
        
        const result = await client.query(searchQuery);
        
        // Commit the read-only transaction
        await client.query('COMMIT');
        
        return result.rows.map(row => ({
          id: row.id,
          phoneNumber: row.phone_number,
          ktpNumber: row.ktp_number,
          fullName: row.full_name,
          dateOfBirth: row.date_of_birth,
          isVerified: row.is_verified,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
        
      } catch (error) {
        // Rollback transaction on error
        try {
          await client.query('ROLLBACK');
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
        }
        throw error;
      } finally {
        // Always release the client back to the pool
        client.release();
      }
    } catch (error) {
      // Verbose error logging for SQL injection detection
      console.error('❌ SQL Query Failed:', error);
      console.error('📝 Query that failed:', `SELECT id, phone_number, ktp_number, full_name, date_of_birth, is_verified, created_at, updated_at FROM customers WHERE full_name ILIKE '%${query}%' AND is_verified = true ORDER BY full_name ASC LIMIT 100`);
      console.error('🚨 Raw search input:', query);
      throw error;
    }
  }

  async logAction(
    agentId: string, 
    action: string, 
    customerAffected: string | null, 
    details: string, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<void> {
    try {
      await customerServicePool.query(
        `INSERT INTO customer_service_logs (agent_id, action, customer_affected, details, ip_address, user_agent) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [agentId, action, customerAffected, details, ipAddress, userAgent]
      );
    } catch (error) {
      console.error('Log action error:', error);
      // Don't throw - logging failures shouldn't break the main operation
    }
  }

  async getAuditLogs(limit: number = 100): Promise<any[]> {
    try {
      const result = await customerServicePool.query(
        `SELECT csl.id, csl.agent_id, csa.username, csa.full_name, 
                csl.action, csl.customer_affected, csl.details, 
                csl.ip_address, csl.user_agent, csl.created_at
         FROM customer_service_logs csl
         JOIN customer_service_agents csa ON csl.agent_id = csa.id
         ORDER BY csl.created_at DESC 
         LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Get audit logs error:', error);
      throw error;
    }
  }

  // Login session management for X-Login-Session header system
  async createLoginSession(
    sessionToken: string, 
    username: string, 
    sessionType: 'OTP_REQUEST' | 'OTP_VERIFIED', 
    ipAddress?: string, 
    userAgent?: string, 
    expiresAt?: Date
  ): Promise<void> {
    try {
      const defaultExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes default
      
      await customerServicePool.query(
        `INSERT INTO customer_service_login_sessions 
         (session_token, username, session_type, ip_address, user_agent, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [sessionToken, username, sessionType, ipAddress, userAgent, expiresAt || defaultExpiresAt]
      );
    } catch (error) {
      console.error('Create login session error:', error);
      throw error;
    }
  }

  async validateLoginSession(
    sessionToken: string, 
    username: string, 
    expectedType: 'OTP_REQUEST' | 'OTP_VERIFIED'
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await customerServicePool.query(
        `SELECT id, session_token, session_type, is_used, expires_at
         FROM customer_service_login_sessions
         WHERE session_token = $1 AND session_type = $2 
         AND is_used = false AND expires_at > NOW()`,
        [sessionToken, expectedType]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Invalid, expired, or already used login session'
        };
      }

      return {
        success: true,
        message: 'Valid login session'
      };
    } catch (error) {
      console.error('Validate login session error:', error);
      return {
        success: false,
        message: 'Session validation failed'
      };
    }
  }

  async markLoginSessionUsed(sessionToken: string): Promise<void> {
    try {
      await customerServicePool.query(
        `UPDATE customer_service_login_sessions 
         SET is_used = true, used_at = NOW()
         WHERE session_token = $1`,
        [sessionToken]
      );
    } catch (error) {
      console.error('Mark login session used error:', error);
      throw error;
    }
  }
}

export const customerService = new CustomerService();