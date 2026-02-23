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

export interface IProcessorLean {
  _id: mongoose.Types.ObjectId | string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: ProcessorRole;
  status: ProcessorStatus;
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

// // Public API version (no password, safe to return in responses)
// export interface IProcessorPublic {
//   _id: mongoose.Types.ObjectId;
//   firstName: string;
//   middleName?: string;
//   lastName: string;
//   email: string;
//   role: "staff" | "manager";
//   status: "active" | "restricted";
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface IProcessorPopulated {
//   _id: mongoose.Types.ObjectId;
//   firstName: string;
//   middleName?: string;
//   lastName: string;
//   email: string;
//   role: "staff" | "manager";
//   status: "active" | "restricted";
// }
