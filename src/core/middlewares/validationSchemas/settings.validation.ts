import type { Schema } from "express-validator";

const updateChargePerCubicMeter: Schema = {
  chargePerCubicMeter: {
    in: ["body"],
    notEmpty: {
      errorMessage: "chargePerCubicMeter is required",
    },
    isFloat: {
      options: { min: 0 },
      errorMessage: "Charge per cubic meter must be a positive number.",
    },
    toFloat: true,
  },
};

export const SettingsValidationSchema = {
  updateChargePercubicMeter: updateChargePerCubicMeter,
};
