import mongoose, { Schema } from "mongoose";
import { BILL_STATUSES, type IBillDocument } from "./bill.types.ts";

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
    appliedSurchargePercent: {
      type: Number,
      required: [true, "Applied surcharge percent is required."],
    },
    consumedUnits: {
      type: Number, // calculated as current meter reading - last month's meter reading
      required: [true, "Consumed units is required"],
      min: [0, "Consumed units cannot be negative"],
    },
    billAmount: {
      type: Number, // calculated as consumedUnits * chargePerCubicMeter
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    surchargeAmount: {
      type: Number,
      required: [true, "Surcharge amount is required"],
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
    },
    status: {
      type: String,
      enum: BILL_STATUSES,
      required: [true, "Status is required"],
      default: "unpaid",
    },
    paidAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Processor",
      required: [true, "Creator reference is required"],
    },
    lastEditBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Processor",
      default: null,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Processor",
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
