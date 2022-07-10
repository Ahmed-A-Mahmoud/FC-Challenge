import HttpError from "@exceptions/httpError";
import { generateRandomString, generateTtl } from "@utils/helper";
import { NextFunction, Request, Response } from "express";
import config from "config";
import cacheService from "@services/cache.service";

const getCacheDataById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existingCache = await cacheService.findCacheById(req.params.id);
    if (!existingCache) {
      handleCacheLimitForMiss(req, res, next);
    } else {
      if (existingCache.ttl.getTime() < new Date().getTime()) {
        existingCache.data = generateRandomString();
        existingCache.ttl = generateTtl();
        await existingCache.save();
      }

      res.json({ message: "Cache hit", data: existingCache.data });
    }
  } catch (error) {
    next(new HttpError("Fetching cache failed, please try again later.", 500));
  }
};

const getAllCacheIds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheIds = await cacheService.findAllCacheIds();
    res.json({ message: "Retrieved Caches", data: cacheIds });
  } catch (error) {
    next(error);
  }
};

const upsertCacheDataById = async (req: Request, res: Response, next: NextFunction) => {
  let existingCache: any;
  try {
    existingCache = await cacheService.findCacheById(req.params.id);
  } catch (error) {
    next(new HttpError("Fetching cache failed, please try again later.", 500));
  }

  if (!existingCache) {
    handleCacheLimit(req, res, next);
  } else {
    // Update
    try {
      existingCache = await cacheService.updateExistingCache(existingCache);
      res.json({ message: "Updated Cache", data: existingCache });
    } catch (error) {
      next(error);
    }
  }
};

const deleteCacheById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cache = await cacheService.deleteCache(req.params.id);
    if (!cache) {
      throw new HttpError("Invalid cache id, could not find cache.", 404);
    }
    res.status(200).json({ message: "Deleted cache." });
  } catch (error) {
    next(error);
  }
};

const deleteAllCaches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await cacheService.clearCache();
    res.status(200).json({ message: "Cleared cache." });
  } catch (error) {
    next(error);
  }
};

const handleCacheLimit = async (req: Request, res: Response, next: NextFunction) => {
  const cacheSize: number = await cacheService.findCacheSize();

  if (cacheSize >= config.get("cacheLimit")) {
    // Find oldest created cache entry using updated_at timestamp and update it
    try {
      const oldestCache = await cacheService.updateOldestCache();
      res.json({ message: "Updated Cache", data: oldestCache });
    } catch (error) {
      next(error);
    }
  } else {
    // Creation
    try {
      const createdCache = await cacheService.createNewCache();
      res.status(201).json({ message: "Created Cache", data: createdCache });
    } catch (error) {
      next(error);
    }
  }
};

const handleCacheLimitForMiss = async (req: Request, res: Response, next: NextFunction) => {
  const cacheSize: number = await cacheService.findCacheSize();

  if (cacheSize >= config.get("cacheLimit")) {
    // Find oldest created cache entry using updated_at timestamp and update it
    try {
      const oldestCache = await cacheService.updateOldestCache();
      res.json({ message: "Cache miss", data: oldestCache.data });
    } catch (error) {
      next(error);
    }
  } else {
    // Creation
    try {
      const createdCache = await cacheService.createNewCache();
      res.status(201).json({ message: "Cache miss", data: createdCache.data });
    } catch (error) {
      next(error);
    }
  }
};
export default { getCacheDataById, getAllCacheIds, upsertCacheDataById, deleteCacheById, deleteAllCaches };
