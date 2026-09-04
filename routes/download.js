import express from "express";
import fs from "fs";
import File from "../models/File.js";

const router = express.Router();

/**
 * Shared logic to find a file by code or linkToken, validate it,
 * and return metadata without exposing the storage path.
 */
async function findValidFile({ code, linkToken }) {
  const query = code ? { code: code.toUpperCase() } : { linkToken };
  const fileDoc = await File.findOne(query);

  if (!fileDoc || fileDoc.deleted) {
    return { error: "not_found" };
  }

  if (fileDoc.expiresAt < new Date()) {
    // Lazy cleanup: mark deleted + remove from disk if still present
    if (fs.existsSync(fileDoc.storagePath)) {
      fs.unlink(fileDoc.storagePath, () => {});
    }
    fileDoc.deleted = true;
    await fileDoc.save();
    return { error: "expired" };
  }

  if (!fs.existsSync(fileDoc.storagePath)) {
    return { error: "not_found" };
  }

  return { fileDoc };
}

// Verify a code exists before attempting download (used by the "Receive File" flow)
router.get("/verify/:code", async (req, res) => {
  const { code } = req.params;
  const { fileDoc, error } = await findValidFile({ code });

  if (error === "expired") {
    return res.status(410).json({ success: false, message: "This file has expired." });
  }
  if (error === "not_found") {
    return res.status(404).json({ success: false, message: "Invalid or unknown code." });
  }

  return res.json({
    success: true,
    filename: fileDoc.originalName,
    size: fileDoc.size,
    expiresAt: fileDoc.expiresAt,
  });
});

// Verify a link token exists before attempting download (used by direct link clicks)
router.get("/verify/link/:token", async (req, res) => {
  const { token } = req.params;
  const { fileDoc, error } = await findValidFile({ linkToken: token });

  if (error === "expired") {
    return res.status(410).json({ success: false, message: "This link has expired." });
  }
  if (error === "not_found") {
    return res.status(404).json({ success: false, message: "This link is invalid or has expired." });
  }

  return res.json({
    success: true,
    filename: fileDoc.originalName,
    size: fileDoc.size,
    expiresAt: fileDoc.expiresAt,
  });
});

// Download by code
router.get("/download/code/:code", async (req, res) => {
  await handleDownload(req, res, { code: req.params.code });
});

// Download by link token (direct link click)
router.get("/download/link/:token", async (req, res) => {
  await handleDownload(req, res, { linkToken: req.params.token });
});

async function handleDownload(req, res, identifier) {
  try {
    const { fileDoc, error } = await findValidFile(identifier);

    if (error === "expired") {
      return res.status(410).json({ success: false, message: "This file has expired." });
    }
    if (error === "not_found") {
      return res.status(404).json({ success: false, message: "Invalid or unknown code." });
    }

    res.download(fileDoc.storagePath, fileDoc.originalName, async (err) => {
      if (err) {
        console.error("Download stream error:", err);
        return;
      }

      // Mark downloaded, then delete file from disk immediately (Version 1 policy)
      fileDoc.downloaded = true;
      fileDoc.downloadCount += 1;
      fileDoc.deleted = true;
      await fileDoc.save();

      fs.unlink(fileDoc.storagePath, (unlinkErr) => {
        if (unlinkErr) console.error("Cleanup error:", unlinkErr);
      });
    });
  } catch (err) {
    console.error("Download error:", err);
    return res.status(500).json({ success: false, message: "Download failed. Please try again." });
  }
}

export default router;
