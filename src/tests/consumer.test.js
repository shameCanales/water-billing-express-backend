import * as validator from "express-validator";
import * as helpers from "../utils/helpers.js";
import {
  getAllConsumersHandler,
  createConsumerHandler,
  getConsumerById,
} from "../controllers/consumer.controller.js";
import { Consumer } from "../mongoose/schemas/consumer.js";

jest.mock("express-validator", () => ({
  validationResult: jest.fn(() => ({
    isEmpty: jest.fn(() => false),
    array: jest.fn(() => [{ msg: "Invalid Field" }]),
  })),
  matchedData: jest.fn(() => ({
    name: "John Doe",
    email: "john@mail.com",
    birthDate: "1999-02-14",
    mobileNumber: "09997654321",
    password: "password123",
    address: "Barangay Del Pilar, San Fernando, Pampanga",
    status: "active",
  })),
}));

jest.mock("../utils/helpers.js", () => ({
  hashPassword: jest.fn((password) => `hashed_${password}`),
}));

jest.mock("../mongoose/schemas/consumer");

const mockRequest = {
  params: {
    id: "noneExistent123",
  },
};
const mockResponse = {
  status: jest.fn(() => mockResponse),
  json: jest.fn(),
};

describe("get all consumer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and the consumers list on success", async () => {
    const consumersArray = [
      { _id: "1", name: "john" },
      { _id: "2", name: "jane" },
    ];

    // Mock Consumer.find().select("-password") to resolve with consumersArray
    Consumer.find.mockReturnValue({
      select: jest.fn().mockResolvedValue(consumersArray),
    });

    // Act
    await getAllConsumersHandler(mockRequest, mockResponse);

    // Assert
    expect(Consumer.find).toHaveBeenCalledTimes(1);
    const findReturn = Consumer.find.mock.results[0].value;
    expect(findReturn.select).toHaveBeenCalledWith("-password");
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: consumersArray,
    });
  });

  it("should return 500 and error message when DB fails", async () => {
    // Arrange: simulate DB error by having select reject
    Consumer.find.mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error("DB failure")),
    });

    await getAllConsumersHandler(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to fetch consumers",
    });
  });
});

describe("create consumer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 and validation errors array if there are validation errors", async () => {
    await createConsumerHandler(mockRequest, mockResponse);
    expect(validator.validationResult).toHaveBeenCalledTimes(1);
    expect(validator.validationResult).toHaveBeenCalledWith(mockRequest);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      errors: [{ msg: "Invalid Field" }],
    });
  });

  it("should return 201 and consumer data on success", async () => {
    jest.spyOn(validator, "validationResult").mockImplementation(() => ({
      isEmpty: jest.fn(() => true),
    }));

    Consumer.findOne.mockResolvedValue(null); // no existing consumer

    const fakeConsumer = {
      toObject: () => ({
        _id: "123",
        name: "John Doe",
        email: "john@mail.com",
        birthDate: "1999-02-14",
        mobileNumber: "09997654321",
        password: "password123",
        address: "Barangay Del Pilar, San Fernando, Pampanga",
        status: "active",
      }),
    };

    Consumer.create.mockResolvedValue(fakeConsumer);

    await createConsumerHandler(mockRequest, mockResponse);
    expect(validator.matchedData).toHaveBeenCalledWith(mockRequest);
    expect(helpers.hashPassword).toHaveBeenCalledWith("password123");
    expect(helpers.hashPassword).toHaveReturnedWith("hashed_password123");

    expect(Consumer.findOne).toHaveBeenCalledWith({ email: "john@mail.com" });
    expect(Consumer.create).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@mail.com",
      birthDate: "1999-02-14",
      mobileNumber: "09997654321",
      password: "hashed_password123",
      address: "Barangay Del Pilar, San Fernando, Pampanga",
      status: "active",
    });

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: "Consumer added successfully",
      data: {
        _id: "123",
        name: "John Doe",
        email: "john@mail.com",
        birthDate: "1999-02-14",
        mobileNumber: "09997654321",
        address: "Barangay Del Pilar, San Fernando, Pampanga",
        status: "active",
      },
    });
  });

  it("should return 409 and error message if consumer already exist", async () => {
    jest.spyOn(validator, "validationResult").mockImplementation(() => ({
      isEmpty: jest.fn(() => true),
    }));

    Consumer.findOne.mockResolvedValue({
      _id: "existing123",
      email: "john@mail.com",
    });
    await createConsumerHandler(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Consumer with this email already exists",
    });
    expect(Consumer.create).not.toHaveBeenCalled();
  });

  it("should return 500 and error message when server fails", async () => {
    jest.spyOn(validator, "validationResult").mockImplementation(() => ({
      isEmpty: jest.fn(() => true),
    }));

    jest.spyOn(validator, "matchedData").mockReturnValue({
      name: "John",
      email: "john@mail.com",
      birthDate: "1999-02-14",
      mobileNumber: "09991234567",
      password: "password123",
      address: "Pampanga",
      status: "active",
    });

    jest.spyOn(helpers, "hashPassword").mockResolvedValue("hashed_password123");

    Consumer.findOne.mockRejectedValue(new Error("Database down"));

    await createConsumerHandler(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
  });
});

