import type { Schema } from "express-validator";
import mongoose from "mongoose";

const getAllConnectionsQuerySchema: Schema = {
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
    escape: true,
  },

  status: {
    in: ["query"],
    optional: true,
    isIn: {
      options: [["active", "disconnected", "all"]],
      errorMessage: "Status must be 'active', 'disconnected', or 'all'",
    },
    trim: true,
  },

  type: {
    in: ["query"],
    optional: true,
    isIn: {
      options: [["residential", "commercial", "all"]],
      errorMessage: "Status must be 'residential', 'commercial', or 'all'",
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

const editConnectionValidationSchema: Schema = {
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

const addConnectionValidationSchema: Schema = {
  consumer: {
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

export const ConnectionValidationSchema = {
  getAll: getAllConnectionsQuerySchema,
  add: addConnectionValidationSchema,
  edit: editConnectionValidationSchema,
};
