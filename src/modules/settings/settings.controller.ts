import { matchedData, validationResult } from "express-validator";
import { SettingsService } from "./settings.service.ts";
import type { Request, Response } from "express";

export const SettingsController = {
  async getChargePerCubicMeter(req: Request, res: Response): Promise<Response> {
    console.log("get Charge per mter")

    try {
      const chargePerCubicMeter =
        await SettingsService.getChargePerCubicMeter();

      return res.status(200).json({
        success: true,
        message: "Charge per cubic meter retrieved successfully",
        data: { chargePerCubicMeter },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown Error";

      return res.status(500).json({
        success: false,
        message: errorMessage,
      });
    }
  },

  async updateChargePerCubicMeter(
    req: Request,
    res: Response,
  ): Promise<Response> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const { chargePerCubicMeter } = matchedData(req);

      const updatedCharge =
        await SettingsService.updateChargePerCubicMeter(chargePerCubicMeter);

      return res.status(200).json({
        success: true,
        message: "Charge per cubic meter updated successfully",
        data: {
          chargePerCubicMeter: updatedCharge,
        },
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
