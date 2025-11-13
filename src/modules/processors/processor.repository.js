import { Processor } from "./processor.model.js";

export const ProcessorRepository = {
  async findAll() {
    return await Processor.find().select("-password").sort({
      createdAt: -1,
    });
  },

  async findById(id) {
    return await Processor.findById(id).select("-password").lean();
  },

  async findByEmail(email) {
    return await Processor.findOne({ email });
  },

  async create(data) {
    return await Processor.create(data);
  },

  async updateById(id, updates) {
    return await Processor.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");
  },

  async deleteById(id) {
    return await Processor.findByIdAndDelete(id);
  },
};
