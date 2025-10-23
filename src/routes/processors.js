// import { processors } from "../utils/constants.js";
import { Router } from "express";
import { registerProcessorValidationSchema } from "../middlewares/validationSchemas/registerProcessorValidation.js";
import { checkSchema, validationResult } from "express-validator";
import {
  requireAuthAndManager,
  requireAuth,
} from "../middlewares/authmiddleware.js";
import { Processor } from "../mongoose/schemas/processor.js";
import { parse } from "cookie";

const router = Router();

// Get all processors
router.get("/api/processors", requireAuthAndManager, async (req, res) => {
  try {
    const processors = await Processor.find().select("-password");

    return res.status(200).json({
      success: true,
      data: processors,
    });
  } catch (error) {
    console.error("Error fetching processors: ", error.message);

    return res.status(500).json({
      sucess: false,
      message: "Failed to fetch processors",
      error: error.message,
    });
  }
});

// Get Processor by ID


// Add a new processor
/**
 * @route   POST /api/processors
 * @desc    Register a new processor (Manager only)
 * @access  Private (Manager)
 */
router.post(
  "/api/processors",
  requireAuthAndManager, // middleware that checks for authentication and manager role
  checkSchema(registerProcessorValidationSchema), // middleware for validating request body
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
      const existingProcessor = await Processor.findOne({ email });

      if (existingProcessor) {
        return res.status(409).json({
          success: false,
          message: "Processor with this email already exists",
        });
      }

      const newProcessor = await Processor.create({
        name,
        email,
        password,
        role,
      });

      return res.status(201).json({
        success: true,
        message: "Processor registered successfully",
        data: newProcessor,
      });
    } catch (error) {
      console.error("Error creating processor:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error registering processor",
        error: error.message,
      });
    }
  }
);

// Edit Processor by ID

// Delete Processor by ID

export default router;
