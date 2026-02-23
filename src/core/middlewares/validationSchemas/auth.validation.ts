import type { Schema } from "express-validator";

const loginSchema: Schema = {
  email: {
    in: ["body"],
    isEmail: { errorMessage: "Please provide a valid email address" },
    normalizeEmail: true,
    notEmpty: { errorMessage: "Email is required" },
  },
  password: {
    in: ["body"],
    isString: { errorMessage: "Password must be a string" },
    notEmpty: { errorMessage: "Password is required" },
  },
};

export const AuthAdminValidationSchema = {
  login: loginSchema,
};
