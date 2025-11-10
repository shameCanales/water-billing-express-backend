import { Router } from "express";
// import processorsRouter from "./processors.js";
import authRouter from "./auth.routes.js";
import processorsRouter from "./processors.routes.js";
import consumerRouter from "./consumers.routes.js";
import ConnectionRouter from "./connections.routes.js";
import BillRouter from "./bills.routes.js";

const router = Router();

router.use(authRouter);
router.use(processorsRouter);
router.use(ConnectionRouter);
router.use(consumerRouter);
router.use(BillRouter);

export default router;
