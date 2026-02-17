import mongoose, { Schema } from "mongoose";
import type { Settingkey } from "./settings.model.ts";

export interface ISettingsHistory {
  key: Settingkey;
  value: number;
  effectiveFrom: Date;
}

export interface ISettingsHistoryDocument
  extends ISettingsHistory, mongoose.Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ISettingsHistoryLean extends ISettingsHistory {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
}

const settingsHistorySchema = new Schema<ISettingsHistoryDocument>(
  {
    key: {
      type: String,
      required: true,
      enum: ["chargePerCubicMeter", "surchargeRate"] satisfies Settingkey[],
    },
    value: {
      type: Number,
      required: true,
    },
    effectiveFrom: {
      type: Date,
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

settingsHistorySchema.index({ key: 1, effectiveFrom: -1 });

export const SettingsHistory = mongoose.model<ISettingsHistoryDocument>(
  "SettingsHistory",
  settingsHistorySchema,
);
