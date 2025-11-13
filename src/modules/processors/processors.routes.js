import { Router } from "express";
import { registerProcessorValidationSchema } from "../../core/middlewares/validationSchemas/registerProcessorValidation.js";
import { checkSchema } from "express-validator";
import { requireAuthAndManager } from "../../core/middlewares/authmiddleware.js";
import { validateObjectIdReusable } from "../../core/middlewares/validateObjectId.js";
import { editProcessorValidationSchema } from "../../core/middlewares/validationSchemas/editProcessorValidation.js";
import { ProcessorController } from "./processor.controller.js";
import { registerManagerValidationSchema } from "../../core/middlewares/validationSchemas/registerManagerValidation.js";

const router = Router();

// Get all processors
router.get("/", requireAuthAndManager, ProcessorController.getAll);

// Get Processor by ID
router.get(
  "/:processorId",
  requireAuthAndManager,
  validateObjectIdReusable({ key: "processorId" }),
  ProcessorController.getById
);

// Add a new processor
/**
 * @route   POST /api/processors
 * @desc    Register a new processor (Manager only)
 * @access  Private (Manager)
 */
router.post(
  "/",
  requireAuthAndManager, // middleware that checks for authentication and manager role
  checkSchema(registerProcessorValidationSchema), // middleware for validating request body
  ProcessorController.create
);

// Add first manager, not public route. only for adding initial user or manager
router.post(
  "/register",
  checkSchema(registerManagerValidationSchema),
  ProcessorController.createManager
);

// Edit Processor by ID
router.patch(
  "/:processorId",
  requireAuthAndManager,
  validateObjectIdReusable({ key: "processorId" }),
  checkSchema(editProcessorValidationSchema),
  ProcessorController.update
);

// Delete Processor by ID
router.delete(
  "/:processorId",
  requireAuthAndManager,
  validateObjectIdReusable({ key: "processorId" }),
  ProcessorController.delete
);

export default router;
