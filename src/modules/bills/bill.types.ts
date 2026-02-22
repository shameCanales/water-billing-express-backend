import mongoose, { Document } from "mongoose";
import type { IConnectionPopulated } from "../connections/connection.types.ts";

export const BILL_STATUSES = ["paid", "unpaid", "overdue"] as const;
export type BillStatus = (typeof BILL_STATUSES)[number];

export interface IBill {
  connection: mongoose.Types.ObjectId | string;
  monthOf: Date;
  dueDate: Date;
  meterReading: number;
  chargePerCubicMeter: number;
  consumedUnits: number;
  amount: number;
  status: BillStatus;
  paidAt: Date | null;
}

export type CreateBillData = Omit<
  IBill,
  "amount" | "chargePerCubicMeter" | "consumedUnits" | "paidAt"
>;

// Full Mongoose document (with methods)
export interface IBillDocument extends IBill, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Plain lean object (no Mongoose methods)
export interface IBillLean {
  _id: mongoose.Types.ObjectId;
  connection: mongoose.Types.ObjectId | string;
  monthOf: Date;
  dueDate: Date;
  meterReading: number;
  chargePerCubicMeter: number;
  consumedUnits: number;
  amount: number;
  status: BillStatus;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

// Lean with populated connection
export interface IBillPopulatedLean extends Omit<IBillLean, "connection"> {
  connection: IConnectionPopulated;
}

export interface PaginatedBillsResult {
  bills: IBillPopulatedLean[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}
