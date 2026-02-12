import { ProcessorRepository } from "./processor.repository.ts";
import { hashPassword } from "../../core/utils/helpers.ts";
import type {
  IProcessor,
  IProcessorDocument,
  IProcessorLean,
} from "./processor.model.ts";
import { Types } from "mongoose";

export const ProcessorService = {
  async getAll(role: string): Promise<IProcessorDocument[]> {
    const filter: any = {};
    if (role) {
      filter.role = role;
    }

    const processors = await ProcessorRepository.findAll(filter);
    if (processors.length === 0) {
      const errorMessage = role
        ? `No processors found with role ${role}`
        : "You don't have any processors recorded.";
      throw new Error(errorMessage);
    }

    return processors;
  },

  async getById(_id: Types.ObjectId | string): Promise<IProcessorLean | null> {
    const processor = await ProcessorRepository.findById(_id);
    if (!processor) throw new Error("Processor not found");
    return processor;
  },

  // In modules/processors/processor.service.ts
  async getByEmail(email: string): Promise<IProcessorDocument | null> {
    return await ProcessorRepository.findByEmail(email);
  },

  async create(
    data: IProcessor,
  ): Promise<Omit<IProcessorDocument, "password">> {
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
    return safeProcessor;
  },

  async createFirstManager(
    data: Pick<
      IProcessor,
      "firstName" | "middleName" | "lastName" | "email" | "password"
    >,
  ) {
    const { firstName, middleName, lastName, email, password } = data;

    const existing = await ProcessorRepository.findByEmail(email);
    if (existing) throw new Error("Processor with this email already exists");

    const hashedPassword = await hashPassword(password);
    const newManager = await ProcessorRepository.create({
      firstName,
      middleName,
      lastName,
      email,
      password: hashedPassword,
      role: "manager",
    });

    const { password: _, ...safeManager } = newManager.toObject();
    return safeManager;
  },

  async updateById(
    _id: Types.ObjectId | string,
    updates: Partial<IProcessor>,
  ): Promise<IProcessorDocument> {
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const updated = await ProcessorRepository.updateById(_id, updates);
    if (!updated) throw new Error("Processor not found");

    return updated;
  },

  async deleteById(_id: Types.ObjectId | string): Promise<IProcessorDocument> {
    const deleted = await ProcessorRepository.deleteById(_id);
    if (!deleted) throw new Error("Processor not found");
    return deleted;
  },
};
