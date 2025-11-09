
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
import {
  addNewConnectionToAConsumerHandler,
  deleteConnectionByIdHandler,
  editConnectionByIdHandler,
  getAllConnectionsHandler,
  getConnectionsByConsumerIdHandler,
} from "../controllers/connection.controller.js";

const router = Router();

// Add new connection for a specific consumer
router.post(
  "/api/connections",
  requireAuthAndStaffOrManager,
  checkSchema(addConnectionValidationSchema),
  validateObjectIdReusable({ key: "consumerId" }),
  addNewConnectionToAConsumerHandler
);

// Get all connections
router.get(
  "/api/connections",
  requireAuthAndStaffOrManager,
  getAllConnectionsHandler
);

// edit connection by id
router.patch(
  "/api/connections/:id",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "id" }),
  checkSchema(editConnectionValidationSchema),
  editConnectionByIdHandler
);

// delete connection by id
router.delete(
  "/api/connections/:id",
  requireAuthAndManager,
  validateObjectIdReusable({ key: "id" }),
  deleteConnectionByIdHandler
);

// get connections for a specific consumer
router.get(
  "/api/connections/consumer/:consumerid",
  requireAuth,
  validateObjectIdReusable({ key: "consumerid" }),
  getConnectionsByConsumerIdHandler
);

// get connection by id

// deactivate connection

// activate connection

// get active connections

// get disconnected connections

// get connections by type

export default router;
