const express = require("express");
const router = express.Router();
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { parseCSV } = require("../utils/csvUtils");
const { runModel } = require("../utils/modelRunner");
const { saveJob } = require("../utils/jobStore");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are accepted"), false);
    }
  },
});

// POST /api/upload
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const jobId = uuidv4();
  const startTime = Date.now();

  let headers = [];
  try {
    const records = parseCSV(req.file.buffer);
    if (!records.length) {
      return res.status(400).json({ error: "CSV file is empty or has no data rows" });
    }
    headers = Object.keys(records[0]);
  } catch (err) {
    return res.status(400).json({ error: `Could not parse CSV: ${err.message}` });
  }

  await saveJob({
    jobId,
    fileName: req.file.originalname,
    status: "processing",
    totalRows: 0,
    inputHeaders: headers,
    createdAt: new Date(),
  });

  res.json({ jobId, headers, status: "processing" });

  try {
    const result = await runModel(req.file.buffer);
    await saveJob({
      jobId,
      fileName: req.file.originalname,
      status: "completed",
      totalRows: result.totalRows,
      uniqueRows: result.uniqueRows,
      duplicatesRemoved: result.duplicatesRemoved,
      languagesDetected: Object.keys(result.languageBreakdown || {}),
      languageBreakdown: result.languageBreakdown || {},
      processingTimeMs: Date.now() - startTime,
      inputHeaders: result.columns || headers,
      outputCsv: result.outputCsv,
      createdAt: new Date(),
    });
    console.log(`✅ Job ${jobId} done — ${result.duplicatesRemoved} rows removed`);
  } catch (err) {
    console.error(`❌ Job ${jobId} failed:`, err.message);
    await saveJob({
      jobId,
      fileName: req.file.originalname,
      status: "failed",
      errorMessage: err.message,
      inputHeaders: headers,
      createdAt: new Date(),
    });
  }
});

module.exports = router;
