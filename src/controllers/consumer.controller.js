import { Consumer } from "../mongoose/schemas/consumer.js";
import { hashPassword } from "../utils/helpers.js";
import { matchedData, validationResult } from "express-validator";

export const getAllConsumersHandler = async (req, res) => {
  try {
    const consumers = await Consumer.find().select("-password");

    return res.status(200).json({
      success: true,
      data: consumers,
    });
  } catch (error) {
    console.error("Error fetching consumers: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch consumers",
      // error: error.message, should not send to client.
    });
  }
};

export const createConsumerHandler = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, birthDate, mobileNumber, password, address, status } =
    matchedData(req);

  const hashedPassword = await hashPassword(password);

  try {
    const existingConsumer = await Consumer.findOne({ email });

    if (existingConsumer) {
      return res.status(409).json({
        success: false,
        message: "Consumer with this email already exists",
      });
    }

    const newConsumer = await Consumer.create({
      name,
      email,
      birthDate,
      mobileNumber,
      password: hashedPassword,
      address,
      status,
    });

    const { password: _, ...consumerData } = newConsumer.toObject();

    return res.status(201).json({
      success: true,
      message: "Consumer added successfully",
      data: consumerData,
    });
  } catch (error) {
    console.error("Error creating consumer:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      // error: error.message,
    });
  }
};

export const getConsumerById = async (req, res) => {
  try {
    const { id } = req.params;

    const consumer = await Consumer.findById(id).select("-password"); // Exclude password from response

    if (!consumer) {
      return res.status(404).json({
        success: false,
        message: "Consumer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: consumer,
    });
  } catch (error) {
    console.log(error, error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch consumer",
      // error: error.message,
    });
  }
};

export const editConsumerById = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    const updates = matchedData(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const updatedConsumer = await Consumer.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedConsumer) {
      return res.status(404).json({
        success: false,
        message: "Consumer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Consumer updated successfully",
      data: updatedConsumer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update consumer",
      error: error.message,
    });
  }
};
