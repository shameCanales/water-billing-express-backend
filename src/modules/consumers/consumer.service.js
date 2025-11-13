import { ConsumerRepository } from "./consumer.repository.js";
import { hashPassword } from "../../core/utils/helpers.js";

export const ConsumerService = {
  async getAllConsumers() {
    return await ConsumerRepository.findAll();
  },

  async createConsumer(data) {
    const { name, email, birthDate, mobileNumber, password, address, status } =
      data;

    const existingConsumer = await ConsumerRepository.findByEmail(email);
    if (existingConsumer) {
      throw new Error("Consumer with this email already exists");
    }
    const hashedPassword = await hashPassword(password);

    const newConsumer = await ConsumerRepository.create({
      name,
      email,
      birthDate,
      mobileNumber,
      password: hashedPassword,
      address,
      status,
    });

    const { password: _, ...consumerData } = newConsumer.toObject();
    return consumerData;
  },

  async getConsumerById(id) {
    const consumer = await ConsumerRepository.findById(id);
    if (!consumer) throw new Error("Consumer not found");
    return consumer;
  },

  async updateConsumer(id, updates) {
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const updatedConsumer = await ConsumerRepository.editById(id, updates);
    if (!updatedConsumer) throw new Error("Consumer not found");

    return updatedConsumer;
  },

  async deleteConsumer(id) {
    const deletedConsumer = await ConsumerRepository.deleteById(id);
    if (!deletedConsumer) throw new Error("Consumer not found");
    return deletedConsumer;
  },
};
