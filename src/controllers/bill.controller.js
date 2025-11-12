import { matchedData, validationResult } from "express-validator";
import { BillService } from "../services/bill.service.js";

export const BillController = {
  async getAll(req, res) {
    try {
      const bills = await BillService.getAllBills();

      res.status(200).json({
        success: true,
        message: "Bills retrieved successfully",
        count: bills.length,
        data: bills,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  },

  async getByConnection(req, res) {
    try {
      const { connectionId } = req.params;
      const bills = await BillService.getBillsByConnection(connectionId);

      res.status(200).json({
        success: true,
        count: bills.length,
        message: "bills fetched succesfully",
        data: bills,
      });
    } catch (err) {
      const status = err.message.includes("not found") ? 404 : 500;

      res.status(status).json({
        success: false,
        message: err.message,
      });
    }
  },

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const data = matchedData(req);
      const bill = await BillService.addBill(data);

      res.status(201).json({
        success: true,
        message: "Bill added successfully",
        data: bill,
      });
    } catch (err) {
      const status =
        err.message.includes("exists") || err.message.includes("duplicate")
          ? 409
          : 400;

      res.status(status).json({
        success: false,
        message: err.message,
      });
    }
  },

  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const update = matchedData(req);
      const { billId } = req.params;
      const bill = await BillService.updateBill(billId, update);

      res.status(200).json({
        success: true,
        message: "Bill updated successfully",
        data: bill,
      });
    } catch (err) {
      const status = err.message.includes("not found") ? 404 : 500;
      res.status(status).json({
        success: false,
        message: err.message,
      });
    }
  },

  async updateStatus(req, res) {
    try {
      const { billId } = req.params;
      const { status } = req.body;
      const bill = await BillService.updateBillStatus(billId, status);
      res.status(200).json({
        success: true,
        message: "Bill status updated successfully",
        data: bill,
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async delete(req, res) {
    try {
      const { billId } = req.params;
      const bill = await BillService.deleteBill(billId);
      res.status(200).json({
        success: true,
        message: "Bill deleted successfully",
        data: bill,
      });
    } catch (err) {
      const status = err.message.includes("not found") ? 404 : 500;
      res.status(status).json({ success: false, message: err.message });
    }
  },
};
