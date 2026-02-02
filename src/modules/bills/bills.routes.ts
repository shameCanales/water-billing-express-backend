import { Router } from "express";
import { AuthMiddleware } from "../../core/middlewares/auth/auth.middleware.ts";
import { validateObjectIdReusable } from "../../core/middlewares/validateObjectId.ts";
import { checkSchema } from "express-validator";
import { BillValidationSchema } from "../../core/middlewares/validationSchemas/bill.validation.ts";
import { BillController } from "./bill.controller.ts";

const router = Router();

// Get all bills
router.get(
  "/",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(BillValidationSchema.getAll),
  BillController.getAll,
);

// add bill to a connection
router.post(
  "/",
  AuthMiddleware.requireStaffOrManager,
  validateObjectIdReusable({ source: "body", key: "connection" }),
  checkSchema(BillValidationSchema.add),
  BillController.create,
);

// update bill information
router.patch(
  "/:billId",
  AuthMiddleware.requireStaffOrManager,
  validateObjectIdReusable({ key: "billId" }),
  checkSchema(BillValidationSchema.edit),
  BillController.update,
);

// Update bill status (paid, unpaid, overdue)
router.patch(
  "/:billId/status",
  AuthMiddleware.requireStaffOrManager,
  validateObjectIdReusable({ key: "billId" }),
  BillController.updateStatus,
);

// Delete a bill
router.delete(
  "/:billId",
  AuthMiddleware.requireStaffOrManager,
  validateObjectIdReusable({ key: "billId" }),
  BillController.delete,
);

export default router;
