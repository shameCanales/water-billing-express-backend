import { Router } from "express";
import { AuthMiddleware } from "../../core/middlewares/auth/auth.middleware.ts";
import { SettingsController } from "./settings.controller.ts";
import { checkSchema } from "express-validator";
import { SettingsValidationSchema } from "../../core/middlewares/validationSchemas/settings.validation.ts";

const router = Router();


router.get(
  "/",
  AuthMiddleware.requireStaffOrManager,
  SettingsController.getSettings,
);

router.patch(
  "/",
  AuthMiddleware.requireManager,
  checkSchema(SettingsValidationSchema.updateSetting),
  SettingsController.updateSetting,
);

router.get(
  "/history/:key",
  AuthMiddleware.requireStaffOrManager,
  SettingsController.getHistory,
);



export default router;
