import { Connection } from "./connection.model.ts";
import type {
  IConnectionLean,
  IConnectionPopulated,
  IConnection,
} from "./connection.model.ts";

import mongoose from "mongoose";

export const ConnectionRepository = {
  async findAll(): Promise<IConnectionPopulated[]> {
    return (await Connection.find()
      .populate("consumer", "firstName middleName lastName email mobileNumber")
      .sort({ createdAt: -1 })
      .lean()) as unknown as IConnectionPopulated[];
  },

  async findById(
    id: string | mongoose.Types.ObjectId
  ): Promise<IConnectionPopulated | null> {
    return (await Connection.findById(id)
      .populate("consumer", "firstName middleName lastName email mobileNumber")
      .lean()) as unknown as IConnectionPopulated | null;
  },

  async findByMeterNumber(
    meterNumber: number
  ): Promise<IConnectionLean | null> {
    return (await Connection.findOne({
      meterNumber,
    }).lean()) as unknown as IConnectionLean | null;
  },

  async findByConsumerId(consumer: string | mongoose.Types.ObjectId) {
    return Connection.find({ consumer })
      .populate("consumer", "firstName middleName lastName email mobileNumber")
      .sort({ createdAt: -1 })
      .lean() as unknown as IConnectionPopulated[];
  },

  async create(data: IConnection): Promise<IConnectionPopulated> {
    const newConnection = await Connection.create(data);
    return newConnection.populate(
      "consumer",
      "firstName middleName lastName email mobileNumber"
    ) as unknown as IConnectionPopulated;
  },

  async updateById(
    id: string | mongoose.Types.ObjectId,
    updates: Partial<IConnection>
  ): Promise<IConnectionPopulated | null> {
    return (await Connection.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate("consumer", "firstName middleName lastName email mobileNumber")
      .lean()) as unknown as IConnectionPopulated | null;
  },

  async deleteById(
    id: string | mongoose.Types.ObjectId
  ): Promise<IConnectionPopulated | null> {
    const deleted = await Connection.findByIdAndDelete(id)?.populate(
      "consumer",
      "firstName middleName lastName email mobileNumber"
    );
    return deleted as unknown as IConnectionPopulated | null;
  },
};
