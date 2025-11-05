import * as validator from "express-validator";
import * as helpers from "../utils/helpers.js";
import {
  getAllConsumersHandler,
  createConsumerHandler,
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

const mockRequest = {};
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

  //   it("should return 409 and error message if consumer already exist");

  //   it("should return 500 and error message when server fails");
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
