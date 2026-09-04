import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import File from "../models/File.js";
import { createUniqueCode, createUniqueLinkToken } from "../utils/generateCode.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || "100", 10);
const EXPIRY_HOURS = parseInt(process.env.FILE_EXPIRY_HOURS || "24", 10);
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

const router = express.Router();

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided." });
    }

    const code = await createUniqueCode();
    const linkToken = await createUniqueLinkToken();

    const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);

    const fileDoc = await File.create({
      code,
      linkToken,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      storagePath: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      expiresAt,
    });

    return res.status(201).json({
      success: true,
      code: fileDoc.code,
      link: `${BASE_URL}/r/${fileDoc.linkToken}`,
      filename: fileDoc.originalName,
      size: fileDoc.size,
      expiresAt: fileDoc.expiresAt,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ success: false, message: "Upload failed. Please try again." });
  }
});

export default router;
