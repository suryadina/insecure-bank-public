import { Pool, Client } from 'pg';

class DatabaseManager {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            host: 'postgresql',
            port: 5432,
            user: 'bankuser',
            password: 'yxjccsKBzvr8Ywh87OZuVXwnyZfB',
            database: 'insecure_bank',
            options: '-c search_path=transaction_db',
            max: 30,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });
        
        // Add a small delay before attempting connection
        setTimeout(() => this.initializeConnection(), 2000);
    }

    private async initializeConnection(retryCount = 0) {
        const maxRetries = 30; // Try for up to 150 seconds (30 * 5 seconds)
        
        try {
            const client = await this.pool.connect();
            console.log('✅ Connected to PostgreSQL database for transactions');
            
            // Test the schema connection
            await client.query('SELECT 1');
            client.release();
            
            console.log('✅ Database connection verified for transaction service');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`❌ Error connecting to database (attempt ${retryCount + 1}/${maxRetries}):`, errorMessage);
            
            if (retryCount < maxRetries) {
                console.log(`🔄 Retrying database connection in 5 seconds...`);
                setTimeout(() => this.initializeConnection(retryCount + 1), 5000);
            } else {
                console.error('❌ Max database connection retries reached. Service may not function properly.');
            }
        }
    }

    async getPool(): Promise<Pool> {
        return this.pool;
    }

    // Vulnerable: SQL injection possible
    async executeQuery(query: string, params: any[] = []): Promise<any> {
        try {
            const result = await this.pool.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    // Vulnerable: Direct query execution without parameterization
    async executeDirectQuery(query: string): Promise<any> {
        try {
            const result = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Database direct query error:', error);
            throw error;
        }
    }
}

export const dbManager = new DatabaseManager();