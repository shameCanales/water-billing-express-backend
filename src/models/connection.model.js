import mongoose from "mongoose";

// consumer, meterNumber, address, connectionDate, type: residential | , status: active | disconnected

const ConnectionSchema = new mongoose.Schema(
  {
    consumerId: {
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
