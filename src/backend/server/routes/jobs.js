const express = require("express");
const router = express.Router();

// Shared job store reference
const jobStore = new Map();

let Job = null;
try {
  Job = require("../models/Job");
} catch (e) {}

async function getJob(jobId) {
  if (Job) {
    try {
      const job = await Job.findOne({ jobId });
      if (job) return job.toObject();
    } catch (e) {}
  }
  // fallback - re-require upload to access its store
  const uploadRouter = require("./upload");
  return uploadRouter.getJob ? await uploadRouter.getJob(jobId) : null;
}

// GET /api/jobs/:jobId - Poll job status
router.get("/:jobId", async (req, res) => {
  const job = await getJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const { outputCsv, ...jobMeta } = job;
  res.json({ ...jobMeta, hasOutput: !!outputCsv });
});

// GET /api/jobs/:jobId/download - Download the cleaned CSV
router.get("/:jobId/download", async (req, res) => {
  const job = await getJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  if (job.status !== "completed" || !job.outputCsv) {
    return res.status(400).json({ error: "Output not ready yet" });
  }

  const filename = job.fileName
    ? `deduped_${job.fileName}`
    : `deduped_output_${req.params.jobId}.csv`;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(job.outputCsv);
});

// GET /api/jobs - List recent jobs (analytics overview)
router.get("/", async (req, res) => {
  if (Job) {
    try {
      const jobs = await Job.find({}, { outputCsv: 0 })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
      return res.json(jobs);
    } catch (e) {}
  }
  res.json([]);
});

module.exports = router;
