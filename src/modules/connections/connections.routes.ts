import { Router } from "express";
import { AuthMiddleware } from "../../core/middlewares/auth/auth.middleware.ts";
import { ConnectionValidationSchema } from "../../core/middlewares/validationSchemas/connection.validation.ts";
import { checkSchema } from "express-validator";
import { BillController } from "../bills/bill.controller.ts";
import { ConnectionController } from "./connection.controller.ts";
import { handleValidationErrors } from "../../core/middlewares/validation/validate.middleware.ts";

const router = Router();

// Add new connection for a specific consumer
router.post(
  "/",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(ConnectionValidationSchema.add),
  handleValidationErrors,
  ConnectionController.create,
);

// Get all connections
router.get(
  "/",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(ConnectionValidationSchema.getAll),
  handleValidationErrors,
  ConnectionController.getAll,
);

// Get bills for a specific connection
router.get(
  "/:connectionId/bills",
  AuthMiddleware.requireAnyUser,
  checkSchema(ConnectionValidationSchema.idOnly),
  handleValidationErrors,
  BillController.getByConnection,
);

// edit connection by id
router.patch(
  "/:connectionId",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(ConnectionValidationSchema.edit),
  handleValidationErrors,
  ConnectionController.updateById,
);

//update connection status by id (activate | disconnect)
router.patch(
  "/:connectionId/status",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(ConnectionValidationSchema.editStatus),
  handleValidationErrors,
  ConnectionController.updateStatusById,
); // all goods

// delete connection by id
router.delete(
  "/:connectionId",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(ConnectionValidationSchema.delete),
  handleValidationErrors,
  ConnectionController.deleteById,
);

// get connection by id
router.get(
  "/:connectionId",
  AuthMiddleware.requireAnyUser,
  checkSchema(ConnectionValidationSchema.idOnly),
  handleValidationErrors,
  ConnectionController.getById,
);

export default router;
