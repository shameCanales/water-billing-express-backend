import { Router } from "express";
import { registerProcessorValidationSchema } from "../../core/middlewares/validationSchemas/registerProcessorValidation.ts";
import { checkSchema } from "express-validator";
import { AuthMiddleware } from "../../core/middlewares/auth/auth.middleware.ts";
import { validateObjectIdReusable } from "../../core/middlewares/validateObjectId.ts";
import { editProcessorValidationSchema } from "../../core/middlewares/validationSchemas/editProcessorValidation.ts";
import { ProcessorController } from "./processor.controller.ts";
import { registerManagerValidationSchema } from "../../core/middlewares/validationSchemas/registerManagerValidation.ts";

const router = Router();

// Get all processors
router.get("/", AuthMiddleware.requireManager, ProcessorController.getAll);

// Get Processor by ID
router.get(
  "/:processorId",
  AuthMiddleware.requireManager,
  validateObjectIdReusable({ key: "processorId" }),
  ProcessorController.getById
);

/**
 * @route   POST /api/processors
 * @desc    Register a new processor (Manager only)
 * @access  Private (Manager)
 */
router.post(
  "/",
  AuthMiddleware.requireManager,
  checkSchema(registerProcessorValidationSchema), 
  ProcessorController.create
);

// Edit Processor by ID
router.patch(
  "/:processorId",
  AuthMiddleware.requireManager,
  validateObjectIdReusable({ key: "processorId" }),
  checkSchema(editProcessorValidationSchema),
  ProcessorController.update
);

// Delete Processor by ID
router.delete(
  "/:processorId",
  AuthMiddleware.requireManager,
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
