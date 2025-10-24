import { requireAuthAndStaffOrManager } from "../middlewares/authmiddleware.js";
import { Consumer } from "../mongoose/schemas/consumer.js";
import { Router } from "express";
import { addConsumerValidationSchema } from "../middlewares/validationSchemas/addConsumerValidation.js";
import { checkSchema, validationResult } from "express-validator";

const router = Router();

// get all consumers
router.get("/api/consumers", requireAuthAndStaffOrManager, async (req, res) => {
  try {
    const consumers = await Consumer.find();

    return res.status(200).json({
      success: true,
      data: consumers,
    });
  } catch (error) {
    console.error("Error fetching consumers: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch consumers",
      error: error.message,
    });
  }
});

// name, email, birthDate, mobileNumber, password, address, status

//add consumer
router.post(
  "/api/consumers",
  checkSchema(addConsumerValidationSchema),
  requireAuthAndStaffOrManager,
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, birthDate, mobileNumber, password, address, status } =
      req.body;

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
        password,
        address,
        status,
      });

      return res.status(201).json({
        success: true,
        message: "Consumer added successfully",
        data: newConsumer,
      });
    } catch (error) {
      console.error("Error creating consumer:", error.message);

      return res.status(500).json({
        success: false,
        message: "Error registering consumer",
        error: error.message,
      });
    }
  }
);

// Edit Consumer by ID

// Delete Consumer by ID 

// Get Consumer by ID

export default router;
