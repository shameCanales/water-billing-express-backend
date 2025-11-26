import type { Request, Response, NextFunction } from "express";
import { verifyToken, extractTokenFromHeader } from "../utils/jwt.utils.ts";

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

export const AdminAuthMiddleware = {
  requireAuth(req: Request, res: Response, next: NextFunction): void {
    try {
      const token = extractTokenFromHeader(req.headers.authorization);
      console.log("logged");

      if (!token) {
        res.status(401).json({
          success: false,
          message: "Authentication required. Please provide a token.",
        });
        return;
      }

      const payload = verifyToken(token);

      if (!payload) {
        res.status(401).json({
          success: false,
          message: "Invalid or expired token.",
        });
        return;
      }

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
      console.error("Admin auth error:", err);
      res.status(500).json({
        success: false,
        message: "Internal server error during authentication.",
      });
    }
  },

  requireManager(req: Request, res: Response, next: NextFunction): void {
    if (!req.user || req.user.type !== "admin") {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (req.user.role !== "manager") {
      res.status(403).json({
        success: false,
        message: "Access denied. Manager privileges required.",
      });
      return;
    }

    next();
  },

  requireStaffOrManager(req: Request, res: Response, next: NextFunction): void {
    if (!req.user || req.user.type !== "admin") {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (req.user.role !== "staff" && req.user.role !== "manager") {
      res.status(403).json({
        success: false,
        message: "Access denied. Staff or Manager privileges required.",
      });
      return;
    }

    next();
  },
};

/* ------------------------------------------
   CONSUMER AUTH MIDDLEWARE
------------------------------------------- */
export const ConsumerAuthMiddleware = {
  requireAuth(req: Request, res: Response, next: NextFunction): void {
    try {
      const token = extractTokenFromHeader(req.headers.authorization);

      if (!token) {
        res.status(401).json({
          success: false,
          message: "Authentication required. Please provide a token.",
        });
        return;
      }

      const payload = verifyToken(token);

      if (!payload) {
        res.status(401).json({
          success: false,
          message: "Invalid or expired token.",
        });
        return;
      }

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
      console.error("Consumer auth error:", err);
      res.status(500).json({
        success: false,
        message: "Internal server error during authentication.",
      });
    }
  },
};

/* ------------------------------------------
   OPTIONAL AUTH (for both admin + consumer)
------------------------------------------- */
export const OptionalAuthMiddleware = {
  check(req: Request, res: Response, next: NextFunction): void {
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
    } catch {
      next(); // silently ignore, because auth is optional
    }
  },
};
