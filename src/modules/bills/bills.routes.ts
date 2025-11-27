import { Router } from "express";
import { AdminAuthMiddleware } from "../../core/middlewares/adminAuth.middleware.ts";
// import { requireAuthAndStaffOrManager } from "../../core/middlewares/authmiddleware.ts";
import { validateObjectIdReusable } from "../../core/middlewares/validateObjectId.ts";
import { checkSchema } from "express-validator";
import { addBillValidationSchema } from "../../core/middlewares/validationSchemas/addBillValidation.ts";
import { editBillValidationSchema } from "../../core/middlewares/validationSchemas/editBillValidation.ts";
import { BillController } from "./bill.controller.ts";

const router = Router();

// Get all bills
router.get(
  "/",
  AdminAuthMiddleware.requireAuth,
  AdminAuthMiddleware.requireStaffOrManager,
  BillController.getAll
);

// add bill to a connection
router.post(
  "/",
  AdminAuthMiddleware.requireAuth,
  AdminAuthMiddleware.requireStaffOrManager,
  validateObjectIdReusable({ source: "body", key: "connection" }),
  checkSchema(addBillValidationSchema),
  BillController.create
);

// update bill information
router.patch(
  "/:billId",
  AdminAuthMiddleware.requireAuth,
  AdminAuthMiddleware.requireStaffOrManager,
  validateObjectIdReusable({ key: "billId" }),
  checkSchema(editBillValidationSchema),
  BillController.update
);

// Update bill status (paid, unpaid, overdue)
router.patch(
  "/:billId/status",
  AdminAuthMiddleware.requireAuth,
  AdminAuthMiddleware.requireStaffOrManager,
  validateObjectIdReusable({ key: "billId" }),
  BillController.updateStatus
);

// Delete a bill
router.delete(
  "/:billId",
  AdminAuthMiddleware.requireAuth,
  AdminAuthMiddleware.requireStaffOrManager,
  validateObjectIdReusable({ key: "billId" }),
  BillController.delete
);

export default router;
