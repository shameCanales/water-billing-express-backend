import { matchedData } from "express-validator";
import { ConnectionService } from "./connection.service.ts";
import type { Request, Response } from "express";
import type { IConnection } from "./connection.types.ts";
import { handleControllerError } from "../../core/utils/errorHandler.ts";

export const ConnectionController = {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const data = matchedData(req) as IConnection;
      const newConnection = await ConnectionService.create(data);

      return res.status(201).json({
        success: true,
        message: "Connection added successfully",
        data: newConnection,
      });
    } catch (err: any) {
      return handleControllerError(err, res);
    }
  },

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { page, limit, search, status, type, sortBy, sortOrder } =
        matchedData(req);

      const connections = await ConnectionService.getAll({
        page,
        limit,
        search,
        status,
        type,
        sortBy,
        sortOrder,
      });

      return res.status(200).json({
        success: true,
        message: "Connections retrieved successfully",
        data: connections,
      });
    } catch (err) {
      return handleControllerError(err, res);
    }
  },

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { connectionId } = matchedData(req) as { connectionId: string };
      const connection = await ConnectionService.getById(connectionId);

      return res.status(200).json({ success: true, data: connection });
    } catch (err: any) {
      return handleControllerError(err, res);
    }
  },

  async updateById(req: Request, res: Response): Promise<Response> {
    try {
      const { connectionId, ...updates } = matchedData(req);

      const updated = await ConnectionService.updateById(connectionId, updates);

      return res.status(200).json({
        success: true,
        message: "Connection updated successfully",
        data: updated,
      });
    } catch (err) {
      return handleControllerError(err, res);
    }
  },

  async updateStatusById(req: Request, res: Response): Promise<Response> {
    try {
      const { connectionId, status } = matchedData(req);

      const updatedConnection = await ConnectionService.updateStatusById(
        connectionId,
        status,
      );

      return res.status(200).json({
        success: true,
        message: `Connection status updated to ${status} successfully`,
        data: updatedConnection,
      });
    } catch (err) {
      return handleControllerError(err, res);
    }
  },

  async deleteById(req: Request, res: Response): Promise<Response> {
    try {
      const { connectionId } = matchedData(req);

      await ConnectionService.deleteById(connectionId);

      return res.status(200).json({
        success: true,
        message: "Connection deleted successfully",
      });
    } catch (err) {
      return handleControllerError(err, res);
    }
  },

  async getByConsumerId(req: Request, res: Response): Promise<Response> {
    try {
      const { consumerId } = matchedData(req);

      const data = await ConnectionService.getByConsumerId(consumerId);

      return res.status(200).json({
        success: true,
        message: data.length
          ? "Connections retrieved successfully"
          : "No connections found for this consumer",
        data,
      });
    } catch (err) {
      return handleControllerError(err, res);
    }
  },
};
