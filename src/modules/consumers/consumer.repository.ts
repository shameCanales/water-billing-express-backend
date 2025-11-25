import type mongoose from "mongoose";
import { Consumer } from "./consumer.model.ts";
import type { IConsumer, IConsumerDocument } from "./consumer.model.ts";

export const ConsumerRepository = {
  async findAll(): Promise<IConsumerDocument[]> {
    return Consumer.find().select("-password");
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
};
