import { Router } from "express";

const router = Router();

router.post("/login", () => console.log("Login endpoint"));
router.get("/status", () => console.log("Status endpoint"));
router.post("/logout", () => console.log("Logout endpoint"));

export default router;
