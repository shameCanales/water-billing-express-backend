import { matchedData } from "express-validator";
import type { BillStatus, CreateBillData, IBill } from "./bill.types.ts";
import type { Request, Response } from "express";
import { BillService } from "./bill.service.ts";
import { handleControllerError } from "../../core/utils/errorHandler.ts";

export const BillController = {
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { page, limit, search, status, sortBy, sortOrder } =
        matchedData(req);

      const bills = await BillService.getAllBills({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        status,
      });

      return res.status(200).json({
        success: true,
        message: "Bills retrieved successfully",
        data: bills,
      });
    } catch (err) {
      return handleControllerError(err, res);
    }
  },

  async getByConnection(req: Request, res: Response): Promise<Response> {
    try {
      const { connectionId } = matchedData(req) as { connectionId: string };
      const bills = await BillService.getBillsByConnection(connectionId);

      return res.status(200).json({
        success: true,
        count: bills.length,
        message: "bills fetched succesfully",
        data: bills,
      });
    } catch (err) {
      return handleControllerError(err, res);
    }
  },

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const data = matchedData(req) as CreateBillData;
      const bill = await BillService.addBill(data);

      return res.status(201).json({
        success: true,
        message: "Bill added successfully",
        data: bill,
      });
    } catch (err) {
      return handleControllerError(err, res);
    }
  },

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { billId, ...update } = matchedData(req) as {
        billId: string;
      } & Partial<IBill>;
      const bill = await BillService.updateBill(billId, update);

      return res.status(200).json({
        success: true,
        message: "Bill updated successfully",
        data: bill,
      });
    } catch (err) {
      return handleControllerError(err, res);
    }
  },

  async updateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { billId, status } = matchedData(req) as {
        billId: string;
        status: BillStatus;
      };
      const bill = await BillService.updateBillStatus(billId, status);

      return res.status(200).json({
        success: true,
        message: "Bill status updated successfully",
        data: bill,
      });
    } catch (err: any) {
      return handleControllerError(err, res);
    }
  },

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { billId } = matchedData(req) as { billId: string };
      const bill = await BillService.deleteBill(billId);

      return res.status(200).json({
        success: true,
        message: "Bill deleted successfully",
        data: bill,
      });
    } catch (err) {
      return handleControllerError(err, res);
    }
  },
};
