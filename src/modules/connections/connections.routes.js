import { Router } from "express";
import {
  requireAuthAndStaffOrManager,
  requireAuth,
  requireAuthAndManager,
} from "../../core/middlewares/authmiddleware.js";
import { validateObjectIdReusable } from "../../core/middlewares/validateObjectId.js";
import { addConnectionValidationSchema } from "../../core/middlewares/validationSchemas/addConnectionValidation.js";
import { editConnectionValidationSchema } from "../../core/middlewares/validationSchemas/editConnectionValidation.js";
import { checkSchema } from "express-validator";
import { BillController } from "../bills/bill.controller.js";
import { ConnectionController } from "./connection.controller.js";

const router = Router();

// Add new connection for a specific consumer
router.post(
  "/",
  requireAuthAndStaffOrManager,
  checkSchema(addConnectionValidationSchema),
  validateObjectIdReusable({ key: "consumer", source: "body" }),
  ConnectionController.create
);

// Get all connections
router.get("/", requireAuthAndStaffOrManager, ConnectionController.getAll);

// Get bills for a specific connection
router.get(
  "/:connectionId/bills",
  requireAuth,
  validateObjectIdReusable({ key: "connectionId" }),
  BillController.getByConnection
);

// edit connection by id
router.patch(
  "/:connectionId",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "connectionId" }),
  checkSchema(editConnectionValidationSchema),
  ConnectionController.updateById
);

// delete connection by id
router.delete(
  "/:connectionId",
  requireAuthAndManager,
  validateObjectIdReusable({ key: "connectionId" }),
  ConnectionController.deleteById
);



// get connection by id

// deactivate connection

// activate connection

// get active connections

// get disconnected connections

// get connections by type

export default router;
