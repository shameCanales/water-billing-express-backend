import { requireAuthAndStaffOrManager } from "../middlewares/authmiddleware.js";
import { Router } from "express";
import { addConsumerValidationSchema } from "../middlewares/validationSchemas/addConsumerValidation.js";
import { checkSchema } from "express-validator";
import { validateObjectIdReusable } from "../middlewares/validateObjectId.js";
import { ConsumerController } from "../controllers/consumer.controller.js";

const router = Router();

// get all consumers :  [{name, email, birthDate, mobileNumber, password, address, status}, ...]
router.get(
  "/api/consumers",
  requireAuthAndStaffOrManager,
  ConsumerController.getAll
);

// Get Consumer by ID
router.get(
  "/api/consumers/:id",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "id" }),
  ConsumerController.getById
);

//add consumer
router.post(
  "/api/consumers",
  requireAuthAndStaffOrManager,
  checkSchema(addConsumerValidationSchema),
  ConsumerController.create
);

// Edit Consumer by ID
router.patch(
  "/api/consumers/:id",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "id" }),
  ConsumerController.editById
);

// Delete Consumer by ID
router.delete(
  "/api/consumers/:id",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "id" }),
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
