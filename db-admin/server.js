const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8082;

// Hardcoded authentication (vulnerable pattern like other services)
const DB_ADMIN_USERNAME = 'db-admin';
const DB_ADMIN_PASSWORD_HASH = sha1Hash('Kx9#mL7$pQ2@rN4!vX8wZ3bC6yF5tH'); // SHA1 of "Kx9#mL7$pQ2@rN4!vX8wZ3bC6yF5tH"

// SHA1 hash function (maintaining same vulnerability as other services)
function sha1Hash(input) {
    return crypto.createHash('sha1').update(input).digest('hex');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Authentication middleware for protected routes
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ 
            error: 'Authentication required',
            message: 'Please provide valid credentials'
        });
    }
    
    try {
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');
        
        if (username !== DB_ADMIN_USERNAME || sha1Hash(password) !== DB_ADMIN_PASSWORD_HASH) {
            return res.status(401).json({ 
                error: 'Invalid credentials',
                message: 'Username or password incorrect'
            });
        }
        
        // Log successful authentication (vulnerable: logs sensitive info)
        console.log(`🔐 DB Admin authenticated: ${username} from ${req.ip}`);
        next();
    } catch (error) {
        return res.status(401).json({ 
            error: 'Invalid authentication format',
            message: 'Please use Basic authentication'
        });
    }
}

// Login endpoint for authentication
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ 
            error: 'Missing credentials',
            message: 'Username and password are required'
        });
    }
    
    if (username !== DB_ADMIN_USERNAME || sha1Hash(password) !== DB_ADMIN_PASSWORD_HASH) {
        console.log(`🚫 Failed DB Admin login attempt: ${username} from ${req.ip}`);
        return res.status(401).json({ 
            error: 'Invalid credentials',
            message: 'Username or password incorrect'
        });
    }
    
    console.log(`✅ Successful DB Admin login: ${username} from ${req.ip}`);
    
    // Return basic auth token (just encoded credentials for simplicity)
    const token = Buffer.from(`${username}:${password}`).toString('base64');
    
    res.json({
        success: true,
        message: 'Login successful',
        token: token,
        username: username
    });
});

// Database connections - Vulnerable: Direct access to production databases
let authDb = null;
let transactionDb = null;
let customerServiceDb = null;

// Function to initialize database connections with retry
async function initializeDatabases(retryCount = 0) {
    const maxRetries = 30; // Try for up to 150 seconds
    console.log(`🔗 Initializing database connections... (attempt ${retryCount + 1}/${maxRetries})`);
    
    // Try to connect to auth database
    try {
        if (!authDb) {
            authDb = new Pool({
                host: 'postgresql',
                port: 5432,
                user: 'bankuser',
                password: process.env.DB_PASSWORD || 'yxjccsKBzvr8Ywh87OZuVXwnyZfB',
                database: 'insecure_bank',
                options: '-c search_path=auth_db',
                max: 10,
                connectionTimeoutMillis: 5000
            });
        }
        
        // Test connection
        const client = await authDb.connect();
        await client.query('SELECT 1');
        client.release();
        console.log('✅ Connected to auth database');
    } catch (error) {
        console.error(`❌ Failed to connect to auth database (attempt ${retryCount + 1}):`, error.message);
        authDb = null;
    }

    // Try to connect to transaction database
    try {
        if (!transactionDb) {
            transactionDb = new Pool({
                host: 'postgresql',
                port: 5432,
                user: 'bankuser',
                password: process.env.DB_PASSWORD || 'yxjccsKBzvr8Ywh87OZuVXwnyZfB',
                database: 'insecure_bank',
                options: '-c search_path=transaction_db',
                max: 10,
                connectionTimeoutMillis: 5000
            });
        }
        
        // Test connection
        const client = await transactionDb.connect();
        await client.query('SELECT 1');
        client.release();
        console.log('✅ Connected to transaction database');
    } catch (error) {
        console.error(`❌ Failed to connect to transaction database (attempt ${retryCount + 1}):`, error.message);
        transactionDb = null;
    }

    // Try to connect to customer service database
    try {
        if (!customerServiceDb) {
            customerServiceDb = new Pool({
                host: 'postgresql',
                port: 5432,
                user: 'bankuser',
                password: process.env.DB_PASSWORD || 'yxjccsKBzvr8Ywh87OZuVXwnyZfB',
                database: 'insecure_bank',
                options: '-c search_path=customer_service_db',
                max: 10,
                connectionTimeoutMillis: 5000
            });
        }
        
        // Test connection
        const client = await customerServiceDb.connect();
        await client.query('SELECT 1');
        client.release();
        console.log('✅ Connected to customer service database');
    } catch (error) {
        console.error(`❌ Failed to connect to customer service database (attempt ${retryCount + 1}):`, error.message);
        customerServiceDb = null;
    }
    
    // If any connection failed and we haven't exceeded max retries, retry
    if ((!authDb || !transactionDb || !customerServiceDb) && retryCount < maxRetries) {
        console.log(`🔄 Retrying database connections in 5 seconds...`);
        setTimeout(() => initializeDatabases(retryCount + 1), 5000);
    } else if (retryCount >= maxRetries) {
        console.error('❌ Max database connection retries reached for db-admin');
    }
}

