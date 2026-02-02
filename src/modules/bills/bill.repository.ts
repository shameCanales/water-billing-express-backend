import { Bill } from "./bill.model.ts";
import type {
  IBill,
  IBillDocument,
  IBillLean,
  IBillPopulatedLean,
} from "./bill.model.ts";

export const BillRepository = {
  async findAll(
    filter: Record<string, any> = {},
    sort: Record<string, any> = { createdAt: -1 },
    skip: number = 0,
    limit: number = 0,
  ): Promise<IBillPopulatedLean[]> {
    const result = await Bill.find(filter)
      .populate({
        path: "connection",
        populate: {
          path: "consumer",
          select: "firstName middleName lastName email mobileNumber address",
        },
      })
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
    connection: string,
    monthOf: Date,
  ): Promise<IBillDocument | null> {
    return await Bill.findOne({ connection, monthOf });
  },

  async findOneByConnection(connection: string): Promise<IBillLean | null> {
    const result = await Bill.findOne({ connection })
      .sort({ monthOf: -1 })
      .lean();
    return result as unknown as IBillLean | null;
  },

  async findLastBill(connection: string): Promise<IBillLean | null> {
    const result = await Bill.findOne({
      connection,
    })
      .sort({ monthOf: -1 })
      .lean();

    return result as unknown as IBillLean | null;
  },

  async create(data: IBill): Promise<IBillDocument> {
    return await Bill.create(data);
  },

  async findById(bill: string): Promise<IBillPopulatedLean | null> {
    const result = await Bill.findById(bill)
      .populate({
        path: "connection",
        populate: {
          path: "consumer",
          select: "firstName middleName lastName email mobileNumber",
        },
      })
      .lean();

    return result as unknown as IBillPopulatedLean | null;
  },

  async findByConnection(connection: string): Promise<IBillDocument[]> {
    return await Bill.find({ connection })
      .populate({
        path: "connection",
        populate: {
          path: "consumer",
          select: "firstName middleName lastName email mobileNumber address",
        },
      })
      .sort({ createdAt: -1 });
    // No cast needed - returns IBillDocument[]
  },

  async updateById(
    bill: string,
    updates: Partial<IBill>,
  ): Promise<IBillDocument | null> {
    return await Bill.findByIdAndUpdate(bill, updates, {
      new: true,
      runValidators: true,
    }).populate({
      path: "connection",
      populate: {
        path: "consumer",
        select: "firstName middleName lastName email mobileNumber",
      },
    });
  },

  async deleteById(bill: string): Promise<IBillDocument | null> {
    return Bill.findByIdAndDelete(bill);
  },
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
