import express from "express";
import cacheController from "@controllers/cache.controller";
const router = express.Router();

router.get("/:id", cacheController.getCacheDataById);
router.get("/", cacheController.getAllCacheIds);

router.post("/:id", cacheController.upsertCacheDataById);

router.delete("/:id", cacheController.deleteCacheById);
router.delete("/", cacheController.deleteAllCaches);

export default router;
