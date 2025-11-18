import { BillRepository } from "./bill.repository.js";
import { ConnectionRepository } from "../connections/connection.repository.js";
import { BILLING_SETTINGS } from "../../config/settings.js"; //{chargePerCubicMeter: 20,}
import type {
  IBill,
  IBillDocument,
  BillStatus,
  IBillPopulatedLean,
} from "./bill.model.js";
import mongoose from "mongoose";

export type CreateBillData = Omit<
  IBill,
  "status" | "amount" | "chargePerCubicMeter" | "consumedUnits" | "paidAt"
>;

export const BillService = {
  async getAllBills(): Promise<IBillPopulatedLean[]> {
    return await BillRepository.findAll();
  },

  async getBillsByConnection(connection: string): Promise<IBillDocument[]> {
    const connectionExists = await ConnectionRepository.findById(connection);
    if (!connectionExists) throw new Error("Connection not found");
    return await BillRepository.findByConnection(connection);
  },

  async addBill(data: CreateBillData): Promise<IBillPopulatedLean> {
    const { connection, monthOf, dueDate, meterReading } = data;

    const connectionId = new mongoose.Types.ObjectId(connection);

    // validate connection
    const findConnection = await ConnectionRepository.findById(
      connectionId.toString()
    );
    if (!findConnection) throw new Error("Connection not found");

    // year, month, day
    const m = new Date(monthOf);
    const monthDate = new Date(
      Date.UTC(m.getUTCFullYear(), m.getUTCMonth(), 1)
    );

    const dueDateObj = new Date(dueDate);

    if (isNaN(monthDate.getTime()) || isNaN(dueDateObj.getTime()))
      throw new Error("Invalid date format");

    // prevent duplicate bill
    const existing = await BillRepository.findOneByConnectionAndMonth(
      connectionId.toString(),
      monthDate
    );
    if (existing) throw new Error("A bill for this month already exists");

    //find last bill for consumption calculation
    const lastBill = await BillRepository.findLastBill(connectionId.toString());
    const lastReading = lastBill ? lastBill.meterReading : 0;
    const consumedUnits = meterReading - lastReading;

    if (consumedUnits < 0)
      throw new Error(
        "Current meter reading cannot be lower than previous reading"
      );

    const amount = consumedUnits * BILLING_SETTINGS.chargePerCubicMeter;

    // create
    const newBill = await BillRepository.create({
      connection,
      monthOf: monthDate,
      dueDate: dueDateObj,
      meterReading,
      chargePerCubicMeter: BILLING_SETTINGS.chargePerCubicMeter,
      consumedUnits,
      amount,
      status: "unpaid",
      paidAt: null,
    });

    const createdBill = await BillRepository.findById(newBill._id.toString());

    if (!createdBill) {
      throw new Error("Error to retrieve created bill");
    }

    return createdBill;
  },

  async updateBill(
    bill: string,
    updates: Partial<IBill>
  ): Promise<IBillDocument | null> {
    const existingBill = await BillRepository.findById(bill);
    if (!existingBill) throw new Error("Bill not found");
    return await BillRepository.updateById(bill, updates);
  },

  async updateBillStatus(
    bill: string,
    status: BillStatus
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
