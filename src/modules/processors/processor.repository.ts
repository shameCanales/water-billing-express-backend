import { Processor } from "./processor.model.ts";
import type {
  IProcessor,
  IProcessorDocument,
  IProcessorLean,
  ProcessorStatus,
} from "./processor.types.ts";
import type mongoose from "mongoose";

export const ProcessorRepository = {
  async findAll(
    filter: Record<string, any> = {},
    sort: Record<string, any> = { createdAt: -1 },
    skip: number = 0,
    limit: number = 10,
  ): Promise<IProcessorLean[]> {
    return (await Processor.find(filter)
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()) as unknown as IProcessorLean[];
  },

  async count(filter: Record<string, any> = {}): Promise<number> {
    return Processor.countDocuments(filter);
  },

  async findById(
    _id: string | mongoose.Types.ObjectId,
  ): Promise<IProcessorLean | null> {
    return (await Processor.findById(_id).select("-password").lean()) as unknown as IProcessorLean | null;
  },

  async findByEmail(email: string): Promise<IProcessorDocument | null> {
    return await Processor.findOne({ email }).select("+password");
  },

  async create(data: IProcessor): Promise<IProcessorDocument> {
    return await Processor.create(data);
  },

  async updateById(
    _id: string | mongoose.Types.ObjectId,
    updates: Partial<IProcessor>,
  ): Promise<IProcessorLean | null> {
    return (await Processor.findByIdAndUpdate(_id, updates, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .lean()) as unknown as IProcessorLean | null;
  },

  async updateStatus(
    _id: string | mongoose.Types.ObjectId,
    status: ProcessorStatus,
  ): Promise<IProcessorLean | null> {
    return (await Processor.findByIdAndUpdate(
      _id,
      { status },
      { new: true, runValidators: true }
    )
      .select("-password")
      .lean()) as unknown as IProcessorLean | null;
  },

  async deleteById(
    _id: string | mongoose.Types.ObjectId,
  ): Promise<IProcessorLean | null> {
    return (await Processor.findByIdAndDelete(_id).select("-password").lean()) as unknown as IProcessorLean | null;
  },
};