import { ProcessorRepository } from "./processor.repository.js";
import { hashPassword } from "../../core/utils/helpers.js";

export const ProcessorService = {
  async getAll() {
    const processors = await ProcessorRepository.findAll();
    if (processors.length === 0)
      throw new Error("you don't have any processors recorded.");

    return processors;
  },

  async getById(id) {
    const processor = await ProcessorRepository.findById(id);
    if (!processor) throw new Error("Processor not found");
    return processor;
  },

  async create(data) {
    const { name, email, password, role } = data;

    const existing = await ProcessorRepository.findByEmail(email);
    if (existing) throw new Error("Processor with this email already exists");

    const hashedPassword = await hashPassword(password);

    const newProcessor = await ProcessorRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const { password: _, ...safeProcessor } = newProcessor.toObject();
    return safeProcessor;
  },

  async createFirstManager(data) {
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

  async updateById(id, updates) {
    if (updates.password) {
      updates.password = await hashPassword(password);
    }

    const updated = await ProcessorRepository.updateById(id, updates);
    if (!updated) throw new Error("Processor not found");

    return updated;
  },

  async deleteById(id) {
    const deleted = await ProcessorRepository.deleteById(id);
    if (!deleted) throw new Error("Processor not found");
    return deleted;
  },
};
