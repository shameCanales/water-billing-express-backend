import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { matchedData } from "express-validator";
import { ConsumerService } from "../../../modules/consumers/consumer.service.ts";
import { ConsumerController } from "../../../modules/consumers/consumer.controller.ts";
import { handleControllerError } from "../../../core/utils/errorHandler.ts";
import type { Request, Response } from "express";

// 1. Auto-mock the dependencies natively
jest.mock("express-validator");
jest.mock("../../../modules/consumers/consumer.service.ts");
jest.mock("../../../core/utils/errorHandler.ts");

// 2. Use jest.mocked() for perfect TypeScript inference (Modern Best Practice)
const mockedMatchedData = jest.mocked(matchedData);
const mockedConsumerService = jest.mocked(ConsumerService);
const mockedHandleControllerError = jest.mocked(handleControllerError);

describe("Consumer Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn() as any,
    };

    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should return 200 and the consumers list on success", async () => {
      // Setup exact object keys to match the controller's destructuring
      const mockQueryData = {
        page: 1,
        limit: 10,
        search: "john",
        status: "active",
        sortBy: "createdAt",
        sortOrder: "desc" as const,
      };
      mockedMatchedData.mockReturnValue(mockQueryData);

      const mockResult = {
        consumers: [],
        pagination: { total: 0, totalPages: 0, currentPage: 1, limit: 10 },
      };
      mockedConsumerService.getAllConsumers.mockResolvedValue(
        mockResult as any,
      );

      // Act
      await ConsumerController.getAll(req as Request, res as Response);

      // Assert
      expect(mockedMatchedData).toHaveBeenCalledWith(req);
      expect(mockedConsumerService.getAllConsumers).toHaveBeenCalledWith(
        mockQueryData,
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Consumers fetched successfully",
        data: mockResult,
      });
    });

    it("should call handleControllerError if service throws an error", async () => {
      const error = new Error("DB failure");
      mockedConsumerService.getAllConsumers.mockRejectedValue(error);

      await ConsumerController.getAll(req as Request, res as Response);

      expect(mockedHandleControllerError).toHaveBeenCalledWith(
        error,
        res as Response,
      );
    });
  });

  describe("create", () => {
    it("should return 201 and created consumer when successful", async () => {
      // 1. Provide all required fields to satisfy the IConsumer interface
      const newConsumerData = {
        firstName: "Mark",
        lastName: "Doe",
        email: "test@test.com",
        birthDate: new Date("1990-01-01"), // Adjust to string if your interface uses string
        mobileNumber: "09123456789",
        password: "securePassword123!",
        address: "123 Main Street",
        status: "active" as const,
      };

      mockedMatchedData.mockReturnValue(newConsumerData);

      const createdConsumer = { _id: "1", ...newConsumerData };
      mockedConsumerService.createConsumer.mockResolvedValue(
        createdConsumer as any,
      );

      await ConsumerController.create(req as Request, res as Response);

      expect(mockedConsumerService.createConsumer).toHaveBeenCalledWith(
        newConsumerData,
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Consumer added successfully",
        data: createdConsumer,
      });
    });

    it("should call handleControllerError if creation fails", async () => {
      const error = new Error("Consumer already exists");
      mockedConsumerService.createConsumer.mockRejectedValue(error);

      await ConsumerController.create(req as Request, res as Response);

      expect(mockedHandleControllerError).toHaveBeenCalledWith(
        error,
        res as Response,
      );
    });
  });

  describe("getById", () => {
    it("should return 200 and consumer when found", async () => {
      mockedMatchedData.mockReturnValue({ consumerId: "123" });
      const mockConsumer = {
        _id: "123",
        firstName: "John",
        email: "john@test.com",
      };

      mockedConsumerService.getConsumerById.mockResolvedValue(
        mockConsumer as any,
      );

      await ConsumerController.getById(
        req as Request<{ consumerId: string }>,
        res as Response,
      );

      expect(mockedConsumerService.getConsumerById).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "successfully fetched consumer by id",
        data: mockConsumer,
      });
    });

    it("should call handleControllerError if consumer is not found", async () => {
      mockedMatchedData.mockReturnValue({ consumerId: "123" });
      const error = new Error("Consumer not found");
      mockedConsumerService.getConsumerById.mockRejectedValue(error);

      await ConsumerController.getById(
        req as Request<{ consumerId: string }>,
        res as Response,
      );

      expect(mockedHandleControllerError).toHaveBeenCalledWith(
        error,
        res as Response,
      );
    });
  });

  describe("editById", () => {
    it("should return 200 and updated consumer on success", async () => {
      // The controller extracts consumerId and spreads the rest into `updates`
      mockedMatchedData.mockReturnValue({
        consumerId: "123",
        firstName: "Updated John",
      });

      const mockUpdatedConsumer = { _id: "123", firstName: "Updated John" };
      mockedConsumerService.updateConsumer.mockResolvedValue(
        mockUpdatedConsumer as any,
      );

      await ConsumerController.editById(req as Request, res as Response);

      // Assert that consumerId was extracted and only updates were passed
      expect(mockedConsumerService.updateConsumer).toHaveBeenCalledWith("123", {
        firstName: "Updated John",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Consumer updated successfully",
        data: mockUpdatedConsumer,
      });
    });

    it("should call handleControllerError if update fails", async () => {
      mockedMatchedData.mockReturnValue({
        consumerId: "123",
        firstName: "Error user",
      });
      const error = new Error("Database error");
      mockedConsumerService.updateConsumer.mockRejectedValue(error);

      await ConsumerController.editById(req as Request, res as Response);

      expect(mockedHandleControllerError).toHaveBeenCalledWith(
        error,
        res as Response,
      );
    });
  });

  describe("deleteById", () => {
    it("should return 200 when consumer is deleted successfully", async () => {
      mockedMatchedData.mockReturnValue({ consumerId: "123" });
      mockedConsumerService.deleteConsumer.mockResolvedValue(undefined as any);

      await ConsumerController.deleteById(req as Request, res as Response);

      expect(mockedConsumerService.deleteConsumer).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Consumer deleted successfully",
      });
    });

    it("should call handleControllerError if deletion fails", async () => {
      mockedMatchedData.mockReturnValue({ consumerId: "123" });
      const error = new Error("Not found");
      mockedConsumerService.deleteConsumer.mockRejectedValue(error);

      await ConsumerController.deleteById(req as Request, res as Response);

      expect(mockedHandleControllerError).toHaveBeenCalledWith(
        error,
        res as Response,
      );
    });
  });

  describe("updateStatusById", () => {
    it("should return 200 and updated consumer on success", async () => {
      // 1. Change mock input to a valid ConsumerStatus
      mockedMatchedData.mockReturnValue({
        consumerId: "123",
        status: "suspended",
      });

      // 2. Change the mocked output
      const mockUpdatedConsumer = { _id: "123", status: "suspended" };
      mockedConsumerService.updateStatus.mockResolvedValue(
        mockUpdatedConsumer as any,
      );

      await ConsumerController.updateStatusById(
        req as Request,
        res as Response,
      );

      // 3. Assert with the valid status
      expect(mockedConsumerService.updateStatus).toHaveBeenCalledWith(
        "123",
        "suspended",
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Consumer status updated successfully",
        data: mockUpdatedConsumer,
      });
    });

    it("should call handleControllerError if status update fails", async () => {
      mockedMatchedData.mockReturnValue({
        consumerId: "123",
        status: "suspended",
      });
      const error = new Error("Not found");
      mockedConsumerService.updateStatus.mockRejectedValue(error);

      await ConsumerController.updateStatusById(
        req as Request,
        res as Response,
      );

      expect(mockedHandleControllerError).toHaveBeenCalledWith(
        error,
        res as Response,
      );
    });
  });
});

