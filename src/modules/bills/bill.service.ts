import { BillRepository } from "./bill.repository.ts";
import { ConnectionRepository } from "../connections/connection.repository.ts";
import { SettingsRepository } from "../settings/settings.repository.ts";

import type {
  IBill,
  CreateBillData,
  BillStatus,
  IBillPopulatedLean,
  PaginatedBillsResult,
} from "./bill.types.ts";
import { Consumer } from "../consumers/consumer.model.ts";
import { Connection } from "../connections/connection.model.ts";

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

  async getBillsByConnection(
    connection: string,
  ): Promise<IBillPopulatedLean[]> {
    const connectionExists = await ConnectionRepository.findById(connection);
    if (!connectionExists) throw new Error("Connection not found");
    return await BillRepository.findByConnection(connection);
  },

  async addBill(data: CreateBillData): Promise<IBillPopulatedLean> {
    const { connection, monthOf, dueDate, meterReading, status } = data;

    // validate connection
    const findConnection = await ConnectionRepository.findById(connection);
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
      connection,
      monthDate,
    );
    if (existing) throw new Error("A bill for this month already exists");

    //find last bill for consumption calculation
    const lastBill = await BillRepository.findLastBill(connection);
    const lastReading = lastBill ? lastBill.meterReading : 0;
    const consumedUnits = meterReading - lastReading;

    if (consumedUnits < 0)
      throw new Error(
        "Current meter reading cannot be lower than previous reading",
      );

    const chargePerCubicMeter = await SettingsRepository.getSettingValue(
      "chargePerCubicMeter",
    );
    // const chargePerCubicMeter =
    //   await SettingsRepository.getChargePerCubicMeter();
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
  ): Promise<IBillPopulatedLean> {
    const existingBill = await BillRepository.findById(bill);
    if (!existingBill) throw new Error("Bill not found");

    const updated = await BillRepository.updateById(bill, updates);
    if (!updated) throw new Error("Failed to update Bill");

    return updated;
  },

  async updateBillStatus(
    bill: string,
    status: BillStatus,
  ): Promise<IBillPopulatedLean> {
    const existingBill = await BillRepository.findById(bill);
    if (!existingBill) throw new Error("Bill not found");

    if (existingBill.status === status) {
      throw new Error(`Bill is already ${status}`);
    }

    const updatedData = {
      status,
      paidAt: status === "paid" ? new Date() : null,
    };

    const updated = await BillRepository.updateById(bill, updatedData);
    if (!updated) throw new Error("Failed to update bill status");

    return updated;
  },

  async deleteBill(bill: string): Promise<IBillPopulatedLean> {
    const existingBill = await BillRepository.findById(bill);
    if (!existingBill) throw new Error("Bill not found");

    const deletedBill = await BillRepository.deleteById(bill);
    if (!deletedBill) throw new Error("Failed to delete bill");

    return deletedBill;
  },
};
