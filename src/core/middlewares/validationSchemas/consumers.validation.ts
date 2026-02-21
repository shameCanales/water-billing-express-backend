import type { Schema } from "express-validator";
import { CONSUMER_STATUSES } from "../../../modules/consumers/consumer.types.ts";
import { capitalizeFirstLetter } from "../../utils/validationHelpers.ts";

const consumerIdParam: Schema[string] = {
  in: ["params"],
  isMongoId: {
    errorMessage: "Invalid Consumer ID format",
  },
};

const statusOptions = [...CONSUMER_STATUSES, "all"];

const getAllConsumersQuerySchema: Schema = {
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
      options: [statusOptions],
      errorMessage: `Status must be one of: ${statusOptions.join(", ")}`,
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

const addConsumerValidationSchema: Schema = {
  // NAME
  firstName: {
    in: ["body"], // means where to look: req.body
    isString: {
      errorMessage: "first name must be a string",
    },
    isLength: {
      options: { min: 1, max: 40 },
      errorMessage: "first name must be between 5 and 40 characters",
    },
    notEmpty: {
      errorMessage: "first name is required",
    },
    trim: true,
    customSanitizer: {
      options: capitalizeFirstLetter,
    },
  },

  middleName: {
    in: ["body"], // means where to look: req.body
    optional: {
      options: {
        nullable: true,
        checkFalsy: true,
      },
    },
    isString: {
      errorMessage: "middle name must be a string",
    },
    isLength: {
      options: { min: 1, max: 40 },
      errorMessage: "middle name must be between 1 and 40 characters",
    },
    trim: true,
    customSanitizer: {
      options: capitalizeFirstLetter,
    },
  },

  lastName: {
    in: ["body"], // means where to look: req.body
    isString: {
      errorMessage: "last name must be a string",
    },
    isLength: {
      options: { min: 1, max: 40 },
      errorMessage: "last name must be between 1 and 40 characters",
    },
    notEmpty: {
      errorMessage: "last name is required",
    },
    trim: true,
    customSanitizer: {
      options: capitalizeFirstLetter,
    },
  },

  // EMAIL
  email: {
    in: ["body"],
    isString: {
      errorMessage: "Email must be a string",
    },
    notEmpty: {
      errorMessage: "Email is required",
    },
    isEmail: {
      errorMessage: "Please enter a valid email address",
    },
    normalizeEmail: true, // converts to lowercase, removes dots in Gmail, etc.
  },

  // BIRTHDATE
  birthDate: {
    in: ["body"],
    notEmpty: {
      errorMessage: "Birth date is required",
    },
    isISO8601: {
      errorMessage:
        "Birth date must be a valid ISO 8601 date (e.g., 2000-12-31)",
    },
    toDate: true, // automatically converts to JS Date
  },

  // MOBILE NUMBER
  mobileNumber: {
    in: ["body"],
    isString: {
      errorMessage: "Mobile number must be a string",
    },
    notEmpty: {
      errorMessage: "Mobile number is required",
    },
    matches: {
      options: [/^09\d{9}$/],
      errorMessage: "Please enter a valid PH mobile number (e.g., 09171234567)",
    },
    trim: true,
  },

  // PASSWORD
  password: {
    in: ["body"],
    isString: {
      errorMessage: "Password must be a string",
    },
    notEmpty: {
      errorMessage: "Password is required",
    },
    isLength: {
      options: { min: 6 },
      errorMessage: "Password must be at least 6 characters long",
    },
    trim: true,
  },

  // ADDRESS
  address: {
    in: ["body"],
    isString: {
      errorMessage: "Address must be a string",
    },
    notEmpty: {
      errorMessage: "Address is required",
    },
    isLength: {
      options: { min: 5, max: 100 },
      errorMessage: "Address must be between 5 and 100 characters",
    },
    trim: true,
    customSanitizer: {
      options: capitalizeFirstLetter,
    },
  },

  // STATUS
  status: {
    in: ["body"],
    optional: true, // optional, defaults to "active" if not provided
    isIn: {
      options: [CONSUMER_STATUSES],
      errorMessage: `Status must be one of: ${CONSUMER_STATUSES.join(", ")}`,
    },
  },
};

const updateConsumerStatusSchema: Schema = {
  consumerId: consumerIdParam,
  status: {
    in: ["body"],
    exists: {
      errorMessage: "Status is required",
    },
    isIn: {
      options: [CONSUMER_STATUSES],
      errorMessage: `Status must be one of: ${CONSUMER_STATUSES.join(", ")}`,
    },
  },
};

const editConsumerSchema: Schema = {
  consumerId: consumerIdParam,
  firstName: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "first name must be a string",
    },
    isLength: {
      options: { min: 1, max: 40 },
      errorMessage: "first name must be between 5 and 40 characters",
    },
    trim: true,
    customSanitizer: {
      options: capitalizeFirstLetter,
    },
  },

  middleName: {
    in: ["body"],
    optional: {
      options: {
        nullable: true,
        checkFalsy: true,
      },
    },
    isString: {
      errorMessage: "middle name must be a string",
    },
    isLength: {
      options: { min: 1, max: 40 },
      errorMessage: "middle name must be between 1 and 40 characters",
    },
    trim: true,
    customSanitizer: {
      options: capitalizeFirstLetter,
    },
  },

  lastName: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "last name must be a string",
    },
    isLength: {
      options: { min: 1, max: 40 },
      errorMessage: "last name must be between 1 and 40 characters",
    },
    trim: true,
    customSanitizer: {
      options: capitalizeFirstLetter,
    },
  },

  email: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "Email must be a string",
    },
    isEmail: {
      errorMessage: "Please enter a valid email address",
    },
    normalizeEmail: true,
  },

  birthDate: {
    in: ["body"],
    optional: true,
    isISO8601: {
      errorMessage:
        "Birth date must be a valid ISO 8601 date (e.g., 2000-12-31)",
    },
    toDate: true,
  },

  mobileNumber: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "Mobile number must be a string",
    },

    matches: {
      options: [/^09\d{9}$/],
      errorMessage: "Please enter a valid PH mobile number (e.g., 09171234567)",
    },
    trim: true,
  },

  password: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "Password must be a string",
    },
    isLength: {
      options: { min: 6 },
      errorMessage: "Password must be at least 6 characters long",
    },
    trim: true,
  },

  address: {
    in: ["body"],
    optional: true,
    isString: {
      errorMessage: "Address must be a string",
    },
    isLength: {
      options: { min: 5, max: 100 },
      errorMessage: "Address must be between 5 and 100 characters",
    },
    trim: true,
    customSanitizer: {
      options: capitalizeFirstLetter,
    },
  },

  // we might want to remove this and only allow status changes through the dedicated endpoint. because we already have a separate endpoint for changing status.

  status: {
    in: ["body"],
    optional: true,
    isIn: {
      options: [CONSUMER_STATUSES],
      errorMessage: `Status must be one of: ${CONSUMER_STATUSES.join(", ")}`,
    },
  },
};

export const ConsumerValidationSchema = {
  add: addConsumerValidationSchema,
  getAll: getAllConsumersQuerySchema,
  edit: editConsumerSchema,
  updateStatus: updateConsumerStatusSchema,
  idOnly: { consumerId: consumerIdParam } as Schema,
};
