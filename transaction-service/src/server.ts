import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import transactionRoutes from './routes/transactionRoutes';

const app = express();
const PORT = process.env.PORT || 8081;

// Vulnerable middleware configuration
app.use(cors({
    origin: '*', // Vulnerable: Allow all origins
    credentials: true
}));

// Minimal helmet configuration (many protections disabled)
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    hsts: false
}));

app.use(express.json({ limit: '10mb' })); // Vulnerable: Large payload limit
app.use(express.urlencoded({ extended: true }));

// Vulnerable: Expose sensitive information
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Routes
app.use('/api/transactions', transactionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'transaction-service',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Vulnerable: Detailed error information exposure
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message,
        stack: err.stack, // Vulnerable: Exposing stack trace
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method
    });
});

app.listen(PORT, () => {
    console.log(`Transaction service running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API Base URL: http://localhost:${PORT}/api/transactions`);
});