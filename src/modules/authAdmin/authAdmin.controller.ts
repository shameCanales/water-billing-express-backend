import type { Request, Response, NextFunction } from "express";
import { ProcessorService } from "../processors/processor.service.ts";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../core/utils/jwt.utils.ts";
import { comparePassword } from "../../core/utils/helpers.ts";

export const AuthAdminController = {
  /**
   * Admin Login
   * POST /api/auth/admin/login
   */

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      const admin = await ProcessorService.getByEmail(email);

      if (!admin || !(await comparePassword(password, admin.password))) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      if (admin.status === "restricted") {
        res.status(403).json({
          success: false,
          message: "Account is restricted by the Manager.",
        });
        return;
      }

      const payload = {
        _id: admin._id.toString(),
        email: admin.email,
        role: admin.role!, // staff || manager
        type: "admin" as const, //admin lahat ng processor. as const because in types string !== "admin". it's like "admin" | "consumer". because if string, it could be "hello" and is not equal to type "admin". basta
        status: admin.status!, // active || restricted
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // NODE_ENV = 'development'
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      });

      res.status(200).json({
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
      console.error("Admin login error:", err);
      res.status(500).json({
        success: false,
        message: "Internal server error.",
      });
    }
  },

  /**
   * Refresh Token (Optional - for extending sessions)
   * POST /api/auth/admin/refresh
   * Requires: requireAdminAuth middleware
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const cookies = req.cookies;
      if (!cookies?.jwt) {
        res.status(401).json({
          success: false,
          message: "Refresh token required",
        });
        return;
      }

      const refreshToken = cookies.jwt;
      const decoded = verifyRefreshToken(refreshToken);

      if (!decoded) {
        res.clearCookie("jwt");
        res.status(403).json({
          success: false,
          message: "Invalid refresh token",
        });
        return;
      }

      if (decoded.type !== "admin") {
        res.status(403).json({
          success: false,
          message: "Invalid token type",
        });
        return;
      }

      // 3. Optional but recommended: Check if user still exists in DB // let's add this in the future using redis ba yun, basta.
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

      res.status(200).json({
        success: true,
        accessToken: newAccessToken,
      });
    } catch (err) {
      console.error("Refresh Error: ", err);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  },

  /**
   * Get Admin Auth Status
   * GET /api/auth/admin/status
   * Requires: requireAdminAuth middleware
   */

  async status(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });

        return;
      }

      // Optionally fetch resh data from database

      const admin = await ProcessorService.getById(req.user._id);

      if (!admin) {
        res.status(404).json({
          success: false,
          message: "Admin account not found",
        });

        return;
      }

      // const adminObj = admin.toObject ? admin.toObject() : admin;

      const { password: _, ...adminData } = admin as any;

      res.status(200).json({
        success: true,
        user: adminData,
      });
    } catch (err) {
      console.error("Admin status error: ", err);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  // backend should delete the refresh token(the cookie)
  // frontend should delete the Access Token (The variable in memory)
  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (err) {
      console.error("Logout error: ", err);

      res.status(500).json({
        success: false,
        message: "Cannot logout, Internal server error",
      });
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
