import { Router } from "express";
import { checkSchema } from "express-validator";
import { AuthMiddleware } from "../../core/middlewares/auth/auth.middleware.ts";
import { validateObjectIdReusable } from "../../core/middlewares/validateObjectId.ts";
import { ProcessorController } from "./processor.controller.ts";
import { ProcessorValidationSchema } from "../../core/middlewares/validationSchemas/processor.validation.ts";

const router = Router();

// Get all processors
router.get(
  "/",
  AuthMiddleware.requireManager,
  checkSchema(ProcessorValidationSchema.getAll),
  ProcessorController.getAll,
);

// Get Processor by ID
router.get(
  "/:processorId",
  AuthMiddleware.requireManager,
  validateObjectIdReusable({ key: "processorId" }),
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
  ProcessorController.create,
);

// Edit Processor by ID
router.patch(
  "/:processorId",
  AuthMiddleware.requireManager,
  validateObjectIdReusable({ key: "processorId" }),
  checkSchema(ProcessorValidationSchema.edit),
  ProcessorController.update,
);

// Delete Processor by ID
router.delete(
  "/:processorId",
  AuthMiddleware.requireManager,
  validateObjectIdReusable({ key: "processorId" }),
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
  ProcessorController.createManager,
);

export default router;
