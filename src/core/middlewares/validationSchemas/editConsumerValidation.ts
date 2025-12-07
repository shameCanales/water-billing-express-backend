import type { Schema } from "express-validator";

export const editConsumerValidationSchema: Schema = {
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
  },

  status: {
    in: ["body"],
    optional: true,
    isIn: {
      options: [["active", "suspended"]],
      errorMessage: "Status must be either 'active' or 'suspended'",
    },
  },
};
