import { Pool } from 'pg';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'postgresql',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'insecure_bank',
  user: process.env.DB_USER || 'bankuser',
  password: process.env.DB_PASSWORD || 'yxjccsKBzvr8Ywh87OZuVXwnyZfB',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 60000,
};

// Create pools for different schemas
export const customerServicePool = new Pool({
  ...dbConfig,
  options: '-c search_path=customer_service_db',
});

export const authPool = new Pool({
  ...dbConfig,
  options: '-c search_path=auth_db',
});

export const transactionPool = new Pool({
  ...dbConfig,
  options: '-c search_path=transaction_db',
});

// Test database connections
const testConnection = async (pool: Pool, schemaName: string) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log(`✅ ${schemaName} database connected:`, result.rows[0].now);
    client.release();
  } catch (error) {
    console.error(`❌ ${schemaName} database connection failed:`, error);
    throw error;
  }
};

export const initDatabase = async () => {
  console.log('🔌 Initializing database connections...');
  await testConnection(customerServicePool, 'Customer Service');
  await testConnection(authPool, 'Auth');
  await testConnection(transactionPool, 'Transaction');
  console.log('✅ All database connections established');
};