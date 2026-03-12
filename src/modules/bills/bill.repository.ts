import type mongoose from "mongoose";
import { Bill } from "./bill.model.ts";
import type {
  IBill,
  IBillDocument,
  IBillLean,
  IBillPopulatedLean,
  IBillSummary,
} from "./bill.types.ts";

const LIST_POPULATE = [
  {
    path: "connection",
    select: "meterNumber address type -_id", // -_id hide connection ID
    populate: {
      path: "consumer",
      select: "firstName middleName lastName mobileNumber -_id",
    },
  },
  { path: "createdBy", select: "firstName middleName lastName role -_id" },
  { path: "lastEditBy", select: "firstName middleName lastName role -_id" },
  { path: "processedBy", select: "firstName middleName lastName role -_id" },
];

const FULL_POPULATE = [
  {
    path: "connection",
    populate: {
      path: "consumer",
      select: "firstName middleName lastName email mobileNumber address",
    },
  },
  {
    path: "createdBy",
    select: "firstName middleName lastName role",
  },
  {
    path: "lastEditBy",
    select: "firstName middleName lastName role",
  },
  {
    path: "processedBy",
    select: "firstName middleName lastName role",
  },
];

export const BillRepository = {
  async findAll(
    filter: Record<string, any> = {},
    sort: Record<string, any> = { createdAt: -1 },
    skip: number = 0,
    limit: number = 0,
  ): Promise<IBillSummary[]> {
    const result = await Bill.find(filter)
      .populate(LIST_POPULATE)
      .select("-appliedSurchargePercent -__v -updatedAt")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return result as unknown as IBillSummary[];
  },

  async findOneByConnectionAndMonth(
    connection: string | mongoose.Types.ObjectId,
    monthOf: Date,
  ): Promise<IBillLean | null> {
    return await Bill.findOne({ connection, monthOf }).lean();
  },

  async findLastBill(
    connection: string | mongoose.Types.ObjectId,
  ): Promise<IBillLean | null> {
    return Bill.findOne({ connection }).sort({ monthOf: -1 }).lean();
  },

  async findById(billId: string): Promise<IBillPopulatedLean | null> {
    return (await Bill.findById(billId)
      .populate(FULL_POPULATE)
      .lean()) as unknown as IBillPopulatedLean | null;
  },

  async findByConnection(
    connection: string | mongoose.Types.ObjectId,
  ): Promise<IBillSummary[]> {
    return (await Bill.find({ connection })
      .populate(LIST_POPULATE)
      .sort({ createdAt: -1 })
      .lean()) as unknown as IBillSummary[];
  },

  async create(data: IBill): Promise<IBillDocument> {
    return await Bill.create(data);
  },

  async updateById(
    bill: string,
    updates: Partial<IBill>,
  ): Promise<IBillSummary | null> {
    return (await Bill.findByIdAndUpdate(bill, updates, {
      new: true,
      runValidators: true,
    })
      .populate(LIST_POPULATE)
      .select("-appliedSurchargePercent -__v -updatedAt")
      .lean()) as unknown as IBillSummary | null;
  },

  async deleteById(billId: string): Promise<IBillSummary | null> {
    return (await Bill.findByIdAndDelete(billId)
      .populate(LIST_POPULATE)
      .select("-appliedSurchargePercent -__v -updatedAt")
      .lean()) as unknown as IBillSummary | null;
  },

  async findOverdueUnprocessed(today: Date): Promise<IBillDocument[]> {
    return await Bill.find({
      status: "unpaid",
      dueDate: { $lt: today },
      surchargeAmount: 0, // Only those without surcharges applied yet
    });
  },

  async count(filter: Record<string, any> = {}): Promise<number> {
    return Bill.countDocuments(filter);
  },
};

