import { Connection } from "../models/connection.model.js";

export const ConnectionRepository = {
  async findAll() {
    return Connection.find().populate("consumerId", "name email mobileNumber");
  },

  async findById(id) {
    return await Connection.findById(id).populate(
      "consumerId",
      "name email mobileNumber"
    );
  },

  async findByMeterNumber(meterNumber) {
    return await Connection.findOne({ meterNumber });
  },

  async findByConsumerId(consumerId) {
    return Connection.find({ consumerId: consumerId })
      .populate("consumerId", "name email mobileNumber")
      .sort({ createdAt: -1 })
      .lean();
  },

  async create(data) {
    const newConnection = await Connection.create(data);
    return newConnection.populate("consumerId", "name email mobileNumber");
  },

  async updateById(id, updates) {
    return Connection.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("consumerId", "name email mobileNumber");
  },

  async deleteById(id) {
    return Connection.findByIdAndDelete(id);
  },
};
