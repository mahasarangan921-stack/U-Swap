import cron from "node-cron";
import fs from "fs";
import File from "../models/File.js";

/**
 * Runs every hour: finds expired, non-deleted files,
 * removes them from disk, and marks them deleted in MongoDB.
 */
export function startCleanupJob() {
  cron.schedule("0 * * * *", async () => {
    try {
      const expiredFiles = await File.find({
        expiresAt: { $lt: new Date() },
        deleted: false,
      });

      for (const fileDoc of expiredFiles) {
        if (fs.existsSync(fileDoc.storagePath)) {
          fs.unlink(fileDoc.storagePath, (err) => {
            if (err) console.error(`Cleanup: failed to delete ${fileDoc.storagePath}`, err);
          });
        }
        fileDoc.deleted = true;
        await fileDoc.save();
      }

      if (expiredFiles.length > 0) {
        console.log(`Cleanup job: purged ${expiredFiles.length} expired file(s).`);
      }
    } catch (err) {
      console.error("Cleanup job error:", err);
    }
  });

  console.log("Cleanup job scheduled (hourly).");
}
