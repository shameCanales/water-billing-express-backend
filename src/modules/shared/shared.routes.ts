import { Router } from "express";
import { SharedController } from "./shared.controller.ts";
import { AuthMiddleware } from "../../core/middlewares/auth/auth.middleware.ts";

const router = Router();

router.get("/me", AuthMiddleware.requireAnyUser, SharedController.getMe);

export default router;
