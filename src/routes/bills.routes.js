import { Bill } from "../models/bill.model.js";
import { Connection } from "../models/connection.model.js";
import { Router } from "express";
import {
  requireAuth,
  requireAuthAndStaffOrManager,
} from "../middlewares/authmiddleware.js";
import { BILLING_SETTINGS } from "../config/settings.js";
import { validateObjectIdReusable } from "../middlewares/validateObjectId.js";
import { checkSchema, validationResult } from "express-validator";
import { addBillValidationSchema } from "../middlewares/validationSchemas/addBillValidation.js";
import { editBillValidationSchema } from "../middlewares/validationSchemas/editBillValidation.js";
import {
  addBillToConnectionHandler,
  getAllBillsHandler,
  getBillsByConnectionIdHandler,
  updateBillInformationByIdHandler,
  updateBillStatusByIdHandler,
} from "../controllers/bill.controller.js";

const router = Router();

// Get all bills
router.get("/api/bills", requireAuthAndStaffOrManager, getAllBillsHandler);

// add bill to a connection
router.post(
  "/api/bills",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ source: "body", key: "connection" }),
  checkSchema(addBillValidationSchema),
  addBillToConnectionHandler
);

// Get bills for a specific connection
router.get(
  "/api/connections/:connectionId/bills",
  requireAuth,
  validateObjectIdReusable({ key: "connectionId" }),
  getBillsByConnectionIdHandler
);

// update bill information
router.patch(
  "/api/bills/:billId",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "billId" }),
  checkSchema(editBillValidationSchema),
  updateBillInformationByIdHandler
);

// Update bill status (paid, unpaid, overdue)
router.patch(
  "/api/bills/:billId/status",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "billId" }),
  updateBillStatusByIdHandler
);

// Delete a bill
router.delete(
  "/api/bills/:billId",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "billId" })
);

export default router;