// // 1. Read the function — identify inputs, outputs, side effects.
// // 2. List all possible branches (happy path + errors).
// // 3. Decide what to mock (DB, helpers).
// // 4. Create minimal req and res fakes.
// // 5. Write the happy path test:
// // - Mock dependencies to succeed.
// // - Call handler.
// // - Assert status and payload.
// // 6. Write failure tests:
// // - Mock dependency to fail.
// // - Call handler.
// // - Assert 500 and error payload.
// // 7. Assert dependency calls & arguments.
// // 8. Clear mocks in beforeEach.
// // 9. Run tests, debug failing ones.
// // 10.Refactor tests for clarity.

// // | Step | Question                            | Example for `createConsumerHandler`          |
// // | ---- | ----------------------------------- | -------------------------------------------- |
// // | 1️⃣  | What function am I testing?         | `createConsumerHandler`                      |
// // | 2️⃣  | What dependencies does it use?      | validator, hashPassword, Consumer model      |
// // | 3️⃣  | What are the behavior branches?     | 400, 409, 201, 500                           |
// // | 4️⃣  | What should I mock to trigger each? | Mock dependencies to return specific results |
// // | 5️⃣  | What inputs does it need?           | Fake `req` and `res`                         |
// // | 6️⃣  | What output/behavior do I expect?   | Correct status + JSON                        |
// // | 7️⃣  | Should I test helpers separately?   | Yes, in separate files                       |

