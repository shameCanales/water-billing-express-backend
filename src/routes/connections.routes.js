import { Router } from "express";
import {
  requireAuthAndStaffOrManager,
  requireAuth,
  requireAuthAndManager,
} from "../middlewares/authmiddleware.js";
import { validateObjectIdReusable } from "../middlewares/validateObjectId.js";
import { addConnectionValidationSchema } from "../middlewares/validationSchemas/addConnectionValidation.js";
import { editConnectionValidationSchema } from "../middlewares/validationSchemas/editConnectionValidation.js";
import { checkSchema } from "express-validator";

import { connectionController } from "../controllers/connection.controller.js";

const router = Router();

// Add new connection for a specific consumer
router.post(
  "/api/connections",
  requireAuthAndStaffOrManager,
  checkSchema(addConnectionValidationSchema),
  validateObjectIdReusable({ key: "consumerId", source: "body" }),
  connectionController.create
);

// Get all connections
router.get(
  "/api/connections",
  requireAuthAndStaffOrManager,
  connectionController.getAll
);

// edit connection by id
router.patch(
  "/api/connections/:id",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "id" }),
  checkSchema(editConnectionValidationSchema),
  connectionController.updateById
);

// delete connection by id
router.delete(
  "/api/connections/:id",
  requireAuthAndManager,
  validateObjectIdReusable({ key: "id" }),
  connectionController.deleteById
);

// get connections for a specific consumer
router.get(
  "/api/connections/consumer/:consumerid",
  requireAuth,
  validateObjectIdReusable({ key: "consumerid" }),
  connectionController.getByConsumerId
);

// get connection by id

// deactivate connection

// activate connection

// get active connections

// get disconnected connections

// get connections by type

export default router;
