import mongoose, { Document } from "mongoose";

export interface IProcessor {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  role?: "staff" | "manager";
  status?: "active" | "inactive";
}

// MongoDB document version (includes _id, timestamps)
export interface IProcessorDocument extends IProcessor, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Lean version (plain JS object, e.g. when using .lean())
export interface IProcessorLean {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: "staff" | "manager";
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  // password is excluded because .select("-password") is always used
}

// Public API version (no password, safe to return in responses)
export interface IProcessorPublic {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: "staff" | "manager";
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface IProcessorPopulated {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: "staff" | "manager";
  status: "active" | "inactive";
}

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
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["staff", "manager"],
      default: "staff",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
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
