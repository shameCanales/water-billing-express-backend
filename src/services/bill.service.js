import { BillRepository } from "../repositories/bill.repository.js";
import { ConnectionRepository } from "../repositories/connection.repository.js";
import { BILLING_SETTINGS } from "../config/settings.js"; //{chargePerCubicMeter: 20,}

export const BillService = {
  async getAllBills() {
    return await BillRepository.findAll();
  },

  async getBillsByConnection(connection) {
    const connectionExists = await ConnectionRepository.findById(connection);
    if (!connectionExists) throw new Error("Connection not found");
    return await BillRepository.findByConnection(connection);
  },

  async addBill(data) {
    const { connection, monthOf, dueDate, meterReading } = data;

    // validate connection
    const findConnection = await ConnectionRepository.findById(connection);
    if (!findConnection) throw new Error("Connection not found");

    //normalize dates
    const monthDate = new Date(
      Date.UTC(
        new Date(monthOf).getUTCMonth(),
        1,
        new Date(monthOf).getUTCFullYear()
      )
    );

    const dueDateObj = new Date(dueDate);

    if (isNaN(monthDate) || isNaN(dueDateObj))
      throw new Error("Invalid date format");

    // prevent duplicate bill
    const existing = await BillRepository.findOneByConnectionAndMonth(
      connection,
      monthDate
    );
    if (existing) throw new Error("A bill for this month already exists");

    //find last bill for consumption calculation
    const lastBill = await BillRepository.findLastBill(connection);
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
    });

    return await BillRepository.findById(newBill._id);
  },

  async updateBill(bill, updates) {
    const existingBill = await BillRepository.findById(bill);
    if (!existingBill) throw new Error("Bill not found");
    return await BillRepository.updateById(bill, updates);
  },

  async updateBillStatus(bill, status) {
    const allowedStatuses = ["paid", "unpaid", "overdue"];
    if (!allowedStatuses.includes(status))
      throw new Error(`Invalid status. Allowed: ${allowedStatuses.join(", ")}`);

    const existingBill = await BillRepository.findById(bill);
    if (!existingBill) throw new Error("Bill not found");

    if (existingBill.status === status) return existingBill;

    const updatedData = {
      status,
      paidAt: status === "paid" ? new Date() : null,
    };

    return await BillRepository.updateById(bill, updatedData);
  },

  async deleteBill(bill) {
    const deletedBill = await BillRepository.findById(bill);
    if (!deletedBill) throw new Error("Bill not found");
    await BillRepository.deleteById(bill);
    return bill;
  },
};
