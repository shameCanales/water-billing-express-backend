import type { Response } from "express";

export const handleControllerError = (error: unknown, res: Response) => {
  const errorMessage =
    error instanceof Error ? error.message : "An unknown error occurred";

  let status = 500;
  if (errorMessage.includes("not found")) status = 404;
  else if (
    errorMessage.includes("exists") ||
    errorMessage.includes("duplicate")
  )
    status = 409;
  else if (
    errorMessage.includes("Invalid") ||
    errorMessage.includes("cannot be")
  )
    status = 400;

  return res.status(status).json({
    success: false,
    message: errorMessage,
  });
};
