import { Connection } from "./connection.model.ts";
import type {
  IConnectionLean,
  IConnectionPopulatedLean,
  IConnection,
  IConnectionSummary,
} from "./connection.types.ts";

import mongoose from "mongoose";

const LIST_POPULATE = [
  {
    path: "consumer",
    select: "firstName middleName lastName mobileNumber -_id",
  },
  { path: "createdBy", select: "firstName lastName role -_id" },
  { path: "lastEditBy", select: "firstName lastName role -_id" },
];

const FULL_POPULATE = [
  {
    path: "consumer",
    select:
      "firstName middleName lastName email birthDate mobileNumber address status lastEditAt",
  },
  { path: "createdBy", select: "firstName middleName lastName role" },
  { path: "lastEditBy", select: "firstName middleName lastName role" },
];

export const ConnectionRepository = {
  async findAll(
    filter: Record<string, any> = {},
    sort: Record<string, any> = { createdAt: -1 },
    skip: number = 0,
    limit: number = 0,
  ): Promise<IConnectionSummary[]> {
    return (await Connection.find(filter)
      .populate(LIST_POPULATE)
      .select("-updatedAt -__v")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()) as unknown as IConnectionSummary[];
  },

  async count(filter: Record<string, any> = {}): Promise<number> {
    return Connection.countDocuments(filter);
  },

  async findById(
    id: string | mongoose.Types.ObjectId,
  ): Promise<IConnectionPopulatedLean | null> {
    return (await Connection.findById(id)
      .populate(FULL_POPULATE)
      .lean()) as unknown as IConnectionPopulatedLean | null;
  },

  async findStatusById(_id: string): Promise<{ status: string } | null> {
    return Connection.findById(_id).select("status").lean();
  },

  async findByMeterNumber(
    meterNumber: number,
  ): Promise<IConnectionLean | null> {
    return (await Connection.findOne({
      meterNumber,
    }).lean()) as unknown as IConnectionLean | null;
  },

  async findByConsumerId(
    consumer: string | mongoose.Types.ObjectId,
  ): Promise<IConnectionSummary[]> {
    return Connection.find({ consumer })
      .populate(LIST_POPULATE)
      .sort({ createdAt: -1 })
      .lean() as unknown as IConnectionSummary[];
  },

  async create(data: IConnection): Promise<IConnectionPopulatedLean> {
    const newConnection = await Connection.create(data);
    return (await ConnectionRepository.findById(newConnection._id.toString()))!;
  },

  async updateById(
    _id: string | mongoose.Types.ObjectId,
    updates: Partial<IConnection>,
  ): Promise<IConnectionSummary | null> {
    return (await Connection.findByIdAndUpdate(_id, updates, {
      new: true,
      runValidators: true,
    })
      .populate(LIST_POPULATE)
      .select("-updatedAt -__v")
      .lean()) as unknown as IConnectionSummary | null;
  },

  async deleteById(
    _id: string | mongoose.Types.ObjectId,
  ): Promise<IConnectionSummary | null> {
    return (await Connection.findByIdAndDelete(_id)
      .populate(LIST_POPULATE)
      .select("-updatedAt -__v")
      .lean()) as unknown as IConnectionSummary | null;
  },
};
