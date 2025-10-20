import { processors } from "../utils/constants.js";
import { Router } from "express";
import { registerProcessorValidationSchema } from "../middlewares/validationSchemas.js";
import { checkSchema, validationResult } from "express-validator";
import { requireAuthAndManager } from "../middlewares/authmiddleware.js";

const router = Router();

router.post(
  "/api/processors",
  requireAuthAndManager,
  checkSchema(registerProcessorValidationSchema),
  (request, response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(404).send({ errors: errors.array() });
    }

    const {
      body: { name, username, password, role },
    } = request;

    return response.status(201).send({
      success: true,
      message: "Processor registered successfully",
      data: { name, username, role },
    });
  }
);

export default router;
