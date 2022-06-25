import express from "express";
import cacheRoutes from "@routes/cache.route";
import notFoundMiddleware from "@middlewares/notFound.middleware";

const router = express.Router();

router.use("/api/cache", cacheRoutes);

router.use("*", notFoundMiddleware);

export default router;
