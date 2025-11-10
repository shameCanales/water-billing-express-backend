import mongoose from "mongoose";
import request from "supertest";
import { createApp } from "../../createApp";

describe("/api/processor", () => {
  let app;
  let cookie;

  beforeAll(async () => {
    await mongoose
      .connect("mongodb://localhost/water_billing_system_test")
      .then(() => {
        console.log("Connected to TESTING Database");
      })
      .catch((err) => {
        console.log("failed to connect to database", err);
      });

    app = createApp();

    const registerManagerResponse = await request(app)
      .post("/api/processor/register")
      .send({
        name: "adminadmin",
        email: "admin@test.com",
        password: "password123",
      });

    expect(registerManagerResponse.statusCode).toBe(201);

    const loginRes = await request(app).post("/api/auth/login").send({
      processorEmail: "admin@test.com",
      processorPassword: "password123",
    });
    expect(loginRes.statusCode).toBe(200);

    cookie = loginRes.headers["set-cookie"];
  });

  it("should return 401 when not logged in", async () => {
    const response = await request(app).get("/api/auth/status");
    expect(response.statusCode).toBe(401);
  });

  it("should return authenticated manager when logged in", async () => {
    const response = await request(app)
      .get("/api/auth/status")
      .set("Cookie", cookie);

    expect(response.statusCode).toBe(200);
    expect(response.body.email).toBe("admin@test.com");
  });

  // this requires login
  it("should add a new processor", async () => {
    const res = await request(app)
      .post("/api/processors")
      .set("Cookie", cookie)
      .send({
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

// it("should register a new manager", async () => {
//   const res = await request(app).post("/api/processor/register").send({
//     name: "adminadmin",
//     email: "admin@test.com",
//     password: "password123",
//   });

//   expect(res.statusCode).toBe(201);
// });
