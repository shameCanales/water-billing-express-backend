import mongoose, { Document } from "mongoose";
import type { IConsumerPopulatedLean } from "../consumers/consumer.types.ts";
import type { IConsumerSummary } from "../consumers/consumer.types.ts";
import type {
  IProcessorSummary,
  IProcessorPopulated,
} from "../processors/processor.types.ts";

export const CONNECTION_STATUSES = ["connected", "disconnected"] as const;
export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];

export const CONNECTION_TYPES = ["residential", "commercial"] as const;
export type ConnectionType = (typeof CONNECTION_TYPES)[number];

export interface IConnection {
  consumer: mongoose.Types.ObjectId;
  meterNumber: number;
  address: string;
  connectionDate: Date;
  type: ConnectionType;
  status: ConnectionStatus;
  createdBy: mongoose.Types.ObjectId | string;
  lastEditBy: mongoose.Types.ObjectId | null | string;
  lastEditAt: Date | null;
}

export interface IConnectionDocument extends IConnection, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConnectionLean extends IConnection {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface IConnectionPopulatedLean extends Omit<
  IConnectionLean,
  "consumer" | "createdBy" | "lastEditBy"
> {
  consumer: IConsumerPopulatedLean;
  createdBy: IProcessorPopulated;
  lastEditBy: IProcessorPopulated | null;
}

export interface IConnectionSummary extends Omit<
  IConnectionLean,
  "consumer" | "createdBy" | "lastEditBy" | "updatedAt" | "__v"
> {
  consumer: IConsumerSummary;
  createdBy: IProcessorSummary;
  lastEditBy: IProcessorSummary | null;
}

export interface PaginatedConnectionsResult {
  connections: IConnectionSummary[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}
