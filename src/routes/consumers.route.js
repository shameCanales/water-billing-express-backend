import { requireAuthAndStaffOrManager } from "../middlewares/authmiddleware.js";
import { Consumer } from "../models/consumer.model.js";
import { Router } from "express";
import { addConsumerValidationSchema } from "../middlewares/validationSchemas/addConsumerValidation.js";
import { checkSchema, validationResult, matchedData } from "express-validator";
import { validateObjectIdReusable } from "../middlewares/validateObjectId.js";
import { hashPassword } from "../utils/helpers.js";
import {
  getAllConsumersHandler,
  createConsumerHandler,
  getConsumerById,
  editConsumerById,
  deleteConsumerById,
} from "../controllers/consumer.controller.js";

const router = Router();

// get all consumers :  [{name, email, birthDate, mobileNumber, password, address, status}, ...]
router.get(
  "/api/consumers",
  requireAuthAndStaffOrManager,
  getAllConsumersHandler
);

//add consumer
router.post(
  "/api/consumers",
  requireAuthAndStaffOrManager,
  checkSchema(addConsumerValidationSchema),
  createConsumerHandler
);

// Edit Consumer by ID
router.patch(
  "/api/consumers/:id",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "id" }),
  editConsumerById
);

// Delete Consumer by ID
router.delete(
  "/api/consumers/:id",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "id" }),
  deleteConsumerById
);

// Get Consumer by ID
router.get(
  "/api/consumers/:id",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "id" }),
  getConsumerById
);

export default router;
