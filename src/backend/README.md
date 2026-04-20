# LinguaDedup 🌍

**Multilingual CSV deduplication powered by Claude AI.**

Upload a CSV with records in any mix of languages. Claude identifies semantically identical entries across translations and returns a clean, deduplicated dataset — with full analytics.

---

## Features

- 🧠 **AI-powered** — Claude detects cross-language duplicates (e.g. "Apple Inc." = "苹果公司" = "アップル")
- 🌍 **50+ languages** — English, French, Spanish, Arabic, Chinese, Japanese, Korean, Hindi, and more
- 📊 **Analytics dashboard** — language breakdown, deduplication rate, processing stats
- ⬇️ **CSV export** — download the cleaned file instantly
- 🕒 **Job history** — view recent jobs with status and download links
- 🐳 **Docker ready** — one command to spin up the full stack

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18, Recharts, Axios         |
| Backend  | Node.js, Express 4                |
| Database | MongoDB + Mongoose                |
| AI       | Anthropic Claude (claude-sonnet)  |
| DevOps   | Docker, Docker Compose            |

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Anthropic API key → [console.anthropic.com](https://console.anthropic.com)

### 1. Clone & install

```bash
git clone <repo-url>
cd linguadedup
npm run install:all
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env and set your ANTHROPIC_API_KEY
```

### 3. Run in development

```bash
npm run dev
# Server: http://localhost:5000
# Client: http://localhost:3000
```

### 4. Generate a test CSV

```bash
npm run sample
# Creates sample.csv with 38 multilingual records (~15 expected duplicates)
```

---

## Docker

```bash
# Set your API key first
export ANTHROPIC_API_KEY=sk-ant-...

docker-compose up --build
```

Starts MongoDB, Express server, and React client in one command.

---

## API Reference

| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| POST   | `/api/upload`               | Upload CSV, returns `{ jobId }`    |
| GET    | `/api/jobs/:jobId`          | Poll job status & analytics        |
| GET    | `/api/jobs/:jobId/download` | Download deduplicated CSV          |
| GET    | `/api/jobs`                 | List recent 20 jobs                |
| GET    | `/api/health`               | Health check                       |

### Upload Response
```json
{
  "jobId": "uuid-v4",
  "totalRows": 38,
  "headers": ["id", "name", "category", "country"],
  "status": "processing"
}
```

### Job Status Response
```json
{
  "jobId": "...",
  "fileName": "data.csv",
  "status": "completed",
  "totalRows": 38,
  "uniqueRows": 23,
  "duplicatesRemoved": 15,
  "languagesDetected": ["English", "Chinese", "Japanese", "Arabic"],
  "languageBreakdown": { "English": 14, "Chinese": 8, "Japanese": 6, "Arabic": 5, "Korean": 5 },
  "processingTimeMs": 12400,
  "inputHeaders": ["id", "name", "category", "country", "language"],
  "hasOutput": true
}
```

---

## How It Works

```
CSV Upload
    │
    ▼
Parse with csv-parse
    │
    ▼
Split into chunks of 50 rows
    │
    ▼
Send each chunk to Claude API
  ┌─────────────────────────────────┐
  │  Prompt includes:               │
  │  • All records as JSON          │
  │  • Instructions to detect lang  │
  │  • Find cross-language dupes    │
  │  • Return duplicateIndices      │
  └─────────────────────────────────┘
    │
    ▼
Filter out duplicate indices
    │
    ▼
Stringify clean records to CSV
    │
    ▼
Store in MongoDB + return to client
```

---

## Project Structure

```
linguadedup/
├── package.json              ← Root scripts (concurrently)
├── docker-compose.yml
├── generate-sample.js        ← Test data generator
│
├── server/
│   ├── index.js              ← Express app + MongoDB connect
│   ├── Dockerfile
│   ├── .env.example
│   ├── models/
│   │   └── Job.js            ← Mongoose schema
│   ├── routes/
│   │   ├── upload.js         ← File upload + async processing
│   │   └── jobs.js           ← Status polling + download
│   └── utils/
│       ├── csvUtils.js       ← csv-parse / csv-stringify helpers
│       └── aiUtils.js        ← Claude API chunked deduplication
│
└── client/
    ├── Dockerfile
    ├── public/index.html
    └── src/
        ├── App.js
        ├── utils/api.js      ← Axios API client
        ├── hooks/useJob.js   ← 2s polling hook
        ├── styles/global.css
        └── components/
            ├── DropZone.js          ← Drag & drop upload
            ├── JobResult.js         ← Status + results view
            ├── AnalyticsDashboard.js ← Recharts visualizations
            └── RecentJobs.js        ← Job history list
```

---

## Limitations & Notes

- **Chunk size**: 50 records per API call. Large files take longer but are fully supported.
- **Confidence**: Claude is conservative — only marks as duplicate when highly confident.
- **MongoDB optional**: Falls back to in-memory job store if MongoDB is unreachable.
- **File size limit**: 10 MB per upload.

---

## License

MIT
