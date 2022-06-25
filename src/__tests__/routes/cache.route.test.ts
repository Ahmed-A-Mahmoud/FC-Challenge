import app from "../../app";
import request from "supertest";
import { dbConfig } from "@interfaces/db.interface";
import config from "config";
import mongoose from "mongoose";
const { host, port, name }: dbConfig = config.get("dbConfig");

describe("cache", () => {
  beforeAll(() => {
    mongoose.connect(`mongodb://${host}:${port}/${name}`);
  });

  afterAll(() => {
    mongoose.disconnect();
  });

  it("should retrieve caches with success", async () => {
    expect.assertions(2);
    const response = await request(app).get("/api/cache");
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.statusCode).toBe(200);
  });
});
