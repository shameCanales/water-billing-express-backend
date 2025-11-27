import { Router } from "express";
import { registerProcessorValidationSchema } from "../../core/middlewares/validationSchemas/registerProcessorValidation.ts";
import { checkSchema } from "express-validator";
import { AdminAuthMiddleware } from "../../core/middlewares/adminAuth.middleware.ts";
import { validateObjectIdReusable } from "../../core/middlewares/validateObjectId.ts";
import { editProcessorValidationSchema } from "../../core/middlewares/validationSchemas/editProcessorValidation.ts";
import { ProcessorController } from "./processor.controller.ts";
import { registerManagerValidationSchema } from "../../core/middlewares/validationSchemas/registerManagerValidation.ts";

const router = Router();

// Get all processors
router.get(
  "/",
  AdminAuthMiddleware.requireAuth,
  AdminAuthMiddleware.requireManager,
  ProcessorController.getAll
);

// Get Processor by ID
router.get(
  "/:processorId",
  AdminAuthMiddleware.requireAuth,
  AdminAuthMiddleware.requireManager,
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
  AdminAuthMiddleware.requireAuth,
  AdminAuthMiddleware.requireManager, // middleware that checks for authentication and manager role
  checkSchema(registerProcessorValidationSchema), // middleware for validating request body
  ProcessorController.create
);

// Edit Processor by ID
router.patch(
  "/:processorId",
  AdminAuthMiddleware.requireAuth,
  AdminAuthMiddleware.requireManager,
  validateObjectIdReusable({ key: "processorId" }),
  checkSchema(editProcessorValidationSchema),
  ProcessorController.update
);

// Delete Processor by ID
router.delete(
  "/:processorId",
  AdminAuthMiddleware.requireAuth,
  AdminAuthMiddleware.requireManager,
  validateObjectIdReusable({ key: "processorId" }),
  ProcessorController.delete
);

/**
 * @route   POST /api/processors/register
 * @desc    Register the first manager (Initial setup)
 * @access  Public (No auth required)
 */
router.post(
  "/register",
  checkSchema(registerManagerValidationSchema),
  ProcessorController.createManager
);

export default router;
