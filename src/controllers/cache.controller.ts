import HttpError from "@exceptions/httpError";
import cacheService from "@services/cache.service";
import { ICache } from "@interfaces/cache.interface";
import { Request, Response, NextFunction } from "express";
import { Document, Types } from "mongoose";
import config from "config";

const getCacheDataById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let existingCache = await cacheService.findCacheById(req.params.id);
    if (!existingCache || existingCache.ttl.getTime() < new Date().getTime()) {
      try {
        const cacheLimit: number = config.get("cacheLimit");
        const { status, message, data } = await cacheService.handleCacheLimit(cacheLimit, true);
        res.status(status).json({ message, data });
      } catch (error) {
        next(error);
      }
    } else {
      existingCache = await cacheService.updateExistingCache(existingCache, true);
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
  let existingCache: Document<unknown, any, ICache> & ICache & { _id: Types.ObjectId };
  try {
    existingCache = await cacheService.findCacheById(req.params.id);
  } catch (error) {
    next(new HttpError("Fetching cache failed, please try again later.", 500));
  }

  if (!existingCache) {
    try {
      const cacheLimit: number = config.get("cacheLimit");
      const { status, message, data } = await cacheService.handleCacheLimit(cacheLimit, false);
      res.status(status).json({ message, data });
    } catch (error) {
      next(error);
    }
  } else {
    // Update existing cache
    try {
      existingCache = await cacheService.updateExistingCache(existingCache, false);
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

export default { getCacheDataById, getAllCacheIds, upsertCacheDataById, deleteCacheById, deleteAllCaches };
