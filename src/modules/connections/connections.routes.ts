import { Router } from "express";
import {
  AdminAuthMiddleware,
  AuthMiddleware,
} from "../../core/middlewares/auth/auth.middleware.ts";
import { validateObjectIdReusable } from "../../core/middlewares/validateObjectId.ts";
import { addConnectionValidationSchema } from "../../core/middlewares/validationSchemas/addConnectionValidation.ts";
import { editConnectionValidationSchema } from "../../core/middlewares/validationSchemas/editConnectionValidation.ts";
import { checkSchema } from "express-validator";
import { BillController } from "../bills/bill.controller.ts";
import { ConnectionController } from "./connection.controller.ts";

const router = Router();

// Add new connection for a specific consumer
router.post(
  "/",
  AdminAuthMiddleware.requireAuth,
  AdminAuthMiddleware.requireStaffOrManager,
  checkSchema(addConnectionValidationSchema),
  validateObjectIdReusable({ key: "consumer", source: "body" }),
  ConnectionController.create
);

// Get all connections
router.get(
  "/",
  AdminAuthMiddleware.requireAuth,
  AdminAuthMiddleware.requireStaffOrManager,
  ConnectionController.getAll
);

// Get bills for a specific connection
router.get(
  "/:connectionId/bills",
  AuthMiddleware.requireConsumerOrAdmin,
  validateObjectIdReusable({ key: "connectionId" }),
  BillController.getByConnection
);

// edit connection by id
router.patch(
  "/:connectionId",
  AdminAuthMiddleware.requireAuth,
  AdminAuthMiddleware.requireStaffOrManager,
  validateObjectIdReusable({ key: "connectionId" }),
  checkSchema(editConnectionValidationSchema),
  ConnectionController.updateById
);

// delete connection by id
router.delete(
  "/:connectionId",
  AdminAuthMiddleware.requireAuth,
  AdminAuthMiddleware.requireStaffOrManager,
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
