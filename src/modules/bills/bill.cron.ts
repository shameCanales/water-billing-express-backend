import cron from "node-cron";
import { BillService } from "./bill.service.ts";

export const initBillCrons = () => {
  // Scheduled for 6:00 AM daily in Philippine Time (ensure server timezone is correct)
  cron.schedule("0 6 * * *", async () => {
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
