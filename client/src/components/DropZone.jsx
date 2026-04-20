import React, { useState, useRef } from "react";
import { uploadCSV } from "../utils/api.jsx";

export default function DropZone({ onJobStarted }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a .csv file.");
      return;
    }
    setError("");
    setUploading(true);
    setProgress(0);
    try {
      const { data } = await uploadCSV(file, (e) => {
        setProgress(Math.round((e.loaded / e.total) * 100));
      });
      onJobStarted(data);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div style={styles.wrapper}>
      <div
        style={{
          ...styles.zone,
          ...(dragging ? styles.zoneDragging : {}),
          ...(uploading ? styles.zoneUploading : {}),
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {uploading ? (
          <div style={styles.uploadingState}>
            <div style={styles.spinnerRing} />
            <p style={styles.uploadLabel}>Uploading... {progress}%</p>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div style={styles.idleState}>
            <div style={styles.iconBox}>
              <CsvIcon />
            </div>
            <p style={styles.mainLabel}>Drop your CSV file here</p>
            <p style={styles.subLabel}>or click to browse — up to 10 MB</p>
            <div style={styles.badge}>
              <span style={styles.badgeDot} />
              multilingual deduplication
            </div>
          </div>
        )}
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.hints}>
        {["English", "French", "Spanish", "Arabic", "Hindi", "Chinese", "Japanese", "more..."].map((lang) => (
          <span key={lang} style={styles.langTag}>{lang}</span>
        ))}
      </div>
    </div>
  );
}

const CsvIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect x="6" y="2" width="22" height="28" rx="3" stroke="#7c6aff" strokeWidth="1.5" fill="none" />
    <path d="M22 2v8h8" stroke="#7c6aff" strokeWidth="1.5" fill="none" />
    <path d="M11 16h12M11 20h8" stroke="#7c6aff" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="30" cy="32" r="8" fill="#22d3a0" fillOpacity="0.15" stroke="#22d3a0" strokeWidth="1.5" />
    <path d="M27 32l2 2 4-4" stroke="#22d3a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const styles = {
  wrapper: { display: "flex", flexDirection: "column", gap: "16px" },
  zone: {
    border: "1.5px dashed #2a2a3a",
    borderRadius: "16px",
    padding: "48px 32px",
    textAlign: "center",
    cursor: "pointer",
    background: "#13131c",
    transition: "all 0.2s ease",
    position: "relative",
    overflow: "hidden",
  },
  zoneDragging: {
    border: "1.5px dashed #7c6aff",
    background: "rgba(124, 106, 255, 0.07)",
    transform: "scale(1.01)",
  },
  zoneUploading: { cursor: "default", pointerEvents: "none" },
  idleState: { display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" },
  uploadingState: { display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" },
  iconBox: {
    width: "72px", height: "72px",
    borderRadius: "16px",
    background: "rgba(124, 106, 255, 0.1)",
    border: "1px solid rgba(124, 106, 255, 0.25)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "4px",
  },
  mainLabel: { fontSize: "18px", fontWeight: "700", color: "#e8e8f0", letterSpacing: "-0.3px" },
  subLabel: { fontSize: "13px", color: "#5a5a7a", fontFamily: "'JetBrains Mono', monospace" },
  badge: {
    marginTop: "8px",
    display: "inline-flex", alignItems: "center", gap: "6px",
    background: "rgba(34, 211, 160, 0.1)",
    border: "1px solid rgba(34, 211, 160, 0.25)",
    borderRadius: "100px",
    padding: "4px 12px",
    fontSize: "11px", fontWeight: "600",
    color: "#22d3a0",
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: "uppercase", letterSpacing: "0.05em",
  },
  badgeDot: {
    width: "6px", height: "6px",
    borderRadius: "50%",
    background: "#22d3a0",
    animation: "pulse-ring 2s infinite",
    display: "inline-block",
  },
  uploadLabel: { fontSize: "16px", fontWeight: "600", color: "#7c6aff" },
  progressBar: {
    width: "200px", height: "4px",
    background: "#2a2a3a", borderRadius: "2px", overflow: "hidden",
  },
  progressFill: {
    height: "100%", background: "linear-gradient(90deg, #7c6aff, #22d3a0)",
    borderRadius: "2px", transition: "width 0.2s ease",
  },
  spinnerRing: {
    width: "40px", height: "40px",
    border: "3px solid #2a2a3a",
    borderTopColor: "#7c6aff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  hints: { display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" },
  langTag: {
    padding: "3px 10px",
    borderRadius: "100px",
    background: "#1a1a24",
    border: "1px solid #2a2a3a",
    fontSize: "11px", color: "#5a5a7a",
    fontFamily: "'JetBrains Mono', monospace",
  },
  error: { color: "#ff5a6e", fontSize: "13px", textAlign: "center" },
};