// // // OLD TESTING WITH OUT SPLITTING CODES INTO CONTROLLER, SERVICES, REPOSITORIES:
// // import * as validator from "express-validator";
// // import * as helpers from "../utils/helpers.js";
// // import {
// //   getAllConsumersHandler,
// //   createConsumerHandler,
// //   getConsumerById,
// //   editConsumerById,
// //   deleteConsumerById,
// // } from "../controllers/consumer.controller.js";
// // import { Consumer } from "../models/consumer.model.js";

// // jest.mock("express-validator", () => ({
// //   validationResult: jest.fn(() => ({
// //     isEmpty: jest.fn(() => false),
// //     array: jest.fn(() => [{ msg: "Invalid Field" }]),
// //   })),
// //   matchedData: jest.fn(() => ({
// //     name: "John Doe",
// //     email: "john@mail.com",
// //     birthDate: "1999-02-14",
// //     mobileNumber: "09997654321",
// //     password: "password123",
// //     address: "Barangay Del Pilar, San Fernando, Pampanga",
// //     status: "active",
// //   })),
// // }));

// // jest.mock("../utils/helpers.js", () => ({
// //   hashPassword: jest.fn((password) => `hashed_${password}`),
// // }));

// // jest.mock("../models/consumer.model");

// // const mockRequest = {
// //   params: {
// //     id: "noneExistent123",
// //   },
// // };
// // const mockResponse = {
// //   status: jest.fn(() => mockResponse),
// //   json: jest.fn(),
// // };

// // describe("get all consumer", () => {
// //   beforeEach(() => {
// //     jest.clearAllMocks();
// //   });

// //   it("should return 200 and the consumers list on success", async () => {
// //     const consumersArray = [
// //       { _id: "1", name: "john" },
// //       { _id: "2", name: "jane" },
// //     ];

// //     // Mock Consumer.find().select("-password") to resolve with consumersArray
// //     Consumer.find.mockReturnValue({
// //       select: jest.fn().mockResolvedValue(consumersArray),
// //     });

// //     // Act
// //     await getAllConsumersHandler(mockRequest, mockResponse);

// //     // Assert
// //     expect(Consumer.find).toHaveBeenCalledTimes(1);
// //     const findReturn = Consumer.find.mock.results[0].value;
// //     expect(findReturn.select).toHaveBeenCalledWith("-password");
// //     expect(mockResponse.status).toHaveBeenCalledWith(200);
// //     expect(mockResponse.json).toHaveBeenCalledWith({
// //       success: true,
// //       data: consumersArray,
// //     });
// //   });

// //   it("should return 500 and error message when DB fails", async () => {
// //     // Arrange: simulate DB error by having select reject
// //     Consumer.find.mockReturnValue({
// //       select: jest.fn().mockRejectedValue(new Error("DB failure")),
// //     });

// //     await getAllConsumersHandler(mockRequest, mockResponse);
// //     expect(mockResponse.status).toHaveBeenCalledWith(500);
// //     expect(mockResponse.json).toHaveBeenCalledWith({
// //       success: false,
// //       message: "Failed to fetch consumers",
// //     });
// //   });
// // });

// // describe("create consumer", () => {
// //   beforeEach(() => {
// //     jest.clearAllMocks();
// //   });

