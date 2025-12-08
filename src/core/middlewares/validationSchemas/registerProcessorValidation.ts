import type { Schema } from "express-validator";

export const registerProcessorValidationSchema: Schema = {
  firstName: {
    in: ["body"],
    isString: {
      errorMessage: "first name must be a string",
    },
    isLength: {
      options: { min: 1, max: 40 },
    },
    notEmpty: {
      errorMessage: "firt name is required",
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
      options: {
        min: 1,
        max: 40,
      },
      errorMessage: "middle name must be between 1 and 40 characters",
    },
    trim: true,
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
  },
  email: {
    isString: {
      errorMessage: "email must be a string.",
    },
    isLength: {
      options: { min: 3, max: 30 },
      errorMessage: "Email must be between 3 and 30 characters.",
    },
    notEmpty: {
      errorMessage: "Email is required.",
    },
    trim: true,
    isEmail: {
      errorMessage: "Please enter a valid email address",
    },
    normalizeEmail: true,
  },

  password: {
    isString: {
      errorMessage: "Password must be a string.",
    },
    isLength: {
      options: { min: 8 },
      errorMessage: "Password must be at least 8 characters long.",
    },
    matches: {
      options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      errorMessage:
        "Password must contain uppercase, lowercase, number, and special character.",
    },
    notEmpty: {
      errorMessage: "Password is required.",
    },
  },

  role: {
    isIn: {
      options: [["manager", "staff"]],
      errorMessage: "Role must be either 'manager' or 'staff'.",
    },
    notEmpty: {
      errorMessage: "Role is required.",
    },
  },
};
