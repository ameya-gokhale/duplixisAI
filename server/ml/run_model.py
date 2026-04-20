#!/usr/bin/env python3
"""
run_model.py — replicates the SIES deduplication pipeline from the notebook.

Pipeline:
  1. Preprocess & combine name + description columns
  2. Detect language per record
  3. Encode with paraphrase-multilingual-MiniLM-L12-v2
  4. Build hybrid similarity matrix (semantic + fuzzy + keyword)
  5. Compute language-specific dynamic thresholds
  6. Find duplicate pairs, cluster with networkx
  7. Keep one representative per cluster, output clean CSV

Usage:
    python run_model.py <input_csv_path> <output_csv_path>
"""

import sys
import os
import json

# ── dependency check ────────────────────────────────────────────────────────
REQUIRED = {
    "pandas":                "pandas",
    "numpy":                 "numpy",
    "sentence_transformers": "sentence-transformers",
    "sklearn":               "scikit-learn",
    "rapidfuzz":             "rapidfuzz",
    "langdetect":            "langdetect",
    "networkx":              "networkx",
}
missing = []
for mod, pkg in REQUIRED.items():
    try:
        __import__(mod)
    except ImportError:
        missing.append(pkg)

if missing:
    print(
        f"\n❌  Missing Python packages: {', '.join(missing)}\n\n"
        f"Run this once, then restart the server:\n\n"
        f"  pip install {' '.join(missing)}\n",
        file=sys.stderr,
    )
    sys.exit(1)
# ────────────────────────────────────────────────────────────────────────────

import warnings
warnings.filterwarnings("ignore")

import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from rapidfuzz import fuzz
from langdetect import detect
import networkx as nx


# ── helpers (verbatim from notebook) ────────────────────────────────────────

def preprocess_text(text):
    if pd.isnull(text):
        return ""
    return str(text).strip()


def detect_lang_safe(text):
    try:
        return detect(text)
    except Exception:
        return "unknown"


