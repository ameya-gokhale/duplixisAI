const express = require("express");
const router = express.Router();
const { getJob, listJobs } = require("../utils/jobStore");

// GET /api/jobs — list recent jobs
router.get("/", async (_req, res) => {
  const jobs = await listJobs(20);
  res.json(jobs);
});

// GET /api/jobs/:jobId — poll status
router.get("/:jobId", async (req, res) => {
  const job = await getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  const { outputCsv, ...meta } = job;
  res.json({ ...meta, hasOutput: !!outputCsv });
});

// GET /api/jobs/:jobId/download — download cleaned CSV
router.get("/:jobId/download", async (req, res) => {
  const job = await getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (job.status !== "completed" || !job.outputCsv) {
    return res.status(400).json({ error: "Output not ready yet" });
  }
  const filename = `deduped_${job.fileName || req.params.jobId + ".csv"}`;
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(job.outputCsv);
});

module.exports = router;
