import type { Request, Response } from "express";
import { ProcessorService } from "../processors/processor.service.ts";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../core/utils/jwt.utils.ts";
import { comparePassword } from "../../core/utils/helpers.ts";
import { matchedData } from "express-validator";
import { handleControllerError } from "../../core/utils/errorHandler.ts";

export const AuthAdminController = {
  /**
   * Admin Login
   * POST /api/auth/admin/login
   */

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = matchedData(req) as {
        email: string;
        password: string;
      };

      const admin = await ProcessorService.getByEmail(email);

      if (!admin || !(await comparePassword(password, admin.password))) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      if (admin.status === "restricted") {
        return res.status(403).json({
          success: false,
          message: "Account is restricted by the Manager.",
        });
      }

      const payload = {
        _id: admin._id.toString(),
        email: admin.email,
        role: admin.role, // staff || manager
        type: "admin" as const, //admin lahat ng processor. as const because in types string !== "admin". it's like "admin" | "consumer". because if string, it could be "hello" and is not equal to type "admin". basta
        status: admin.status, // active || restricted
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        accessToken,
        user: {
          _id: admin._id,
          email: admin.email,
          role: admin.role,
          type: "admin",
          status: admin.status,
        },
      });
    } catch (err) {
      return handleControllerError(err, res);
    }
  },

  /**
   * Refresh Token (Optional - for extending sessions)
   * POST /api/auth/admin/refresh
   * Requires: requireAdminAuth middleware
   */
  async refresh(req: Request, res: Response): Promise<Response> {
    try {
      const cookies = req.cookies;
      if (!cookies?.jwt) {
        return res.status(401).json({
          success: false,
          message: "Refresh token required",
        });
      }

      const refreshToken = cookies.jwt;
      const decoded = verifyRefreshToken(refreshToken);

      if (!decoded) {
        res.clearCookie("jwt");
        return res.status(403).json({
          success: false,
          message: "Invalid refresh token",
        });
      }

      if (decoded.type !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Invalid token type",
        });
      }

      // 3. Optional but recommended: Check if user still exists in DB // let's add this in the future using redis ba yun, basta kung may loggedIn table tayo.
      // const foundUser = await UserService.getById(decoded.id);
      // if (!foundUser) return res.status(401)

      // 4. Generate NEW Access Token
      const newAccessToken = generateAccessToken({
        _id: decoded._id,
        email: decoded.email,
        role: decoded.role,
        type: decoded.type,
        status: decoded.status,
      });

      return res.status(200).json({
        success: true,
        accessToken: newAccessToken,
      });
    } catch (err) {
      return handleControllerError(err, res);
    }
  },

  /**
   * Get Admin Auth Status
   * GET /api/auth/admin/status
   * Requires: requireAdminAuth middleware
   */

  async status(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      const admin = await ProcessorService.getById(req.user._id);

      return res.status(200).json({
        success: true,
        user: admin,
      });
    } catch (err) {
      return handleControllerError(err, res);
    }
  },

  // backend should delete the refresh token(the cookie)
  // frontend should delete the Access Token (The variable in memory)
  async logout(_req: Request, res: Response): Promise<Response> {
    try {
      res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (err) {
      return handleControllerError(err, res);
    }
  },
};

// export const AuthAdminController = {
//   async login(req: Request, res: Response, next: NextFunction): Promise<void> {
//     passport.authenticate(
//       "local",
//       (
//         err: Error | null,
//         user: Express.User | false,
//         info?: { message?: string }
//       ) => {
//         if (err) {
//           next(err);
//           return;
//         }
//         if (!user) {
//           res
//             .status(401)
//             .json({ message: info?.message || "Invalid credentials" });

//           return;
//         }

//         req.login(user, (loginErr) => {
//           if (loginErr) {
//             next(loginErr);
//             return;
//           }
//           // req.session.user = user; // optional: custom session reference
//           res.status(200).json(user);
//         });
//       }
//     )(req, res, next);
//   },
//   async authStatus(req: Request, res: Response): Promise<void> {
//     req.sessionStore.get(req.session.id, (err, session) => {
//       if (err) console.error("Session retrieval error:", err);
//       else console.log("Current session data:", session);
//     });

//     if (req.isAuthenticated()) {
//       res.status(200).json(req.user);
//       return;
//     }
//     res.status(401).json({ message: "Not authenticated" });
//   },

//   async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
//     req.logout((logoutErr) => {
//       if (logoutErr) {
//         console.error("Logout error:", logoutErr);
//         next(logoutErr);
//         return;
//       }

//       req.session.destroy((sessionErr) => {
//         if (sessionErr) {
//           console.error("Session destroy error:", sessionErr);
//           res.status(500).json({ message: "Failed to destroy session" });
//           return;
//         }

//         res.clearCookie("connect.sid");
//         res.status(200).json({ message: "Logged out successfully" });
//       });
//     });
//   },
// };
