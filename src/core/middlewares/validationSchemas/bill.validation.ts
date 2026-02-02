import type { Schema } from "express-validator";
import mongoose from "mongoose";

const getAllBillsQuerySchema: Schema = {
  page: {
    in: ["query"],
    optional: true,
    isInt: {
      options: {
        min: 1,
      },
      errorMessage: "Page must be a positive integer",
    },
    toInt: true,
  },

  limit: {
    in: ["query"],
    optional: true,
    isInt: {
      options: {
        min: 1,
        max: 100,
      },
      errorMessage: "Limit must be between 1 and 100",
    },
    toInt: true,
  },

  search: {
    in: ["query"],
    optional: true,
    trim: true,
    escape: true, // Sanitizes input (e.g. converts < to &lt;)
  },

  status: {
    in: ["query"],
    optional: true,
    isIn: {
      options: [["paid", "unpaid", "overdue", "all"]],
      errorMessage: "Status must be 'paid', 'unpaid', 'overdue', or 'all'",
    },
    trim: true,
  },

  sortBy: {
    in: ["query"],
    optional: true,
    trim: true,
    // You can add an isIn check here if you want to strictly limit which fields can be sorted
    // isIn: { options: [['firstName', 'lastName', 'createdAt']] }
  },

  sortOrder: {
    in: ["query"],
    optional: true,
    isIn: {
      options: [["asc", "desc"]],
      errorMessage: "Sort order must be 'asc' or 'desc'",
    },
    trim: true,
  },
};

const addBillValidationSchema: Schema = {
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

const editBillValidationSchema: Schema = {
  connection: {
    in: ["body"],
    notEmpty: { errorMessage: "Connection id is required" },
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

export const BillValidationSchema = {
  getAll: getAllBillsQuerySchema,
  add: addBillValidationSchema,
  edit: editBillValidationSchema,
};
