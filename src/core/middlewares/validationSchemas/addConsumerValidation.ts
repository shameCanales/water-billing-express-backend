import type { Schema } from "express-validator";

export const addConsumerValidationSchema : Schema = {
  // NAME
  name: {
    in: ["body"], // means where to look: req.body
    isString: {
      errorMessage: "Name must be a string",
    },
    isLength: {
      options: { min: 5, max: 40 },
      errorMessage: "Name must be between 5 and 40 characters",
    },
    notEmpty: {
      errorMessage: "Name is required",
    },
    trim: true,
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
      errorMessage: "Birth date must be a valid ISO 8601 date (e.g., 2000-12-31)",
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
  },

  // STATUS
  status: {
    in: ["body"],
    optional: true, // optional, defaults to "active" if not provided
    isIn: {
      options: [["active", "suspended"]],
      errorMessage: "Status must be either 'active' or 'suspended'",
    },
  },
};
