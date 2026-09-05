import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import uploadRoutes from "./routes/upload.js";
import downloadRoutes from "./routes/download.js";
import { startCleanupJob } from "./utils/cleanupJob.js";

dotenv.config();

// ES module __dirname shim
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/arma-transfer";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// CORS — only needed for cross-origin dev; in production frontend + backend share the same origin
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// ── API routes ──────────────────────────────────────────────────────────────
app.use("/api", uploadRoutes);
app.use("/api", downloadRoutes);

// Health check (was the old root "/" route)
app.get("/api/health", (req, res) => {
  res.json({ status: "ARMA Transfer API is running." });
});

// Multer / general error handler
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ success: false, message: "File is too large." });
  }
  console.error(err);
  return res.status(500).json({ success: false, message: "Something went wrong." });
});

// ── Serve React frontend from dist/ ─────────────────────────────────────────
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// SPA fallback: non-API routes return index.html so React Router handles them.
// Written as middleware (not app.get("*")) to stay compatible with Express 5.
app.use((req, res, next) => {
  // Don't intercept API routes
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(distPath, "index.html"));
});

// ── Database + start ─────────────────────────────────────────────────────────
console.log("MONGO_URI =", process.env.MONGO_URI);
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected.");
    app.listen(PORT, () => {
      console.log(`ARMA Transfer server running on port ${PORT}`);
      startCleanupJob();
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
