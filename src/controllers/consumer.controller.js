import { matchedData, validationResult } from "express-validator";
import { ConsumerService } from "../services/consumer.service.js";

export const ConsumerController = {
  async getAll(req, res) {
    try {
      const consumers = await ConsumerService.getAllConsumers();
      return res.status(200).json({
        success: true,
        data: consumers,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch consumers",
        // error: error.message, should not send to client.
      });
    }
  },

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const data = matchedData(req);
      const newConsumer = await ConsumerService.createConsumer(data);

      return res.status(201).json({
        success: true,
        message: "Consumer added successfully",
        data: newConsumer,
      });
    } catch (error) {
      const status = error.message.includes("already exists") ? 409 : 500;

      return res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const consumer = await ConsumerService.getConsumerById(id);

      return res.status(200).json({
        success: true,
        message: "successfully fetched consumer by id",
        data: consumer,
      });
    } catch (error) {
      const status = error.message.includes("not found") ? 404 : 500;
      console.log(`${status}: ${error.message} ::::::::: ${error}`);

      return res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  },

  async editById(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const updates = matchedData(req);

      const updatedConsumer = await ConsumerService.updateConsumer(id, updates);

      return res.status(200).json({
        success: true,
        message: "Consumer updated successfully",
        data: updatedConsumer,
      });
    } catch (error) {
      const status = error.message.includes("not found") ? 404 : 500;

      return res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  },

  async deleteById(req, res) {
    try {
      await ConsumerService.deleteConsumer(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Consumer deleted successfully",
      });
    } catch (error) {
      const status = error.message.includes("not found") ? 404 : 500;
      console.log(`${status}: ${error.message} ::::::::: ${error}`);

      return res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  },
};

// BEFORE SEPARATING CODES TO CONTROLLERS, SERVICES, AND REPOSITORIES :::::::::::::::::::::::

// import { Consumer } from "../models/consumer.model.js";
// import { hashPassword } from "../utils/helpers.js";
// import { matchedData, validationResult } from "express-validator";
// import { ConsumerService } from "../services/consumer.service.js";

// export const getAllConsumersHandler = async (req, res) => {
//   try {
//     const consumers = await Consumer.find().select("-password");

//     return res.status(200).json({
//       success: true,
//       data: consumers,
//     });
//   } catch (error) {
//     console.error("Error fetching consumers: ", error.message);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch consumers",
//       // error: error.message, should not send to client.
//     });
//   }
// };

// export const createConsumerHandler = async (req, res) => {
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     return res.status(400).json({ success: false, errors: errors.array() });
//   }

//   const { name, email, birthDate, mobileNumber, password, address, status } =
//     matchedData(req);

//   const hashedPassword = await hashPassword(password);

//   try {
//     const existingConsumer = await Consumer.findOne({ email });

//     if (existingConsumer) {
//       return res.status(409).json({
//         success: false,
//         message: "Consumer with this email already exists",
//       });
//     }

//     const newConsumer = await Consumer.create({
//       name,
//       email,
//       birthDate,
//       mobileNumber,
//       password: hashedPassword,
//       address,
//       status,
//     });

//     const { password: _, ...consumerData } = newConsumer.toObject();

//     return res.status(201).json({
//       success: true,
//       message: "Consumer added successfully",
//       data: consumerData,
//     });
//   } catch (error) {
//     console.error("Error creating consumer:", error.message);

//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       // error: error.message,
//     });
//   }
// };

// export const getConsumerById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const consumer = await Consumer.findById(id).select("-password"); // Exclude password from response

//     if (!consumer) {
//       return res.status(404).json({
//         success: false,
//         message: "Consumer not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: consumer,
//     });
//   } catch (error) {
//     console.log(error, error.message);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch consumer",
//       // error: error.message,
//     });
//   }
// };

// export const editConsumerById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const errors = validationResult(req);
//     const updates = matchedData(req);

//     if (!errors.isEmpty()) {
//       return res.status(400).json({ success: false, errors: errors.array() });
//     }

//     if (updates.password) {
//       updates.password = await hashPassword(updates.password);
//     }

//     const updatedConsumer = await Consumer.findByIdAndUpdate(id, updates, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updatedConsumer) {
//       return res.status(404).json({
//         success: false,
//         message: "Consumer not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Consumer updated successfully",
//       data: updatedConsumer,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update consumer",
//       error: error.message,
//     });
//   }
// };

// export const deleteConsumerById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedConsumer = await Consumer.findByIdAndDelete(id);

//     if (!deletedConsumer) {
//       return res.status(404).json({
//         success: false,
//         message: "Consumer not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Consumer deleted successfully",
//       data: deletedConsumer,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Failed to delete consumer",
//       error: error.message,
//     });
//   }
// };
