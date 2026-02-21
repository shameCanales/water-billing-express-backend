import type mongoose from "mongoose";
import { Consumer } from "./consumer.model.ts";
import type {
  IConsumer,
  IConsumerDocument,
  IConsumerLean,
  ConsumerStatus,
} from "./consumer.types.ts";

export const ConsumerRepository = {
  async findAll(
    filter: Record<string, any> = {},
    sort: Record<string, any> = { createdAt: -1 },
    skip: number = 0,
    limit: number = 10,
  ): Promise<IConsumerLean[]> {
    return Consumer.find(filter)
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  },

  async count(filter: Record<string, any> = {}): Promise<number> {
    return Consumer.countDocuments(filter);
  },

  async findById(
    _id: mongoose.Types.ObjectId | string,
  ): Promise<IConsumerLean | null> {
    return Consumer.findById(_id).select("-password").lean();
  },

  async findByEmail(email: string): Promise<IConsumerLean | null> {
    return Consumer.findOne({ email }).lean();
  },

  async create(data: IConsumer): Promise<IConsumerDocument> {
    return Consumer.create(data);
  },
  async editById(
    _id: string,
    updates: Partial<IConsumer>,
  ): Promise<IConsumerLean | null> {
    return Consumer.findByIdAndUpdate(_id, updates, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .lean();
  },

  async deleteById(_id: string): Promise<IConsumerLean | null> {
    return Consumer.findByIdAndDelete(_id).select("-password").lean();
  },

  async consumerExists(consumerId: string): Promise<boolean> {
    const exists = await Consumer.exists({ _id: consumerId });
    return exists !== null;
  },

  async updateStatus(
    _id: string,
    status: ConsumerStatus,
  ): Promise<IConsumerLean | null> {
    return Consumer.findByIdAndUpdate(
      _id,
      { status: status },
      { new: true, runValidators: true },
    )
      .select("-password")
      .lean();
  },
};
