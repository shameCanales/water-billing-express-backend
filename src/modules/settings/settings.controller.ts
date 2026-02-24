import { SettingsService } from "./settings.service.ts";
import type { Request, Response } from "express";
import type { Settingkey } from "./settings.model.ts";
import { matchedData } from "express-validator";
import { handleControllerError } from "../../core/utils/errorHandler.ts";

export const SettingsController = {
  async getSettings(_req: Request, res: Response): Promise<Response> {
    try {
      const settings = await SettingsService.getSettings();
      return res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (err) {
      return handleControllerError(err, res);
    }
  },

  async updateSetting(req: Request, res: Response): Promise<Response> {
    try {
      const { key, value } = matchedData(req) as {
        key: Settingkey;
        value: number;
      };
      const updated = await SettingsService.updateSetting(key, value);

      return res.status(200).json({
        success: true,
        message: `${key} updated successfully`,
        data: updated,
      });
    } catch (err) {
      return handleControllerError(err, res);
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
      return handleControllerError(err, res);
    }
  },
};
