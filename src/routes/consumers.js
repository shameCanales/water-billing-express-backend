import { requireAuthAndStaffOrManager } from "../middlewares/authmiddleware";
import { Consumer } from "../mongoose/schemas/consumer";
import { Router } from "express";

// name, email, birthDate, mobileNumber, password, address, status
const router = Router();

router.get("/api/consumers", requireAuthAndStaffOrManager, async (req, res) => {
  try {
    const consumers = await Consumer.find();

    return res.status(200).json({
      success: true,
      data: consumers,
    });
  } catch (error) {
    console.error("Error fetching consumers: ", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch consumers",
      error: error.message,
    });
  }
});

export default router;
