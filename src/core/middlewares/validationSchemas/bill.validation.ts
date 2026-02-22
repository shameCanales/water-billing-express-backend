import type { Schema } from "express-validator";
import mongoose from "mongoose";
import { BILL_STATUSES } from "../../../modules/bills/bill.types.ts";

const billIdParam: Schema[string] = {
  in: ["params"],
  isMongoId: { errorMessage: "Invalid Bill ID format" },
};

const statusQueryOptions = [...BILL_STATUSES, "all"];

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
      options: [statusQueryOptions],
      errorMessage: `Status must be one of: ${statusQueryOptions.join(", ")}`,
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
    isMongoId: { errorMessage: "Invalid connection ID format" }, // Native validation
  },
  monthOf: {
    in: ["body"],
    notEmpty: { errorMessage: "monthOf is required" },
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
  status: {
    in: ["body"],
    optional: true,
    isIn: {
      options: [BILL_STATUSES],
      errorMessage: `Status must be one of: ${BILL_STATUSES.join(", ")}`,
    },
    trim: true,
  },
};

const editBillValidationSchema: Schema = {
  billId: billIdParam,
  connection: {
    in: ["body"],
    optional: true, // Optional on edit
    notEmpty: { errorMessage: "Connection id cannot be empty" },
    isMongoId: { errorMessage: "Invalid connection ID format" },
  },
  monthOf: {
    in: ["body"],
    optional: true,
    notEmpty: { errorMessage: "monthOf cannot be empty" },
    trim: true,
  },
  dueDate: {
    in: ["body"],
    optional: true,
    notEmpty: { errorMessage: "dueDate cannot be empty" },
    isISO8601: {
      errorMessage: "dueDate must be a valid date or ISO8601 string",
    },
    toDate: true,
  },
  meterReading: {
    in: ["body"],
    optional: true,
    notEmpty: { errorMessage: "meterReading cannot be empty" },
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

const editBillStatusValidationSchema: Schema = {
  billId: billIdParam,
  status: {
    in: ["body"],
    exists: { errorMessage: "Status is required" },
    isIn: {
      options: [BILL_STATUSES],
      errorMessage: `Status must be one of: ${BILL_STATUSES.join(", ")}`,
    },
  },
};

export const BillValidationSchema = {
  getAll: getAllBillsQuerySchema,
  add: addBillValidationSchema,
  edit: editBillValidationSchema,
  editStatus: editBillStatusValidationSchema,
  idOnly: { billId: billIdParam } as Schema,
};