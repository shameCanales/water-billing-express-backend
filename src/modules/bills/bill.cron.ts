import cron from "node-cron";
import { BillService } from "./bill.service.js";

export const initBillCrons = async () => {
  //runs when server starts
  console.log("[CRON] Running startup surcharge check...");
  try {
    const startupCount = await BillService.processOverdueSurcharges();
    console.log(
      `[CRON] Startup Sweep Complete: Processed ${startupCount} bills.`,
    );
  } catch (error) {
    console.error("[CRON] Startup Sweep Error:", error);
  }

  // runs based on scheduled time
  cron.schedule("0 9 * * *", async () => {
    console.log("[CRON] 06:00 AM: Starting Surcharge & Overdue Sweep...");

    try {
      const processedCount = await BillService.processOverdueSurcharges();
      console.log(
        `[CRON] Success: Applied surcharges to ${processedCount} bills.`,
      );
    } catch (error) {
      console.error("[CRON] Critical Error during surcharge process:", error);
    }
  });
};
