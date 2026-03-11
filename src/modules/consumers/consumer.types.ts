import mongoose, { Document } from "mongoose";

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

// For population in other models (minimal fields)
export interface IConsumerPopulated extends Omit< 
  IConsumerLean,
  "password" | "__v" | "createdBy" | "lastEditBy"
> {
  // If you later decide to populate who created the consumer,
  // you'd add: createdBy: IProcessorPopulated;
}

export interface IConsumerSummary {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  middleName?: string;
  lastName: string;
  mobileNumber: string;
}

export interface PaginatedConsumersResult {
  consumers: IConsumerLean[]; // Usually, we use Lean here so we have the password for potential admin resets
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}
