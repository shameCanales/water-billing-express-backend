import type { Schema } from "express-validator";
import mongoose from "mongoose";
import {
  CONNECTION_STATUSES,
  CONNECTION_TYPES,
} from "../../../modules/connections/connection.types.ts";

const connectionIdParam: Schema[string] = {
  in: ["params"],
  isMongoId: { errorMessage: "Invalid Connection ID format" },
};

const consumerIdParam: Schema[string] = {
  in: ["params"],
  isMongoId: { errorMessage: "Invalid Consumer ID format" },
};

const statusOptions = [...CONNECTION_STATUSES, "all"];
const typeOptions = [...CONNECTION_TYPES, "all"];

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
      options: [statusOptions],
      errorMessage: `Status must be one of: ${statusOptions.join(", ")}`,
    },
    trim: true,
  },

  type: {
    in: ["query"],
    optional: true,
    isIn: {
      options: [typeOptions],
      errorMessage: `Type must be one of: ${typeOptions.join(", ")}`,
    },
    trim: true,
  },

  sortBy: {
    in: ["query"],
    optional: true,
    trim: true,
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
  connectionId: connectionIdParam,

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
    notEmpty: {
      errorMessage: "Address cannot be empty",
    },
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
      options: [CONNECTION_TYPES],
      errorMessage: `Type must be one of: ${CONNECTION_TYPES.join(", ")}`,
    },
  },

  // we might want to remove this and only allow status changes through the dedicated endpoint. because we already have a separate endpoint for changing status.
  status: {
    in: ["body"],
    optional: true,
    isIn: {
      options: [CONNECTION_STATUSES],
      errorMessage: `Status must be one of: ${CONNECTION_STATUSES.join(", ")}`,
    },
  },
};

const editConnectionStatusValidationSchema: Schema = {
  connectionId: {
    in: ["params"],
  },
  status: {
    in: ["body"],
    exists: { errorMessage: "Status is required" },
    isIn: {
      options: [CONNECTION_STATUSES],
      errorMessage: `Status must be one of: ${CONNECTION_STATUSES.join(", ")}`,
    },
  },
};

const deleteConnectionByIdValidationSchema: Schema = {
  connectionId: connectionIdParam,
};

const addConnectionValidationSchema: Schema = {
  consumer: {
    in: ["body"],
    notEmpty: {
      errorMessage: "Consumer ID is required",
    },
    isMongoId: { errorMessage: "Invalid Consumer ID format" },
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
      options: [CONNECTION_TYPES],
      errorMessage: `Type must be one of: ${CONNECTION_TYPES.join(", ")}`,
    },
  },

  status: {
    in: ["body"],
    optional: { options: { nullable: true } },
    isIn: {
      options: [CONNECTION_STATUSES],
      errorMessage: `Status must be one of: ${CONNECTION_STATUSES.join(", ")}`,
    },
  },
};

export const ConnectionValidationSchema = {
  getAll: getAllConnectionsQuerySchema,
  add: addConnectionValidationSchema,
  edit: editConnectionValidationSchema,
  editStatus: editConnectionStatusValidationSchema,
  delete: deleteConnectionByIdValidationSchema,
  idOnly: { connectionId: connectionIdParam } as Schema,
  consumerIdOnly: { consumerId: consumerIdParam } as Schema,
};
