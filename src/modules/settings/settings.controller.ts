import { SettingsService } from "./settings.service.ts";
import type { Request, Response } from "express";
import type { Settingkey } from "./settings.model.ts";
import { validationResult } from "express-validator";
import { matchedData } from "express-validator";

export const SettingsController = {
  async getSettings(req: Request, res: Response): Promise<Response> {
    try {
      const settings = await SettingsService.getSettings();
      return res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown Error";

      return res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  },

  async updateSetting(req: Request, res: Response): Promise<Response> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const { key, value } = matchedData(req);
      const updated = await SettingsService.updateSetting(key, value);

      return res.status(200).json({
        success: true,
        message: `${key} updated successfully`,
        data: updated,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown Error";

      return res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  },

  async getHistory(req: Request, res: Response): Promise<Response> {
    try {
      const { key } = req.params as { key: Settingkey };
      const months = Number(req.query.months) || 12;

      const history = await SettingsService.getMonthlyHistory(key, months);

      return res.status(200).json({
        success: true,
        data: history,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown Error";

      return res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  },
};
