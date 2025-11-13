import { validationResult, matchedData } from "express-validator";
import { ConsumerService } from "../../../modules/consumers/consumer.service.js";
import { ConsumerController } from "../../../modules/consumers/consumer.controller.js";

jest.mock("express-validator", () => ({
  validationResult: jest.fn(),
  matchedData: jest.fn(),
}));

jest.mock("../../../services/consumer.service.js", () => ({
  ConsumerService: {
    getAllConsumers: jest.fn(),
    createConsumer: jest.fn(),
    getConsumerById: jest.fn(),
    updateConsumer: jest.fn(),
    deleteConsumer: jest.fn(),
  },
}));

describe("Consumer Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("get all consumer", () => {
    it("should return 200 and the consumers list on success", async () => {
      const consumersArray = [
        { _id: "1", name: "john" },
        { _id: "2", name: "jane" },
      ];
      ConsumerService.getAllConsumers.mockResolvedValue(consumersArray);

      // Act
      await ConsumerController.getAll(req, res);

      // Assert
      expect(ConsumerService.getAllConsumers).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: consumersArray,
      });
    });

    it("should return 500 if service throws an error", async () => {
      ConsumerService.getAllConsumers.mockRejectedValue(
        new Error("DB failure")
      );

      await ConsumerController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to fetch consumers",
      });
    });
  });

  describe("create", () => {
    it("should return 400 if validation fails", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: "Invalid email" }],
      });

      await ConsumerController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: [{ msg: "Invalid email" }],
      });
    });

    it("should return 201 and created consumer when successful", async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      const newConsumer = { name: "Mark", email: "test@test.com" };
      matchedData.mockReturnValue(newConsumer);

      ConsumerService.createConsumer.mockResolvedValue(newConsumer);

      await ConsumerController.create(req, res);

      expect(ConsumerService.createConsumer).toHaveBeenCalledWith(newConsumer);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Consumer added successfully",
        data: newConsumer,
      });
    });

    it("should return 409 if consumer already exists", async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      matchedData.mockReturnValue({ email: "exists@test.com" });

      ConsumerService.createConsumer.mockRejectedValue(
        new Error("Consumer already exists")
      );

      await ConsumerController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Consumer already exists",
      });
    });
  });

  describe("getById", () => {
    it("should return 200 and consumer when found", async () => {
      req.params.id = "123";
      const mockConsumer = { _id: "123", name: "John" };
      ConsumerService.getConsumerById.mockResolvedValue(mockConsumer);

      await ConsumerController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "successfully fetched consumer by id",
        data: mockConsumer,
      });
    });

    it("should return 404 if consumer not found", async () => {
      req.params.id = "123";
      ConsumerService.getConsumerById.mockRejectedValue(
        new Error("Consumer not found")
      );

      await ConsumerController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Consumer not found",
      });
    });
  });

  describe("editById", () => {
    it("should return 400 when validation errors", async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: "Invalid email" }],
      });

      await ConsumerController.editById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: [{ msg: "Invalid email" }],
      });
    });

    it("should return 200 and updated consumer on success", async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      req.params.id = "123";
      matchedData.mockReturnValue({ name: "Updated John" });

      const mockUpdatedConsumer = { _id: "123", name: "Updated John" };
      ConsumerService.updateConsumer.mockResolvedValue(mockUpdatedConsumer);

      await ConsumerController.editById(req, res);

      expect(ConsumerService.updateConsumer).toHaveBeenCalledWith("123", {
        name: "Updated John",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Consumer updated successfully",
        data: mockUpdatedConsumer,
      });
    });

    it("should return 404 if consumer not found", async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      req.params.id = "999";
      matchedData.mockReturnValue({ name: "Doesn't exist" });

      ConsumerService.updateConsumer.mockRejectedValue(
        new Error("Consumer not found")
      );

      await ConsumerController.editById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Consumer not found",
      });
    });

    it("should return 500 if other error occurs", async () => {
      validationResult.mockReturnValue({ isEmpty: () => true });
      req.params.id = "123";
      matchedData.mockReturnValue({ name: "Error user" });

      ConsumerService.updateConsumer.mockRejectedValue(
        new Error("Database connection failed")
      );

      await ConsumerController.editById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Database connection failed",
      });
    });
  });

  describe("deleteById", () => {
    it("should return 200 when consumer is deleted successfully", async () => {
      req.params.id = "123";
      ConsumerService.deleteConsumer.mockResolvedValue();

      await ConsumerController.deleteById(req, res);

      expect(ConsumerService.deleteConsumer).toHaveBeenCalledWith("123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Consumer deleted successfully",
      });
    });

    it("should return 404 if consumer not found", async () => {
      req.params.id = "404";
      ConsumerService.deleteConsumer.mockRejectedValue(
        new Error("Consumer not found")
      );

      await ConsumerController.deleteById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Consumer not found",
      });
    });

    it("should return 500 if an unexpected error occurs", async () => {
      req.params.id = "123";
      ConsumerService.deleteConsumer.mockRejectedValue(
        new Error("Unexpected error")
      );

      await ConsumerController.deleteById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unexpected error",
      });
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

