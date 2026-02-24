import mongoose from "mongoose";
import {
  Settings,
  type ISettingsLean,
  type Settingkey,
} from "./settings.model.ts";
import {
  SettingsHistory,
  type ISettingsHistoryLean,
} from "./settingsHistory.model.ts";

export const SettingsRepository = {
  async getSettings(): Promise<ISettingsLean> {
    const settings = (await Settings.findOne().lean()) as ISettingsLean | null;
    if (!settings) throw new Error("Settings not initialized");
    return settings;
  },

  async getSettingValue(key: Settingkey): Promise<number> {
    const settings = await this.getSettings();
    return settings[key];
  },

  async initialize(defaults: {
    chargePerCubicMeter: number;
    surchargeRate: number;
  }): Promise<void> {
    const existing = await Settings.findOne().lean();
    if (existing) return;

    const now = new Date();
    const session = await mongoose.startSession();

    await session.withTransaction(async () => {
      await Settings.create([defaults], { session });

      await SettingsHistory.insertMany(
        Object.entries(defaults).map(([key, value]) => ({
          key,
          value,
          effectiveFrom: now,
        })),
        { session },
      );
    });

    await session.endSession();
  },

  async updateSetting(key: Settingkey, value: number): Promise<ISettingsLean> {
    const now = new Date();
    const session = await mongoose.startSession();

    let updatedSettings: ISettingsLean | null = null;

    await session.withTransaction(async () => {
      updatedSettings = (await Settings.findOneAndUpdate(
        {},
        { [key]: value },
        { new: true, upsert: true, runValidators: true, session },
      ).lean()) as ISettingsLean;
      // append to history
      await SettingsHistory.create([{ key, value, effectiveFrom: now }], {
        session,
      });
    });

    await session.endSession();

    if (!updatedSettings) throw new Error("Failed to update settings");

    return updatedSettings;
  },

  async getHistory(
    key: Settingkey,
    months = 12,
  ): Promise<ISettingsHistoryLean[]> {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    return (await SettingsHistory.find({
      key,
      effectiveFrom: { $gte: since },
    })
      .sort({ effectiveFrom: 1 })
      .lean()) as ISettingsHistoryLean[];
  },

  async getValueAsOf(key: Settingkey, asOf: Date): Promise<number> {
    const record = (await SettingsHistory.findOne({
      key,
      effectiveFrom: { $lte: asOf },
    })
      .sort({ effectiveFrom: -1 })
      .lean()) as ISettingsHistoryLean | null;

    if (!record) throw new Error(`No history found for setting: ${key}`);
    return record.value;
  },
};
