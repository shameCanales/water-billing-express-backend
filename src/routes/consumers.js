import { requireAuthAndStaffOrManager } from "../middlewares/authmiddleware.js";
import { Consumer } from "../mongoose/schemas/consumer.js";
import { Router } from "express";
import { addConsumerValidationSchema } from "../middlewares/validationSchemas/addConsumerValidation.js";
import { checkSchema, validationResult, matchedData } from "express-validator";
import { validateObjectIdReusable } from "../middlewares/validateObjectId.js";
import { hashPassword } from "../utils/helpers.js";

const router = Router();

// get all consumers
router.get("/api/consumers", requireAuthAndStaffOrManager, async (req, res) => {
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
});

// name, email, birthDate, mobileNumber, password, address, status

//add consumer
router.post(
  "/api/consumers",
  requireAuthAndStaffOrManager,
  checkSchema(addConsumerValidationSchema),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    console.log(matchedData(req));

    const { name, email, birthDate, mobileNumber, password, address, status } =
      matchedData(req);

    const hashedPassword = hashPassword(password);

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
  }
);

// Edit Consumer by ID
router.patch(
  "/api/consumers/:id",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "id" }),
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
  validateObjectIdReusable({ key: "id" }),
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
router.get(
  "/api/consumers/:id",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "id" }),
  async (req, res) => {
    try {
      const { id } = req.params;

      const consumer = await Consumer.findById(id).select("-password"); // Exclude password from response

      if (!consumer) {
        return res.status(404).json({
          success: false,
          message: "Consumer not found",
        });
      }

      res.status(200).json({
        success: true,
        data: consumer,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch consumer",
        error: error.message,
      });
    }
  }
);

export default router;
