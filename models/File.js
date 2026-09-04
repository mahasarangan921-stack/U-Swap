import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    linkToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    storedName: {
      type: String,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
    },
    size: {
      type: Number, // bytes
      required: true,
    },
    downloaded: {
      type: Boolean,
      default: false,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // adds createdAt (uploadedAt) & updatedAt
);

export default mongoose.model("File", fileSchema);
