import React from "react";
import { useJob } from "../hooks/useJob";
import { downloadCSV } from "../utils/api";
import AnalyticsDashboard from "./AnalyticsDashboard";

export default function JobResult({ jobId, fileName, totalRows }) {
  const { job, error } = useJob(jobId);

  if (error) return <ErrorCard message={error} />;
  if (!job) return <LoadingCard message="Connecting..." />;

  if (job.status === "processing" || job.status === "pending") {
    return <ProcessingCard fileName={fileName} totalRows={totalRows} />;
  }

  if (job.status === "failed") {
    return <ErrorCard message={job.errorMessage || "Processing failed"} />;
  }

  return (
    <div style={styles.wrapper}>
      {/* Success header */}
      <div style={styles.successHeader}>
        <div style={styles.checkCircle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L20 7" stroke="#22d3a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p style={styles.successTitle}>Deduplication Complete</p>
          <p style={styles.successSub}>{job.fileName}</p>
        </div>
        <button style={styles.downloadBtn} onClick={() => downloadCSV(jobId)}>
          <DownloadIcon /> Download CSV
        </button>
      </div>

      {/* Stats row */}
      <div style={styles.statsRow}>
        <StatCard label="Total Rows" value={job.totalRows} color="#7c6aff" />
        <StatCard label="Unique Rows" value={job.uniqueRows} color="#22d3a0" highlight />
        <StatCard label="Duplicates Removed" value={job.duplicatesRemoved} color="#ff5a6e" />
        <StatCard
          label="Processing Time"
          value={`${((job.processingTimeMs || 0) / 1000).toFixed(1)}s`}
          color="#fbbf24"
        />
      </div>

      {/* Analytics */}
      <AnalyticsDashboard job={job} />
    </div>
  );
}

function StatCard({ label, value, color, highlight }) {
  return (
    <div style={{ ...styles.statCard, ...(highlight ? { border: `1px solid ${color}40` } : {}) }}>
      <p style={{ ...styles.statValue, color }}>{value}</p>
      <p style={styles.statLabel}>{label}</p>
    </div>
  );
}

function ProcessingCard({ fileName, totalRows }) {
  return (
    <div style={styles.processingCard}>
      <div style={styles.processingInner}>
        <div style={styles.aiSpinner}>
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" stroke="#2a2a3a" strokeWidth="3" fill="none" />
            <circle
              cx="24" cy="24" r="20"
              stroke="#7c6aff" strokeWidth="3" fill="none"
              strokeDasharray="40 88"
              strokeLinecap="round"
              style={{ animation: "spin 1.4s linear infinite", transformOrigin: "center" }}
            />
          </svg>
          <div style={styles.aiLabel}>AI</div>
        </div>
        <div>
          <p style={styles.processingTitle}>Analyzing with Claude AI</p>
          <p style={styles.processingMeta}>{fileName} · {totalRows} rows</p>
        </div>
      </div>

      <div style={styles.stepsList}>
        {[
          "Parsing CSV structure",
          "Detecting languages across records",
          "Identifying cross-language duplicates",
          "Generating clean dataset",
        ].map((step, i) => (
          <div key={i} style={styles.step}>
            <div style={styles.stepDot} />
            <span style={styles.stepText}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingCard({ message }) {
  return (
    <div style={styles.loadCard}>
      <div style={styles.spinnerRing} />
      <p style={styles.loadText}>{message}</p>
    </div>
  );
}

function ErrorCard({ message }) {
  return (
    <div style={styles.errorCard}>
      <p style={styles.errorTitle}>❌ Error</p>
      <p style={styles.errorMsg}>{message}</p>
    </div>
  );
}

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: "6px" }}>
    <path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const styles = {
  wrapper: { display: "flex", flexDirection: "column", gap: "20px", animation: "fadeUp 0.4s ease" },
  successHeader: {
    display: "flex", alignItems: "center", gap: "16px",
    padding: "20px 24px",
    background: "#13131c",
    border: "1px solid #2a2a3a",
    borderRadius: "14px",
  },
  checkCircle: {
    width: "44px", height: "44px",
    borderRadius: "50%",
    background: "rgba(34, 211, 160, 0.12)",
    border: "1px solid rgba(34, 211, 160, 0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  successTitle: { fontWeight: "700", fontSize: "16px", color: "#e8e8f0" },
  successSub: { fontSize: "12px", color: "#5a5a7a", marginTop: "2px", fontFamily: "'JetBrains Mono', monospace" },
  downloadBtn: {
    marginLeft: "auto",
    display: "flex", alignItems: "center",
    background: "linear-gradient(135deg, #7c6aff, #a855f7)",
    color: "#fff", border: "none", borderRadius: "10px",
    padding: "10px 18px", fontWeight: "700", fontSize: "14px",
    cursor: "pointer", fontFamily: "'Syne', sans-serif",
    transition: "opacity 0.2s", whiteSpace: "nowrap",
  },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" },
  statCard: {
    padding: "20px 16px",
    background: "#13131c",
    border: "1px solid #2a2a3a",
    borderRadius: "12px",
    textAlign: "center",
  },
  statValue: { fontSize: "28px", fontWeight: "800", letterSpacing: "-1px" },
  statLabel: { fontSize: "11px", color: "#5a5a7a", marginTop: "4px", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" },
  processingCard: {
    padding: "32px",
    background: "#13131c",
    border: "1px solid #2a2a3a",
    borderRadius: "14px",
    display: "flex", flexDirection: "column", gap: "28px",
    animation: "fadeUp 0.4s ease",
  },
  processingInner: { display: "flex", alignItems: "center", gap: "20px" },
  aiSpinner: { position: "relative", flexShrink: 0 },
  aiLabel: {
    position: "absolute", inset: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "11px", fontWeight: "700", color: "#7c6aff",
    fontFamily: "'JetBrains Mono', monospace",
  },
  processingTitle: { fontSize: "18px", fontWeight: "700", color: "#e8e8f0" },
  processingMeta: { fontSize: "12px", color: "#5a5a7a", marginTop: "4px", fontFamily: "'JetBrains Mono', monospace" },
  stepsList: { display: "flex", flexDirection: "column", gap: "10px" },
  step: { display: "flex", alignItems: "center", gap: "10px" },
  stepDot: {
    width: "6px", height: "6px", borderRadius: "50%",
    background: "#7c6aff", flexShrink: 0,
    animation: "pulse-ring 2s infinite",
  },
  stepText: { fontSize: "13px", color: "#9090b0", fontFamily: "'JetBrains Mono', monospace" },
  loadCard: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "20px 24px", background: "#13131c",
    border: "1px solid #2a2a3a", borderRadius: "14px",
  },
  spinnerRing: {
    width: "24px", height: "24px",
    border: "2px solid #2a2a3a",
    borderTopColor: "#7c6aff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadText: { color: "#9090b0", fontSize: "14px" },
  errorCard: {
    padding: "20px 24px",
    background: "rgba(255, 90, 110, 0.08)",
    border: "1px solid rgba(255, 90, 110, 0.25)",
    borderRadius: "14px",
  },
  errorTitle: { fontSize: "16px", fontWeight: "700", color: "#ff5a6e", marginBottom: "6px" },
  errorMsg: { fontSize: "13px", color: "#9090b0", fontFamily: "'JetBrains Mono', monospace" },
};
