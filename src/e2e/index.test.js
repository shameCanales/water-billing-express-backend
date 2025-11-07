import mongoose from "mongoose";
import request from "supertest";
import { createApp } from "../createApp";

describe("/api/auth", () => {
  let app;

  beforeAll(() => {
    mongoose
      .connect("mongodb://localhost/water_billing_system_test")
      .then(() => {
        console.log("Connected to TESTING Database");
      })
      .catch((err) => {
        console.log("failed to connect to database", err);
      });

    app = createApp();
  });

  it("should return 401 when not logged in", async () => {
    const response = await request(app).get("/api/auth/status");
    expect(response.statusCode).toBe(401);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
});
