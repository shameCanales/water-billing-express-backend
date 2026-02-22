import { Router } from "express";
import { AuthMiddleware } from "../../core/middlewares/auth/auth.middleware.ts";
import { checkSchema } from "express-validator";
import { BillValidationSchema } from "../../core/middlewares/validationSchemas/bill.validation.ts";
import { BillController } from "./bill.controller.ts";
import { handleValidationErrors } from "../../core/middlewares/validation/validate.middleware.ts";

const router = Router();

// Get all bills
router.get(
  "/",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(BillValidationSchema.getAll),
  handleValidationErrors,
  BillController.getAll,
);

// add bill to a connection
router.post(
  "/",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(BillValidationSchema.add),
  handleValidationErrors,
  BillController.create,
);

// update bill information
router.patch(
  "/:billId",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(BillValidationSchema.edit),
  handleValidationErrors,
  BillController.update,
);

// Update bill status (paid, unpaid, overdue)
router.patch(
  "/:billId/status",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(BillValidationSchema.editStatus),
  handleValidationErrors,
  BillController.updateStatus,
);
// add validation schema here

// Delete a bill
router.delete(
  "/:billId",
  AuthMiddleware.requireStaffOrManager,
  checkSchema(BillValidationSchema.idOnly),
  handleValidationErrors,
  BillController.delete,
);

export default router;
