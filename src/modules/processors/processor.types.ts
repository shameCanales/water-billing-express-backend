import mongoose, { Document } from "mongoose";

export const PROCESSOR_ROLES = ["staff", "manager"] as const;
export type ProcessorRole = (typeof PROCESSOR_ROLES)[number];

export const PROCESSOR_STATUSES = ["active", "restricted"] as const;
export type ProcessorStatus = (typeof PROCESSOR_STATUSES)[number];

export interface IProcessor {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  role: ProcessorRole;
  status: ProcessorStatus;
}

export interface IProcessorDocument extends IProcessor, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProcessorLean extends IProcessor {
  _id: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface PaginatedProcessorsResult {
  processors: IProcessorLean[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export interface IProcessorPopulated {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  middleName?: string;
  lastName: string;
  role: ProcessorRole;
}

export type IProcessorSummary = Pick<
  IProcessorPopulated,
  "firstName" | "middleName" | "lastName" | "role"
>;