// // OLD TESTING WITH OUT SPLITTING CODES INTO CONTROLLER, SERVICES, REPOSITORIES:
// import * as validator from "express-validator";
// import * as helpers from "../utils/helpers.js";
// import {
//   getAllConsumersHandler,
//   createConsumerHandler,
//   getConsumerById,
//   editConsumerById,
//   deleteConsumerById,
// } from "../controllers/consumer.controller.js";
// import { Consumer } from "../models/consumer.model.js";

// jest.mock("express-validator", () => ({
//   validationResult: jest.fn(() => ({
//     isEmpty: jest.fn(() => false),
//     array: jest.fn(() => [{ msg: "Invalid Field" }]),
//   })),
//   matchedData: jest.fn(() => ({
//     name: "John Doe",
//     email: "john@mail.com",
//     birthDate: "1999-02-14",
//     mobileNumber: "09997654321",
//     password: "password123",
//     address: "Barangay Del Pilar, San Fernando, Pampanga",
//     status: "active",
//   })),
// }));

// jest.mock("../utils/helpers.js", () => ({
//   hashPassword: jest.fn((password) => `hashed_${password}`),
// }));

// jest.mock("../models/consumer.model");

// const mockRequest = {
//   params: {
//     id: "noneExistent123",
//   },
// };
// const mockResponse = {
//   status: jest.fn(() => mockResponse),
//   json: jest.fn(),
// };

// describe("get all consumer", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return 200 and the consumers list on success", async () => {
//     const consumersArray = [
//       { _id: "1", name: "john" },
//       { _id: "2", name: "jane" },
//     ];

//     // Mock Consumer.find().select("-password") to resolve with consumersArray
//     Consumer.find.mockReturnValue({
//       select: jest.fn().mockResolvedValue(consumersArray),
//     });

//     // Act
//     await getAllConsumersHandler(mockRequest, mockResponse);

//     // Assert
//     expect(Consumer.find).toHaveBeenCalledTimes(1);
//     const findReturn = Consumer.find.mock.results[0].value;
//     expect(findReturn.select).toHaveBeenCalledWith("-password");
//     expect(mockResponse.status).toHaveBeenCalledWith(200);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       success: true,
//       data: consumersArray,
//     });
//   });

//   it("should return 500 and error message when DB fails", async () => {
//     // Arrange: simulate DB error by having select reject
//     Consumer.find.mockReturnValue({
//       select: jest.fn().mockRejectedValue(new Error("DB failure")),
//     });

//     await getAllConsumersHandler(mockRequest, mockResponse);
//     expect(mockResponse.status).toHaveBeenCalledWith(500);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       success: false,
//       message: "Failed to fetch consumers",
//     });
//   });
// });

// describe("create consumer", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return 400 and validation errors array if there are validation errors", async () => {
//     await createConsumerHandler(mockRequest, mockResponse);
//     expect(validator.validationResult).toHaveBeenCalledTimes(1);
//     expect(validator.validationResult).toHaveBeenCalledWith(mockRequest);
//     expect(mockResponse.status).toHaveBeenCalledWith(400);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       success: false,
//       errors: [{ msg: "Invalid Field" }],
//     });
//   });

//   it("should return 201 and consumer data on success", async () => {
//     jest.spyOn(validator, "validationResult").mockImplementation(() => ({
//       isEmpty: jest.fn(() => true),
//     }));

//     Consumer.findOne.mockResolvedValue(null); // no existing consumer

//     const fakeConsumer = {
//       toObject: () => ({
//         _id: "123",
//         name: "John Doe",
//         email: "john@mail.com",
//         birthDate: "1999-02-14",
//         mobileNumber: "09997654321",
//         password: "password123",
//         address: "Barangay Del Pilar, San Fernando, Pampanga",
//         status: "active",
//       }),
//     };

//     Consumer.create.mockResolvedValue(fakeConsumer);

//     await createConsumerHandler(mockRequest, mockResponse);
//     expect(validator.matchedData).toHaveBeenCalledWith(mockRequest);
//     expect(helpers.hashPassword).toHaveBeenCalledWith("password123");
//     expect(helpers.hashPassword).toHaveReturnedWith("hashed_password123");

