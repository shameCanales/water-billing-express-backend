import { BillRepository } from "./bill.repository.js";
import { ConnectionRepository } from "../connections/connection.repository.js";
import { SettingsRepository } from "../settings/settings.repository.js";

import type {
  IBill,
  CreateBillData,
  BillStatus,
  IBillPopulatedLean,
  PaginatedBillsResult,
  IBillSummary,
} from "./bill.types.ts";
import { Consumer } from "../consumers/consumer.model.js";
import { Connection } from "../connections/connection.model.js";
import {
  formatCurrency,
  calculateBillFinancials,
} from "../../core/utils/finance.utils.js";

interface GetAllBillsParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
}

export const BillService = {
  async getAllBills(params: GetAllBillsParams): Promise<PaginatedBillsResult> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
    } = params;
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");

      // Step A: Find Consumers matching the name/email/mobile
      const matchingConsumers = await Consumer.find({
        $or: [
          { email: searchRegex },
          { mobileNumber: searchRegex },
          { firstName: searchRegex },
          { lastName: searchRegex },
        ],
      })
        .select("_id")
        .lean(); // We only need the IDs

      const consumerIds = matchingConsumers.map((c) => c._id);

      // Step B: Find Connections belonging to those Consumers OR matching meter number
      const matchingConnections = await Connection.find({
        $or: [
          { consumer: { $in: consumerIds } }, // Matches Consumer Name/Email
          { meterNumber: !isNaN(Number(search)) ? Number(search) : null }, // Matches Meter #
        ],
      })
        .select("_id")
        .lean();

      const connectionIds = matchingConnections.map((c) => c._id);
      // Step C: Filter Bills that belong to these Connections
      filter.connection = { $in: connectionIds };
    }

    const sort: any = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [bills, total] = await Promise.all([
      BillRepository.findAll(filter, sort, skip, limit),
      BillRepository.count(filter),
    ]);

    return {
      bills,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    };
  },

  async getBillById(billId: string): Promise<IBillPopulatedLean> {
    const bill = await BillRepository.findById(billId);
    if (!bill) throw new Error("bill not found");
    return bill;
  },

  async getBillsByConnection(connection: string): Promise<IBillSummary[]> {
    const connectionExists = await ConnectionRepository.findById(connection);

    if (!connectionExists) throw new Error("Connection not found");
    return await BillRepository.findByConnection(connection);
  },

  async addBill(
    data: CreateBillData & { createdBy: string },
  ): Promise<IBillPopulatedLean> {
    const { connection, monthOf, dueDate, meterReading, status, createdBy } =
      data;

    // 1. Validation Guards
    const findConnection = await ConnectionRepository.findById(connection);
    if (!findConnection) throw new Error("Connection not found");

    const m = new Date(monthOf);
    const monthDate = new Date(
      Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), 1),
    );

    const dueDateObj = new Date(dueDate);
    if (isNaN(monthDate.getTime()) || isNaN(dueDateObj.getTime()))
      throw new Error("Invalid date format");

    const existing = await BillRepository.findOneByConnectionAndMonth(
      connection,
      monthDate,
    );
    if (existing) throw new Error("A bill for this month already exists");

    // 2. Data Fetching
    const [chargePerCubicMeter, surchargeRate, lastBill] = await Promise.all([
      SettingsRepository.getSettingValue("chargePerCubicMeter"),
      SettingsRepository.getSettingValue("surchargeRate"),
      BillRepository.findLastBill(connection),
    ]);

    // 3. Calculation Logic
    const isAddedLate = dueDateObj < new Date();
    const financials = calculateBillFinancials(
      meterReading,
      lastBill?.meterReading || 0,
      chargePerCubicMeter,
      surchargeRate,
      isAddedLate,
    );

    const finalStatus = isAddedLate && status === "unpaid" ? "overdue" : status;

    // 4. Persistence
    const newBill = await BillRepository.create({
      ...financials, // consumedUnits, billAmount, surchargeAmount, totalAmount
      connection,
      monthOf: monthDate,
      dueDate: dueDateObj,
      meterReading,
      chargePerCubicMeter,
      appliedSurchargePercent: surchargeRate,
      status: finalStatus,
      paidAt: finalStatus === "paid" ? new Date() : null,
      createdBy,
      processedBy: finalStatus === "paid" ? createdBy : null,
      lastEditBy: null,
      lastEditAt: null,
    } as IBill);

    return (await BillRepository.findById(newBill._id.toString()))!;
  },

  async processOverdueSurcharges(): Promise<number> {
    const overdueBills = await BillRepository.findOverdueUnprocessed(
      new Date(),
    );
    if (overdueBills.length === 0) return 0;

    const updates = overdueBills.map((bill) => {
      const surcharge = formatCurrency(
        bill.billAmount * bill.appliedSurchargePercent,
      );
      bill.surchargeAmount = surcharge;
      bill.totalAmount = formatCurrency(bill.billAmount + surcharge);
      bill.status = "overdue";
      return bill.save();
    });

    await Promise.all(updates);
    return overdueBills.length;
  },

  async updateBill(
    billId: string,
    updates: Partial<IBill> & { lastEditBy: string },
  ): Promise<IBillSummary> {
    const bill = await BillRepository.findById(billId);

    // Rule 1: Guard against missing or paid bills
    if (!bill) throw new Error("Bill not found");
    if (bill.status === "paid")
      throw new Error("Invalid update: Paid bills are locked.");

    // Rule 2: Recalculate if meter reading changes
    if (
      updates.meterReading !== undefined &&
      updates.meterReading !== bill.meterReading
    ) {
      const lastBill = await BillRepository.findLastBill(
        bill.connection as any,
      );

      const previousReading =
        lastBill && lastBill._id.toString() !== billId
          ? lastBill.meterReading
          : 0;
      const isPastDue = new Date(bill.dueDate) < new Date();

      const financials = calculateBillFinancials(
        updates.meterReading,
        previousReading,
        bill.chargePerCubicMeter,
        bill.appliedSurchargePercent,
        isPastDue || bill.surchargeAmount > 0,
      );

      Object.assign(updates, {
        ...financials,
        lastEditBy: updates.lastEditBy,
        lastEditAt: new Date(),
      });
    } else {
      updates.lastEditAt = new Date();
    }

    const updated = await BillRepository.updateById(billId, updates);
    if (!updated) throw new Error("Failed to update Bill");
    return updated;
  },

  async updateBillStatus(
    billId: string,
    status: BillStatus,
    adminId: string,
  ): Promise<IBillSummary> {
    const bill = await BillRepository.findById(billId);
    if (!bill) throw new Error("Bill not found");
    if (bill.status === "paid")
      throw new Error("Financial Protection: Cannot modify a paid bill.");
    if (bill.status === status) throw new Error(`Bill is already ${status}`);

    const isPastDue = new Date(bill.dueDate) < new Date();

    const updatedData: Partial<IBill> = {
      status,
      paidAt: status === "paid" ? new Date() : null,
      processedBy: status === "paid" ? adminId : null,
    };

    // Auto-apply Surcharge if moving to a late status
    const movingToLate =
      status === "overdue" || (status === "unpaid" && isPastDue);
    if (movingToLate && bill.surchargeAmount === 0) {
      const surcharge = formatCurrency(
        bill.billAmount * bill.appliedSurchargePercent,
      );
      updatedData.surchargeAmount = surcharge;
      updatedData.totalAmount = formatCurrency(bill.billAmount + surcharge);
      updatedData.lastEditBy = adminId;
      updatedData.lastEditAt = new Date();
    }

    const updated = await BillRepository.updateById(billId, updatedData);
    if (!updated) throw new Error("Failed to update bill status");
    return updated;
  },

  async deleteBill(billId: string): Promise<IBillSummary> {
    const bill = await BillRepository.findById(billId);
    if (!bill) throw new Error("Bill not found");

    if (bill.status === "paid")
      throw new Error("Audit Protection: Cannot delete a paid bill.");

    const deleted = await BillRepository.deleteById(billId);
    if (!deleted) throw new Error("Failed to delete bill");

    return deleted;
  },
};
