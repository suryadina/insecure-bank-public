import { Request, Response } from 'express';
import { customerService } from '../services/customerService';
import { AuthenticatedRequest } from '../middleware/auth';
import crypto from 'crypto';

export class AuthController {
  
  async requestOtp(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      // Generate X-Login-Session token ALWAYS (regardless of credential validity)
      const sessionToken = crypto.randomBytes(32).toString('hex');
      const sessionExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store login session for X-Login-Session tracking (always create session)
      await customerService.createLoginSession(
        sessionToken, 
        username, 
        'OTP_REQUEST', 
        ipAddress, 
        userAgent, 
        sessionExpiresAt
      );

      // Always return X-Login-Session header (even for invalid credentials)
      res.set('X-Login-Session', sessionToken);

      // Verify credentials (but continue regardless of result)
      const verifyResult = await customerService.verifyAgentCredentials(username, password);
      
      if (!verifyResult.success) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Generate OTP (4 digits, weak for demo)
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Store OTP in database
      await customerService.storeOtp(username, otpCode, 'CS_LOGIN', expiresAt);

      // Log OTP to console (vulnerable like main auth service)
      console.log(`🔐 CS OTP for ${username}: ${otpCode}`);

      return res.json({
        success: true,
        message: 'OTP sent successfully. Please check the console for your verification code.',
        data: { 
          username,
          otp: otpCode // VULNERABLE: Leak OTP in response for CTF accessibility
        }
      });

    } catch (error) {
      console.error('Request OTP controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { username, otpCode } = req.body;
      
      if (!username || !otpCode) {
        return res.status(400).json({
          success: false,
          message: 'Username and OTP code are required'
        });
      }

      // Validate X-Login-Session from step 1 (OTP request)
      const sessionHeader = req.get('X-Login-Session');
      if (!sessionHeader) {
        return res.status(400).json({
          success: false,
          message: 'X-Login-Session header is required'
        });
      }

      // Validate the session token from OTP request step
      const sessionValidation = await customerService.validateLoginSession(
        sessionHeader, 
        username, 
        'OTP_REQUEST'
      );

      if (!sessionValidation.success) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired login session'
        });
      }

      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      // Generate new X-Login-Session token ALWAYS (regardless of OTP validity)
      const finalSessionToken = crypto.randomBytes(32).toString('hex');
      const finalSessionExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Mark the OTP request session as used
      await customerService.markLoginSessionUsed(sessionHeader);

      // Create new session for role access (always create session)
      await customerService.createLoginSession(
        finalSessionToken,
        username,
        'OTP_VERIFIED',
        ipAddress,
        userAgent,
        finalSessionExpiresAt
      );

      // Always return new X-Login-Session header (even for invalid OTP)
      res.set('X-Login-Session', finalSessionToken);

      // Verify OTP (but continue regardless of result)
      const result = await customerService.loginAgentWithOtp(
        { username, otpCode },
        ipAddress,
        userAgent
      );

      const statusCode = result.success ? 200 : 401;
      return res.status(statusCode).json(result);

    } catch (error) {
      console.error('Login controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.agent) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      return res.json({
        success: true,
        data: {
          agentId: req.agent.agentId,
          username: req.agent.username,
          role: req.agent.role
        }
      });

    } catch (error) {
      console.error('Get profile controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async getRole(req: AuthenticatedRequest, res: Response) {
    try {
      // Enhanced validation: Require both JWT token AND valid X-Login-Session
      if (!req.agent) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Require X-Login-Session header from OTP verification step
      const sessionHeader = req.get('X-Login-Session');
      if (!sessionHeader) {
        return res.status(400).json({
          success: false,
          message: 'X-Login-Session header is required for role access'
        });
      }

      // Validate session token is from OTP verification and unused
      // Only check that the session token exists, is not used, and not expired
      const sessionValidation = await customerService.validateLoginSession(
        sessionHeader,
        '', // Username not checked - only token validity matters
        'OTP_VERIFIED'
      );

      if (!sessionValidation.success) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired login session for role access'
        });
      }

      // Mark the session as used to prevent reuse
      await customerService.markLoginSessionUsed(sessionHeader);

      // Return role info with Challenge 4 flag for proper flow completion
      const roleData: any = {
        role: req.agent.role
      };

      // Award flag for completing the proper authentication flow
      // This now requires: 1) Valid JWT, 2) Valid X-Login-Session from OTP flow
      if (req.agent.role !== 'AGENT' && req.agent.role !== 'ADMIN') {
        roleData.message = 'Customer JWT with proper session flow - Challenge 4 completed!';
      } else {
        roleData.message = 'Agent role access granted through proper authentication flow';
      }

      return res.json(roleData);

    } catch (error) {
      console.error('Get role controller error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}