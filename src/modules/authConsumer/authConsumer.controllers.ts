import type { Request, Response } from "express";
import { comparePassword } from "../../core/utils/helpers.ts";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../core/utils/jwt.utils.ts";
import { ConsumerService } from "../consumers/consumer.service.ts";

export const AuthConsumerController = {
  /**
   * Consumer Login
   * POST /api/auth/consumer/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;


      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      const consumer = await ConsumerService.getConsumerByEmail(email);

      if (!consumer) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      if (consumer.status === "suspended") {
        res.status(403).json({
          success: false,
          message: "Your account has been suspended. Please contact support.",
        });
        return;
      }

      const isPasswordValid = await comparePassword(password, consumer.password);

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      // set the payload
      const payload = {
        _id: consumer._id.toString(),
        email: consumer.email,
        type: "consumer" as const,
      };

      // Generate Both Tokens
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Set HttpOnly Cookie
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      // ---------------------------------------------------------
      // NEW JWT LOGIC END
      // ---------------------------------------------------------

      // Return token and user data (without password)
      const { password: _, ...consumerData } = consumer.toObject();

      res.status(200).json({
        success: true,
        message: "Login successful",
        accessToken, // Frontend stores this in memory
        user: consumerData,
      });
    } catch (error) {
      console.error("Consumer login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  /**
   * Consumer Registration
   * POST /api/auth/consumer/register
   * (Logic remains mostly the same)
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const newConsumer = await ConsumerService.createConsumer(req.body);

      res.status(201).json({
        success: true,
        message: "Registration successful. You can now login.",
        user: newConsumer,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";

      const statusCode = errorMessage.includes("already exists") ? 409 : 400;

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
  },

  /**
   * Get Consumer Auth Status
   * GET /api/auth/consumer/status
   * Requires: AuthMiddleware.requireConsumer
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

      const consumer = await ConsumerService.getConsumerById(req.user._id);

      if (!consumer) {
        res.status(404).json({
          success: false,
          message: "Consumer not found",
        });
        return;
      }

      if (consumer.status === "suspended") {
        res.status(403).json({
          success: false,
          message: "Your account has been suspended.",
        });
        return;
      }

      const { password: _, ...consumerData } = consumer.toObject();

      res.status(200).json({
        success: true,
        user: consumerData,
      });
    } catch (error) {
      console.error("Consumer status error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  /**
   * Consumer Logout
   * POST /api/auth/consumer/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Clear the cookie logic
      const cookies = req.cookies;
      if (!cookies?.jwt) {
        res.status(200).json({ success: true, message: "Logged out" });
        return;
      }

      res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Consumer logout error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },

  /**
   * Refresh Token
   * POST /api/auth/consumer/refresh
   * Note: Does NOT use middleware because access token is expired
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

      if (!decoded || decoded.type !== "consumer") {
        res.status(403).json({
          success: false,
          message: "Invalid or expired refresh token",
        });
        return;
      }

      // (Optional) Strict check: Ensure consumer is not suspended before issuing new token
      // const consumer = await ConsumerService.getConsumerById(decoded.id);
      // if (!consumer || consumer.status === 'suspended') return res.status(403)...

      // Generate NEW Access Token
      const newAccessToken = generateAccessToken({
        _id: decoded._id,
        email: decoded.email,
        type: "consumer",
      });

      res.status(200).json({
        success: true,
        message: "Token refreshed",
        accessToken: newAccessToken,
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