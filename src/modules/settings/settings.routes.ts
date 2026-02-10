import { Router } from "express";
import { AuthMiddleware } from "../../core/middlewares/auth/auth.middleware.ts";
import { SettingsController } from "./settings.controller.ts";

const router = Router();

router.get("/chargePerCubicMeter", SettingsController.getChargePerCubicMeter);

router.patch(
  "/chargePerCubicMeter",
  SettingsController.updateChargePerCubicMeter,
);

export default router;
