import { Router } from "express";
import { checkSchema } from "express-validator";
import { AuthMiddleware } from "../../core/middlewares/auth/auth.middleware.ts";
import { validateObjectIdReusable } from "../../core/middlewares/validateObjectId.ts";
import { ConsumerController } from "./consumer.controller.ts";
import { ConnectionController } from "../connections/connection.controller.ts";
import { ConsumerValidationSchema } from "../../core/middlewares/validationSchemas/consumers.validation.ts";
import { ConnectionValidationSchema } from "../../core/middlewares/validationSchemas/connection.validation.ts";
import { handleValidationErrors } from "../../core/middlewares/validation/validate.middleware.ts";

const router = Router();

// get all consumers :  [{name, email, birthDate, mobileNumber, password, address, status}, ...]
router.get(
  "/",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(ConsumerValidationSchema.getAll),
  ConsumerController.getAll,
);

// Get Consumer by ID
router.get(
  "/:consumerId",
  AuthMiddleware.requireStaffOrManager,
  validateObjectIdReusable({ key: "consumerId" }),
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

//add consumer
router.post(
  "/",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(ConsumerValidationSchema.add),
  ConsumerController.create,
);

// Edit Consumer by ID
router.patch(
  "/:consumerId",
  AuthMiddleware.requireStaffOrManager,
  validateObjectIdReusable({ key: "consumerId" }),
  checkSchema(ConsumerValidationSchema.edit),
  ConsumerController.editById,
);

// Delete Consumer by ID
router.delete(
  "/:consumerId",
  AuthMiddleware.requireStaffOrManager,
  validateObjectIdReusable({ key: "consumerId" }),
  ConsumerController.deleteById,
);

// Update Consumer Status (suspend/activate)
router.patch(
  "/:consumerId/status",
  AuthMiddleware.requireStaffOrManager,
  validateObjectIdReusable({ key: "consumerId" }),
  checkSchema(ConsumerValidationSchema.updateStatus),
  ConsumerController.updateStatusById,
);

export default router;

// // 1st architecture: no multilayer architecture
// // get all consumers :  [{name, email, birthDate, mobileNumber, password, address, status}, ...]
// router.get(
//   "/api/consumers",
//   requireAuthAndStaffOrManager,
//   getAllConsumersHandler
// );