//     expect(Consumer.findOne).toHaveBeenCalledWith({ email: "john@mail.com" });
//     expect(Consumer.create).toHaveBeenCalledWith({
//       name: "John Doe",
//       email: "john@mail.com",
//       birthDate: "1999-02-14",
//       mobileNumber: "09997654321",
//       password: "hashed_password123",
//       address: "Barangay Del Pilar, San Fernando, Pampanga",
//       status: "active",
//     });

//     expect(mockResponse.status).toHaveBeenCalledWith(201);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       success: true,
//       message: "Consumer added successfully",
//       data: {
//         _id: "123",
//         name: "John Doe",
//         email: "john@mail.com",
//         birthDate: "1999-02-14",
//         mobileNumber: "09997654321",
//         address: "Barangay Del Pilar, San Fernando, Pampanga",
//         status: "active",
//       },
//     });
//   });

//   it("should return 409 and error message if consumer already exist", async () => {
//     jest.spyOn(validator, "validationResult").mockImplementation(() => ({
//       isEmpty: jest.fn(() => true),
//     }));

//     Consumer.findOne.mockResolvedValue({
//       _id: "existing123",
//       email: "john@mail.com",
//     });
//     await createConsumerHandler(mockRequest, mockResponse);

//     expect(mockResponse.status).toHaveBeenCalledWith(409);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       success: false,
//       message: "Consumer with this email already exists",
//     });
//     expect(Consumer.create).not.toHaveBeenCalled();
//   });

//   it("should return 500 and error message when server fails", async () => {
//     jest.spyOn(validator, "validationResult").mockImplementation(() => ({
//       isEmpty: jest.fn(() => true),
//     }));

//     jest.spyOn(validator, "matchedData").mockReturnValue({
//       name: "John",
//       email: "john@mail.com",
//       birthDate: "1999-02-14",
//       mobileNumber: "09991234567",
//       password: "password123",
//       address: "Pampanga",
//       status: "active",
//     });

//     jest.spyOn(helpers, "hashPassword").mockResolvedValue("hashed_password123");

//     Consumer.findOne.mockRejectedValue(new Error("Database down"));

//     await createConsumerHandler(mockRequest, mockResponse);

//     expect(mockResponse.status).toHaveBeenCalledWith(500);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       success: false,
//       message: "Internal server error",
//     });
//   });
// });

// describe("get consumer by ID", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return 404 when consumer is not found", async () => {
//     Consumer.findById.mockReturnValue({
//       select: jest.fn().mockResolvedValue(null),
//     });

//     await getConsumerById(mockRequest, mockResponse);

//     expect(Consumer.findById).toHaveBeenCalledWith("noneExistent123");
//     expect(Consumer.findById.mock.results[0].value.select).toHaveBeenCalledWith(
//       "-password"
//     );
//     expect(mockResponse.status).toHaveBeenCalledWith(404);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       success: false,
//       message: "Consumer not found",
//     });
//   });

//   it("should return 200 on success", async () => {
//     mockRequest.params.id = 1;

//     const fakeConsumer = { _id: "1", name: "john" };

//     Consumer.findById.mockReturnValue({
//       select: jest.fn().mockResolvedValue(fakeConsumer),
//     });

//     await getConsumerById(mockRequest, mockResponse);
//     expect(Consumer.findById).toHaveBeenCalledTimes(1);
//     expect(Consumer.findById).toHaveBeenCalledWith(mockRequest.params.id);
//     expect(Consumer.findById.mock.results[0].value.select).toHaveBeenCalledWith(
//       "-password"
//     );
//     expect(mockResponse.status).toHaveBeenCalledWith(200);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       success: true,
//       data: fakeConsumer,
//     });
//   });

//   it("should return 500 when server or database fails", async () => {
//     mockRequest.params.id = "1";

//     Consumer.findById.mockReturnValue({
//       select: jest
//         .fn()
//         .mockRejectedValueOnce(new Error("Database connection failed")),
//     });
//     await getConsumerById(mockRequest, mockResponse);

//     expect(Consumer.findById).toHaveBeenCalledWith("1");
//     expect(mockResponse.status).toHaveBeenCalledWith(500);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       success: false,
//       message: "Failed to fetch consumer",
//     });
//   });
// });

// describe("edit consumer by ID", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return 400 when there is validation error", async () => {
//     jest.spyOn(validator, "validationResult").mockReturnValue({
//       isEmpty: jest.fn(() => false),
//       array: jest.fn(() => [{ msg: "Invalid Field" }]),
//     });
//     mockRequest.params.id = 1;

