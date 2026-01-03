import type mongoose from "mongoose";
import { Consumer } from "./consumer.model.ts";
import type {
  IConsumer,
  IConsumerDocument,
  IConsumerLean,
} from "./consumer.model.ts";

export const ConsumerRepository = {
  async findAll(
    filter: Record<string, any> = {},
    sort: Record<string, any> = { createdAt: -1 },
    skip: number = 0,
    limit: number = 0
  ): Promise<IConsumerLean[]> {
    return Consumer.find(filter)
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
  },

  //to calculate total pages for the frontend
  async count(filter: Record<string, any> = {}): Promise<number> {
    return Consumer.countDocuments(filter);
  },

  async findById(
    id: mongoose.Types.ObjectId | string
  ): Promise<IConsumerDocument | null> {
    return Consumer.findById(id).select("-password");
  },

  async findByEmail(email: string): Promise<IConsumerDocument | null> {
    return Consumer.findOne({ email });
  },

  async create(data: IConsumer): Promise<IConsumerDocument> {
    return Consumer.create(data);
  },

  async editById(
    id: string,
    updates: Partial<IConsumer>
  ): Promise<IConsumerDocument | null> {
    return Consumer.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
  },

  async deleteById(id: string): Promise<IConsumerDocument | null> {
    return Consumer.findByIdAndDelete(id);
  },

  async consumerExists(consumerId: string): Promise<boolean> {
    const exists = await Consumer.exists({ _id: consumerId });
    return exists !== null;
  },

  async updateStatus(
    id: string,
    status: "active" | "suspended"
  ): Promise<IConsumerDocument | null> {
    return Consumer.findByIdAndUpdate(
      id,
      { status: status },
      {
        new: true,
        runValidators: true,
      }
    );
  },
};
