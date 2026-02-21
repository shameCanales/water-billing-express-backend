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
}

// Interface for the consumer document (with MongoDB fields)
export interface IConsumerDocument extends IConsumer, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Lean version - plain object with password INCLUDED (for auth checks)
export interface IConsumerLean {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  birthDate: Date;
  mobileNumber: string;
  address: string;
  status: ConsumerStatus;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

// For population in other models (minimal fields)
export interface IConsumerPopulated {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  address: string;
}

export interface PaginatedConsumersResult {
  consumers: IConsumerLean[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

