import type { Schema } from "express-validator";

const getAllProcessorsSchema: Schema = {
  role: {
    in: ["query"],
    optional: true,
    trim: true,
    isIn: {
      options: [["staff", "manager"]],
      errorMessage: "Role filter must be staff or manager",
    },
  },
};

const registerManagerSchema: Schema = {
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

  status: {
    isIn: {
      options: [["active", "restricted"]],
      errorMessage: "Status must be either 'active' or 'restricted'.",
    },
    notEmpty: {
      errorMessage: "Status is required.",
    },
  },
};

const registerStaffSchema: Schema = {
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

  status: {
    isIn: {
      options: [["active", "restricted"]],
      errorMessage: "Status must be either 'active' or 'restricted'.",
    },
    notEmpty: {
      errorMessage: "Status is required.",
    },
  },
};

const editProcessorValidationSchema: Schema = {
  name: {
    isString: {
      errorMessage: "Name must be a string.",
    },
    isLength: {
      options: { min: 3, max: 32 },
      errorMessage: "Name must be between 3 and 32 characters.",
    },
    notEmpty: {
      errorMessage: "Name is required.",
    },
    trim: true,
    optional: true,
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
    optional: true,
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
    optional: true,
  },

  role: {
    isIn: {
      options: [["manager", "staff"]],
      errorMessage: "Role must be either 'manager' or 'staff'.",
    },
    notEmpty: {
      errorMessage: "Role is required.",
    },
    optional: true,
  },

  status: {
    isIn: {
      options: [["active", "restricted"]],
      errorMessage: "Status must be either 'active' or 'restricted'.",
    },
    notEmpty: {
      errorMessage: "Status is required.",
    },
  },
};

export const ProcessorValidationSchema = {
  getAll: getAllProcessorsSchema,
  registerManager: registerManagerSchema,
  registerStaff: registerStaffSchema,
  edit: editProcessorValidationSchema,
};
