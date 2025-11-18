import { Processor } from "./processor.model.js";
import type {
  IProcessor,
  IProcessorDocument,
  IProcessorLean,
} from "./processor.model.js";
import type { Types } from "mongoose";

export const ProcessorRepository = {
  async findAll(): Promise<IProcessorDocument[]> {
    return await Processor.find().select("-password").sort({
      createdAt: -1,
    });
  },

  async findById(id: string | Types.ObjectId): Promise<IProcessorLean | null> {
    const result = await Processor.findById(id).select("-password").lean();
    return result as unknown as IProcessorLean | null;
  },

  async findByEmail(email: string): Promise<IProcessorDocument | null> {
    return await Processor.findOne({ email });
  },

  async create(data: IProcessor): Promise<IProcessorDocument> {
    return await Processor.create(data);
  },

  async updateById(
    id: string | Types.ObjectId,
    updates: Partial<IProcessor>
  ): Promise<IProcessorDocument | null> {
    return await Processor.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
  },

  async deleteById(
    id: string | Types.ObjectId
  ): Promise<IProcessorDocument | null> {
    return await Processor.findByIdAndDelete(id);
  },
};
