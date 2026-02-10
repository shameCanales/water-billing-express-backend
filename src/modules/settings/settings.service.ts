import { SettingsRepository } from "./settings.repository.ts";

export const SettingsService = {
  async getChargePerCubicMeter(): Promise<number> {
    return await SettingsRepository.getChargePerCubicMeter();
  },

  async updateChargePerCubicMeter(amount: number): Promise<number> {
    return await SettingsRepository.updateChargePerCubicMeter(amount);
  },
};
