const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, unique: true },
    fileName: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    totalRows: { type: Number, default: 0 },
    uniqueRows: { type: Number, default: 0 },
    duplicatesRemoved: { type: Number, default: 0 },
    languagesDetected: { type: [String], default: [] },
    languageBreakdown: { type: Map, of: Number, default: {} },
    processingTimeMs: { type: Number, default: 0 },
    inputHeaders: { type: [String], default: [] },
    errorMessage: { type: String },
    outputCsv: { type: String }, // stored as string for simplicity
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
