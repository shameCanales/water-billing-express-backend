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
router.patch(
  "/api/consumers/:id",
  requireAuthAndStaffOrManager,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

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

      res.status(200).json({
        success: true,
        message: "Consumer updated successfully",
        data: updatedConsumer,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update consumer",
        error: error.message,
      });
    }
  }
);

// Delete Consumer by ID
router.delete(
  "/api/consumers/:id",
  requireAuthAndStaffOrManager,
  async (req, res) => {
    try {
      const { id } = req.params;

      const deletedConsumer = await Consumer.findByIdAndDelete(id);

      if (!deletedConsumer) {
        return res.status(404).json({
          success: false,
          message: "Consumer not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Consumer deleted successfully",
        data: deletedConsumer,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete consumer",
        error: error.message,
      });
    }
  }
);

// Get Consumer by ID



export default router;
