import { Consumer } from "./consumer.model.js";

export const ConsumerRepository = {
  async findAll() {
    return Consumer.find().select("-password");
  },

  async findById(id) {
    return Consumer.findById(id).select("-password");
  },

  async findByEmail(email) {
    return Consumer.findOne({ email });
  },

  async create(data) {
    return Consumer.create(data);
  },

  async editById(id, updates) {
    return Consumer.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
  },

  async deleteById(id) {
    return Consumer.findByIdAndDelete(id);
  },

  async consumerExists(consumerId) {
    return Consumer.exists({ _id: consumerId });
  },
};