// //   it("should return 400 and validation errors array if there are validation errors", async () => {
// //     await createConsumerHandler(mockRequest, mockResponse);
// //     expect(validator.validationResult).toHaveBeenCalledTimes(1);
// //     expect(validator.validationResult).toHaveBeenCalledWith(mockRequest);
// //     expect(mockResponse.status).toHaveBeenCalledWith(400);
// //     expect(mockResponse.json).toHaveBeenCalledWith({
// //       success: false,
// //       errors: [{ msg: "Invalid Field" }],
// //     });
// //   });

// //   it("should return 201 and consumer data on success", async () => {
// //     jest.spyOn(validator, "validationResult").mockImplementation(() => ({
// //       isEmpty: jest.fn(() => true),
// //     }));

// //     Consumer.findOne.mockResolvedValue(null); // no existing consumer

// //     const fakeConsumer = {
// //       toObject: () => ({
// //         _id: "123",
// //         name: "John Doe",
// //         email: "john@mail.com",
// //         birthDate: "1999-02-14",
// //         mobileNumber: "09997654321",
// //         password: "password123",
// //         address: "Barangay Del Pilar, San Fernando, Pampanga",
// //         status: "active",
// //       }),
// //     };

// //     Consumer.create.mockResolvedValue(fakeConsumer);

// //     await createConsumerHandler(mockRequest, mockResponse);
// //     expect(validator.matchedData).toHaveBeenCalledWith(mockRequest);
// //     expect(helpers.hashPassword).toHaveBeenCalledWith("password123");
// //     expect(helpers.hashPassword).toHaveReturnedWith("hashed_password123");

// //     expect(Consumer.findOne).toHaveBeenCalledWith({ email: "john@mail.com" });
// //     expect(Consumer.create).toHaveBeenCalledWith({
// //       name: "John Doe",
// //       email: "john@mail.com",
// //       birthDate: "1999-02-14",
// //       mobileNumber: "09997654321",
// //       password: "hashed_password123",
// //       address: "Barangay Del Pilar, San Fernando, Pampanga",
// //       status: "active",
// //     });

// //     expect(mockResponse.status).toHaveBeenCalledWith(201);
// //     expect(mockResponse.json).toHaveBeenCalledWith({
// //       success: true,
// //       message: "Consumer added successfully",
// //       data: {
// //         _id: "123",
// //         name: "John Doe",
// //         email: "john@mail.com",
// //         birthDate: "1999-02-14",
// //         mobileNumber: "09997654321",
// //         address: "Barangay Del Pilar, San Fernando, Pampanga",
// //         status: "active",
// //       },
// //     });
// //   });

// //   it("should return 409 and error message if consumer already exist", async () => {
// //     jest.spyOn(validator, "validationResult").mockImplementation(() => ({
// //       isEmpty: jest.fn(() => true),
// //     }));

// //     Consumer.findOne.mockResolvedValue({
// //       _id: "existing123",
// //       email: "john@mail.com",
// //     });
// //     await createConsumerHandler(mockRequest, mockResponse);

// //     expect(mockResponse.status).toHaveBeenCalledWith(409);
// //     expect(mockResponse.json).toHaveBeenCalledWith({
// //       success: false,
// //       message: "Consumer with this email already exists",
// //     });
// //     expect(Consumer.create).not.toHaveBeenCalled();
// //   });

// //   it("should return 500 and error message when server fails", async () => {
// //     jest.spyOn(validator, "validationResult").mockImplementation(() => ({
// //       isEmpty: jest.fn(() => true),
// //     }));

// //     jest.spyOn(validator, "matchedData").mockReturnValue({
// //       name: "John",
// //       email: "john@mail.com",
// //       birthDate: "1999-02-14",
// //       mobileNumber: "09991234567",
// //       password: "password123",
// //       address: "Pampanga",
// //       status: "active",
// //     });

// //     jest.spyOn(helpers, "hashPassword").mockResolvedValue("hashed_password123");

// //     Consumer.findOne.mockRejectedValue(new Error("Database down"));

// //     await createConsumerHandler(mockRequest, mockResponse);

