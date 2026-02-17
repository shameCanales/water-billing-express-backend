import mongoose, { Schema } from "mongoose";

export type Settingkey = "chargePerCubicMeter" | "surchargeRate";

export interface ISettings {
  chargePerCubicMeter: number;
  surchargeRate: number;
}

export interface ISettingsDocument extends ISettings, mongoose.Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISettingsLean extends ISettings {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

const settingsSchema = new Schema<ISettingsDocument>(
  {
    chargePerCubicMeter: {
      type: Number,
      required: [true, "Charge Per Cubic meter is required"],
      min: [0, "Charge per cubic meter cannot be negative. "],
      default: 0,
    },
    surchargeRate: {
      type: Number,
      required: [true, "Surcharge rate is required"],
      min: [0, "Surcharge rate cannot be negative"],
      max: [1, "Surcharge rate must be a decimal e.g. 0.20 for 20%"],
      default: 0.2,
    },
  },
  {
    timestamps: true,
  },
);

export const Settings = mongoose.model<ISettingsDocument>(
  "Settings",
  settingsSchema,
);
