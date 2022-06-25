import HttpError from "@exceptions/httpError";
import { Cache } from "@models/cache.model";
import { generateRandomString, generateTtl } from "@utils/helper";

const createNewCache = async () => {
  try {
    const createdCache = new Cache({
      data: generateRandomString(),
      ttl: generateTtl(),
    });

    await createdCache.save();
    return createdCache;
  } catch (error) {
    throw new HttpError("Creating cache failed, please try again later.", 500);
  }
};

const updateExistingCache = async (existingCache: any) => {
  try {
    existingCache.data = generateRandomString();
    await existingCache.save();
    return existingCache;
  } catch (error) {
    throw new HttpError("Updating cache failed, please try again later.", 500);
  }
};

const updateOldestCache = async () => {
  try {
    const oldestCache = await Cache.findOne({}, {}, { sort: { updatedAt: 1 } });
    oldestCache.data = generateRandomString();
    await oldestCache.save();
    return oldestCache;
  } catch (error) {
    throw new HttpError("Updating cache failed, please try again later.", 500);
  }
};

const findAllCacheIds = async () => {
  try {
    const cacheIds = await Cache.find({}, "id");
    return cacheIds;
  } catch (error) {
    throw new HttpError("Fetching cache ids failed, please try again later.", 500);
  }
};

const deleteCache = async (id: string) => {
  try {
    const cache = await Cache.findByIdAndDelete(id);
  } catch (error) {
    throw new HttpError("Something went wrong, could not delete cache.", 500);
  }
};

const clearCache = async () => {
  try {
    await Cache.deleteMany();
  } catch (error) {
    throw new HttpError("Something went wrong, could not delete cache.", 500);
  }
};

export default { createNewCache, updateExistingCache, updateOldestCache, findAllCacheIds, deleteCache, clearCache };
