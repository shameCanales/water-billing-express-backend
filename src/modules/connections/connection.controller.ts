import { validationResult, matchedData } from "express-validator";
import { ConnectionService } from "./connection.service.js";
import type { Request, Response } from "express";
import type { IConnection } from "./connection.model.js";

export const ConnectionController = {
  async create(req: Request, res: Response): Promise<Response> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const data = matchedData(req) as IConnection;
      const newConnection = await ConnectionService.create(data);
      return res.status(201).json({
        success: true,
        message: "Connection added successfully",
        data: newConnection,
      });
    } catch (error: any) {
      const status = error.message.includes("not found")
        ? 404
        : error.message.includes("exists")
        ? 400
        : 500;

      return res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const connections = await ConnectionService.getAll();
      return res.status(200).json({
        success: true,
        message: "Connections retrieved successfully",
        data: connections,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch connections",
      });
    }
  },

  async updateById(req: Request, res: Response): Promise<Response> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const { connectionId } = req.params;
      const updates = matchedData(req);

      if (!connectionId) {
        return res.status(400).json({
          success: false,
          message: "Connection ID is required",
        });
      }
      const updated = await ConnectionService.updateById(connectionId, updates);

      return res.status(200).json({
        success: true,
        message: "Connection updated successfully",
        data: updated,
      });
    } catch (error: any) {
      const status = error.message.includes("not found") ? 404 : 500;
      return res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  },

  async deleteById(req: Request, res: Response): Promise<Response> {
    try {
      const { connectionId } = req.params;
      if (!connectionId) {
        return res.status(400).json({
          success: false,
          message: "Connection ID is required",
        });
      }
      await ConnectionService.deleteById(connectionId);

      return res.status(200).json({
        success: true,
        message: "Connection deleted successfully",
      });
    } catch (error: any) {
      const status = error.message.includes("not found") ? 404 : 500;
      return res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  },

  async getByConsumerId(req: Request, res: Response): Promise<Response> {
    try {
      const { consumerId } = req.params;

      if (!consumerId) {
        return res.status(400).json({
          success: false,
          message: "Consumer ID is required",
        });
      }

      const data = await ConnectionService.getByConsumerId(consumerId);

      return res.status(200).json({
        success: true,
        message: data.length
          ? "Connections retrieved successfully"
          : "No connections found for this consumer",
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch connections",
      });
    }
  },
};

// export const addNewConnectionToAConsumerHandler = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       success: false,
//       errors: errors.array(),
//     });
//   }

//   try {
//     const { consumerId, meterNumber, address, connectionDate, type, status } =
//       req.body;

//     const existingConsumer = await Consumer.findById(consumerId);
//     if (!existingConsumer) {
//       return res.status(404).json({
//         success: false,
//         message: "Consumer not found",
//       });
//     }

//     const existingConnection = await Connection.findOne({ meterNumber });
//     if (existingConnection) {
//       return res.status(400).json({
//         success: false,
//         message: "Connection with this meter number already exists",
//       });
//     }

//     const newConnection = await Connection.create({
//       consumer: consumerId,
//       meterNumber,
//       address,
//       connectionDate,
//       type,
//       status,
//     });

//     const populatedConnection = await newConnection.populate(
//       "consumer",
//       "name email mobileNumber"
//     );

//     res.status(201).json({
//       success: true,
//       message: "Connection added successfully",
//       data: populatedConnection,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal Server error: Failed to add connection",
//       // error: error.message,
//     });
//   }
// };

// export const getAllConnectionsHandler = async (req, res) => {
//   try {
//     const connections = await Connection.find().populate(
//       "consumer",
//       "name email mobileNumber"
//     );

//     res.status(200).json({
//       success: true,
//       message: "Connections retrieved successfully",
//       data: connections,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch connections",
//       error: error.message,
//     });
//   }
// };

// export const editConnectionByIdHandler = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       success: false,
//       errors: errors.array(),
//     });
//   }

//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     const updatedConnection = await Connection.findByIdAndUpdate(id, updates, {
//       new: true,
//       runValidators: true,
//     }).populate("consumer", "name email mobileNumber");

//     if (!updatedConnection) {
//       return res.status(404).json({
//         success: false,
//         message: "Connection not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Connection updated successfully",
//       data: updatedConnection,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal Server error: Failed to update connection.",
//       // error: error.message,
//     });
//   }
// };

// export const deleteConnectionByIdHandler = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedConnection = await Connection.findByIdAndDelete(id);

//     if (!deletedConnection) {
//       return res.status(404).json({
//         success: false,
//         message: "Connection not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Connection deleted successfully",
//       data: deletedConnection,
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to delete connection",
//       error: error.message,
//     });
//   }
// };

// export const getConnectionsByConsumerIdHandler = async (req, res) => {
//   try {
//     const { consumerid } = req.params;

//     const connections = await Connection.find({
//       consumer: consumerid,
//     })
//       .populate("consumer", "name email mobileNumber")
//       .sort({ createdAt: -1 })
//       .lean();

//     const message =
//       connections.length > 0
//         ? "Connections retrieved successfuly"
//         : "No connections found for this consumer";

//     res.status(200).json({
//       success: true,
//       message,
//       data: connections,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch connections",
//       error: error.message,
//     });
//   }
// };
