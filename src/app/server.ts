import "../core/emv.ts"; // import first to
import mongoose from "mongoose";
import { createApp } from "./createApp.ts";

mongoose
  // .connect("mongodb://localhost/water_billing_system")
  .connect(
    // process.env.MONGODB_CONNECTION_URL || "mongodb://localhost/water_billing_system",
    process.env.MONGODB_CONNECTION_URL || "mongodb://localhost/water_billing_system",
  )
  .then(() => {
    if (!process.env.MONGODB_CONNECTION_URL){
      console.warn(
        "Warning: MONGODB_CONNECTION_URL is not set. Defaulting to mongodb://localhost/water_billing_system",
      );
    } else {
      console.log("Connected using MongoDB connection URL from env.");
    }
  })
  .catch((err) => {
    console.log("failed to connect to database", err);
  });

const app = createApp();
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Express Server Running on ${port}`);
});

// save Uninitialized:::::::::::::::::::
// false (recommended):
// Don’t store empty sessions — only save when something is added (like req.session.user = {...}).
// true:
// Save all sessions, even if they’re brand new and unused (empty).
// Why false is better:
// Saves database space and avoids creating useless session documents in MongoDB.
// Better performance and privacy compliance (e.g., GDPR).

// Resave:::::::::::::::::::::
// false (recommended):
// Only save the session if something changed in req.session.
// true:
// Re-save the session on every request, even if nothing changed.
// Why false is better:
// Prevents unnecessary writes to MongoDB on every HTTP request.
// Reduces I/O and improves performance.
