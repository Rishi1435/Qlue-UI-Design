import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth.js";
import resumesRouter from "./resumes.js";
import sessionsRouter from "./sessions.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/resumes", resumesRouter);
router.use("/sessions", sessionsRouter);

export default router;
