import { Connection } from "../models/connection.model.js";

export const ConnectionRepository = {
  async findAll() {
    return Connection.find().populate("consumer", "name email mobileNumber");
  },

  async findById(id) {
    return await Connection.findById(id).populate(
      "consumer",
      "name email mobileNumber"
    );
  },

  async findByMeterNumber(meterNumber) {
    return await Connection.findOne({ meterNumber }).lean();
  },

  async findByConsumerId(consumer) {
    return Connection.find(consumer)
      .populate("consumer", "name email mobileNumber")
      .sort({ createdAt: -1 })
      .lean();
  },

  async create(data) {
    const newConnection = await Connection.create(data);
    return newConnection.populate("consumer", "name email mobileNumber");
  },

  async updateById(id, updates) {
    return Connection.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("consumer", "name email mobileNumber");
  },

  async deleteById(id) {
    return Connection.findByIdAndDelete(id);
  },

};
