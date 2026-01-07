import { Router } from "express";
import { AuthMiddleware } from "../../core/middlewares/auth/auth.middleware.ts";
import { validateObjectIdReusable } from "../../core/middlewares/validateObjectId.ts";
import { ConnectionValidationSchema } from "../../core/middlewares/validationSchemas/connection.validation.ts";
import { checkSchema } from "express-validator";
import { BillController } from "../bills/bill.controller.ts";
import { ConnectionController } from "./connection.controller.ts";

const router = Router();

// Add new connection for a specific consumer
router.post(
  "/",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(ConnectionValidationSchema.add),
  validateObjectIdReusable({ key: "consumer", source: "body" }),
  ConnectionController.create
);

// Get all connections
router.get(
  "/",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(ConnectionValidationSchema.getAll),
  ConnectionController.getAll
);

// Get bills for a specific connection
router.get(
  "/:connectionId/bills",
  AuthMiddleware.requireAnyUser,
  validateObjectIdReusable({ key: "connectionId" }),
  BillController.getByConnection
);

// edit connection by id
router.patch(
  "/:connectionId",
  AuthMiddleware.requireStaffOrManager,
  validateObjectIdReusable({ key: "connectionId" }),
  checkSchema(ConnectionValidationSchema.edit),
  ConnectionController.updateById
);

// delete connection by id
router.delete(
  "/:connectionId",
  AuthMiddleware.requireStaffOrManager,
  validateObjectIdReusable({ key: "connectionId" }),
  ConnectionController.deleteById
);

// get connection by id

// update connection status

// get active connections

// get disconnected connections

// get connections by type

export default router;
