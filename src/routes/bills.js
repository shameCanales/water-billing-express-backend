import { Bill } from "../mongoose/schemas/bill.js";
import { Connection } from "../mongoose/schemas/connection.js";
import { Router } from "express";
import {
  requireAuth,
  requireAuthAndStaffOrManager,
} from "../middlewares/authmiddleware.js";
import { BILLING_SETTINGS } from "../config/settings.js";
import { validateObjectIdReusable } from "../middlewares/validateObjectId.js";

const router = Router();

// Get all bills
router.get("/api/bills", requireAuthAndStaffOrManager, async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate({
        path: "connection",
        populate: {
          path: "consumer",
          select: "name email mobileNumber address",
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    

    res.status(200).json({
      success: true,
      message: `${bills.length} retrieved succesfully`,
      data: bills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bills",
      error: error.message,
    });
  }
});

// add bill to a connection
router.post(
  "/api/bills",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ source: "body", key: "connection" }),
  async (req, res) => {
    try {
      const {
        connection,
        monthOf,
        dueDate,
        meterReading,
        chargePerCubicMeter = BILLING_SETTINGS.chargePerCubicMeter,
      } = req.body;

      const monthDate = new Date(monthOf);
      monthDate.setDate(1); // sets the day of the date to the 1st date of the month.
      monthDate.setHours(0, 0, 0, 0); // sets the time to 00:00:00:00 (midnight)

      const dueDateObj = new Date(dueDate); // duedate = "2025-11-01" || "November 2025". convert to date object

      // Ensure connection exists
      const findConnection = await Connection.findById(connection).populate(
        "consumer",
        "name email mobileNumber"
      );
      if (!findConnection) {
        return res.status(404).json({
          success: false,
          message: "Connection not found",
        });
      }

      // prevent duplicate month bills
      const existingBill = await Bill.findOne({
        connection,
        monthOf: monthDate,
      });

      if (existingBill) {
        return res.status(400).json({
          success: false,
          message: `A bill for this period already exists for this connection`,
        });
      }

      // find the last bill for this connection
      const lastBill = await Bill.findOne({ connection })
        .sort({ createdAt: -1 })
        .lean();

      // compute consumed units
      let lastReading = lastBill ? lastBill.meterReading : 0;
      const consumedUnits = meterReading - lastReading;

      if (consumedUnits <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "Current meter reading cannot be lower than previous reading",
        });
      }

      // compute amount
      const amount = consumedUnits * chargePerCubicMeter;

      // create a save new bill
      const newBill = await Bill.create({
        connection,
        monthOf: monthDate,
        dueDate: dueDateObj,
        meterReading,
        chargePerCubicMeter,
        consumedUnits,
        amount,
        status: "unpaid",
      });

      // populate connection + consumer for response
      const populatedbill = await Bill.findById(newBill._id)
        .populate({
          path: "connection",
          populate: { path: "consumer", select: "name email mobileNumber" },
        })
        .lean();

      res.status(201).json({
        success: true,
        message: "Bill added successfully",
        data: populatedbill,
      });
    } catch (error) {
      console.error("Error creating bill: ", error);

      res.status(500).json({
        success: false,
        message: "Failed to add bill",
        error: error.message,
      });
    }
  }
);

// Get bills for a specific connection
router.get(
  "/api/connections/:connectionId/bills",
  requireAuth,
  validateObjectIdReusable({ key: "connectionId" }),
  async (req, res) => {
    try {
      const { connectionId } = req.params;

      const connectionExists = await Connection.exists({ _id: connectionId });
      if (!connectionExists) {
        return res.status(404).json({
          success: false,
          message: "Connection not found",
        });
      }

      const bills = await Bill.find({ connection: connectionId })
        .populate({
          path: "connection",
          populate: {
            path: "consumer",
            select: "name email mobileNumber address",
          },
        })
        .sort({ createdAt: -1 });

      if (!bills.length) {
        return res.status(404).json({
          success: false,
          message: "No bills found for this connection",
        });
      }

      res.status(200).json({
        success: true,
        count: bills.length,
        message: `${bills.length} bills retrieved successfully.`,
        data: bills,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch bills for this connection",
        error: error.message,
      });
    }
  }
);

// update bill information

// Update bill status (paid, unpaid, overdue)
router.patch(
  "/api/bills/:billId/status",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "billId" }),
  async (req, res) => {
    try {
      const { billId } = req.params;
      const { status } = req.body;

      //validate status value
      const allowedStatuses = ["paid", "unpaid", "overdue"];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Allowed values: ${allowedStatuses.join(
            ", "
          )}`,
        });
      }

      const existingBill = await Bill.findById(billId).populate({
        path: "connection",
        populate: {
          path: "consumer",
          select: "name email mobileNumber address",
        },
      });

      if (!existingBill) {
        return res.status(404).json({
          success: false,
          message: "Bill not found",
        });
      }

      if (existingBill.status === status) {
        return res.status(200).json({
          success: true,
          message: `Bill is already marked as ${status}`,
          data: existingBill,
        });
      }

      // set paidAt date when marked as paid
      const updateData = {
        status,
        paidAt: status === "paid" ? new Date() : null,
      };

      const updatedBill = await Bill.findByIdAndUpdate(billId, updateData, {
        new: true,
        runValidators: true,
      }).populate({
        path: "connection",
        populate: {
          path: "consumer",
          select: "name email mobileNumber address",
        },
      });

      res.status(200).json({
        success: true,
        message: "Bill status updated successfully",
        data: updatedBill,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update bill status",
        error: error.message,
      });
    }
  }
);

// Delete a bill
router.delete(
  "/api/bills/:billId",
  requireAuthAndStaffOrManager,
  validateObjectIdReusable({ key: "billId" }),
  async (req, res) => {
    try {
      const { billId } = req.params;

      const deletedBill = await Bill.findByIdAndDelete(billId);

      if (!deletedBill) {
        return res.status(404).json({
          success: false,
          message: "Bill not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Succesfully deleted bill and I don't know why would you want to delete it",
        data: deletedBill,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete bill",
        error: error.message,
      });
    }
  }
);

export default router;
