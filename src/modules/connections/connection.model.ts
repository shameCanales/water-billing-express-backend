import mongoose from "mongoose";
import {
  CONNECTION_STATUSES,
  CONNECTION_TYPES,
  type IConnectionDocument,
} from "./connection.types.js";

const ConnectionSchema = new mongoose.Schema<IConnectionDocument>(
  {
    consumer: {
      type: mongoose.Schema.Types.ObjectId, // reference to Consumer model
      ref: "Consumer", // foreign key
      required: [true, "Consumer reference is required"],
    },
    meterNumber: {
      type: Number,
      required: [true, "Meter number is required"],
      unique: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    connectionDate: {
      type: Date,
      required: [true, "Connection date is required"],
      default: Date.now,
    },
    type: {
      type: String,
      enum: CONNECTION_TYPES,
      required: [true, "Connection type is required"],
      default: "residential",
    },
    status: {
      type: String,
      enum: CONNECTION_STATUSES,
      default: "connected",
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
    lastEditAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const Connection = mongoose.model<IConnectionDocument>(
  "Connection",
  ConnectionSchema,
);
