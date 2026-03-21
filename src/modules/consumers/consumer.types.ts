import mongoose, { Document } from "mongoose";
import type {
  IProcessorPopulated,
  IProcessorSummary,
} from "../processors/processor.types.js";

export const CONSUMER_STATUSES = ["active", "suspended"] as const;
export type ConsumerStatus = (typeof CONSUMER_STATUSES)[number];

export interface IConsumer {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  birthDate: Date;
  mobileNumber: string;
  password: string;
  address: string;
  status: ConsumerStatus;
  createdBy: mongoose.Types.ObjectId | string;
  lastEditBy: mongoose.Types.ObjectId | null | string;
  lastEditAt: Date | null;
}

// Interface for the consumer document (with MongoDB fields)
export interface IConsumerDocument extends IConsumer, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Lean version - plain object with password INCLUDED (for auth checks)
export interface IConsumerLean extends IConsumer {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

//Detailed view
export interface IConsumerPopulatedLean extends Omit<
  IConsumerLean,
  "password" | "createdBy" | "lastEditBy"
> {
  createdBy: IProcessorPopulated;
  lastEditBy: IProcessorPopulated | null;
}

// list summary view
export interface IConsumerSummary extends Omit<
  IConsumerLean,
  "password" | "createdBy" | "lastEditBy"
> {
  createdBy: IProcessorSummary;
  lastEditBy: IProcessorSummary | null;
}

export interface PaginatedConsumersResult {
  consumers: IConsumerSummary[]; 
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}
