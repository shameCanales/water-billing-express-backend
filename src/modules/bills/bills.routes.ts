import { Router } from "express";
import { requireAuthAndStaffOrManager } from "../../core/middlewares/authmiddleware.ts";
import { validateObjectIdReusable } from "../../core/middlewares/validateObjectId.ts";
import { checkSchema } from "express-validator";
import { addBillValidationSchema } from "../../core/middlewares/validationSchemas/addBillValidation.ts";
import { editBillValidationSchema } from "../../core/middlewares/validationSchemas/editBillValidation.ts";
import { BillController } from "./bill.controller.ts";

const router = Router();

// Get all bills
router.get("/", requireAuthAndStaffOrManager, BillController.getAll);

// add bill to a connection
router.post(
  "/",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ source: "body", key: "connection" }),
  checkSchema(addBillValidationSchema),
  BillController.create
);

// update bill information
router.patch(
  "/:billId",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "billId" }),
  checkSchema(editBillValidationSchema),
  BillController.update
);

// Update bill status (paid, unpaid, overdue)
router.patch(
  "/:billId/status",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "billId" }),
  BillController.updateStatus
);

// Delete a bill
router.delete(
  "/:billId",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "billId" }),
  BillController.delete
);

export default router;
