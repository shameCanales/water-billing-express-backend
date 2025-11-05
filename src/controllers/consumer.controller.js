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
