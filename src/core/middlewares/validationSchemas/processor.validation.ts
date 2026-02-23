import type { Schema } from "express-validator";
import {
  PROCESSOR_ROLES,
  PROCESSOR_STATUSES,
} from "../../../modules/processors/processor.types.ts";
import { capitalizeFirstLetter } from "../../utils/validationHelpers.ts";

const processorIdParam: Schema[string] = {
  in: ["params"],
  isMongoId: { errorMessage: "Invalid Processor ID format" },
};

const roleOptions = [...PROCESSOR_ROLES, "all"];
const statusOptions = [...PROCESSOR_STATUSES, "all"];

const getAllProcessorsSchema: Schema = {
  page: {
    in: ["query"],
    optional: true,
    isInt: { options: { min: 1 } },
    toInt: true,
  },
  limit: {
    in: ["query"],
    optional: true,
    isInt: { options: { min: 1, max: 100 } },
    toInt: true,
  },
  search: { in: ["query"], optional: true, trim: true, escape: true },
  role: {
    in: ["query"],
    optional: true,
    trim: true,
    isIn: {
      options: [roleOptions],
      errorMessage: `Role must be one of: ${roleOptions.join(", ")}`,
    },
  },
  status: {
    in: ["query"],
    optional: true,
    trim: true,
    isIn: {
      options: [statusOptions],
      errorMessage: `Status must be one of: ${statusOptions.join(", ")}`,
    },
  },
  sortBy: { in: ["query"], optional: true, trim: true },
  sortOrder: {
    in: ["query"],
    optional: true,
    isIn: { options: [["asc", "desc"]] },
    trim: true,
  },
};

const baseCreateSchema: Schema = {
  firstName: {
    in: ["body"],
    isString: true,
    notEmpty: true,
    trim: true,
    isLength: { options: { min: 1, max: 40 } },
    customSanitizer: { options: capitalizeFirstLetter },
  },
  middleName: {
    in: ["body"],
    optional: { options: { nullable: true, checkFalsy: true } },
    isString: true,
    trim: true,
    isLength: { options: { max: 40 } },
    customSanitizer: { options: capitalizeFirstLetter },
  },
  lastName: {
    in: ["body"],
    isString: true,
    notEmpty: true,
    trim: true,
    isLength: { options: { min: 1, max: 40 } },
    customSanitizer: { options: capitalizeFirstLetter },
  },
  email: {
    in: ["body"],
    isString: true,
    notEmpty: true,
    isEmail: true,
    normalizeEmail: true,
    trim: true,
  },
  password: {
    in: ["body"],
    isString: true,
    notEmpty: true,
    isLength: { options: { min: 8 } },
    matches: {
      options: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/],
      errorMessage:
        "Password must contain uppercase, lowercase, number, and special character.",
    },
  },
};

const registerManagerSchema: Schema = {
  ...baseCreateSchema,
};

const registerStaffSchema: Schema = {
  ...baseCreateSchema,
  role: { in: ["body"], isIn: { options: [PROCESSOR_ROLES] } },
};

const editProcessorValidationSchema: Schema = {
  processorId: processorIdParam,
  firstName: {
    in: ["body"],
    optional: true,
    isString: true,
    notEmpty: true,
    trim: true,
    isLength: { options: { max: 40 } },
    customSanitizer: { options: capitalizeFirstLetter },
  },
  middleName: {
    in: ["body"],
    optional: { options: { nullable: true, checkFalsy: true } },
    isString: true,
    trim: true,
    isLength: { options: { max: 40 } },
    customSanitizer: { options: capitalizeFirstLetter },
  },
  lastName: {
    in: ["body"],
    optional: true,
    isString: true,
    notEmpty: true,
    trim: true,
    isLength: { options: { max: 40 } },
    customSanitizer: { options: capitalizeFirstLetter },
  },
  email: {
    in: ["body"],
    optional: true,
    isString: true,
    notEmpty: true,
    isEmail: true,
    normalizeEmail: true,
  },
  password: {
    in: ["body"],
    optional: true,
    isString: true,
    notEmpty: true,
    isLength: { options: { min: 8 } },
    matches: {
      options: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/],
      errorMessage:
        "Password must contain uppercase, lowercase, number, and special character.",
    },
  },
  role: { in: ["body"], optional: true, isIn: { options: [PROCESSOR_ROLES] } },
};

const editStatusSchema: Schema = {
  processorId: processorIdParam,
  status: {
    in: ["body"],
    exists: { errorMessage: "Status is required" },
    isIn: {
      options: [PROCESSOR_STATUSES],
      errorMessage: `Status must be one of: ${PROCESSOR_STATUSES.join(", ")}`,
    },
  },
};

export const ProcessorValidationSchema = {
  getAll: getAllProcessorsSchema,
  registerManager: registerManagerSchema,
  registerStaff: registerStaffSchema,
  edit: editProcessorValidationSchema,
  editStatus: editStatusSchema,
  idOnly: { processorId: processorIdParam } as Schema,
};
