import type mongoose from "mongoose";
import { Consumer } from "./consumer.model.ts";
import type {
  IConsumer,
  IConsumerLean,
  IConsumerSummary,
  IConsumerPopulatedLean,
} from "./consumer.types.ts";

const LIST_POPULATE = [
  { path: "createdBy", select: "firstName middleName lastName role -_id" },
  { path: "lastEditBy", select: "firstName middleName lastName role -_id" },
];

const FULL_POPULATE = [
  { path: "createdBy", select: "firstName middleName lastName role" },
  { path: "lastEditBy", select: "firstName middleName lastName role" },
];

export const ConsumerRepository = {
  async findAll(
    filter: Record<string, any> = {},
    sort: Record<string, any> = { createdAt: -1 },
    skip: number = 0,
    limit: number = 10,
  ): Promise<IConsumerPopulatedLean[]> {
    return Consumer.find(filter)
      .populate(FULL_POPULATE)
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean() as unknown as IConsumerPopulatedLean[];
  },

  async findById(
    _id: mongoose.Types.ObjectId | string,
  ): Promise<IConsumerPopulatedLean | null> {
    return Consumer.findById(_id)
      .populate(FULL_POPULATE)
      .select("-password")
      .lean() as unknown as IConsumerPopulatedLean | null;
  },

  async findByEmail(email: string): Promise<IConsumerLean | null> {
    return Consumer.findOne({ email }).lean();
  },

  async create(data: IConsumer): Promise<IConsumerPopulatedLean> {
    const newConsumer = await Consumer.create(data);
    return (await ConsumerRepository.findById(newConsumer._id.toString()))!;
  },

  async editById(
    _id: string,
    updates: Partial<IConsumer>,
  ): Promise<IConsumerSummary | null> {
    return (await Consumer.findByIdAndUpdate(_id, updates, {
      new: true,
      runValidators: true,
    })
      .populate(LIST_POPULATE)
      .select("-password")
      .lean()) as unknown as IConsumerSummary | null;
  },

  async deleteById(_id: string): Promise<IConsumerSummary | null> {
    return Consumer.findByIdAndDelete(_id)
      .populate(LIST_POPULATE)
      .select("-password")
      .lean() as unknown as IConsumerSummary | null;
  },

  async count(filter: Record<string, any> = {}): Promise<number> {
    return Consumer.countDocuments(filter);
  },

  // async consumerExists(consumerId: string): Promise<boolean> { i think we just use the findById?
  //   const exists = await Consumer.exists({ _id: consumerId });
  //   return exists !== null;
  // },

  // async findStatusById(
  //   // where is this even used for? why did you add this?
  //   _id: string,
  // ): Promise<{ status: ConsumerStatus } | null> {
  //   return Consumer.findById(_id).select("status").lean() as any;
  // },

  // async updateStatus( also i think we can use general editByid instead of having separate updateStatus?
  //   _id: string,
  //   status: ConsumerStatus,
  // ): Promise<IConsumerLean | null> {
  //   return Consumer.findByIdAndUpdate(
  //     _id,
  //     { status: status },
  //     { new: true, runValidators: true },
  //   )
  //     .select("-password")
  //     .lean();
  // },
};
