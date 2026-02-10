import { Settings, type ISettingsLean } from "./settings.model.ts";

export const SettingsRepository = {
  async getChargePerCubicMeter(): Promise<number> {
    const settings =
      ((await Settings.findOne()
        .sort({ createdAt: -1 })
        .lean()) as unknown as ISettingsLean) || null;

    if (!settings) {
      const newSettings = await Settings.create({ chargePerCubicMeter: 0 });
      return newSettings.chargePerCubicMeter;
    }

    return settings.chargePerCubicMeter;
  },

  async updateChargePerCubicMeter(amount: number): Promise<number> {
    const updated = await Settings.findOneAndUpdate(
      {}, // match any (singleton)
      { chargePerCubicMeter: amount },
      {
        new: true,
        upsert: true, // create a new document if none exists
        runValidators: true,
      },
    ).lean();


    return updated!.chargePerCubicMeter;
  },
};
