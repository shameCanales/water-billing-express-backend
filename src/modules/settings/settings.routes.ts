import { Router } from "express";
import { AuthMiddleware } from "../../core/middlewares/auth/auth.middleware.ts";
import { SettingsController } from "./settings.controller.ts";
import { checkSchema } from "express-validator";
import { SettingsValidationSchema } from "../../core/middlewares/validationSchemas/settings.validation.ts";

const router = Router();

router.get(
  "/chargePerCubicMeter",
  AuthMiddleware.requireStaffOrManager,
  SettingsController.getChargePerCubicMeter,
);

router.patch(
  "/chargePerCubicMeter",
  AuthMiddleware.requireManager,
  checkSchema(SettingsValidationSchema.updateChargePercubicMeter),
  SettingsController.updateChargePerCubicMeter,
);

export default router;
