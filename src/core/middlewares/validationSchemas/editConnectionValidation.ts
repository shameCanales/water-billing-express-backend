
import type { Schema } from "express-validator";

export const editConnectionValidationSchema: Schema = {
  meterNumber: {
    in: ["body"],
    optional: true,
    isNumeric: {
      errorMessage: "Meter number must be a number",
    },
    toInt: true,
  },

  address: {
    in: ["body"],
    optional: true,
    trim: true,
  },

  connectionDate: {
    in: ["body"],
    optional: true,
    isISO8601: {
      errorMessage: "Invalid date format for connectionDate",
    },
    toDate: true,
  },

  type: {
    in: ["body"],
    optional: true,
    isIn: {
      options: [["residential", "commercial"]],
      errorMessage: "Type must be either 'residential' or 'commercial'",
    },
  },

  status: {
    in: ["body"],
    optional: true,
    isIn: {
      options: [["active", "disconnected"]],
      errorMessage: "Status must be either 'active' or 'disconnected'",
    },
  },
};
