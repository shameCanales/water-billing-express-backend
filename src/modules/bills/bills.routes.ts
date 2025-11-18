import { Router } from "express";
import { requireAuthAndStaffOrManager } from "../../core/middlewares/authmiddleware.js";
import { validateObjectIdReusable } from "../../core/middlewares/validateObjectId.js";
import { checkSchema } from "express-validator";
import { addBillValidationSchema } from "../../core/middlewares/validationSchemas/addBillValidation.js";
import { editBillValidationSchema } from "../../core/middlewares/validationSchemas/editBillValidation.js";
import { BillController } from "./bill.controller.js";

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
