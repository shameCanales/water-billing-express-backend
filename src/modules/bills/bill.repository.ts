import type mongoose from "mongoose";
import { Bill } from "./bill.model.ts";
import type {
  IBill,
  IBillDocument,
  IBillLean,
  IBillPopulatedLean,
} from "./bill.types.ts";

const populateConfig = {
  path: "connection",
  populate: {
    path: "consumer",
    select: "firstName middleName lastName email mobileNumber address",
  },
};

export const BillRepository = {
  async findAll(
    filter: Record<string, any> = {},
    sort: Record<string, any> = { createdAt: -1 },
    skip: number = 0,
    limit: number = 0,
  ): Promise<IBillPopulatedLean[]> {
    const result = await Bill.find(filter)
      .populate(populateConfig)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    return result as unknown as IBillPopulatedLean[];
  },

  async count(filter: Record<string, any> = {}): Promise<number> {
    return Bill.countDocuments(filter);
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

  async create(data: IBill): Promise<IBillDocument> {
    return await Bill.create(data);
  },

  async findById(billId: string): Promise<IBillPopulatedLean | null> {
    return (await Bill.findById(billId)
      .populate(populateConfig)
      .lean()) as unknown as IBillPopulatedLean | null;
  },

  async findByConnection(
    connection: string | mongoose.Types.ObjectId,
  ): Promise<IBillPopulatedLean[]> {
    return (await Bill.find({ connection })
      .populate(populateConfig)
      .sort({ createdAt: -1 })
      .lean()) as unknown as IBillPopulatedLean[];
  },

  async updateById(
    bill: string,
    updates: Partial<IBill>,
  ): Promise<IBillPopulatedLean | null> {
    return (await Bill.findByIdAndUpdate(bill, updates, {
      new: true,
      runValidators: true,
    })
      .populate(populateConfig)
      .lean()) as unknown as IBillPopulatedLean | null;
  },

  async deleteById(billId: string): Promise<IBillPopulatedLean | null> {
    return (await Bill.findByIdAndDelete(billId)
      .populate(populateConfig)
      .lean()) as unknown as IBillPopulatedLean | null;
  },

  // async findOneByConnection(connection: string): Promise<IBillLean | null> {
  //   const result = await Bill.findOne({ connection })
  //     .sort({ monthOf: -1 })
  //     .lean();
  //   return result as unknown as IBillLean | null;
  // },
};

// Quick Reference - When to use which type
// ----------------------------------------
// Query has .lean()? | Has .populate()? | Return Type
// -------------------+------------------+-------------------------
// Yes                | No               | IBillLean
// Yes                | Yes              | IBillPopulatedLean
// No                 | Either           | IBillDocument

// Key principle:
// .lean() returns plain objects, NOT Mongoose documents, so you need different types!
