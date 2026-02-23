import { ProcessorRepository } from "./processor.repository.ts";
import { hashPassword } from "../../core/utils/helpers.ts";
import type {
  IProcessor,
  IProcessorDocument,
  IProcessorLean,
  ProcessorStatus,
  PaginatedProcessorsResult,
} from "./processor.types.ts";
import type mongoose from "mongoose";

interface GetAllProcessorsParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const ProcessorService = {
  async getAll(
    params: GetAllProcessorsParams,
  ): Promise<PaginatedProcessorsResult> {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * limit;
    const filter: any = {};

    if (role && role !== "all") filter.role = role;
    if (status && status !== "all") filter.status = status;

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { email: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
      ];
    }

    const sort: any = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [processors, total] = await Promise.all([
      ProcessorRepository.findAll(filter, sort, skip, limit),
      ProcessorRepository.count(filter),
    ]);

    return {
      processors,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    };
  },

  async getById(
    _id: mongoose.Types.ObjectId | string,
  ): Promise<IProcessorLean> {
    const processor = await ProcessorRepository.findById(_id);
    if (!processor) throw new Error("Processor not found");
    return processor;
  },

  async getByEmail(email: string): Promise<IProcessorDocument | null> {
    return ProcessorRepository.findByEmail(email);
  },

  async create(data: IProcessor): Promise<IProcessorLean> {
    const { firstName, middleName, lastName, email, password, role, status } =
      data;

    const existing = await ProcessorRepository.findByEmail(email);
    if (existing) throw new Error("Processor with this email already exists");

    const hashedPassword = await hashPassword(password);

    const newProcessor = await ProcessorRepository.create({
      firstName,
      middleName,
      lastName,
      email,
      password: hashedPassword,
      role: role ?? "staff",
      status: status ?? "active",
    });

    const { password: _, ...safeProcessor } = newProcessor.toObject();
    return safeProcessor as unknown as IProcessorLean;
  },

  async createFirstManager(data: IProcessor): Promise<IProcessorLean> {
    const { firstName, middleName, lastName, email, password } = data;

    const existingManager = await ProcessorRepository.count({
      role: "manager",
    });
    if (existingManager > 0) {
      throw new Error("Manager already exists");
    }

    const existing = await ProcessorRepository.findByEmail(email);
    if (existing) throw new Error("Processor with this email already exists");

    const hashedPassword = await hashPassword(password!);
    const newManager = await ProcessorRepository.create({
      firstName,
      middleName,
      lastName,
      email,
      password: hashedPassword,
      role: "manager",
      status: "active",
    });

    const { password: _, ...safeManager } = newManager.toObject();
    return safeManager as unknown as IProcessorLean;
  },

  async updateById(
    _id: string,
    updates: Partial<IProcessor>,
  ): Promise<IProcessorLean> {
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const updated = await ProcessorRepository.updateById(_id, updates);
    if (!updated) throw new Error("Processor not found");

    return updated;
  },

  async updateStatus(
    _id: string,
    status: ProcessorStatus,
  ): Promise<IProcessorLean> {
    const existing = await ProcessorRepository.findById(_id);
    if (!existing) throw new Error("Processor not found");

    if (existing.status === status) {
      throw new Error(`Processor is already ${status}`);
    }

    const updated = await ProcessorRepository.updateStatus(_id, status);
    if (!updated) throw new Error("Failed to update status");

    return updated;
  },

  async deleteById(_id: string): Promise<IProcessorLean> {
    const deleted = await ProcessorRepository.deleteById(_id);
    if (!deleted) throw new Error("Processor not found");
    return deleted;
  },
};
