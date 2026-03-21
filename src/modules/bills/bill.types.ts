import mongoose, { Document } from "mongoose";
import type {
  IConnectionPopulatedLean,
  IConnectionSummary,
} from "../connections/connection.types.js";
import type {
  IProcessorPopulated,
  IProcessorSummary,
} from "../processors/processor.types.js";

export const BILL_STATUSES = ["paid", "unpaid", "overdue"] as const;
export type BillStatus = (typeof BILL_STATUSES)[number];

export interface IBill {
  connection: mongoose.Types.ObjectId | string;
  monthOf: Date;
  dueDate: Date;
  meterReading: number;
  chargePerCubicMeter: number;
  appliedSurchargePercent: number;
  consumedUnits: number;
  billAmount: number;
  surchargeAmount: number;
  totalAmount: number;
  status: BillStatus;
  paidAt: Date | null;

  createdBy: mongoose.Types.ObjectId | string;
  lastEditBy: mongoose.Types.ObjectId | null | string;
  lastEditAt: Date | null;
  processedBy: mongoose.Types.ObjectId | null | string;
}

export type CreateBillData = Omit<
  IBill,
  | "appliedSurchargePercent"
  | "chargePerCubicMeter"
  | "consumedUnits"
  | "billAmount"
  | "surchargeAmount"
  | "totalAmount"
  | "paidAt"
  | "lastEditBy"
  | "processedBy"
>;

// Full Mongoose document (with methods)
export interface IBillDocument extends IBill, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Plain lean object (no Mongoose methods, no population)
export interface IBillLean extends IBill {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

// Lean with populated connection
export interface IBillPopulatedLean extends Omit<
  IBillLean,
  "connection" | "createdBy" | "lastEditBy" | "processedBy"
> {
  connection: IConnectionPopulatedLean;
  createdBy: IProcessorPopulated;
  lastEditBy: IProcessorPopulated | null;
  processedBy: IProcessorPopulated | null;
}

// lightweight data. tinanggal ang unimportant data for table
export interface IBillSummary extends Omit<
  IBillLean,
  | "connection"
  | "createdBy"
  | "lastEditBy"
  | "processedBy"
  | "appliedSurchargePercent"
  | "__v"
  | "updatedAt"
> {
  connection: IConnectionSummary | null;
  createdBy: IProcessorSummary;
  lastEditBy: IProcessorSummary | null;
  processedBy: IProcessorSummary | null;
}

export interface PaginatedBillsResult {
  bills: IBillSummary[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}
