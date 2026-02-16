import { BillRepository } from "./bill.repository.ts";
import { ConnectionRepository } from "../connections/connection.repository.ts";
import { SettingsRepository } from "../settings/settings.repository.ts";
import {
  type IBill,
  type IBillDocument,
  type BillStatus,
  type IBillPopulatedLean,
  Bill,
  type PaginatedBillsResult,
} from "./bill.model.ts";
import { Consumer } from "../consumers/consumer.model.ts";
import { Connection } from "../connections/connection.model.ts";

import mongoose from "mongoose";

export type CreateBillData = Omit<
  IBill,
  "amount" | "chargePerCubicMeter" | "consumedUnits" | "paidAt" //NOTE: omit =  take Ibill without these fields
>;

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
      page,
      limit,
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
      }).select("_id"); // We only need the IDs

      const consumerIds = matchingConsumers.map((c) => c._id);

      // Step B: Find Connections belonging to those Consumers OR matching meter number
      const matchingConnections = await Connection.find({
        $or: [
          { consumer: { $in: consumerIds } }, // Matches Consumer Name/Email
          { meterNumber: !isNaN(Number(search)) ? Number(search) : null }, // Matches Meter #
        ],
      }).select("_id");

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

  async getBillsByConnection(connection: string): Promise<IBillDocument[]> {
    const connectionExists = await ConnectionRepository.findById(connection);
    if (!connectionExists) throw new Error("Connection not found");
    return await BillRepository.findByConnection(connection);
  },

  async addBill(data: CreateBillData): Promise<IBillPopulatedLean> {
    const { connection, monthOf, dueDate, meterReading, status } = data;

    const connectionId = new mongoose.Types.ObjectId(connection);

    // validate connection
    const findConnection = await ConnectionRepository.findById(
      connectionId.toString(),
    );
    if (!findConnection) throw new Error("Connection not found");

    // year, month, day
    const m = new Date(monthOf);
    const monthDate = new Date(
      Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), 1),
    );

    const dueDateObj = new Date(dueDate);

    if (isNaN(monthDate.getTime()) || isNaN(dueDateObj.getTime()))
      throw new Error("Invalid date format");

    // prevent duplicate bill
    const existing = await BillRepository.findOneByConnectionAndMonth(
      connectionId.toString(),
      monthDate,
    );
    if (existing) throw new Error("A bill for this month already exists");

    //find last bill for consumption calculation
    const lastBill = await BillRepository.findLastBill(connectionId.toString());
    const lastReading = lastBill ? lastBill.meterReading : 0;
    const consumedUnits = meterReading - lastReading;

    if (consumedUnits < 0)
      throw new Error(
        "Current meter reading cannot be lower than previous reading",
      );

    const chargePerCubicMeter =
      await SettingsRepository.getChargePerCubicMeter();
    const amount = consumedUnits * chargePerCubicMeter;

    // create
    const newBill = await BillRepository.create({
      connection,
      monthOf: monthDate,
      dueDate: dueDateObj,
      meterReading,
      chargePerCubicMeter,
      consumedUnits,
      amount,
      status,
      paidAt: status === "paid" ? new Date() : null,
    });

    const createdBill = await BillRepository.findById(newBill._id.toString());

    if (!createdBill) {
      throw new Error("Error to retrieve created bill");
    }

    return createdBill;
  },

  async updateBill(
    bill: string,
    updates: Partial<IBill>,
  ): Promise<IBillDocument | null> {
    const existingBill = await BillRepository.findById(bill);
    if (!existingBill) throw new Error("Bill not found");
    return await BillRepository.updateById(bill, updates);
  },

  async updateBillStatus(
    bill: string,
    status: BillStatus,
  ): Promise<IBillDocument | null> {
    const allowed: BillStatus[] = ["paid", "unpaid", "overdue"];
    if (!allowed.includes(status)) throw new Error(`Invalid status`);

    const existingBill = await BillRepository.findById(bill);
    if (!existingBill) throw new Error("Bill not found");

    if (existingBill.status === status) {
      const doc = await BillRepository.updateById(bill, {});
      return doc;
      // Can't return lean type as document, fetch as document instead.
    }

    const updatedData = {
      status,
      paidAt: status === "paid" ? new Date() : null,
    };

    return await BillRepository.updateById(bill, updatedData);
  },

  async deleteBill(bill: string): Promise<IBillDocument | null> {
    const existingBill = await BillRepository.findById(bill);
    if (!existingBill) throw new Error("Bill not found");

    const deletedBill = await BillRepository.deleteById(bill);
    return deletedBill;
  },
};
