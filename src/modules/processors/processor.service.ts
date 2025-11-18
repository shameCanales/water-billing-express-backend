import { ProcessorRepository } from "./processor.repository.js";
import { hashPassword } from "../../core/utils/helpers.js";
import type {
  IProcessor,
  IProcessorDocument,
  IProcessorLean,
} from "./processor.model.js";
import { Types } from "mongoose";

export const ProcessorService = {
  async getAll(): Promise<IProcessorDocument[]> {
    const processors = await ProcessorRepository.findAll();
    if (processors.length === 0)
      throw new Error("you don't have any processors recorded.");

    return processors;
  },

  async getById(id: Types.ObjectId | string): Promise<IProcessorLean | null> {
    const processor = await ProcessorRepository.findById(id);
    if (!processor) throw new Error("Processor not found");
    return processor;
  },

  async create(
    data: IProcessor
  ): Promise<Omit<IProcessorDocument, "password">> {
    const { name, email, password, role } = data;

    const existing = await ProcessorRepository.findByEmail(email);
    if (existing) throw new Error("Processor with this email already exists");

    const hashedPassword = await hashPassword(password);

    const newProcessor = await ProcessorRepository.create({
      name,
      email,
      password: hashedPassword,
      role: role ?? "staff",
    });

    const { password: _, ...safeProcessor } = newProcessor.toObject();
    return safeProcessor;
  },

  async createFirstManager(
    data: Pick<IProcessor, "name" | "email" | "password">
  ) {
    const { name, email, password } = data;

    const existing = await ProcessorRepository.findByEmail(email);
    if (existing) throw new Error("Processor with this email already exists");

    const hashedPassword = await hashPassword(password);
    const newManager = await ProcessorRepository.create({
      name,
      email,
      password: hashedPassword,
      role: "manager",
    });

    const { password: _, ...safeManager } = newManager.toObject();
    return safeManager;
  },

  async updateById(
    id: Types.ObjectId | string,
    updates: Partial<IProcessor>
  ): Promise<IProcessorDocument> {
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const updated = await ProcessorRepository.updateById(id, updates);
    if (!updated) throw new Error("Processor not found");

    return updated;
  },

  async deleteById(id: Types.ObjectId | string): Promise<IProcessorDocument> {
    const deleted = await ProcessorRepository.deleteById(id);
    if (!deleted) throw new Error("Processor not found");
    return deleted;
  },
};
