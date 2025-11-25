import { ConnectionRepository } from "./connection.repository.ts";
import { ConsumerRepository } from "../consumers/consumer.repository.ts";
import type { IConnection, IConnectionPopulated } from "./connection.model.ts";
import type mongoose from "mongoose";

export const ConnectionService = {
  async create(data: IConnection): Promise<IConnectionPopulated> {
    const { consumer, meterNumber } = data;

    const foundConsumer = await ConsumerRepository.findById(consumer);
    if (!foundConsumer) throw new Error("Consumer not found");

    const existing = await ConnectionRepository.findByMeterNumber(meterNumber);
    if (existing)
      throw new Error("Connection with this meter number already exists");

    const connection = await ConnectionRepository.create(data);
    return connection;
  },

  async getAll() {
    return await ConnectionRepository.findAll();
  },

  async updateById(
    id: string | mongoose.Types.ObjectId,
    updates: Partial<IConnection>
  ): Promise<IConnectionPopulated> {
    const updated = await ConnectionRepository.updateById(id, updates);
    if (!updated) throw new Error("Connection not found");
    return updated;
  },

  async deleteById(
    id: string | mongoose.Types.ObjectId
  ): Promise<IConnectionPopulated> {
    const deleted = await ConnectionRepository.deleteById(id);
    if (!deleted) throw new Error("Connection not found");
    return deleted;
  },

  async getByConsumerId(consumer: mongoose.Types.ObjectId | string) {
    return await ConnectionRepository.findByConsumerId(consumer);
  },
};
