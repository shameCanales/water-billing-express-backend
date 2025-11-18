import mongoose, { Document } from "mongoose";
import type { IConsumerPopulated } from "../consumers/consumer.model.js";
// consumer, meterNumber, address, connectionDate, type: residential | , status: active | disconnected

export interface IConnection {
  consumer: mongoose.Types.ObjectId;
  meterNumber: number;
  address: string;
  connectionDate: Date;
  type: "residential" | "commercial";
  status: "active" | "disconnected";
}

export interface IConnectionDocument extends IConnection, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

/** Lean version without population */
export interface IConnectionLean {
  _id: string;
  consumer: mongoose.Types.ObjectId;
  meterNumber: number;
  address: string;
  connectionDate: Date;
  type: "residential" | "commercial";
  status: "active" | "disconnected";
  createdAt: string;
  updatedAt: string;
}

/** Connection → consumer populated */
export interface IConnectionPopulated {
  _id: mongoose.Types.ObjectId;
  consumer: IConsumerPopulated;
  meterNumber: number;
  address: string;
  connectionDate: Date;
  type: "residential" | "commercial";
  status: "active" | "disconnected";
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

const ConnectionSchema = new mongoose.Schema(
  {
    consumer: {
      type: mongoose.Schema.Types.ObjectId, // reference to Consumer model
      ref: "Consumer", // foreign key
      required: true,
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
      enum: ["residential", "commercial"],
      required: [true, "Connection type is required"],
      default: "residential",
    },
    status: {
      type: String,
      enum: ["active", "disconnected"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export const Connection = mongoose.model("Connection", ConnectionSchema);
