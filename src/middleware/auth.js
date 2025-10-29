// middleware/authenticate.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getUserById } from '../endUser/service/user.service.js';
import { getAdminMe } from '../admin_user/service/admin_user.service.js';
import { getUserAgentMe } from '../user_agent/service/user_agent.service.js';
import { getCaptainUserById } from '../captain_user/service/captain_user.service.js';
import User_Agent from '../user_agent/models/user_agent.model.js';
import Captainconfig from '../captain_user/models/captain_config.models.js';
import Token from '../user_agent/models/token.model.js';    

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const roleHandlers = {
  end_user: async (decoded, token) => {
    const user = await getUserById(decoded.id);
    if (!user) {
      const err = new Error('End user not found');
      err.statusCode = 404;
      throw err;
    }
    const plainUser = user.get({ plain: true });
    if (plainUser.token !== token) {
      const err = new Error('Token mismatch');
      err.statusCode = 401;
      throw err;
    }
    return { key: 'user', value: decoded };
  },

  admin: async (decoded) => {
    const admin = await getAdminMe(decoded.id);
    if (!admin) {
      const err = new Error(`Admin not found with ID: ${decoded.id}`);
      err.statusCode = 404;
      throw err;
    }
    if (!admin.is_active) {
      const err = new Error('Admin account is inactive');
      err.statusCode = 403;
      throw err;
    }
    return { key: 'admin', value: decoded };
  },

  user_agent: async (decoded, token) => {
    const agent = await User_Agent.findByPk(decoded.id);
    if (!agent) {
      const err = new Error('User agent not found');
      err.statusCode = 404;
      throw err;
    }
    if (!agent.is_active) {
      const err = new Error('User agent inactive');
      err.statusCode = 403;
      throw err;
    }
    const existingToken = await Token.findOne({
      where: { useragent_id: decoded.id, token }
    });
    if (!existingToken) {
      const err = new Error('Token mismatch or expired');
      err.statusCode = 401;
      throw err;
    }
    return { key: 'userAgent', value: { id: decoded.id } };
  },

  captain: async (decoded, token) => {
    const captain = await getCaptainUserById(decoded.id);
    if (!captain || !captain.is_active) {
      console.log("Role check failed for captain: Captain not found or inactive");
      const err = new Error('Captain user not found or inactive');
      err.statusCode = 403;
      throw err;
    }

    // ——— NEW CONFIG CHECK ———
    const configCount = await Captainconfig.count();
    if (configCount === 0) {
      console.log("Configuration check failed: no captain_config entries");
      const err = new Error('Configuration missing—please contact admin');
      err.statusCode = 403;
      throw err;
    }
    // ——————————————————————

    const plainCaptain = captain.get({ plain: true });
    if (plainCaptain.token !== token) {
      console.log("Role check failed for captain: Token mismatch");
      const err = new Error('Token mismatch');
      err.statusCode = 401;
      throw err;
    }

    return { key: 'captain', value: decoded };
  }
};

export const authenticate = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // Check if JWT_SECRET is configured
      if (!JWT_SECRET) {
        console.error('❌ JWT_SECRET is not configured in environment variables');
        return res
          .status(500)
          .json({ status: 'error', message: 'Server configuration error: JWT_SECRET missing' });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ Auth header missing or invalid format');
        return res
          .status(401)
          .json({ status: 'error', message: 'Unauthorized: No token provided. Use format: Authorization: Bearer <token>' });
      }

      const token = authHeader.replace('Bearer ', '').trim();
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ Token verified successfully for user:', decoded.username || decoded.id, 'role:', decoded.role);
      } catch (ve) {
        console.error('❌ Token verification failed:', ve.message);
        return res
          .status(401)
          .json({ status: 'error', message: `Unauthorized: Invalid or expired token - ${ve.message}` });
      }

      // Check if token role matches any allowed role (case-insensitive, handles "Super Admin", "Admin", etc.)
      const tokenRole = (decoded.role || '').toLowerCase().trim();
      // Check if token role contains "admin" (for "Admin", "Super Admin", etc.)
      const tokenHasAdminRole = tokenRole.includes('admin');
      
      // Find matching role - check exact match first, then check if token has admin role
      let matchingRole = allowedRoles.find(role => role.toLowerCase() === tokenRole);
      
      // If no exact match but token has "admin" in role and route allows "admin", allow it
      if (!matchingRole && tokenHasAdminRole && allowedRoles.includes('admin')) {
        matchingRole = 'admin';
      }
      
      if (!matchingRole) {
        return res
          .status(403)
          .json({ 
            status: 'error', 
            message: `Unauthorized: Token role '${decoded.role}' does not match required roles: ${allowedRoles.join(', ')}` 
          });
      }

      // Use the handler for the matching role
      const handler = roleHandlers[matchingRole];
      if (!handler) {
        return res
          .status(500)
          .json({ status: 'error', message: `Server error: No handler for role '${matchingRole}'` });
      }

      try {
        const { key, value } = await handler(decoded, token);
        req[key] = value;
        return next();
      } catch (err) {
        console.error(`Role check failed for ${matchingRole}:`, err.message);
        return res
          .status(err.statusCode || 403)
          .json({ status: 'error', message: err.message });
      }

    } catch (err) {
      console.error('Authentication Middleware Error:', err.message);
      return res
        .status(500)
        .json({ status: 'error', message: 'Internal authentication error' });
    }
  };
};
