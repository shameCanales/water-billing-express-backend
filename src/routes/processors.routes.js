import { Router } from "express";
import { registerProcessorValidationSchema } from "../middlewares/validationSchemas/registerProcessorValidation.js";
import { checkSchema } from "express-validator";
import { requireAuthAndManager } from "../middlewares/authmiddleware.js";
import { validateObjectIdReusable } from "../middlewares/validateObjectId.js";
import {
  addFirstManagerHandler,
  addNewProcessorHandler,
  deleteProcessorByIdHandler,
  editProcessorByIdHandler,
  getAllProcessorsHandler,
  getProcessorByIdHandler,
} from "../controllers/processor.controller.js";
import { editProcessorValidationSchema } from "../middlewares/validationSchemas/editProcessorValidation.js";

const router = Router();

// Get all processors
router.get("/api/processors", requireAuthAndManager, getAllProcessorsHandler);

// Get Processor by ID
router.get(
  "/api/processors/:id",
  requireAuthAndManager,
  validateObjectIdReusable({ key: "id" }),
  getProcessorByIdHandler
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
  addNewProcessorHandler
);

// Add first manager, not public route. only for adding initial user or manager
router.post("/api/processor/register", addFirstManagerHandler);

// Edit Processor by ID
router.patch(
  "/api/processors/:id",
  requireAuthAndManager,
  checkSchema(editProcessorValidationSchema),
  editProcessorByIdHandler
);

// Delete Processor by ID
router.delete(
  "/api/processors/:id",
  requireAuthAndManager,
  deleteProcessorByIdHandler
);

export default router;
