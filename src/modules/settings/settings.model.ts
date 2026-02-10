import mongoose, { Schema } from "mongoose";

export interface ISettings {
  chargePerCubicMeter: number;
}

export interface ISettingsDocument extends ISettings, mongoose.Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISettingsLean{
  _id: mongoose.Types.ObjectId;
  chargePerCubicMeter: number;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

const settingsSchema = new Schema<ISettingsDocument>(
  {
    chargePerCubicMeter: {
      type: Number,
      required: [true, "Charge per cubic meter is required"],
      min: [0, "Charge per cubic meter cannot be negative"],
      default: 0,
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
