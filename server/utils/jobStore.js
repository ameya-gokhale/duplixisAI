/**
 * jobStore.js — shared in-memory job store with optional MongoDB persistence.
 * Both upload.js and jobs.js import from here — no circular dependency.
 */

const store = new Map();

function getMongoModel() {
  try {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) return null;
    return require("../models/Job");
  } catch {
    return null;
  }
}

async function saveJob(data) {
  // Always write to in-memory store first
  store.set(data.jobId, { ...data, updatedAt: new Date() });

  // Persist to MongoDB if available
  const Job = getMongoModel();
  if (Job) {
    try {
      await Job.findOneAndUpdate({ jobId: data.jobId }, data, { upsert: true, new: true });
    } catch (e) {
      // Silently fall back to in-memory
    }
  }
}

async function getJob(jobId) {
  const Job = getMongoModel();
  if (Job) {
    try {
      const job = await Job.findOne({ jobId });
      if (job) return job.toObject();
    } catch (e) {}
  }
  return store.get(jobId) || null;
}

async function listJobs(limit = 20) {
  const Job = getMongoModel();
  if (Job) {
    try {
      return await Job.find({}, { outputCsv: 0 }).sort({ createdAt: -1 }).limit(limit).lean();
    } catch (e) {}
  }
  // In-memory fallback: return most recent N jobs without outputCsv
  return [...store.values()]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, limit)
    .map(({ outputCsv, ...rest }) => rest);
}

module.exports = { saveJob, getJob, listJobs };
