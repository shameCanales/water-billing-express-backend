import { ConnectionRepository } from "./connection.repository.js";
import { ConsumerRepository } from "../consumers/consumer.repository.js";

export const ConnectionService = {
  async create(data) {
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

  async updateById(id, updates) {
    const updated = await ConnectionRepository.updateById(id, updates);
    if (!updated) throw new Error("Connection not found");
    return updated;
  },

  async deleteById(id) {
    const deleted = await ConnectionRepository.deleteById(id);
    if (!deleted) throw new Error("Connection not found");
    return deleted;
  },

  async getByConsumerId(consumer) {
    return await ConnectionRepository.findByConsumerId(consumer);
  },
};
