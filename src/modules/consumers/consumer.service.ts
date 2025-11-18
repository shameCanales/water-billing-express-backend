import { ConsumerRepository } from "./consumer.repository.js";
import { hashPassword } from "../../core/utils/helpers.js";
import type { IConsumer, IConsumerDocument } from "./consumer.model.ts";
import type mongoose from "mongoose";

// Type for consumer creation (without generated fields)
type CreateConsumerData = Omit<IConsumer, "status"> & {
  status?: "active" | "suspended";
};

// Type for consumer response (without password)
type ConsumerResponse = Omit<IConsumer, "password"> & {
  _id: string;
  createAt: Date;
  updatedAt: Date;
};

export const ConsumerService = {
  async getAllConsumers(): Promise<IConsumerDocument[]> {
    return await ConsumerRepository.findAll();
  },

  async createConsumer(data: CreateConsumerData): Promise<ConsumerResponse> {
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
      status: status || "active",
    });

    const { password: _, ...consumerData } = newConsumer.toObject();
    return consumerData;
  },

  async getConsumerById(
    id: mongoose.Types.ObjectId | string
  ): Promise<IConsumerDocument> {
    const consumer = await ConsumerRepository.findById(id);
    if (!consumer) throw new Error("Consumer not found");
    return consumer;
  },

  async updateConsumer(id: string, updates: Partial<IConsumerDocument>) {
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const updatedConsumer = await ConsumerRepository.editById(id, updates);
    if (!updatedConsumer) throw new Error("Consumer not found");

    return updatedConsumer;
  },

  async deleteConsumer(id: string): Promise<IConsumerDocument> {
    const deletedConsumer = await ConsumerRepository.deleteById(id);
    if (!deletedConsumer) throw new Error("Consumer not found");
    return deletedConsumer;
  },
};
