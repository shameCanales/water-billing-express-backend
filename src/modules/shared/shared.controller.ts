import type { Request, Response } from "express";
import { ProcessorService } from "../processors/processor.service.ts";
import { ConsumerService } from "../consumers/consumer.service.ts";
import { handleControllerError } from "../../core/utils/errorHandler.ts";

export const SharedController = {
  async getMe(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not Authenticated",
        });
      }

      const { _id, type } = req.user;
      let userProfile = null;

      if (type === "admin") {
        userProfile = await ProcessorService.getById(_id);
      } else if (type === "consumer") {
        userProfile = await ConsumerService.getConsumerById(_id);
      }

      if (!userProfile) {
        return res.status(404).json({
          success: false,
          message: "User account not found",
        });
      }

      // for added safety we can destructure document and convert into new plain object pero indi na kay kasamok lang.

      const { password: _, __v, ...safeProfileData } = userProfile as any;

      return res.status(200).json({
        success: true,
        message: "profileData fetched successfully",
        data: safeProfileData,
      });
    } catch (err) {
      return handleControllerError(err, res);
    }
  },
};
