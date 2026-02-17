import type { Schema } from "express-validator";

export const SettingsValidationSchema = {
  updateSetting: {
    key: {
      in: ["body"],
      isIn: {
        options: [["chargePerCubicMeter", "surchargeRate"]],
        errorMessage: "Invalid setting key",
      },
    },
    value: {
      in: ["body"],
      isFloat: {
        options: { min: 0 },
        errorMessage: "Value must be a positive number",
      },
      toFloat: true,
    },
  } satisfies Schema,
};

// import type { Schema } from "express-validator";

// const updateChargePerCubicMeter: Schema = {
//   chargePerCubicMeter: {
//     in: ["body"],
//     notEmpty: {
//       errorMessage: "chargePerCubicMeter is required",
//     },
//     isFloat: {
//       options: { min: 0 },
//       errorMessage: "Charge per cubic meter must be a positive number.",
//     },
//     toFloat: true,
//   },
// };

// export const SettingsValidationSchema = {
//   updateChargePercubicMeter: updateChargePerCubicMeter,
// };
