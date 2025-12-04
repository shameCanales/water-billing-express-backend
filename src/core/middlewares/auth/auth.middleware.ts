import type { Request, Response, NextFunction } from "express";
import {
  verifyAccessToken,
  extractTokenFromHeader,
  type JWTPayload,
} from "../../utils/jwt.utils.ts";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        type: "admin" | "consumer";
        role?: "staff" | "manager" | "consumer";
      };
    }
  }
}

// check the token: this is a helper to follow DRY concept. because we are checking the token on multiple parts. so we make it reusable
const authenticateRequest = (
  req: Request,
  res: Response
): JWTPayload | null => {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Please provide a token",
    });

    return null;
  }

  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });

    return null;
  }

  return payload;
};

// Public Middleware
export const AuthMiddleware = {
  // L1: Consumer Only
  requireConsumer(req: Request, res: Response, next: NextFunction): void {
    const payload = authenticateRequest(req, res);
    if (!payload) return; // error already

    if (payload.type !== "consumer") {
      res.status(403).json({
        success: false,
        message: "Access denied. Consumer account authentication required. ",
      });

      return;
    }

    req.user = {
      id: payload.id,
      email: payload.email,
      role: "consumer",
      type: "consumer",
    };
    next();
  },

  // L2: admin (staff or consumer)
  requireStafforManager(req: Request, res: Response, next: NextFunction): void {
    const payload = authenticateRequest(req, res);
    if (!payload) return;

    if (payload.type !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
      return;
    }

    if (payload.role !== "staff" && payload.role !== "manager") {
      res.status(403).json({
        success: false,
        message: "Invalid admin role. ",
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
  },

  // L3: Admin only
  requireManager(req: Request, res: Response, next: NextFunction): void {
    const payload = authenticateRequest(req, res);
    if (!payload) return;

    if (payload.type !== "admin") {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required",
      });
      return;
    }

    if (payload.role !== "manager") {
      res.status(403).json({
        success: false,
        message: "Access denied. Manager privileges required",
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
  },

  // L4: requireAnyUser (Common routes) : for shared routes like "change password", "get my profile"
  requireAnyUser(req: Request, res: Response, next: NextFunction): void {
    const payload = authenticateRequest(req, res);
    if (!payload) return;

    if (payload.type === "admin") {
      req.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        type: "admin",
      };
    } else {
      req.user = {
        id: payload.id,
        email: payload.email,
        type: "consumer",
        role: "consumer",
      };
    }
  },
};

// RBAC - ROLE BASED ACCESS CONTROL for consumers and admins(staff and manager)
