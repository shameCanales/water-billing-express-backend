import { Connection } from "../mongoose/schemas/connection.js";
import { Consumer } from "../mongoose/schemas/consumer.js";
import { Router } from "express";
import {
  requireAuthAndStaffOrManager,
  requireAuth,
  requireAuthAndManager,
} from "../middlewares/authmiddleware.js";

const router = Router();

// Add new connection for a specific consumer
router.post(
  "/api/connections",
  requireAuthAndStaffOrManager,
  async (req, res) => {
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
        message: "Failed to add connection",
        error: error.message,
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
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const udpatedConnection = await Connection.findByIdAndUpdate(
        id,
        updates,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!udpatedConnection) {
        return res.status(404).json({
          success: false,
          message: "Connection no found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Connection updated successfully",
        data: udpatedConnection,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update connection",
        error: error.message,
      });
    }
  }
);

// delete connection by id
router.delete(
  "/api/connections/:id",
  requireAuthAndManager,
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
      res.status(500).json({
        success: false,
        message: "Failed to delete connection",
        error: error.message,
      });
    }
  }
);

// get connections for a specific consumer

// get connection by id

// deactivate connection

// activate connection

// get active connections

// get disconnected connections

// get connections by type

export default router;
