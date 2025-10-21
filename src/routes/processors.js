// import { processors } from "../utils/constants.js";
import { Router } from "express";
import { registerProcessorValidationSchema } from "../middlewares/validationSchemas.js";
import { checkSchema, validationResult } from "express-validator";
import { requireAuthAndManager } from "../middlewares/authmiddleware.js";
import { Processor } from "../mongoose/schemas/processor.js";

const router = Router();

router.post(
  "/api/processors",
  requireAuthAndManager, // middleware that checks for authentication and manager role
  checkSchema(registerProcessorValidationSchema), // middleware for validating request body
  async (request, response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(404).send({ errors: errors.array() });
    }

    const {
      body: { name, email, password, role },
    } = request;

    try {
      const newProcessor = await Processor.create({
        name,
        email,
        password,
        role,
      });

      return response.status(201).send({
        success: true,
        message: "Processor registered successfully",
        data: newProcessor,
      });
    } catch (error) {
      return response.status(500).send({
        success: false,
        message: "Error registering processor",
        error: error.message,
      });
    }
  }
);

export default router;
