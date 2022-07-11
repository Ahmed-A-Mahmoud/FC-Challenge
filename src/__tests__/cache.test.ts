import app from "../app";
import request from "supertest";
import db from "./config/db";
import cacheService from "@services/cache.service";

describe("Cache - Success (Database Connected)", () => {
  beforeAll(async () => await db.connect());

  afterEach(async () => await db.clearDatabase());

  afterAll(async () => await db.closeDatabase());

  it("should create a new cache", async () => {
    const response = await request(app).post("/api/cache/123").send({ data: "New Cache" });
    expect(response.body.data.data).toBe("New Cache");
    expect(response.statusCode).toBe(201);
  });

  it("should update the oldest updated cache when cache limit is exceeded", async () => {
    await request(app).post("/api/cache/1").send({ data: "New Cache 1" });
    await request(app).post("/api/cache/2").send({ data: "New Cache 2" });
    await request(app).post("/api/cache/3").send({ data: "New Cache 3" });
    const response = await request(app).post("/api/cache/4").send({ data: "Updated Cache 1" });
    expect(response.body.data.data).toBe("Updated Cache 1");
    expect(response.statusCode).toBe(200);
  });

  it("should update an existing cache", async () => {
    await request(app).post("/api/cache/123").send({ data: "New Cache" });
    const response = await request(app).post("/api/cache/123").send({ data: "Updated Cache" });
    expect(response.body.data.data).toBe("Updated Cache");
    expect(response.statusCode).toBe(200);
  });

  it("should retrieve caches", async () => {
    const response = await request(app).get("/api/cache");
    expect(response.statusCode).toBe(200);
  });

  it("should get a cache by id (Cache miss - non-existing)", async () => {
    const response = await request(app).get("/api/cache/123");
    expect(response.statusCode).toBe(201);
  });

  it("should get a cache by id (Cache miss - non-existing) exceeding cache limit", async () => {
    await request(app).post("/api/cache/1").send({ data: "New Cache 1" });
    await request(app).post("/api/cache/2").send({ data: "New Cache 2" });
    await request(app).post("/api/cache/3").send({ data: "New Cache 3" });
    const response = await request(app).get("/api/cache/4");
    expect(response.statusCode).toBe(200);
  });

  it("should get a cache by id (Cache miss - TTL expired)", async () => {
    await request(app).post("/api/cache/123");
    const existingCache = await cacheService.findCacheById("123");
    // Expiring TTL of cache
    existingCache.ttl = new Date(existingCache.ttl.setMinutes(existingCache.ttl.getMinutes() - 1));
    jest.spyOn(cacheService, "findCacheById").mockResolvedValueOnce(existingCache);
    const response = await request(app).get("/api/cache/123");
    expect(response.statusCode).toBe(200);
  });

  it("should get a cache by id (Cache hit)", async () => {
    await request(app).post("/api/cache/123");
    const response = await request(app).get("/api/cache/123");
    expect(response.statusCode).toBe(200);
  });

  it("should delete a cache by id", async () => {
    await request(app).post("/api/cache/123");
    const response = await request(app).delete("/api/cache/123");
    expect(response.statusCode).toBe(200);
  });

  it("should not delete a non-existing cache", async () => {
    const response = await request(app).delete("/api/cache/123");
    expect(response.statusCode).toBe(404);
  });

  it("should clear cache", async () => {
    const response = await request(app).delete("/api/cache");
    expect(response.statusCode).toBe(200);
  });
});

describe("Cache - Failure (Database disconnected)", () => {
  it("should not create a new cache (Can not get existing cache by Id)", async () => {
    const response = await request(app).post("/api/cache/123").send({ data: "New Cache" });
    expect(response.statusCode).toBe(500);
  });

  it("should not create a new cache (Can not get cache size)", async () => {
    jest.spyOn(cacheService, "findCacheById").mockResolvedValueOnce(null);
    const response = await request(app).post("/api/cache/123").send({ data: "New Cache" });
    expect(response.statusCode).toBe(500);
  });

  it("should not create a new cache", async () => {
    await db.connect();
    await request(app).post("/api/cache/1").send({ data: "New Cache 1" });
    await db.closeDatabase();
    jest.spyOn(cacheService, "findCacheById").mockResolvedValueOnce(null);
    jest.spyOn(cacheService, "findCacheSize").mockResolvedValueOnce(1);
    const response = await request(app).post("/api/cache/2").send({ data: "New Cache 2" });
    expect(response.statusCode).toBe(500);
  });

  it("should not update the oldest updated cache when cache limit is exceeded", async () => {
    await db.connect();
    await request(app).post("/api/cache/1").send({ data: "New Cache 1" });
    await request(app).post("/api/cache/2").send({ data: "New Cache 2" });
    await request(app).post("/api/cache/3").send({ data: "New Cache 3" });
    await db.closeDatabase();
    jest.spyOn(cacheService, "findCacheById").mockResolvedValueOnce(null);
    jest.spyOn(cacheService, "findCacheSize").mockResolvedValueOnce(3);
    const response = await request(app).post("/api/cache/4").send({ data: "Updated Cache 1" });
    expect(response.statusCode).toBe(500);
  });

  it("should not update existing cache", async () => {
    await db.connect();
    await request(app).post("/api/cache/123");
    const existingCache = await cacheService.findCacheById("123");
    await db.closeDatabase();
    jest.spyOn(cacheService, "findCacheById").mockResolvedValueOnce(existingCache);
    const response = await request(app).post("/api/cache/123").send({ data: "New Cache" });
    expect(response.statusCode).toBe(500);
  });

  it("should not retrieve caches", async () => {
    const response = await request(app).get("/api/cache");
    expect(response.statusCode).toBe(500);
  });

  it("should not get a cache by id", async () => {
    const response = await request(app).get("/api/cache/123");
    expect(response.statusCode).toBe(500);
  });

  it("should not get a cache by id (Can not get cache size)", async () => {
    jest.spyOn(cacheService, "findCacheById").mockResolvedValueOnce(null);
    const response = await request(app).get("/api/cache/123");
    expect(response.statusCode).toBe(500);
  });

  it("should not get a cache by id (Existing cache)", async () => {
    await db.connect();
    await request(app).post("/api/cache/123");
    const existingCache = await cacheService.findCacheById("123");
    await db.closeDatabase();
    jest.spyOn(cacheService, "findCacheById").mockResolvedValueOnce(existingCache);
    const response = await request(app).get("/api/cache/123");
    expect(response.statusCode).toBe(500);
  });

  it("should not delete a cache by id", async () => {
    await request(app).post("/api/cache/123");
    const response = await request(app).delete("/api/cache/123");
    expect(response.statusCode).toBe(500);
  });

  it("should not clear cache", async () => {
    const response = await request(app).delete("/api/cache");
    expect(response.statusCode).toBe(500);
  });
});
