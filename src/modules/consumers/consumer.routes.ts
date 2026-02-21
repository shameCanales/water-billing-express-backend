import { Router } from "express";
import { checkSchema } from "express-validator";
import { AuthMiddleware } from "../../core/middlewares/auth/auth.middleware.ts";
import { ConsumerController } from "./consumer.controller.ts";
import { ConnectionController } from "../connections/connection.controller.ts";
import { ConsumerValidationSchema } from "../../core/middlewares/validationSchemas/consumers.validation.ts";
import { ConnectionValidationSchema } from "../../core/middlewares/validationSchemas/connection.validation.ts";
import { handleValidationErrors } from "../../core/middlewares/validation/validate.middleware.ts";

const router = Router();

//add consumer
router.post(
  "/",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(ConsumerValidationSchema.add),
  handleValidationErrors,
  ConsumerController.create,
);

// get all consumers :  [{name, email, birthDate, mobileNumber, password, address, status}, ...]
router.get(
  "/",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(ConsumerValidationSchema.getAll),
  handleValidationErrors,
  ConsumerController.getAll,
);

// Get Consumer by ID
router.get(
  "/:consumerId",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(ConsumerValidationSchema.idOnly),
  handleValidationErrors,
  ConsumerController.getById,
);

// get connections for a specific consumer
router.get(
  "/:consumerId/connections",
  AuthMiddleware.requireAnyUser,
  checkSchema(ConnectionValidationSchema.consumerIdOnly),
  handleValidationErrors,
  ConnectionController.getByConsumerId,
);

// Edit Consumer by ID
router.patch(
  "/:consumerId",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(ConsumerValidationSchema.edit),
  handleValidationErrors,
  ConsumerController.editById,
);

// Update Consumer Status (suspend/activate)
router.patch(
  "/:consumerId/status",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(ConsumerValidationSchema.updateStatus),
  handleValidationErrors,
  ConsumerController.updateStatusById,
);

// Delete Consumer by ID
router.delete(
  "/:consumerId",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(ConsumerValidationSchema.idOnly),
  handleValidationErrors,
  ConsumerController.deleteById,
);

export default router;
