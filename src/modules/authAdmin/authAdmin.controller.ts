import type { Request, Response, NextFunction } from "express";
import { ProcessorService } from "../processors/processor.service.ts";
import { generateToken } from "../../core/utils/jwt.utils.ts";
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

      // Find admin by email (includes password field)
      const admin = await ProcessorService.getByEmail(email);

      if (!admin) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, admin.password);

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      if (!admin.role) {
        res.status(500).json({
          success: false,
          message: "User role not found",
        });
        return;
      }

      // Generate JWT token with admin payload
      const token = generateToken({
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
        type: "admin",
      });

      // Return token and user data (without password)
      // const { password: _, ...adminData } = admin.toObject(); // desctructure is not required because getByEmail already excludes password

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: admin,
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

      const admin = await ProcessorService.getById(req.user.id);

      if (!admin) {
        res.status(404).json({
          success: false,
          message: "Admin not found",
        });

        return;
      }

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

  /**
   * Admin Logout
   * POST /api/auth/admin/logout
   *
   * Note: With JWT, logout is primarily handled client-side
   * by removing the token. This endpoint is optional.
   *
   * For true logout, implement token blacklist:
   * - Store token in Redis with expiry
   * - Check blacklist in auth middleware
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Optional Implement token blacklist here
      // const token = extractTokenFromHeader(req.headers.authorization);
      // await redisClient.set("blacklist:" + token, true, 'EX', tokenExpiry); // 7 days expiry
      // handle logout on the frontend by deleting the token

      res.status(200).json({
        success: true,
        message: "Logged out successfully. Please remove token from client",
      });
    } catch (err) {
      console.error("Admin logout error: ", err);
      res.status(500).json({
        success: false,
        message: "Internal server error",
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
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
        return;
      }

      // Generate new token with same payload
      const newToken = generateToken({
        id: req.user.id,
        email: req.user.email,
        role: req.user.role!,
        type: "admin",
      });

      res.status(200).json({
        success: true,
        message: "Token refreshed",
        token: newToken,
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
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
