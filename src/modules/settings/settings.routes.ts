import { Router } from "express";
import { AuthMiddleware } from "../../core/middlewares/auth/auth.middleware.ts";
import { SettingsController } from "./settings.controller.ts";

const router = Router();

router.get(
  "/chargePerCubicMeter",
  AuthMiddleware.requireStaffOrManager,
  SettingsController.getChargePerCubicMeter,
);

router.patch(
  "/chargePerCubicMeter",
  AuthMiddleware.requireManager,
  SettingsController.updateChargePerCubicMeter,
);

export default router;
