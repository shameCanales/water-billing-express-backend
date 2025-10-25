import mongoose from "mongoose";

const BillSchema = new mongoose.Schema(
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
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// prevent duplicates for the same connection and same month
BillSchema.index({ connection: 1, monthOf: 1 }, { unique: true }); // means

export const Bill = mongoose.model("Bill", BillSchema);
