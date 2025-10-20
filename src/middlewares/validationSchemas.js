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

  username: {
    isString: {
      errorMessage: "Username must be a string.",
    },
    isLength: {
      options: { min: 3, max: 25 },
      errorMessage: "Username must be between 3 and 20 characters.",
    },
    notEmpty: {
      errorMessage: "Username is required.",
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
