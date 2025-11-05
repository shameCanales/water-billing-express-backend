import { requireAuthAndStaffOrManager } from "../middlewares/authmiddleware.js";
import { Consumer } from "../mongoose/schemas/consumer.js";
import { Router } from "express";
import { addConsumerValidationSchema } from "../middlewares/validationSchemas/addConsumerValidation.js";
import { checkSchema, validationResult, matchedData } from "express-validator";
import { validateObjectIdReusable } from "../middlewares/validateObjectId.js";
import { hashPassword } from "../utils/helpers.js";
import {
  getAllConsumersHandler,
  createConsumerHandler,
} from "../controllers/consumer.controller.js";

const router = Router();

// get all consumers :  [{name, email, birthDate, mobileNumber, password, address, status}, ...]
router.get(
  "/api/consumers",
  requireAuthAndStaffOrManager,
  getAllConsumersHandler
);

//add consumer
router.post(
  "/api/consumers",
  requireAuthAndStaffOrManager,
  checkSchema(addConsumerValidationSchema),
  createConsumerHandler
);

// Edit Consumer by ID
router.patch(
  "/api/consumers/:id",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "id" }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = matchedData(req);

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
