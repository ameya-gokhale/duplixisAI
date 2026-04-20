import React, { useEffect, useState } from "react";
import { getRecentJobs, downloadCSV } from "../utils/api.jsx";

export default function RecentJobs({ onSelectJob }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentJobs()
      .then(({ data }) => setJobs(data))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!jobs.length) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={styles.title}>◈ Recent Jobs</span>
        <span style={styles.count}>{jobs.length} jobs</span>
      </div>
      <div style={styles.list}>
        {jobs.map((job) => (
          <JobRow key={job.jobId} job={job} onDownload={() => downloadCSV(job.jobId)} />
        ))}
      </div>
    </div>
  );
}

function JobRow({ job, onDownload }) {
  const statusColor = {
    completed: "#22d3a0",
    failed: "#ff5a6e",
    processing: "#7c6aff",
    pending: "#fbbf24",
  }[job.status] || "#5a5a7a";

  const dedupeRate =
    job.totalRows > 0
      ? ((job.duplicatesRemoved / job.totalRows) * 100).toFixed(0)
      : 0;

  return (
    <div style={styles.row}>
      <div style={styles.rowLeft}>
        <div style={{ ...styles.statusDot, background: statusColor }} />
        <div>
          <p style={styles.fileName}>{job.fileName}</p>
          <p style={styles.meta}>
            {job.totalRows} rows
            {job.duplicatesRemoved != null ? ` · ${job.duplicatesRemoved} dupes removed` : ""}
            {job.languagesDetected?.length ? ` · ${job.languagesDetected.length} languages` : ""}
          </p>
        </div>
      </div>

      <div style={styles.rowRight}>
        {job.status === "completed" && (
          <>
            <div style={styles.rateBadge}>
              <div
                style={{
                  ...styles.rateFill,
                  width: `${dedupeRate}%`,
                }}
              />
              <span style={styles.rateNum}>{dedupeRate}%</span>
            </div>
            <button style={styles.dlBtn} onClick={onDownload} title="Download cleaned CSV">
              <DownloadIcon />
            </button>
          </>
        )}
        {job.status === "processing" && (
          <span style={styles.processingPill}>Processing…</span>
        )}
        {job.status === "failed" && (
          <span style={styles.failedPill}>Failed</span>
        )}
        <span style={styles.timestamp}>
          {new Date(job.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 2v7M4.5 6.5L7 9l2.5-2.5M2.5 11h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const styles = {
  wrapper: {
    marginTop: "8px",
    border: "1px solid #1a1a24",
    borderRadius: "12px",
    overflow: "hidden",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px",
    background: "#0d0d14",
    borderBottom: "1px solid #1a1a24",
  },
  title: {
    fontSize: "11px", fontWeight: "700",
    color: "#3d3d55",
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: "uppercase", letterSpacing: "0.1em",
  },
  count: {
    fontSize: "10px", color: "#3d3d55",
    fontFamily: "'JetBrains Mono', monospace",
  },
  list: { display: "flex", flexDirection: "column" },
  row: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px",
    borderBottom: "1px solid #111118",
    transition: "background 0.15s",
    cursor: "default",
  },
  rowLeft: { display: "flex", alignItems: "center", gap: "10px", minWidth: 0 },
  statusDot: {
    width: "7px", height: "7px",
    borderRadius: "50%", flexShrink: 0,
  },
  fileName: {
    fontSize: "13px", fontWeight: "600", color: "#9090b0",
    fontFamily: "'JetBrains Mono', monospace",
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    maxWidth: "240px",
  },
  meta: { fontSize: "11px", color: "#3d3d55", marginTop: "2px", fontFamily: "'JetBrains Mono', monospace" },
  rowRight: { display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 },
  rateBadge: {
    width: "60px", height: "16px",
    background: "#1a1a24",
    borderRadius: "4px",
    position: "relative", overflow: "hidden",
    display: "flex", alignItems: "center",
  },
  rateFill: {
    position: "absolute", left: 0, top: 0, bottom: 0,
    background: "rgba(124,106,255,0.25)",
    transition: "width 0.5s ease",
  },
  rateNum: {
    position: "relative", zIndex: 1,
    fontSize: "10px", color: "#7c6aff",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: "600",
    paddingLeft: "5px",
  },
  dlBtn: {
    width: "26px", height: "26px",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#1a1a24",
    border: "1px solid #2a2a3a",
    borderRadius: "6px",
    color: "#7c6aff",
    cursor: "pointer",
  },
  processingPill: {
    padding: "2px 8px",
    background: "rgba(124,106,255,0.1)",
    border: "1px solid rgba(124,106,255,0.2)",
    borderRadius: "100px",
    fontSize: "10px", color: "#7c6aff",
    fontFamily: "'JetBrains Mono', monospace",
  },
  failedPill: {
    padding: "2px 8px",
    background: "rgba(255,90,110,0.1)",
    border: "1px solid rgba(255,90,110,0.2)",
    borderRadius: "100px",
    fontSize: "10px", color: "#ff5a6e",
    fontFamily: "'JetBrains Mono', monospace",
  },
  timestamp: {
    fontSize: "10px", color: "#3d3d55",
    fontFamily: "'JetBrains Mono', monospace",
  },
};
