import { Router } from "express";
// import processorsRouter from "./processors.js";
import authRouter from "./auth.js";
import processorsRouter from "./processors.js";
import consumerRouter from "./consumers.js";

const router = Router();

router.use(authRouter);
router.use(processorsRouter);
router.use(consumerRouter);

export default router;
