import mongoose, { Document, Schema } from "mongoose";
import type { IConnectionPopulated } from "../connections/connection.model.js";

export type BillStatus = "paid" | "unpaid" | "overdue";

export interface IBill {
  connection: mongoose.Types.ObjectId;
  monthOf: Date;
  dueDate: Date;
  meterReading: number;
  chargePerCubicMeter: number;
  consumedUnits: number;
  amount: number;
  status: BillStatus;
  paidAt: Date | null;
}

// Full Mongoose document (with methods)
export interface IBillDocument extends IBill, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Plain lean object (no Mongoose methods)
export interface IBillLean {
  _id: mongoose.Types.ObjectId;
  connection: mongoose.Types.ObjectId;
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
export interface IBillPopulatedLean {
  _id: mongoose.Types.ObjectId;
  connection: IConnectionPopulated;
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

export interface PaginatedBillsResult {
  bills: IBillPopulatedLean[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

const BillSchema: Schema = new Schema<IBillDocument>(
  {
    connection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connection",
      required: [true, "Connection reference is required"],
    },
    monthOf: {
      type: Date,
      required: [true, "Month of billing is required"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    meterReading: {
      type: Number,
      required: [true, "Current meter reading is required"],
      min: [0, "Meter reading cannot be negative"],
    },
    chargePerCubicMeter: {
      type: Number, // this should be auto populated from settings
      required: [true, "Charge per cubic meter is required"],
      min: [0, "Charge per cubic meter cannot be negative"],
    },
    consumedUnits: {
      type: Number, // calculated as current meter reading - last month's meter reading
      required: [true, "Consumed units is required"],
      min: [0, "Consumed units cannot be negative"],
    },
    amount: {
      type: Number, // calculated as consumedUnits * chargePerCubicMeter
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["paid", "unpaid", "overdue"],
      default: "unpaid",
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// prevent duplicates for the same connection and same month
BillSchema.index({ connection: 1, monthOf: 1 }, { unique: true }); // means a bill for a given connection and month can only be created once

export const Bill = mongoose.model<IBillDocument>("Bill", BillSchema);
