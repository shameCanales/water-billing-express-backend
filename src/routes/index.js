import { Router } from "express";
// import processorsRouter from "./processors.js";
import authRouter from "./auth.js";
import processorsRouter from "./processors.js";
import consumerRouter from "./consumers.js";
import ConnectionRouter from "./connections.js";

const router = Router();

router.use(authRouter);
router.use(processorsRouter);
router.use(ConnectionRouter);
router.use(consumerRouter);

export default router;
