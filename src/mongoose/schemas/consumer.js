import mongoose from "mongoose";

const consumerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Consumer name is requireds"],
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

export const Consumer = mongoose.model("Consumer", consumerSchema);
