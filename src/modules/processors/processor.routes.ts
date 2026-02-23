import { Router } from "express";
import { checkSchema } from "express-validator";
import { AuthMiddleware } from "../../core/middlewares/auth/auth.middleware.ts";
import { ProcessorController } from "./processor.controller.ts";
import { ProcessorValidationSchema } from "../../core/middlewares/validationSchemas/processor.validation.ts";
import { handleValidationErrors } from "../../core/middlewares/validation/validate.middleware.ts";

const router = Router();

// Get all processors
router.get(
  "/",
  AuthMiddleware.requireManager,
  checkSchema(ProcessorValidationSchema.getAll),
  handleValidationErrors,
  ProcessorController.getAll,
);

// Get Processor by ID
router.get(
  "/:processorId",
  AuthMiddleware.requireManager,
  checkSchema(ProcessorValidationSchema.idOnly),
  handleValidationErrors,
  ProcessorController.getById,
);

/**
 * @route   POST /api/processors
 * @desc    Register a new processor (Manager only)
 * @access  Private (Manager)
 */
router.post(
  "/",
  AuthMiddleware.requireManager,
  checkSchema(ProcessorValidationSchema.registerStaff),
  handleValidationErrors,
  ProcessorController.create,
);

// Edit Processor by ID
router.patch(
  "/:processorId",
  AuthMiddleware.requireManager,
  checkSchema(ProcessorValidationSchema.edit),
  handleValidationErrors,
  ProcessorController.update,
);

// Update Processor Status (active/restricted)
router.patch(
  "/:processorId/status",
  AuthMiddleware.requireManager,
  checkSchema(ProcessorValidationSchema.editStatus),
  handleValidationErrors,
  ProcessorController.updateStatus,
);

// Delete Processor by ID
router.delete(
  "/:processorId",
  AuthMiddleware.requireManager,
  checkSchema(ProcessorValidationSchema.idOnly),
  handleValidationErrors,
  ProcessorController.delete,
);

/**
 * @route   POST /api/processors/register
 * @desc    Register the first manager (Initial setup)
 * @access  Public (No auth required)
 */
router.post(
  "/register",
  checkSchema(ProcessorValidationSchema.registerManager),
  handleValidationErrors,
  ProcessorController.createManager,
);

export default router;
