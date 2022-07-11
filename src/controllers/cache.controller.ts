import HttpError from "@exceptions/httpError";
import cacheService from "@services/cache.service";
import { ICache } from "@interfaces/cache.interface";
import { Request, Response, NextFunction } from "express";
import { Document, Types } from "mongoose";
import config from "config";

const getCacheDataById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    let existingCache = await cacheService.findCacheById(id);
    if (!existingCache) {
      try {
        const cacheLimit: number = config.get("cacheLimit");
        const cacheSize: number = await cacheService.findCacheSize();
        const { status, message, data } = await cacheService.handleCacheLimit(cacheSize, cacheLimit, true, id, null);
        return res.status(status).json({ message, data });
      } catch (error) {
        return next(error);
      }
    } else {
      try {
        const isExpired = existingCache.ttl.getTime() < new Date().getTime();
        existingCache = await cacheService.updateExistingCache(existingCache, isExpired, null);
        return res.json({ message: isExpired ? "Cache miss" : "Cache hit", data: existingCache.data });
      } catch (error) {
        return next(error);
      }
    }
  } catch (error) {
    return next(new HttpError("Fetching cache failed, please try again later", 500));
  }
};

const getAllCacheIds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheIds = await cacheService.findAllCacheIds();
    return res.json({ message: "Retrieved Caches", data: cacheIds });
  } catch (error) {
    return next(error);
  }
};

const upsertCacheDataById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { data: requestData } = req.body;
  let existingCache: Document<unknown, any, ICache> & ICache & { _id: Types.ObjectId };
  try {
    existingCache = await cacheService.findCacheById(id);
  } catch (error) {
    return next(new HttpError("Fetching cache failed, please try again later", 500));
  }

  if (!existingCache) {
    try {
      const cacheLimit: number = config.get("cacheLimit");
      const cacheSize: number = await cacheService.findCacheSize();
      const { status, message, data } = await cacheService.handleCacheLimit(
        cacheSize,
        cacheLimit,
        false,
        id,
        requestData
      );
      return res.status(status).json({ message, data });
    } catch (error) {
      return next(error);
    }
  } else {
    // Update existing cache
    try {
      existingCache = await cacheService.updateExistingCache(existingCache, true, requestData);
      return res.json({ message: "Updated Cache", data: existingCache });
    } catch (error) {
      return next(error);
    }
  }
};

const deleteCacheById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cache = await cacheService.deleteCache(req.params.id);
    if (!cache) {
      throw new HttpError("Invalid cache id, could not find cache", 404);
    }
    return res.status(200).json({ message: "Deleted cache" });
  } catch (error) {
    return next(error);
  }
};

const deleteAllCaches = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await cacheService.clearCache();
    return res.status(200).json({ message: "Cleared cache" });
  } catch (error) {
    return next(error);
  }
};

export default { getCacheDataById, getAllCacheIds, upsertCacheDataById, deleteCacheById, deleteAllCaches };
