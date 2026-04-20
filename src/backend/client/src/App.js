import React, { useState } from "react";
import DropZone from "./components/DropZone";
import JobResult from "./components/JobResult";
import RecentJobs from "./components/RecentJobs";

export default function App() {
  const [activeJob, setActiveJob] = useState(null);

  const handleJobStarted = (data) => {
    setActiveJob(data);
  };

  const handleReset = () => setActiveJob(null);

  return (
    <div style={styles.page}>
      {/* Background grid */}
      <div style={styles.bgGrid} aria-hidden="true" />
      <div style={styles.bgGlow} aria-hidden="true" />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <LogoMark />
          <span style={styles.logoText}>LinguaDedup</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.poweredBy}>Powered by</span>
          <span style={styles.claudeBadge}>Claude AI</span>
        </div>
      </header>

      {/* Main */}
      <main style={styles.main}>
        {!activeJob ? (
          <div style={styles.landing}>
            <div style={styles.heroSection}>
              <div style={styles.eyebrow}>
                <span style={styles.eyebrowDot} />
                Multilingual Deduplication Engine
              </div>
              <h1 style={styles.headline}>
                Remove duplicates
                <br />
                <span style={styles.headlineAccent}>across any language</span>
              </h1>
              <p style={styles.subheadline}>
                Upload a CSV with records in mixed languages. Claude AI identifies semantically
                identical entries — even across translations — and returns a clean, deduplicated dataset.
              </p>
            </div>
            <div style={styles.uploadSection}>
              <DropZone onJobStarted={handleJobStarted} />
              <RecentJobs />
            </div>
            <FeatureBar />
          </div>
        ) : (
          <div style={styles.resultSection}>
            <div style={styles.resultHeader}>
              <button style={styles.backBtn} onClick={handleReset}>
                ← New Upload
              </button>
            </div>
            <JobResult
              jobId={activeJob.jobId}
              fileName={activeJob.fileName || "file.csv"}
              totalRows={activeJob.totalRows}
            />
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <span style={styles.footerText}>
          Built with Express · MongoDB · React · Claude API
        </span>
      </footer>
    </div>
  );
}

function FeatureBar() {
  const features = [
    { icon: "🌍", label: "50+ Languages" },
    { icon: "⚡", label: "Real-time Processing" },
    { icon: "🧠", label: "Semantic Matching" },
    { icon: "📊", label: "Full Analytics" },
    { icon: "⬇️", label: "CSV Export" },
  ];
  return (
    <div style={styles.featureBar}>
      {features.map((f, i) => (
        <div key={i} style={styles.feature}>
          <span>{f.icon}</span>
          <span style={styles.featureLabel}>{f.label}</span>
        </div>
      ))}
    </div>
  );
}

const LogoMark = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
    <path d="M8 16c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M8 16c0 4.4 3.6 8 8 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeDasharray="2 3" />
    <circle cx="16" cy="16" r="2.5" fill="white" />
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
        <stop stopColor="#7c6aff" />
        <stop offset="1" stopColor="#a855f7" />
      </linearGradient>
    </defs>
  </svg>
);

const styles = {
  page: {
    minHeight: "100vh", display: "flex", flexDirection: "column",
    position: "relative",
  },
  bgGrid: {
    position: "fixed", inset: 0, zIndex: 0,
    backgroundImage: `
      linear-gradient(rgba(42,42,58,0.4) 1px, transparent 1px),
      linear-gradient(90deg, rgba(42,42,58,0.4) 1px, transparent 1px)
    `,
    backgroundSize: "48px 48px",
    pointerEvents: "none",
  },
  bgGlow: {
    position: "fixed",
    top: "-20%", left: "50%",
    transform: "translateX(-50%)",
    width: "800px", height: "600px",
    background: "radial-gradient(ellipse at center, rgba(124,106,255,0.08) 0%, transparent 70%)",
    pointerEvents: "none", zIndex: 0,
  },
  header: {
    position: "relative", zIndex: 10,
    padding: "20px 40px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    borderBottom: "1px solid #1a1a24",
    backdropFilter: "blur(10px)",
    background: "rgba(10,10,15,0.8)",
  },
  logo: { display: "flex", alignItems: "center", gap: "10px" },
  logoText: { fontSize: "18px", fontWeight: "800", color: "#e8e8f0", letterSpacing: "-0.5px" },
  headerRight: { display: "flex", alignItems: "center", gap: "8px" },
  poweredBy: { fontSize: "12px", color: "#5a5a7a", fontFamily: "'JetBrains Mono', monospace" },
  claudeBadge: {
    padding: "3px 10px",
    background: "rgba(124,106,255,0.12)",
    border: "1px solid rgba(124,106,255,0.3)",
    borderRadius: "100px",
    fontSize: "11px", fontWeight: "700",
    color: "#7c6aff",
    fontFamily: "'JetBrains Mono', monospace",
  },
  main: {
    flex: 1, position: "relative", zIndex: 1,
    display: "flex", justifyContent: "center",
    padding: "40px 20px 60px",
  },
  landing: {
    width: "100%", maxWidth: "680px",
    display: "flex", flexDirection: "column", gap: "40px",
  },
  heroSection: { textAlign: "center", display: "flex", flexDirection: "column", gap: "16px" },
  eyebrow: {
    display: "inline-flex", alignItems: "center", gap: "8px",
    fontSize: "11px", fontWeight: "600",
    color: "#7c6aff",
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: "uppercase", letterSpacing: "0.1em",
    justifyContent: "center",
  },
  eyebrowDot: {
    width: "6px", height: "6px", borderRadius: "50%",
    background: "#7c6aff", animation: "pulse-ring 2s infinite",
    display: "inline-block",
  },
  headline: {
    fontSize: "clamp(36px, 6vw, 56px)",
    fontWeight: "800",
    color: "#e8e8f0",
    lineHeight: 1.1,
    letterSpacing: "-1.5px",
  },
  headlineAccent: {
    background: "linear-gradient(90deg, #7c6aff, #22d3a0)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subheadline: {
    fontSize: "16px", color: "#9090b0", lineHeight: 1.6,
    maxWidth: "520px", margin: "0 auto",
  },
  uploadSection: {},
  featureBar: {
    display: "flex", flexWrap: "wrap", justifyContent: "center",
    gap: "8px",
  },
  feature: {
    display: "flex", alignItems: "center", gap: "6px",
    padding: "6px 14px",
    background: "#13131c",
    border: "1px solid #2a2a3a",
    borderRadius: "100px",
    fontSize: "12px",
  },
  featureLabel: { color: "#9090b0", fontFamily: "'JetBrains Mono', monospace" },
  resultSection: {
    width: "100%", maxWidth: "900px",
    display: "flex", flexDirection: "column", gap: "20px",
  },
  resultHeader: {},
  backBtn: {
    background: "none",
    border: "1px solid #2a2a3a",
    color: "#9090b0",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "13px", cursor: "pointer",
    fontFamily: "'Syne', sans-serif",
    transition: "all 0.2s",
  },
  footer: {
    position: "relative", zIndex: 1,
    padding: "16px 40px",
    borderTop: "1px solid #1a1a24",
    textAlign: "center",
  },
  footerText: {
    fontSize: "11px", color: "#3d3d55",
    fontFamily: "'JetBrains Mono', monospace",
  },
};
