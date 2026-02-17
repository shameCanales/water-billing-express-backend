import { SettingsRepository } from "./settings.repository.ts";
import type { Settingkey, ISettingsLean } from "./settings.model.ts";
import type { ISettingsHistoryLean } from "./settingsHistory.model.ts";

export interface SettingHistoryPoint {
  month: string;
  value: number | null;
}

function buildMonthlyHistory(
  changes: ISettingsHistoryLean[],
  months: number,
): SettingHistoryPoint[] {
  const now = new Date();
  const result: SettingHistoryPoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const month = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1),
    );

    const activeChange = changes
      .filter((r) => new Date(r.effectiveFrom) <= month)
      .at(-1);

    result.push({
      month: month.toISOString().slice(0, 7),
      value: activeChange?.value ?? null,
    });
  }

  return result;
}

export const SettingsService = {
  async getSettings(): Promise<ISettingsLean> {
    return SettingsRepository.getSettings();
  },

  async updateSetting(key: Settingkey, value: number): Promise<ISettingsLean> {
    return SettingsRepository.updateSetting(key, value);
  },

  async getMonthlyHistory(
    key: Settingkey,
    months = 12,
  ): Promise<SettingHistoryPoint[]> {
    const changes = await SettingsRepository.getHistory(key, months);

    return buildMonthlyHistory(changes, months);
  },
};