//     await editConsumerById(mockRequest, mockResponse);
//     expect(validator.validationResult).toHaveBeenCalledTimes(1);
//     expect(validator.validationResult).toHaveBeenCalledWith(mockRequest);
//     expect(mockResponse.status).toHaveBeenCalledWith(400);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       success: false,
//       errors: [{ msg: "Invalid Field" }],
//     });
//   });

//   it("should return 404 when consumer is not found", async () => {
//     jest.spyOn(validator, "validationResult").mockReturnValue({
//       isEmpty: jest.fn(() => true),
//     });

//     Consumer.findByIdAndUpdate.mockResolvedValue(null);

//     await editConsumerById(mockRequest, mockResponse);

//     expect(Consumer.findByIdAndUpdate).toHaveBeenCalledWith(
//       mockRequest.params.id,
//       expect.any(Object),
//       { new: true, runValidators: true }
//     );

//     expect(mockResponse.status).toHaveBeenCalledWith(404);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       success: false,
//       message: "Consumer not found",
//     });
//   });

//   it("should return 200 and updated consumer on success", async () => {
//     jest.spyOn(validator, "validationResult").mockReturnValue({
//       isEmpty: jest.fn(() => true),
//     });

//     jest.spyOn(validator, "matchedData").mockReturnValue({
//       name: "Updated",
//       password: "newpass123",
//     });

//     helpers.hashPassword.mockResolvedValue("hashed_newpass123");

//     const updatedConsumer = { _id: "1", name: "Updated" };
//     Consumer.findByIdAndUpdate.mockResolvedValue(updatedConsumer);

//     await editConsumerById(mockRequest, mockResponse);

//     expect(helpers.hashPassword).toHaveBeenCalledWith("newpass123");
//     expect(Consumer.findByIdAndUpdate).toHaveBeenCalledWith(
//       mockRequest.params.id,
//       { name: "Updated", password: "hashed_newpass123" },
//       { new: true, runValidators: true }
//     );
//     expect(mockResponse.status).toHaveBeenCalledWith(200);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       success: true,
//       message: "Consumer updated successfully",
//       data: updatedConsumer,
//     });
//   });

//   it("should return 500 when DB fails to updated consumer", async () => {
//     jest.spyOn(validator, "validationResult").mockReturnValue({
//       isEmpty: jest.fn(() => true),
//     });

//     Consumer.findByIdAndUpdate.mockRejectedValue(
//       new Error("Failed to update consumer")
//     );

//     await editConsumerById(mockRequest, mockResponse);

//     expect(mockResponse.status).toHaveBeenCalledWith(500);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       success: false,
//       message: "Failed to update consumer",
//       error: "Failed to update consumer",
//     });
//   });
// });

// describe("delete consumer by id", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return 404 when consumer is not found", async () => {
//     Consumer.findByIdAndDelete.mockResolvedValue(null);

//     await deleteConsumerById(mockRequest, mockResponse);

//     expect(Consumer.findByIdAndDelete).toHaveBeenCalledTimes(1);
//     expect(Consumer.findByIdAndDelete).toHaveBeenCalledWith(
//       mockRequest.params.id
//     );
//     expect(mockResponse.status).toHaveBeenCalledWith(404);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       success: false,
//       message: "Consumer not found",
//     });
//   });

//   it("should return 200 when deleted successfully", async () => {
//     const fakeDeletedConsumer = { _id: "1", name: "John" };
//     Consumer.findByIdAndDelete.mockResolvedValue(fakeDeletedConsumer);

//     await deleteConsumerById(mockRequest, mockResponse);

//     expect(Consumer.findByIdAndDelete).toHaveBeenCalledWith(
//       mockRequest.params.id
//     );
//     expect(mockResponse.status).toHaveBeenCalledWith(200);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       success: true,
//       message: "Consumer deleted successfully",
//       data: fakeDeletedConsumer,
//     });
//   });

//   it("should return 500 when server or database fails", async () => {
//     // Arrange
//     Consumer.findByIdAndDelete.mockRejectedValue(
//       new Error("Database connection failed")
//     );

//     // Act
//     await deleteConsumerById(mockRequest, mockResponse);

//     // Assert
//     expect(Consumer.findByIdAndDelete).toHaveBeenCalledWith(
//       mockRequest.params.id
//     );
//     expect(mockResponse.status).toHaveBeenCalledWith(500);
//     expect(mockResponse.json).toHaveBeenCalledWith({
//       success: false,
//       message: "Failed to delete consumer",
//       error: "Database connection failed",
//     });
//   });
// });