// //     expect(mockResponse.status).toHaveBeenCalledWith(500);
// //     expect(mockResponse.json).toHaveBeenCalledWith({
// //       success: false,
// //       message: "Internal server error",
// //     });
// //   });
// // });

// // describe("get consumer by ID", () => {
// //   beforeEach(() => {
// //     jest.clearAllMocks();
// //   });

// //   it("should return 404 when consumer is not found", async () => {
// //     Consumer.findById.mockReturnValue({
// //       select: jest.fn().mockResolvedValue(null),
// //     });

// //     await getConsumerById(mockRequest, mockResponse);

// //     expect(Consumer.findById).toHaveBeenCalledWith("noneExistent123");
// //     expect(Consumer.findById.mock.results[0].value.select).toHaveBeenCalledWith(
// //       "-password"
// //     );
// //     expect(mockResponse.status).toHaveBeenCalledWith(404);
// //     expect(mockResponse.json).toHaveBeenCalledWith({
// //       success: false,
// //       message: "Consumer not found",
// //     });
// //   });

// //   it("should return 200 on success", async () => {
// //     mockRequest.params.id = 1;

// //     const fakeConsumer = { _id: "1", name: "john" };

// //     Consumer.findById.mockReturnValue({
// //       select: jest.fn().mockResolvedValue(fakeConsumer),
// //     });

// //     await getConsumerById(mockRequest, mockResponse);
// //     expect(Consumer.findById).toHaveBeenCalledTimes(1);
// //     expect(Consumer.findById).toHaveBeenCalledWith(mockRequest.params.id);
// //     expect(Consumer.findById.mock.results[0].value.select).toHaveBeenCalledWith(
// //       "-password"
// //     );
// //     expect(mockResponse.status).toHaveBeenCalledWith(200);
// //     expect(mockResponse.json).toHaveBeenCalledWith({
// //       success: true,
// //       data: fakeConsumer,
// //     });
// //   });

// //   it("should return 500 when server or database fails", async () => {
// //     mockRequest.params.id = "1";

// //     Consumer.findById.mockReturnValue({
// //       select: jest
// //         .fn()
// //         .mockRejectedValueOnce(new Error("Database connection failed")),
// //     });
// //     await getConsumerById(mockRequest, mockResponse);

// //     expect(Consumer.findById).toHaveBeenCalledWith("1");
// //     expect(mockResponse.status).toHaveBeenCalledWith(500);
// //     expect(mockResponse.json).toHaveBeenCalledWith({
// //       success: false,
// //       message: "Failed to fetch consumer",
// //     });
// //   });
// // });

// // describe("edit consumer by ID", () => {
// //   beforeEach(() => {
// //     jest.clearAllMocks();
// //   });

// //   it("should return 400 when there is validation error", async () => {
// //     jest.spyOn(validator, "validationResult").mockReturnValue({
// //       isEmpty: jest.fn(() => false),
// //       array: jest.fn(() => [{ msg: "Invalid Field" }]),
// //     });
// //     mockRequest.params.id = 1;

// //     await editConsumerById(mockRequest, mockResponse);
// //     expect(validator.validationResult).toHaveBeenCalledTimes(1);
// //     expect(validator.validationResult).toHaveBeenCalledWith(mockRequest);
// //     expect(mockResponse.status).toHaveBeenCalledWith(400);
// //     expect(mockResponse.json).toHaveBeenCalledWith({
// //       success: false,
// //       errors: [{ msg: "Invalid Field" }],
// //     });
// //   });

// //   it("should return 404 when consumer is not found", async () => {
// //     jest.spyOn(validator, "validationResult").mockReturnValue({
// //       isEmpty: jest.fn(() => true),
// //     });

// //     Consumer.findByIdAndUpdate.mockResolvedValue(null);

// //     await editConsumerById(mockRequest, mockResponse);

// //     expect(Consumer.findByIdAndUpdate).toHaveBeenCalledWith(
// //       mockRequest.params.id,
// //       expect.any(Object),
// //       { new: true, runValidators: true }
// //     );

// //     expect(mockResponse.status).toHaveBeenCalledWith(404);
// //     expect(mockResponse.json).toHaveBeenCalledWith({
// //       success: false,
// //       message: "Consumer not found",
// //     });
// //   });

