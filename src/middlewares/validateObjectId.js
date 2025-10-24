import mongoose from "mongoose";

/**
 * Middleware: Validates MongoDB ObjectId for a given route parameter.
 *
 * @param {string} paramName - The name of the route parameter to validate (default: "id")
 * @example
 * router.get("/users/:id", validateObjectId(), handler)
 * router.get("/consumers/:consumerid", validateObjectId("consumerid"), handler)
 */
export const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`,
        error: "Provided parameter is not a valid MongoDB ObjectId",
      });
    }

    // Proceed to next middleware/controller
    next();
  };
};