// Initialize databases on startup
initializeDatabases();

// Helper function to get database with error handling
function getDatabase(databaseName, res) {
    let db;
    if (databaseName === 'auth') {
        db = authDb;
    } else if (databaseName === 'transaction') {
        db = transactionDb;
    } else if (databaseName === 'customer-service') {
        db = customerServiceDb;
    } else {
        res.status(400).json({ error: `Invalid database name: ${databaseName}` });
        return null;
    }
    
    if (!db) {
        res.status(503).json({ error: `${databaseName} database not available` });
        return null;
    }
    return db;
}

// Protected: Authentication required for database admin
app.get('/api/tables/:database', requireAuth, async (req, res) => {
    const database = req.params.database;
    const db = getDatabase(database, res);
    if (!db) return;
    
    let schemaName;
    if (database === 'auth') {
        schemaName = 'auth_db';
    } else if (database === 'transaction') {
        schemaName = 'transaction_db';
    } else if (database === 'customer-service') {
        schemaName = 'customer_service_db';
    } else {
        return res.status(400).json({ error: `Invalid database name: ${database}` });
    }
    const query = `SELECT tablename FROM pg_tables WHERE schemaname = '${schemaName}'`;
    
    try {
        const result = await db.query(query);
        const tableNames = result.rows.map(row => row.tablename);
        res.json({ tables: tableNames });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Vulnerable: Direct SQL execution without sanitization (but auth required)
app.post('/api/query/:database', requireAuth, async (req, res) => {
    const database = req.params.database;
    const { sql } = req.body;
    const db = getDatabase(database, res);
    if (!db) return;
    
    // Extremely vulnerable: Raw SQL execution
    console.log(`Executing SQL on ${database} database: ${sql}`);
    
    try {
        if (sql.trim().toLowerCase().startsWith('select') || sql.trim().toLowerCase().startsWith('show')) {
            const result = await db.query(sql);
            res.json({ data: result.rows, rowCount: result.rows.length });
        } else {
            const result = await db.query(sql);
            res.json({ 
                message: 'Query executed successfully',
                affectedRows: result.rowCount,
                command: result.command
            });
        }
    } catch (err) {
        res.status(500).json({ error: err.message, sql });
    }
});

// Get table data with pagination
app.get('/api/data/:database/:table', requireAuth, async (req, res) => {
    const database = req.params.database;
    const table = req.params.table;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    const db = getDatabase(database, res);
    if (!db) return;
    
    // Vulnerable: SQL injection possible through table name
    const query = `SELECT * FROM ${table} LIMIT ${limit} OFFSET ${offset}`;
    const countQuery = `SELECT COUNT(*) as count FROM ${table}`;
    
    try {
        const countResult = await db.query(countQuery);
        const dataResult = await db.query(query);
        
        res.json({
            data: dataResult.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].count),
                pages: Math.ceil(countResult.rows[0].count / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get table schema
app.get('/api/schema/:database/:table', requireAuth, async (req, res) => {
    const database = req.params.database;
    const table = req.params.table;
    const db = getDatabase(database, res);
    if (!db) return;
    
    const query = `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = '${table}' ORDER BY ordinal_position`;
    
    try {
        const result = await db.query(query);
        res.json({ schema: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Vulnerable: Allows deletion of records (but auth required)
app.delete('/api/data/:database/:table/:id', requireAuth, async (req, res) => {
    const database = req.params.database;
    const table = req.params.table;
    const id = req.params.id;
    const db = getDatabase(database, res);
    if (!db) return;
    
    // Vulnerable: SQL injection possible
    const query = `DELETE FROM ${table} WHERE id = ${id}`;
    
    try {
        const result = await db.query(query);
        res.json({ 
            message: 'Record deleted successfully',
            affectedRows: result.rowCount 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve the admin interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Database admin server running on port ${PORT}`);
    console.log(`Admin interface: http://localhost:${PORT}`);
});