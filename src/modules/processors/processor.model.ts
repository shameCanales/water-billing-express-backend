import mongoose from "mongoose";
import type { IProcessorDocument } from "./processor.types.ts";
import { PROCESSOR_ROLES, PROCESSOR_STATUSES } from "./processor.types.ts";

const processorSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "FirstName is required"],
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
      set: (value: string) => (value === "" ? undefined : value),
    },
    lastName: {
      type: String,
      required: [true, "LastName is required"],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: PROCESSOR_ROLES,
      default: "staff",
    },
    status: {
      type: String,
      enum: PROCESSOR_STATUSES,
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

export const Processor = mongoose.model<IProcessorDocument>(
  "Processor",
  processorSchema,
);
