const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { parseCSV, stringifyCSV, getHeaders } = require("../utils/csvUtils");
const { deduplicateRecords } = require("../utils/aiUtils");

// In-memory job store (fallback when MongoDB is unavailable)
const jobStore = new Map();

// Try to load Mongoose model
let Job = null;
try {
  Job = require("../models/Job");
} catch (e) {}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are accepted"), false);
    }
  },
});

async function saveJob(data) {
  jobStore.set(data.jobId, { ...data, updatedAt: new Date() });
  if (Job) {
    try {
      await Job.findOneAndUpdate({ jobId: data.jobId }, data, {
        upsert: true,
        new: true,
      });
    } catch (e) {
      // fallback to in-memory
    }
  }
}

async function getJob(jobId) {
  if (Job) {
    try {
      const job = await Job.findOne({ jobId });
      if (job) return job.toObject();
    } catch (e) {}
  }
  return jobStore.get(jobId) || null;
}

// POST /api/upload - Upload CSV and start processing
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const jobId = uuidv4();
  const startTime = Date.now();

  try {
    const records = parseCSV(req.file.buffer);
    if (records.length === 0) {
      return res.status(400).json({ error: "CSV file is empty or has no data rows" });
    }

    const headers = Object.keys(records[0]);

    // Create initial job
    await saveJob({
      jobId,
      fileName: req.file.originalname,
      status: "processing",
      totalRows: records.length,
      inputHeaders: headers,
    });

    // Respond immediately with jobId
    res.json({ jobId, totalRows: records.length, headers, status: "processing" });

    // Process asynchronously
    try {
      const result = await deduplicateRecords(records);
      const outputCsv = stringifyCSV(result.cleanRecords, headers);
      const processingTimeMs = Date.now() - startTime;

      await saveJob({
        jobId,
        fileName: req.file.originalname,
        status: "completed",
        totalRows: records.length,
        uniqueRows: result.cleanRecords.length,
        duplicatesRemoved: result.duplicatesRemoved,
        languagesDetected: result.languagesDetected,
        languageBreakdown: result.languageBreakdown,
        processingTimeMs,
        inputHeaders: headers,
        outputCsv,
      });

      console.log(`✅ Job ${jobId} completed: ${result.duplicatesRemoved} duplicates removed`);
    } catch (err) {
      console.error(`❌ Job ${jobId} failed:`, err.message);
      await saveJob({
        jobId,
        fileName: req.file.originalname,
        status: "failed",
        errorMessage: err.message,
        inputHeaders: headers,
      });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Export getJob for use in jobs route
router.getJob = getJob;

module.exports = router;
