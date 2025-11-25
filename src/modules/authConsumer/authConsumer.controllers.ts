import type { Request, Response } from "express";
import { ConsumerService } from "../../consumers/consumer.service";
import { verifyPassword } from "../../../core/utils/helpers";
import { generateToken } from "../../../core/utils/jwt.utils";

export const ConsumerAuthController = {
  /**
   * Consumer Login
   * POST /api/auth/consumer/login
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

      // Find consumer by email
      const consumer = await ConsumerService.findByEmail(email);

      if (!consumer) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      // Check if account is suspended
      if (consumer.status === "suspended") {
        res.status(403).json({
          success: false,
          message: "Your account has been suspended. Please contact support.",
        });
        return;
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, consumer.password);

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      // Generate JWT token with consumer payload
      const token = generateToken({
        id: consumer._id.toString(),
        email: consumer.email,
        type: "consumer",
      });

      // Return token and user data (without password)
      const { password: _, ...consumerData } = consumer.toObject();

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
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
   * Allows consumers to self-register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Create new consumer
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
   * Requires: requireConsumerAuth middleware
   */
  async status(req: Request, res: Response): Promise<void> {
    try {
      // req.user is set by requireConsumerAuth middleware
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
        return;
      }

      // Optionally fetch fresh data from database
      const consumer = await ConsumerService.getConsumerById(req.user.id);

      if (!consumer) {
        res.status(404).json({
          success: false,
          message: "Consumer not found",
        });
        return;
      }

      // Check if account was suspended
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
   *
   * Note: With JWT, logout is primarily handled client-side
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json({
        success: true,
        message: "Logged out successfully. Please remove token from client.",
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
   * Refresh Token (Optional)
   * POST /api/auth/consumer/refresh
   * Requires: requireConsumerAuth middleware
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

      // Generate new token
      const newToken = generateToken({
        id: req.user.id,
        email: req.user.email,
        type: "consumer",
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
