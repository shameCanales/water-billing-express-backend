import mongoose from "mongoose";
import request from "supertest";
import { Application } from "express";
import { createApp } from "../../app/createApp";

describe("/api/processor", () => {
  let app: Application;
  let authenticatedAgent: ReturnType<typeof request.agent>;

  beforeAll(async () => {
    await mongoose
      .connect("mongodb://localhost/water_billing_system_test")
      .then(() => {
        console.log("Connected to TESTING Database");
      })
      .catch((err: Error) => {
        console.log("failed to connect to database", err);
      });

    app = createApp();
    authenticatedAgent = request.agent(app);

    const registerManagerResponse = await authenticatedAgent
      .post("/api/processors/register")
      .send({
        name: "adminadmin",
        email: "admin@test.com",
        password: "@Password123",
      });

    expect(registerManagerResponse.statusCode).toBe(201);

    const loginRes = await authenticatedAgent.post("/api/auth/admin/login").send({
      processorEmail: "admin@test.com",
      processorPassword: "@Password123",
    });
    expect(loginRes.statusCode).toBe(200);
  });

  it("should return 401 when not logged in", async () => {
    const response = await request(app).get("/api/auth/admin/status");
    expect(response.statusCode).toBe(401);
  });

  it("should return authenticated manager when logged in", async () => {
    const response = await authenticatedAgent.get("/api/auth/admin/status");

    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe("admin@test.com");
  });

  it("should add a new processor", async () => {
    const res = await authenticatedAgent.post("/api/processors").send({
      name: "new processor",
      email: "processor@test.com",
      password: "@Newprocessor123",
      role: "staff",
    });

    expect(res.statusCode).toBe(201);
  });

  it("should visit index route", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
});
