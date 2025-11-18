import mongoose, { Document } from "mongoose";

export interface IProcessor {
  name: string;
  email: string;
  password: string;
  role?: "staff" | "manager";
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
  name: string;
  email: string;
  role: "staff" | "manager";
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  // password is excluded because .select("-password") is always used
}

// Public API version (no password, safe to return in responses)
export interface IProcessorPublic {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: "staff" | "manager";
  createdAt: Date;
  updatedAt: Date;
}

export interface IProcessorPopulated {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  role: "staff" | "manager";
}

const processorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
  },
  {
    timestamps: true,
  }
);

export const Processor = mongoose.model<IProcessorDocument>(
  "Processor",
  processorSchema
);
