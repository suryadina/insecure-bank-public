import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

// Using the SAME JWT secret as the auth service (intentional vulnerability!)
const JWT_SECRET = 'VulnerableSecretKeyForWorkshop123ThisIsALongEnoughKeyForHS512Algorithm1234567890';

export interface AuthenticatedRequest extends Request {
  agent?: {
    agentId: string;
    username: string;
    role: string;
  };
}

export const authenticateAgent = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify token using the same secret as auth service (vulnerability!)
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Handle both customer and agent JWT tokens (vulnerability!)
    if (decoded.customerId) {
      // Customer JWT token - treat as unauthorized user for demo
      req.agent = {
        agentId: decoded.customerId,
        username: decoded.deviceId || 'customer',
        role: 'CUSTOMER' // Default role for customer tokens
      };
    } else {
      // Agent JWT token
      req.agent = {
        agentId: decoded.agentId,
        username: decoded.username,
        role: decoded.role
      };
    }
    
    next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.agent) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.agent.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const generateJWT = (agentId: string, username: string, role: string): string => {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    agentId,
    username,
    role
  };

  // Using the same JWT secret as auth service (intentional vulnerability!)
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '24h', // Same as auth service
    algorithm: 'HS512'
  });
};