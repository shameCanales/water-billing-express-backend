import { Processor } from "./processor.model.ts";
import type {
  IProcessor,
  IProcessorDocument,
  IProcessorLean,
} from "./processor.model.ts";
import type { Types } from "mongoose";

export const ProcessorRepository = {
  async findAll(
    filter: Record<string, any> = {},
  ): Promise<IProcessorDocument[]> {
    return await Processor.find(filter).select("-password").sort({
      createdAt: -1,
    });
  },

  async findById(_id: string | Types.ObjectId): Promise<IProcessorLean | null> {
    const result = await Processor.findById(_id).select("-password").lean();
    return result as unknown as IProcessorLean | null;
  },

  async findByEmail(email: string): Promise<IProcessorDocument | null> {
    return await Processor.findOne({ email }).select("+password");
  },

  async create(data: IProcessor): Promise<IProcessorDocument> {
    return await Processor.create(data);
  },

  async updateById(
    _id: string | Types.ObjectId,
    updates: Partial<IProcessor>,
  ): Promise<IProcessorDocument | null> {
    return await Processor.findByIdAndUpdate(_id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
  },

  async deleteById(
    _id: string | Types.ObjectId,
  ): Promise<IProcessorDocument | null> {
    return await Processor.findByIdAndDelete(_id);
  },
};