// //   it("should return 200 and updated consumer on success", async () => {
// //     jest.spyOn(validator, "validationResult").mockReturnValue({
// //       isEmpty: jest.fn(() => true),
// //     });

// //     jest.spyOn(validator, "matchedData").mockReturnValue({
// //       name: "Updated",
// //       password: "newpass123",
// //     });

// //     helpers.hashPassword.mockResolvedValue("hashed_newpass123");

// //     const updatedConsumer = { _id: "1", name: "Updated" };
// //     Consumer.findByIdAndUpdate.mockResolvedValue(updatedConsumer);

// //     await editConsumerById(mockRequest, mockResponse);

// //     expect(helpers.hashPassword).toHaveBeenCalledWith("newpass123");
// //     expect(Consumer.findByIdAndUpdate).toHaveBeenCalledWith(
// //       mockRequest.params.id,
// //       { name: "Updated", password: "hashed_newpass123" },
// //       { new: true, runValidators: true }
// //     );
// //     expect(mockResponse.status).toHaveBeenCalledWith(200);
// //     expect(mockResponse.json).toHaveBeenCalledWith({
// //       success: true,
// //       message: "Consumer updated successfully",
// //       data: updatedConsumer,
// //     });
// //   });

// //   it("should return 500 when DB fails to updated consumer", async () => {
// //     jest.spyOn(validator, "validationResult").mockReturnValue({
// //       isEmpty: jest.fn(() => true),
// //     });

// //     Consumer.findByIdAndUpdate.mockRejectedValue(
// //       new Error("Failed to update consumer")
// //     );

// //     await editConsumerById(mockRequest, mockResponse);

// //     expect(mockResponse.status).toHaveBeenCalledWith(500);
// //     expect(mockResponse.json).toHaveBeenCalledWith({
// //       success: false,
// //       message: "Failed to update consumer",
// //       error: "Failed to update consumer",
// //     });
// //   });
// // });

// // describe("delete consumer by id", () => {
// //   beforeEach(() => {
// //     jest.clearAllMocks();
// //   });

// //   it("should return 404 when consumer is not found", async () => {
// //     Consumer.findByIdAndDelete.mockResolvedValue(null);

// //     await deleteConsumerById(mockRequest, mockResponse);

// //     expect(Consumer.findByIdAndDelete).toHaveBeenCalledTimes(1);
// //     expect(Consumer.findByIdAndDelete).toHaveBeenCalledWith(
// //       mockRequest.params.id
// //     );
// //     expect(mockResponse.status).toHaveBeenCalledWith(404);
// //     expect(mockResponse.json).toHaveBeenCalledWith({
// //       success: false,
// //       message: "Consumer not found",
// //     });
// //   });

// //   it("should return 200 when deleted successfully", async () => {
// //     const fakeDeletedConsumer = { _id: "1", name: "John" };
// //     Consumer.findByIdAndDelete.mockResolvedValue(fakeDeletedConsumer);

// //     await deleteConsumerById(mockRequest, mockResponse);

// //     expect(Consumer.findByIdAndDelete).toHaveBeenCalledWith(
// //       mockRequest.params.id
// //     );
// //     expect(mockResponse.status).toHaveBeenCalledWith(200);
// //     expect(mockResponse.json).toHaveBeenCalledWith({
// //       success: true,
// //       message: "Consumer deleted successfully",
// //       data: fakeDeletedConsumer,
// //     });
// //   });

// //   it("should return 500 when server or database fails", async () => {
// //     // Arrange
// //     Consumer.findByIdAndDelete.mockRejectedValue(
// //       new Error("Database connection failed")
// //     );

// //     // Act
// //     await deleteConsumerById(mockRequest, mockResponse);

// //     // Assert
// //     expect(Consumer.findByIdAndDelete).toHaveBeenCalledWith(
// //       mockRequest.params.id
// //     );
// //     expect(mockResponse.status).toHaveBeenCalledWith(500);
// //     expect(mockResponse.json).toHaveBeenCalledWith({
// //       success: false,
// //       message: "Failed to delete consumer",
// //       error: "Database connection failed",
// //     });
// //   });
// // });
