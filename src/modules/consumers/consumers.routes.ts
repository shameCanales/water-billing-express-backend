import { Router } from "express";
import { checkSchema } from "express-validator";
import {
  requireAuthAndStaffOrManager,
  requireAuth,
} from "../../core/middlewares/authmiddleware.ts";
import { addConsumerValidationSchema } from "../../core/middlewares/validationSchemas/addConsumerValidation.ts";
import { validateObjectIdReusable } from "../../core/middlewares/validateObjectId.ts";
import { ConsumerController } from "./consumer.controller.ts";
import { ConnectionController } from "../connections/connection.controller.ts";

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
