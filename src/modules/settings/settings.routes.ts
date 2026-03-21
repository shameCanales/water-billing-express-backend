import { Router } from "express";
import { AuthMiddleware } from "../../core/middlewares/auth/auth.middleware.js";
import { SettingsController } from "./settings.controller.js";
import { checkSchema } from "express-validator";
import { SettingsValidationSchema } from "../../core/middlewares/validationSchemas/settings.validation.js";
import { handleValidationErrors } from "../../core/middlewares/validation/validate.middleware.js";

const router = Router();

router.get(
  "/",
  AuthMiddleware.requireStaffOrManager,
  SettingsController.getSettings,
);

router.get(
  "/history/:key",
  AuthMiddleware.requireStaffOrManager,
  SettingsController.getHistory,
);

router.patch(
  "/",
  AuthMiddleware.requireManager,
  checkSchema(SettingsValidationSchema.updateSetting),
  handleValidationErrors,
  SettingsController.updateSetting,
);

export default router;