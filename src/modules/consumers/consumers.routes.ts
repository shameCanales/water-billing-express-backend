import { Router } from "express";
import { checkSchema } from "express-validator";
import { AuthMiddleware } from "../../core/middlewares/auth/auth.middleware.ts";
import { addConsumerValidationSchema } from "../../core/middlewares/validationSchemas/addConsumerValidation.ts";
import { validateObjectIdReusable } from "../../core/middlewares/validateObjectId.ts";
import { ConsumerController } from "./consumer.controller.ts";
import { ConnectionController } from "../connections/connection.controller.ts";

const router = Router();

// get all consumers :  [{name, email, birthDate, mobileNumber, password, address, status}, ...]
router.get(
  "/",
  AuthMiddleware.requireStaffOrManager,
  ConsumerController.getAll
);

// Get Consumer by ID
router.get(
  "/:consumerId",
  AuthMiddleware.requireStaffOrManager,
  validateObjectIdReusable({ key: "consumerId" }),
  ConsumerController.getById
);

// get connections for a specific consumer
router.get(
  "/:consumerId/connections",
  AuthMiddleware.requireAnyUser,
  validateObjectIdReusable({ key: "consumerId" }),
  ConnectionController.getByConsumerId
);

//add consumer
router.post(
  "/",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(addConsumerValidationSchema),
  ConsumerController.create
);

// Edit Consumer by ID
router.patch(
  "/:consumerId",
  AuthMiddleware.requireStaffOrManager,
  validateObjectIdReusable({ key: "consumerId" }),
  ConsumerController.editById
);

// Delete Consumer by ID
router.delete(
  "/:consumerId",
  AuthMiddleware.requireStaffOrManager,
  validateObjectIdReusable({ key: "consumerId" }),
  ConsumerController.deleteById
);

export default router;

// // 1st architecture: no multilayer architecture
// // get all consumers :  [{name, email, birthDate, mobileNumber, password, address, status}, ...]
// router.get(
//   "/api/consumers",
//   requireAuthAndStaffOrManager,
//   getAllConsumersHandler
// );
