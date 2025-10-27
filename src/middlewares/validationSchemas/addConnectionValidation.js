import mongoose from "mongoose";

export const addConnectionValidationSchema = {
  consumerId: {
    in: ["body"],
    notEmpty: {
      errorMessage: "Consumer ID is required",
    },
    custom: {
      options: (value) => mongoose.Types.ObjectId.isValid(value),
      errorMessage: "Invalid Consumer ID format",
    },
  },

  meterNumber: {
    in: ["body"],
    notEmpty: {
      errorMessage: "Meter number is required",
    },
    isNumeric: {
      errorMessage: "Meter number must be a number",
    },
    toInt: true,
  },

  address: {
    in: ["body"],
    notEmpty: {
      errorMessage: "Address is required",
    },
    trim: true,
  },

  connectionDate: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isISO8601: {
      errorMessage: "Invalid date format for connectionDate",
    },
    toDate: true,
  },

  type: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isIn: {
      options: [["residential", "commercial"]],
      errorMessage: "Type must be either 'residential' or 'commercial'",
    },
  },

  status: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isIn: {
      options: [["active", "disconnected"]],
      errorMessage: "Status must be either 'active' or 'disconnected'",
    },
  },
};
