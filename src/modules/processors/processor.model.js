import mongoose from "mongoose";

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

export const Processor = mongoose.model("Processor", processorSchema);
