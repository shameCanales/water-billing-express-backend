import mongoose, { Document, Schema } from "mongoose";

export interface IConsumer {
  // name: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  birthDate: Date;
  mobileNumber: string;
  password: string;
  address: string;
  status: "active" | "suspended";
}

// Interface for the consumer document (with MongoDB fields)
export interface IConsumerDocument extends IConsumer, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Lean version - plain object with password INCLUDED (for auth checks)
export interface IConsumerLean {
  _id: mongoose.Types.ObjectId;
  // name: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  birthDate: Date;
  mobileNumber: string;
  address: string;
  status: "active" | "suspended";
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

// Public version - for API responses (NO password)
export interface IConsumerPublic {
  _id: mongoose.Types.ObjectId;
  // name: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  birthDate: Date;
  mobileNumber: string;
  address: string;
  status: "active" | "suspended";
  createdAt: Date;
  updatedAt: Date;
}

// For population in other models (minimal fields)
export interface IConsumerPopulated {
  _id: mongoose.Types.ObjectId;
  // name: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  address: string;
}

const consumerSchema = new Schema<IConsumerDocument>(
  {
    // name: {
    //   type: String,
    //   required: [true, "Consumer name is requireds"],
    //   trim: true,
    // },
    firstName: {
      type: String,
      required: [true, "Firstname is required"],
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
      set: (value: string) => (value === "" ? undefined : value), // this will set the empty string into undefined. 
    },
    lastName: {
      type: String,
      required: [true, "Lastname is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    birthDate: {
      type: Date,
      required: [true, "Birth date is required"],
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [
        /^09\d{9}$/,
        "Please enter a valid PH mobile number (e.g., 09171234567)",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, //hides password when querying
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true, // auto-creates createdAt and updatedAt fields
  }
);

export const Consumer = mongoose.model<IConsumerDocument>(
  "Consumer",
  consumerSchema
);