def hybrid_score(text1, text2, emb_score):
    fuzz_score     = fuzz.token_sort_ratio(text1, text2) / 100
    words1         = set(text1.split())
    words2         = set(text2.split())
    keyword_overlap = len(words1 & words2) / (len(words1) + 1e-5)
    return (0.6 * emb_score) + (0.25 * fuzz_score) + (0.15 * keyword_overlap)


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) != 3:
        print("Usage: python run_model.py <input_csv> <output_csv>", file=sys.stderr)
        sys.exit(1)

    input_path  = sys.argv[1]
    output_path = sys.argv[2]

    if not os.path.exists(input_path):
        print(f"Input CSV not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    # ── 1. Load & preprocess ─────────────────────────────────────────────────
    df = pd.read_csv(input_path)
    original_count = len(df)
    print(f"Loaded {original_count} rows", file=sys.stderr)

    # Detect text columns (use first two string columns if name/description absent)
    str_cols = [c for c in df.columns if df[c].dtype == object]
    col1 = "name"        if "name"        in df.columns else (str_cols[0] if len(str_cols) > 0 else None)
    col2 = "description" if "description" in df.columns else (str_cols[1] if len(str_cols) > 1 else None)

    if col1:
        df[col1] = df[col1].apply(preprocess_text)
    if col2:
        df[col2] = df[col2].apply(preprocess_text)

    if col1 and col2:
        df["combined"] = df[col1] + " " + df[col2]
    elif col1:
        df["combined"] = df[col1]
    else:
        # Fall back to concatenating all string columns
        df["combined"] = df[str_cols].fillna("").agg(" ".join, axis=1)

    # ── 2. Language detection ────────────────────────────────────────────────
    print("Detecting languages...", file=sys.stderr)
    df["language"] = df["combined"].apply(detect_lang_safe)
    lang_counts = df["language"].value_counts().to_dict()
    print(f"Languages detected: {lang_counts}", file=sys.stderr)

    # ── 3. Encode ────────────────────────────────────────────────────────────
    print("Loading sentence-transformer model...", file=sys.stderr)
    model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
    texts = df["combined"].tolist()
    print("Encoding texts...", file=sys.stderr)
    embeddings = model.encode(texts, show_progress_bar=False)
    print(f"Embeddings shape: {np.array(embeddings).shape}", file=sys.stderr)

    # ── 4. Cosine similarity + hybrid matrix ─────────────────────────────────
    print("Building similarity matrix...", file=sys.stderr)
    cos_sim_matrix = cosine_similarity(embeddings)

    K   = min(10, original_count)
    n   = original_count
    top_k_indices = np.argsort(-cos_sim_matrix, axis=1)[:, :K]

    hybrid_matrix = np.zeros((n, n))
    for i in range(n):
        for j in top_k_indices[i]:
            if i == j:
                continue
            score = hybrid_score(
                df.iloc[i]["combined"],
                df.iloc[j]["combined"],
                cos_sim_matrix[i][j],
            )
            hybrid_matrix[i][j] = score
            hybrid_matrix[j][i] = score

    # ── 5. Language-specific dynamic thresholds ──────────────────────────────
    default_threshold  = 0.80
    language_thresholds = {}

    for lang in df["language"].unique():
        lang_indices = df[df["language"] == lang].index.tolist()
        if len(lang_indices) < 2:
            language_thresholds[lang] = default_threshold
            continue
        mask = np.zeros(n, dtype=bool)
        mask[lang_indices] = True
        sub = hybrid_matrix[mask][:, mask]
        scores = sub[np.triu_indices(len(lang_indices), k=1)].flatten()
        meaningful = scores[scores > 0]
        language_thresholds[lang] = (
            np.percentile(meaningful, 90) if len(meaningful) > 0 else default_threshold
        )

    print("Language thresholds:", file=sys.stderr)
    for lang, t in language_thresholds.items():
        print(f"  {lang}: {t:.4f}", file=sys.stderr)

    # ── 6. Find duplicate pairs ──────────────────────────────────────────────
    duplicates = []
    for i in range(n):
        for j in top_k_indices[i]:
            if i >= j:
                continue
            lang_i = df.iloc[i]["language"]
            lang_j = df.iloc[j]["language"]
            threshold = default_threshold
            if lang_i == lang_j and lang_i in language_thresholds:
                threshold = language_thresholds[lang_i]
            if hybrid_matrix[i][j] > threshold:
                duplicates.append((i, j, hybrid_matrix[i][j]))

    print(f"Duplicate pairs found: {len(duplicates)}", file=sys.stderr)

    # ── 7. Cluster with networkx, keep first per cluster ─────────────────────
    G = nx.Graph()
    G.add_nodes_from(range(n))
    for i, j, score in duplicates:
        G.add_edge(i, j, weight=score)

    clusters      = [c for c in nx.connected_components(G) if len(c) > 1]
    indices_to_drop = set()
    for cluster in clusters:
        sorted_cluster = sorted(cluster)   # keep lowest original index
        indices_to_drop.update(sorted_cluster[1:])

    # ── 8. Build output ──────────────────────────────────────────────────────
    # Add cluster column (matches notebook behaviour), then drop duplicates
    df["cluster"] = -1
    for cluster_id, cluster in enumerate(clusters):
        for i in cluster:
            df.at[i, "cluster"] = cluster_id

    result = df.drop(index=list(indices_to_drop)).reset_index(drop=True)

    # Drop the helper columns we added so output matches input schema
    cols_to_drop = [c for c in ["combined", "language"] if c not in
                    pd.read_csv(input_path, nrows=0).columns]
    result = result.drop(columns=cols_to_drop, errors="ignore")

    result.to_csv(output_path, index=False)

    removed = original_count - len(result)
    print(f"Done: {len(result)} rows kept, {removed} removed", file=sys.stderr)

    # Summary JSON printed to stdout for Node to parse
    summary = {
        "totalRows":         original_count,
        "uniqueRows":        len(result),
        "duplicatesRemoved": removed,
        "columns":           list(result.columns),
        "languageBreakdown": lang_counts,
    }
    print(json.dumps(summary))


if __name__ == "__main__":
    main()
