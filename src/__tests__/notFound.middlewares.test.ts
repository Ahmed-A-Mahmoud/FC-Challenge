import app from "../app";
import request from "supertest";

describe("Not Found middleware", () => {
  it("should be intercepted by wild card route", async () => {
    const response = await request(app).options("/");
    expect(response.statusCode).toBe(404);
  });
});