describe("get consumer by ID", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 when consumer is not found", async () => {
    Consumer.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    await getConsumerById(mockRequest, mockResponse);

    expect(Consumer.findById).toHaveBeenCalledWith("noneExistent123");
    expect(Consumer.findById.mock.results[0].value.select).toHaveBeenCalledWith(
      "-password"
    );
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Consumer not found",
    });
  });

  it("should return 200 on success", async () => {
    mockRequest.params.id = 1;

    const fakeConsumer = { _id: "1", name: "john" };

    Consumer.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(fakeConsumer),
    });

    await getConsumerById(mockRequest, mockResponse);
    expect(Consumer.findById).toHaveBeenCalledTimes(1);
    expect(Consumer.findById).toHaveBeenCalledWith(mockRequest.params.id);
    expect(Consumer.findById.mock.results[0].value.select).toHaveBeenCalledWith(
      "-password"
    );
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      data: fakeConsumer,
    });
  });

  it("should return 500 when server or database fails", async () => {
    mockRequest.params.id = "1";

    Consumer.findById.mockReturnValue({
      select: jest
        .fn()
        .mockRejectedValueOnce(new Error("Database connection failed")),
    });
    await getConsumerById(mockRequest, mockResponse);

    expect(Consumer.findById).toHaveBeenCalledWith("1");
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to fetch consumer",
    });
  });
});

// 1. Read the function — identify inputs, outputs, side effects.
// 2. List all possible branches (happy path + errors).
// 3. Decide what to mock (DB, helpers).
// 4. Create minimal req and res fakes.
// 5. Write the happy path test:
// - Mock dependencies to succeed.
// - Call handler.
// - Assert status and payload.
// 6. Write failure tests:
// - Mock dependency to fail.
// - Call handler.
// - Assert 500 and error payload.
// 7. Assert dependency calls & arguments.
// 8. Clear mocks in beforeEach.
// 9. Run tests, debug failing ones.
// 10.Refactor tests for clarity.

// | Step | Question                            | Example for `createConsumerHandler`          |
// | ---- | ----------------------------------- | -------------------------------------------- |
// | 1️⃣  | What function am I testing?         | `createConsumerHandler`                      |
// | 2️⃣  | What dependencies does it use?      | validator, hashPassword, Consumer model      |
// | 3️⃣  | What are the behavior branches?     | 400, 409, 201, 500                           |
// | 4️⃣  | What should I mock to trigger each? | Mock dependencies to return specific results |
// | 5️⃣  | What inputs does it need?           | Fake `req` and `res`                         |
// | 6️⃣  | What output/behavior do I expect?   | Correct status + JSON                        |
// | 7️⃣  | Should I test helpers separately?   | Yes, in separate files                       |
