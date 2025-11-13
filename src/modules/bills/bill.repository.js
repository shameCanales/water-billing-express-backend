import { Bill } from "./bill.model.js";

export const BillRepository = {
  async findAll() {
    return Bill.find()
      .populate({
        path: "connection",
        populate: {
          path: "consumer",
          select: "name email mobileNumber address",
        },
      })
      .sort({ createdAt: -1 })
      .lean();
  },

  async findOneByConnectionAndMonth(connection, monthOf) {
    return await Bill.findOne({ connection, monthOf });
  },

  async findOneByConnection(connection) {
    return await Bill.findOne({ connection }).sort({ monthOf: -1 }).lean();
  },

  async findLastBill(connection) {
    return Bill.findOne({
      connection,
    })
      .sort({ monthOf: -1 })
      .lean();
  },

  async create(data) {
    return await Bill.create(data);
  },

  async findById(bill) {
    return Bill.findById(bill)
      .populate({
        path: "connection",
        populate: {
          path: "consumer",
          select: "name email mobileNumber",
        },
      })
      .lean();
  },

  async findByConnection(connection) {
    return await Bill.find({ connection })
      .populate({
        path: "connection",
        populate: {
          path: "consumer",
          select: "name email mobileNumber address",
        },
      })
      .sort({ createdAt: -1 });
  },

  async updateById(bill, updates) {
    return await Bill.findByIdAndUpdate(bill, updates, {
      new: true,
      runValidators: true,
    }).populate({
      path: "connection",
      populate: {
        path: "consumer",
        select: "name email mobileNumber",
      },
    });
  },

  async deleteById(bill) {
    return Bill.findByIdAndDelete(bill);
  },
};
