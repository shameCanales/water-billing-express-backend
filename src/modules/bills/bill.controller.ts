import { matchedData, validationResult } from "express-validator";
import { BillService, type CreateBillData } from "./bill.service.ts";
import type { Request, Response } from "express";
import type { IBill } from "./bill.model.ts";

export const BillController = {
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const bills = await BillService.getAllBills();

      return res.status(200).json({
        success: true,
        message: "Bills retrieved successfully",
        count: bills.length,
        data: bills,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown Error";

      return res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  },

  async getByConnection(
    req: Request<{ connectionId: string }>,
    res: Response
  ): Promise<Response> {
    try {
      const { connectionId } = req.params;
      const bills = await BillService.getBillsByConnection(connectionId);

      return res.status(200).json({
        success: true,
        count: bills.length,
        message: "bills fetched succesfully",
        data: bills,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown Error";
      const status = errorMessage.includes("not found") ? 404 : 500;

      return res.status(status).json({
        success: false,
        message: errorMessage,
      });
    }
  },

  async create(req: Request, res: Response): Promise<Response> {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const data = matchedData(req) as CreateBillData;
      const bill = await BillService.addBill(data);

      return res.status(201).json({
        success: true,
        message: "Bill added successfully",
        data: bill,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown Error";
      const status =
        errorMessage.includes("exists") || errorMessage.includes("duplicate")
          ? 409
          : 400;

      return res.status(status).json({
        success: false,
        message: errorMessage,
      });
    }
  },

  async update(
    req: Request<{ billId: string }>,
    res: Response
  ): Promise<Response> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const update = matchedData(req) as Partial<IBill>;
      const { billId } = req.params;
      const bill = await BillService.updateBill(billId, update);

      return res.status(200).json({
        success: true,
        message: "Bill updated successfully",
        data: bill,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown Error";
      const status = errorMessage.includes("not found") ? 404 : 500;

      return res.status(status).json({
        success: false,
        message: errorMessage,
      });
    }
  },

  async updateStatus(
    req: Request<
      { billId: string },
      any,
      { status: "paid" | "unpaid" | "overdue" }
    >, // three objects: params, body, query
    res: Response
  ): Promise<Response> {
    try {
      const { billId } = req.params;
      const { status } = req.body;
      const bill = await BillService.updateBillStatus(billId, status);

      return res.status(200).json({
        success: true,
        message: "Bill status updated successfully",
        data: bill,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown Error";

      return res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  },

  async delete(
    req: Request<{ billId: string }>,
    res: Response
  ): Promise<Response> {
    try {
      const { billId } = req.params;
      const bill = await BillService.deleteBill(billId);

      return res.status(200).json({
        success: true,
        message: "Bill deleted successfully",
        data: bill,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown Error";
      const status = errorMessage.includes("not found") ? 404 : 500;

      return res.status(status).json({
        success: false,
        message: errorMessage,
      });
    }
  },
};
