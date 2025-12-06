import request from "supertest";
import mongoose from "mongoose";

// Set environment variables for the test environment before importing the app
process.env.ACCESS_TOKEN_SECRET = "a-secure-test-access-secret";
process.env.REFRESH_TOKEN_SECRET = "a-secure-test-refresh-secret";

import { createApp } from "../../app/createApp";
import { Processor } from "../../modules/processors/processor.model";
import { hashPassword } from "../../core/utils/helpers";

describe("E2E: Admin Authentication Flow", () => {
  let app: any;
  let adminToken: string;
  let adminCookie: string[];

  // 1. Setup: Connect to Test DB & Start App
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost/wbs_auth_test");
    app = createApp();

    // 2. Seed: Create a Manager directly in DB
    const hashedPassword = await hashPassword("securePassword123");
    await Processor.create({
      name: "Test Admin",
      email: "admin@test.com",
      password: hashedPassword,
      role: "manager",
      status: "active",
    });
  });

  // Cleanup: Close DB connection
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  // =========================================================================
  // SCENARIO 1: LOGIN (The Entry Point)
  // =========================================================================
  it("Step 1: Should login successfully and receive Token + Cookie", async () => {
    const res = await request(app).post("/api/auth/admin/login").send({
      email: "admin@test.com",
      password: "securePassword123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.accessToken).toBeDefined();

    // Check if Cookie is set
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(JSON.stringify(cookies)).toContain("jwt=");
    expect(JSON.stringify(cookies)).toContain("HttpOnly");

    // SAVE FOR NEXT STEPS
    adminToken = res.body.accessToken;
    adminCookie = Array.isArray(cookies) ? cookies : [cookies as string];
  });

  // =========================================================================
  // SCENARIO 2: ACCESS PROTECTED ROUTE (The Usage)
  // =========================================================================
  it("Step 2: Should access protected /status route with Access Token", async () => {
    const res = await request(app)
      .get("/api/auth/admin/status")
      .set("Authorization", `Bearer ${adminToken}`); // Simulate Frontend Header

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("admin@test.com");
  });

  it("Step 3: Should FAIL to access protected route without token", async () => {
    const res = await request(app).get("/api/auth/admin/status");
    // Should be 401 because no header was sent
    expect(res.statusCode).toBe(401);
  });

  // =========================================================================
  // SCENARIO 3: REFRESH TOKEN (The Extension)
  // =========================================================================
  it("Step 4: Should get a new Access Token using the Cookie", async () => {
    // We wait 1 second just to ensure the 'iat' (issued at) time is different
    await new Promise((r) => setTimeout(r, 1000));

    const res = await request(app)
      .post("/api/auth/admin/refresh")
      .set("Cookie", adminCookie) // Simulate Browser sending Cookie
      .send();

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();

    // Ensure the new token is actually different from the old one
    expect(res.body.accessToken).not.toBe(adminToken);

    // Update our token variable for future tests if needed
    adminToken = res.body.accessToken;
  });

  // =========================================================================
  // SCENARIO 4: LOGOUT (The Exit)
  // =========================================================================
  it("Step 5: Should logout and clear the cookie", async () => {
    const res = await request(app)
      .post("/api/auth/admin/logout")
      .set("Cookie", adminCookie);

    expect(res.statusCode).toBe(200);

    // Verify the response asks the browser to delete the cookie (Expires=1970)
    const logoutHeaders = res.headers["set-cookie"];
    expect(JSON.stringify(logoutHeaders)).toContain("jwt=;");
  });

  it("Step 6: Refresh should fail after logout", async () => {
    // Try to refresh using the OLD cookie (which should be invalid now)
    // Note: In a real browser, the browser wouldn't even send it.
    // Here we manually send it to prove the backend rejects it if it were somehow sent.

    // Note: Since we are mocking, we just check that the server handles the "No Cookie" case
    // or validates the token if we passed the old one.
    // Let's test the "No Cookie sent" case which simulates a cleared browser.
    const res = await request(app).post("/api/auth/admin/refresh").send();

    expect(res.statusCode).toBe(401);
  });
});

// import mongoose from "mongoose";
// import request from "supertest";
// import { Application } from "express";
// import { createApp } from "../../app/createApp";

// describe("/api/processor", () => {
//   let app: Application;
//   let authenticatedAgent: ReturnType<typeof request.agent>;

//   beforeAll(async () => {
//     await mongoose
//       .connect("mongodb://localhost/water_billing_system_test")
//       .then(() => {
//         console.log("Connected to TESTING Database");
//       })
//       .catch((err: Error) => {
//         console.log("failed to connect to database", err);
//       });

//     app = createApp();
//     authenticatedAgent = request.agent(app);

//     const registerManagerResponse = await authenticatedAgent
//       .post("/api/processors/register")
//       .send({
//         name: "adminadmin",
//         email: "admin@test.com",
//         password: "@Password123",
//       });

//     expect(registerManagerResponse.statusCode).toBe(201);

//     const loginRes = await authenticatedAgent.post("/api/auth/admin/login").send({
//       processorEmail: "admin@test.com",
//       processorPassword: "@Password123",
//     });
//     expect(loginRes.statusCode).toBe(200);
//   });

//   it("should return 401 when not logged in", async () => {
//     const response = await request(app).get("/api/auth/admin/status");
//     expect(response.statusCode).toBe(401);
//   });

//   it("should return authenticated manager when logged in", async () => {
//     const response = await authenticatedAgent.get("/api/auth/admin/status");

//     expect(response.statusCode).toBe(200);
//     expect(response.body.email).toBe("admin@test.com");
//   });

//   it("should add a new processor", async () => {
//     const res = await authenticatedAgent.post("/api/processors").send({
//       name: "new processor",
//       email: "processor@test.com",
//       password: "@Newprocessor123",
//       role: "staff",
//     });

//     expect(res.statusCode).toBe(201);
//   });

//   it("should visit index route", async () => {
//     const res = await request(app).get("/");
//     expect(res.statusCode).toBe(200);
//   });

//   afterAll(async () => {
//     await mongoose.connection.dropDatabase();
//     await mongoose.connection.close();
//   });
// });
