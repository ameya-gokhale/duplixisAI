import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const COLORS = ["#7c6aff", "#22d3a0", "#a855f7", "#fbbf24", "#ff5a6e", "#38bdf8", "#fb923c", "#4ade80"];

export default function AnalyticsDashboard({ job }) {
  const langData = Object.entries(job.languageBreakdown || {}).map(([lang, count]) => ({
    name: lang,
    value: count,
  }));

  const deduplicationRate =
    job.totalRows > 0 ? ((job.duplicatesRemoved / job.totalRows) * 100).toFixed(1) : 0;

  const retentionData = [
    { name: "Unique", value: job.uniqueRows || 0, fill: "#22d3a0" },
    { name: "Removed", value: job.duplicatesRemoved || 0, fill: "#ff5a6e" },
  ];

  return (
    <div style={styles.wrapper}>
      <h3 style={styles.title}>
        <span style={styles.titleIcon}>◈</span>
        Analytics
      </h3>

      <div style={styles.grid}>
        {/* Language breakdown pie */}
        <div style={styles.card}>
          <p style={styles.cardTitle}>Language Distribution</p>
          {langData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={langData}
                    cx="50%" cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {langData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1a1a24", border: "1px solid #2a2a3a",
                      borderRadius: "8px", color: "#e8e8f0",
                      fontFamily: "'JetBrains Mono', monospace", fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={styles.legend}>
                {langData.map((item, i) => (
                  <div key={i} style={styles.legendItem}>
                    <div style={{ ...styles.legendDot, background: COLORS[i % COLORS.length] }} />
                    <span style={styles.legendLabel}>{item.name}</span>
                    <span style={styles.legendValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={styles.empty}>No language data available</p>
          )}
        </div>

        {/* Retention bar chart */}
        <div style={styles.card}>
          <p style={styles.cardTitle}>Record Retention</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={retentionData} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#5a5a7a", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#5a5a7a", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#1a1a24", border: "1px solid #2a2a3a",
                  borderRadius: "8px", color: "#e8e8f0",
                  fontFamily: "'JetBrains Mono', monospace", fontSize: "12px",
                }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {retentionData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Dedup rate */}
          <div style={styles.rateBox}>
            <p style={styles.rateLabel}>Deduplication Rate</p>
            <div style={styles.rateBar}>
              <div style={{ ...styles.rateFill, width: `${deduplicationRate}%` }} />
            </div>
            <p style={styles.rateValue}>{deduplicationRate}%</p>
          </div>
        </div>

        {/* Summary card */}
        <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
          <p style={styles.cardTitle}>Job Summary</p>
          <div style={styles.summaryGrid}>
            <SummaryRow label="Job ID" value={job.jobId} mono />
            <SummaryRow label="File" value={job.fileName} />
            <SummaryRow label="Input Rows" value={job.totalRows} />
            <SummaryRow label="Output Rows" value={job.uniqueRows} highlight="#22d3a0" />
            <SummaryRow label="Duplicates Removed" value={job.duplicatesRemoved} highlight="#ff5a6e" />
            <SummaryRow
              label="Languages Detected"
              value={(job.languagesDetected || []).join(", ") || "—"}
            />
            <SummaryRow
              label="Processing Time"
              value={`${((job.processingTimeMs || 0) / 1000).toFixed(2)}s`}
            />
            <SummaryRow
              label="Columns"
              value={(job.inputHeaders || []).join(", ") || "—"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, mono, highlight }) {
  return (
    <div style={styles.summaryRow}>
      <span style={styles.summaryLabel}>{label}</span>
      <span style={{
        ...styles.summaryValue,
        ...(mono ? { fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" } : {}),
        ...(highlight ? { color: highlight } : {}),
      }}>
        {String(value)}
      </span>
    </div>
  );
}

const styles = {
  wrapper: { display: "flex", flexDirection: "column", gap: "16px" },
  title: {
    fontSize: "13px", fontWeight: "700",
    color: "#5a5a7a",
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: "uppercase", letterSpacing: "0.1em",
    display: "flex", alignItems: "center", gap: "8px",
  },
  titleIcon: { color: "#7c6aff" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  card: {
    padding: "20px",
    background: "#13131c",
    border: "1px solid #2a2a3a",
    borderRadius: "12px",
  },
  cardTitle: {
    fontSize: "12px", fontWeight: "600",
    color: "#9090b0",
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: "uppercase", letterSpacing: "0.08em",
    marginBottom: "16px",
  },
  legend: { display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px" },
  legendItem: { display: "flex", alignItems: "center", gap: "8px" },
  legendDot: { width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0 },
  legendLabel: { fontSize: "12px", color: "#9090b0", flex: 1, fontFamily: "'JetBrains Mono', monospace" },
  legendValue: { fontSize: "12px", color: "#e8e8f0", fontFamily: "'JetBrains Mono', monospace" },
  empty: { color: "#5a5a7a", fontSize: "13px", textAlign: "center", padding: "40px 0" },
  rateBox: { marginTop: "16px" },
  rateLabel: { fontSize: "11px", color: "#5a5a7a", fontFamily: "'JetBrains Mono', monospace", marginBottom: "6px" },
  rateBar: { height: "6px", background: "#2a2a3a", borderRadius: "3px", overflow: "hidden" },
  rateFill: { height: "100%", background: "linear-gradient(90deg, #7c6aff, #22d3a0)", borderRadius: "3px", transition: "width 0.8s ease" },
  rateValue: { fontSize: "20px", fontWeight: "800", color: "#7c6aff", marginTop: "6px" },
  summaryGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  summaryRow: {
    display: "flex", flexDirection: "column", gap: "2px",
    padding: "10px",
    background: "#1a1a24",
    borderRadius: "8px",
  },
  summaryLabel: { fontSize: "10px", color: "#5a5a7a", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" },
  summaryValue: { fontSize: "13px", color: "#e8e8f0", fontWeight: "600", wordBreak: "break-all" },
};
