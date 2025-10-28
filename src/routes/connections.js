import { Connection } from "../mongoose/schemas/connection.js";
import { Consumer } from "../mongoose/schemas/consumer.js";
import { Router } from "express";
import {
  requireAuthAndStaffOrManager,
  requireAuth,
  requireAuthAndManager,
} from "../middlewares/authmiddleware.js";
import { validateObjectIdReusable } from "../middlewares/validateObjectId.js";
import { addConnectionValidationSchema } from "../middlewares/validationSchemas/addConnectionValidation.js";
import { editConnectionValidationSchema } from "../middlewares/validationSchemas/editConnectionValidation.js";
import { checkSchema, validationResult } from "express-validator";

const router = Router();

// Add new connection for a specific consumer
router.post(
  "/api/connections",
  requireAuthAndStaffOrManager,
  checkSchema(addConnectionValidationSchema),
  validateObjectIdReusable({ key: "consumerId" }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const { consumerId, meterNumber, address, connectionDate, type, status } =
        req.body;

      const existingConsumer = await Consumer.findById(consumerId);
      if (!existingConsumer) {
        return res.status(404).json({
          success: false,
          message: "Consumer not found",
        });
      }

      const existingConnection = await Connection.findOne({ meterNumber });
      if (existingConnection) {
        return res.status(400).json({
          success: false,
          message: "Connection with this meter number already exists",
        });
      }

      const newConnection = await Connection.create({
        consumer: consumerId,
        meterNumber,
        address,
        connectionDate,
        type,
        status,
      });

      const populatedConnection = await newConnection.populate(
        "consumer",
        "name email mobileNumber"
      );

      res.status(201).json({
        success: true,
        message: "Connection added successfully",
        data: populatedConnection,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server error: Failed to add connection",
        // error: error.message,
      });
    }
  }
);

// Get all connections
router.get(
  "/api/connections",
  requireAuthAndStaffOrManager,
  async (req, res) => {
    try {
      const connections = await Connection.find().populate(
        "consumer",
        "name email mobileNumber"
      );

      res.status(200).json({
        success: true,
        message: "Connections retrieved successfully",
        data: connections,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch connections",
        error: error.message,
      });
    }
  }
);

// edit connection by id
router.patch(
  "/api/connections/:id",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "id" }),
  checkSchema(editConnectionValidationSchema),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const { id } = req.params;
      const updates = req.body;

      const updatedConnection = await Connection.findByIdAndUpdate(
        id,
        updates,
        {
          new: true,
          runValidators: true,
        }
      ).populate("consumer", "name email mobileNumber");

      if (!updatedConnection) {
        return res.status(404).json({
          success: false,
          message: "Connection not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Connection updated successfully",
        data: updatedConnection,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server error: Failed to update connection.",
        // error: error.message,
      });
    }
  }
);

// delete connection by id
router.delete(
  "/api/connections/:id",
  requireAuthAndManager,
  validateObjectIdReusable({ key: "id" }),
  async (req, res) => {
    try {
      const { id } = req.params;

      const deletedConnection = await Connection.findByIdAndDelete(id);

      if (!deletedConnection) {
        return res.status(404).json({
          success: false,
          message: "Connection not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Connection deleted successfully",
        data: deletedConnection,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to delete connection",
        error: error.message,
      });
    }
  }
);

// get connections for a specific consumer
router.get(
  "/api/connections/consumer/:consumerid",
  requireAuth,
  validateObjectIdReusable({ key: "consumerid" }),
  async (req, res) => {
    try {
      const { consumerid } = req.params;

      const connections = await Connection.find({
        consumer: consumerid,
      })
        .populate("consumer", "name email mobileNumber")
        .sort({ createdAt: -1 })
        .lean();

      const message =
        connections.length > 0
          ? "Connections retrieved successfuly"
          : "No connections found for this consumer";

      res.status(200).json({
        success: true,
        message,
        data: connections,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch connections",
        error: error.message,
      });
    }
  }
);

// get connection by id

// deactivate connection

// activate connection

// get active connections

// get disconnected connections

// get connections by type

export default router;
