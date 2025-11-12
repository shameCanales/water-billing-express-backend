import { Router } from "express";
import { registerProcessorValidationSchema } from "../middlewares/validationSchemas/registerProcessorValidation.js";
import { checkSchema } from "express-validator";
import { requireAuthAndManager } from "../middlewares/authmiddleware.js";
import { validateObjectIdReusable } from "../middlewares/validateObjectId.js";
import { editProcessorValidationSchema } from "../middlewares/validationSchemas/editProcessorValidation.js";
import { ProcessorController } from "../controllers/processor.controller.js";
import { registerManagerValidationSchema } from "../middlewares/validationSchemas/registerManagerValidation.js";

const router = Router();

// Get all processors
router.get(
  "/api/processors",
  requireAuthAndManager,
  ProcessorController.getAll
);

// Get Processor by ID
router.get(
  "/api/processors/:id",
  requireAuthAndManager,
  validateObjectIdReusable({ key: "id" }),
  ProcessorController.getById
);

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
  ProcessorController.create
);

// Add first manager, not public route. only for adding initial user or manager
router.post(
  "/api/processors/register",
  checkSchema(registerManagerValidationSchema),
  ProcessorController.createManager
);

// Edit Processor by ID
router.patch(
  "/api/processors/:id",
  requireAuthAndManager,
  checkSchema(editProcessorValidationSchema),
  ProcessorController.update
);

// Delete Processor by ID
router.delete(
  "/api/processors/:id",
  requireAuthAndManager,
  ProcessorController.delete
);

export default router;
