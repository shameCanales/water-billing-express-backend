import type { Request, Response, NextFunction } from "express";
import {
  verifyToken,
  extractTokenFromHeader,
  type JWTPayload,
} from "../utils/jwt.utils.ts";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role?: "staff" | "manager";
        type: "admin" | "consumer";
      };
    }
  }
}

/**
 * Middleware to require admin authentication
 * Checks JWT token and ensures user is admin (staff or manager)
 */

export const requireAdminAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a token.",
      });

      return;
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });

      return;
    }

    //Check if token is for admin
    if (payload.type !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });

      return;
    }

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      type: "admin",
    };

    next();
  } catch (err) {
    console.error("Auth middleware error: ", err);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};

/**
 * Middleware to require manager role
 * Must be used after requireAdminAuth
 */
export const requireManagerAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // First check if admin auth was successful
  if (!req.user || req.user.type !== "admin") {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return;
  }

  // Check if user is manager
  if (req.user.role !== "manager") {
    res.status(403).json({
      success: false,
      message: "Access denied. Manager privileges required.",
    });
    return;
  }

  next();
};

/**
 * Middleware to require staff or manager role
 * Must be used after requireAdminAuth
 */

export const requireStafforManagerAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  //First check if admin auth was successful

  if (!req.user || req.user.type !== "admin") {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });

    return;
  }

  // Check if user is staff or manager
  if (req.user.role !== "staff" && req.user.role !== "manager") {
    res.status(403).json({
      success: false,
      message: "Access denied. Staff or Manager privileges required.",
    });

    return;
  }

  next();
};

/**
 * Middleware to require consumer authentication
 * Checks JWT token and ensures user is consumer
 */
export const requireConsumerAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Extract token from auth header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a token.",
      });

      return;
    }

    // verify token
    const payload = verifyToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token.",
      });

      return;
    }

    // Check if token is for consumer
    if (payload.type !== "consumer") {
      res.status(403).json({
        success: false,
        message: "Access denied. Consumer authentication required.",
      });
      return;
    }

    req.user = {
      id: payload.id,
      email: payload.email,
      type: "consumer",
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);

    res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};

/**
 * Optional middleware - checks auth but doesn't require it
 * Useful for endpoints that work differently when user is logged in
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        req.user = {
          id: payload.id,
          email: payload.email,
          role: payload.type === "admin" ? payload.role : undefined,
          type: payload.type,
        };
      }
    }

    next();
  } catch (error) {
    // Silently fail - auth is optional
    next();
  }
};
