import app from "../app";
import request from "supertest";
import HttpError from "@exceptions/httpError";

jest.mock("@middlewares/notFound.middleware", () => ({
  __esModule: true,
  default: jest.fn(() => {
    throw new HttpError(undefined, undefined);
  }),
}));

describe("Error middleware", () => {
  it("should return default error", async () => {
    const response = await request(app).options("/");
    expect(response.body.message).toBe("An unknown error occurred!");
    expect(response.statusCode).toBe(500);
  });

  it("should pass the error using next function", async () => {
    const response = await request(app).options("/");
    expect(response.body.message).toBe("An unknown error occurred!");
    expect(response.statusCode).toBe(500);
  });
});
