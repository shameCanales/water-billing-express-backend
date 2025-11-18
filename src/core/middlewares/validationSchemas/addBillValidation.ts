import type { Schema } from "express-validator";
import mongoose from "mongoose";

export const addBillValidationSchema: Schema = {
  connection: {
    in: ["body"],
    notEmpty: { errorMessage: "Connection id is required" },
    custom: {
      options: (value) => mongoose.Types.ObjectId.isValid(value),
      errorMessage: "Invalid connection ID format",
    },
  },
  monthOf: {
    in: ["body"],
    notEmpty: {
      errorMessage: "monthOf is required (e.g. 2025-11-01 or November 2025)",
    },
    trim: true,
  },
  dueDate: {
    in: ["body"],
    notEmpty: { errorMessage: "dueDate is required" },
    isISO8601: {
      errorMessage: "dueDate must be a valid date or ISO8601 string",
    },
    toDate: true,
  },
  meterReading: {
    in: ["body"],
    notEmpty: { errorMessage: "meterReading is required" },
    isNumeric: { errorMessage: "meterReading must be a number" },
    toFloat: true,
  },
  chargePerCubicMeter: {
    in: ["body"],
    optional: true,
    isNumeric: { errorMessage: "chargePerCubicMeter must be a number" },
    toFloat: true,
  },
};
