import { Router } from "express";
import {
  requireAuth,
  requireAuthAndStaffOrManager,
} from "../middlewares/authmiddleware.js";
import { validateObjectIdReusable } from "../middlewares/validateObjectId.js";
import { checkSchema } from "express-validator";
import { addBillValidationSchema } from "../middlewares/validationSchemas/addBillValidation.js";
import { editBillValidationSchema } from "../middlewares/validationSchemas/editBillValidation.js";
import { BillController } from "../controllers/bill.controller.js";

const router = Router();

// Get all bills
router.get("/api/bills", requireAuthAndStaffOrManager, BillController.getAll);

// add bill to a connection
router.post(
  "/api/bills",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ source: "body", key: "connection" }),
  checkSchema(addBillValidationSchema),
  BillController.create
);

// Get bills for a specific connection
router.get(
  "/api/connections/:connectionId/bills",
  requireAuth,
  validateObjectIdReusable({ key: "connectionId" }),
  BillController.getByConnection
);

// update bill information
router.patch(
  "/api/bills/:billId",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "billId" }),
  checkSchema(editBillValidationSchema),
  BillController.update
);

// Update bill status (paid, unpaid, overdue)
router.patch(
  "/api/bills/:billId/status",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "billId" }),
  BillController.updateStatus
);

// Delete a bill
router.delete(
  "/api/bills/:billId",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "billId" }),
  BillController.delete
);

export default router;
