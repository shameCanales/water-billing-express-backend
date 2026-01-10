import { ConnectionRepository } from "./connection.repository.ts";
import { ConsumerRepository } from "../consumers/consumer.repository.ts";
import type { IConnection, IConnectionPopulated } from "./connection.model.ts";
import type mongoose from "mongoose";

interface GetAllConnectionsParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  type?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const ConnectionService = {
  async create(data: IConnection): Promise<IConnectionPopulated> {
    const { consumer, meterNumber } = data;

    const foundConsumer = await ConsumerRepository.findById(consumer);
    if (!foundConsumer) throw new Error("Consumer not found");

    const existing = await ConnectionRepository.findByMeterNumber(meterNumber);
    if (existing)
      throw new Error("Connection with this meter number already exists");

    const connection = await ConnectionRepository.create(data);
    return connection;
  },

  async getAll(params: GetAllConnectionsParams) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      type,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const skip = (page - 1) * limit;
    const filter: any = {};

    if (status && status !== "all") filter.status = status;
    if (type && type !== "all") filter.type = type;

    if (search) {
      const searchRegex = new RegExp(search, "i"); // i = case sensitive

      const matchingConsumers = await ConsumerRepository.findAll({
        $or: [
          { firstName: searchRegex },
          { middleName: searchRegex },
          { lastName: searchRegex },
        ],
      });

      const consumerIds = matchingConsumers.map((c) => c._id);

      const orConditions: any[] = [
        { address: searchRegex }, // Search Address
        { consumer: { $in: consumerIds } }, // Search Consumer Name
      ];

      if (!isNaN(Number(search))) {
        orConditions.push({ meterNumber: Number(search) });
      }

      filter.$or = orConditions;
    }

    const sort: any = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [connections, total] = await Promise.all([
      ConnectionRepository.findAll(filter, sort, skip, limit),
      ConnectionRepository.count(filter),
    ]);

    return {
      connections,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    };
  },

  async updateById(
    id: string | mongoose.Types.ObjectId,
    updates: Partial<IConnection>
  ): Promise<IConnectionPopulated> {
    const updated = await ConnectionRepository.updateById(id, updates);
    if (!updated) throw new Error("Connection not found");
    return updated;
  },

  async deleteById(
    id: string | mongoose.Types.ObjectId
  ): Promise<IConnectionPopulated> {
    const deleted = await ConnectionRepository.deleteById(id);
    if (!deleted) throw new Error("Connection not found");
    return deleted;
  },

  async getByConsumerId(consumer: mongoose.Types.ObjectId | string) {
    return await ConnectionRepository.findByConsumerId(consumer);
  },
};
