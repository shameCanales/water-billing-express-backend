import { ConsumerRepository } from "./consumer.repository.ts";
import { hashPassword } from "../../core/utils/helpers.ts";
import type {
  IConsumer,
  IConsumerDocument,
  IConsumerLean,
  PaginatedConsumersResult,
} from "./consumer.model.ts";
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

// Define the Input DTO (Data Transfrer Oject)
interface GetAllConsumersParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
}

export const ConsumerService = {
  async getAllConsumers(
    params: GetAllConsumersParams
  ): Promise<PaginatedConsumersResult> {
    const {
      page,
      limit,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
    } = params;

    const skip = (page - 1) * limit;

    // 1. Build Filter
    const filter: any = {};

    // Filter by status (Exact match)
    if (status && status !== "all") {
      filter.status = status;
    }

    // Filter by Search (Regex Partial Match)
    if (search) {
      const searchRegex = new RegExp(search, "i"); // 'i' = case sensitive
      filter.$or = [
        { email: searchRegex },
        { mobileNumber: searchRegex },
        { firstName: searchRegex },
        { middleName: searchRegex },
        { lastName: searchRegex },
      ];
    }

    // 2. Build sort
    const sort: any = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // 3. Execute Queries
    // Run both queries in parallel for speed
    const [consumers, total] = await Promise.all([
      ConsumerRepository.findAll(filter, sort, skip, limit),
      ConsumerRepository.count(filter),
    ]);

    // 4. Return Result
    return {
      consumers,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    };
  },

  async createConsumer(data: CreateConsumerData): Promise<ConsumerResponse> {
    const {
      firstName,
      middleName,
      lastName,
      email,
      birthDate,
      mobileNumber,
      password,
      address,
      status,
    } = data;

    const existingConsumer = await ConsumerRepository.findByEmail(email);
    if (existingConsumer) {
      throw new Error("Consumer with this email already exists");
    }
    const hashedPassword = await hashPassword(password);

    const newConsumer = await ConsumerRepository.create({
      firstName,
      middleName,
      lastName,
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

  async getConsumerByEmail(email: string): Promise<IConsumerDocument> {
    const consumer = await ConsumerRepository.findByEmail(email);
    if (!consumer) throw new Error("Consumer with this email not found");
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

  async updateStatus(id: string, status: "active" | "suspended") {
    const existingConsumer = await ConsumerRepository.findById(id);
    if (!existingConsumer) throw new Error("Consumer not found");
    if (existingConsumer?.status === status) {
      throw new Error(`Consumer is already ${status}`);
    }

    const updatedConsumer = await ConsumerRepository.updateStatus(id, status);

    return updatedConsumer;
  },
};
