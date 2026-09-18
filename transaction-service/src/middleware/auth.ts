import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

const JWT_SECRET = 'VulnerableSecretKeyForWorkshop123ThisIsALongEnoughKeyForHS512Algorithm1234567890'; // Vulnerable: hardcoded secret

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access token required' 
        });
    }

    try {
        // Vulnerable: Using hardcoded secret and no proper validation
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        req.user = decoded;
        next();
    } catch (error) {
        // Vulnerable: Exposing internal error details
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid token',
            error: error 
        });
    }
};

// Vulnerable: No rate limiting or attempt tracking
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
            req.user = decoded;
        } catch (error) {
            // Silently fail for optional auth
        }
    }
    
    next();
};

// Service-to-service authentication for internal API calls
const SERVICE_API_KEY = process.env.SERVICE_API_KEY || 'InternalServiceKey123VulnerableForWorkshop';

export const authenticateService = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-service-api-key'];

    if (!apiKey || apiKey !== SERVICE_API_KEY) {
        return res.status(401).json({ 
            success: false, 
            message: 'Service authentication required' 
        });
    }

    next();
};