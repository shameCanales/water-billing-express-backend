import { Router } from "express";
import { SharedController } from "./shared.controller.js";
import { AuthMiddleware } from "../../core/middlewares/auth/auth.middleware.js";

const router = Router();

router.get("/me", AuthMiddleware.requireAnyUser, SharedController.getMe);

export default router;
