import HttpError from "@exceptions/httpError";
import { ICache } from "@interfaces/cache.interface";
import { Cache } from "@models/cache.model";
import { generateRandomString, generateTtl } from "@utils/helper";
import { Document, Types } from "mongoose";

const createNewCache = async (id: string, requestData: string) => {
  try {
    const createdCache = new Cache({
      _id: id,
      data: requestData || generateRandomString(),
      ttl: generateTtl(),
    });
    await createdCache.save();
    return createdCache;
  } catch (error) {
    throw new HttpError("Creating cache failed, please try again later", 500);
  }
};

const updateExistingCache = async (
  existingCache: Document<unknown, any, ICache> & ICache & { _id: Types.ObjectId },
  isExpired: boolean,
  requestData: string
) => {
  try {
    if (isExpired) {
      existingCache.data = requestData || generateRandomString();
    }
    existingCache.ttl = generateTtl();
    await existingCache.save();
    return existingCache;
  } catch (error) {
    throw new HttpError("Updating cache failed, please try again later", 500);
  }
};

const findCacheById = async (id: string) => {
  try {
    const existingCache = await Cache.findById(id);
    return existingCache;
  } catch (error) {
    throw new HttpError("Fetching cache failed, please try again later", 500);
  }
};

const findAllCacheIds = async () => {
  try {
    const cacheIds = await Cache.find({}, "id");
    return cacheIds;
  } catch (error) {
    throw new HttpError("Fetching cache ids failed, please try again later", 500);
  }
};

const findCacheSize = async () => {
  try {
    const cacheSize = await Cache.countDocuments();
    return cacheSize;
  } catch (error) {
    throw new HttpError("Fetching cache size failed, please try again later", 500);
  }
};

const handleCacheLimit = async (
  cacheSize: number,
  cacheLimit: number,
  isCacheMiss: boolean,
  id: string,
  requestData: string
) => {
  if (cacheSize >= cacheLimit) {
    // Update oldest updated cache entry using updated_at timestamp
    let oldestCache: Document<unknown, any, ICache> & ICache & { _id: Types.ObjectId };
    try {
      oldestCache = await Cache.findOne({}, {}, { sort: { updatedAt: 1 } });
    } catch (error) {
      throw new HttpError("Updating cache failed, please try again later", 500);
    }
    const updatedCache = await updateExistingCache(oldestCache, true, requestData);
    return {
      status: 200,
      message: isCacheMiss ? "Cache miss" : "Updated Cache",
      data: isCacheMiss ? updatedCache.data : updatedCache,
    };
  } else {
    // Create new cache entry
    const createdCache = await createNewCache(id, requestData);
    return {
      status: 201,
      message: isCacheMiss ? "Cache miss" : "Created Cache",
      data: isCacheMiss ? createdCache.data : createdCache,
    };
  }
};

const deleteCache = async (id: string) => {
  try {
    const cache = await Cache.findByIdAndDelete(id);
    return cache;
  } catch (error) {
    throw new HttpError("Deleting cache failed, please try again later", 500);
  }
};

const clearCache = async () => {
  try {
    await Cache.deleteMany();
  } catch (error) {
    throw new HttpError("Clearing cache failed, please try again later", 500);
  }
};

export default {
  createNewCache,
  updateExistingCache,
  findCacheById,
  findAllCacheIds,
  findCacheSize,
  handleCacheLimit,
  deleteCache,
  clearCache,
};
