import {
  requireAuthAndStaffOrManager,
  requireAuth,
} from "../../core/middlewares/authmiddleware.js";
import { Router } from "express";
import { addConsumerValidationSchema } from "../../core/middlewares/validationSchemas/addConsumerValidation.js";
import { checkSchema } from "express-validator";
import { validateObjectIdReusable } from "../../core/middlewares/validateObjectId.js";
import { ConsumerController } from "./consumer.controller.js";
import { ConnectionController } from "../connections/connection.controller.js";

const router = Router();

// get all consumers :  [{name, email, birthDate, mobileNumber, password, address, status}, ...]
router.get("/", requireAuthAndStaffOrManager, ConsumerController.getAll);

// Get Consumer by ID
router.get(
  "/:consumerId",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "consumerId" }),
  ConsumerController.getById
);

// get connections for a specific consumer
router.get(
  "/:consumerId/connections",
  requireAuth,
  validateObjectIdReusable({ key: "consumerId" }),
  ConnectionController.getByConsumerId
);

//add consumer
router.post(
  "/",
  requireAuthAndStaffOrManager,
  checkSchema(addConsumerValidationSchema),
  ConsumerController.create
);

// Edit Consumer by ID
router.patch(
  "/:consumerId",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "consumerId" }),
  ConsumerController.editById
);

// Delete Consumer by ID
router.delete(
  "/:consumerId",
  requireAuthAndStaffOrManager,
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
