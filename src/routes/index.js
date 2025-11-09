import { Router } from "express";
// import processorsRouter from "./processors.js";
import authRouter from "./auth.route.js";
import processorsRouter from "./processors.route.js";
import consumerRouter from "./consumers.route.js";
import ConnectionRouter from "./connections.route.js";
import BillRouter from "./bills.route.js";

const router = Router();

router.use(authRouter);
router.use(processorsRouter);
router.use(ConnectionRouter);
router.use(consumerRouter);
router.use(BillRouter);

export default router;
