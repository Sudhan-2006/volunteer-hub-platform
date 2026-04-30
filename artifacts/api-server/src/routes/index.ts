import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import requestsRouter from "./requests";
import applicationsRouter from "./applications";
import volunteersRouter from "./volunteers";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(requestsRouter);
router.use(applicationsRouter);
router.use(volunteersRouter);
router.use(dashboardRouter);
router.use(adminRouter);

export default router;
