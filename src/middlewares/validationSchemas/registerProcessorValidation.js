export const registerProcessorValidationSchema = {
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
