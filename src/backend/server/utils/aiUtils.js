const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Sends a batch of records to Claude for cross-language deduplication analysis.
 * Returns groups of duplicate record indices.
 */
async function analyzeChunkForDuplicates(records, chunkIndex, totalChunks) {
  const prompt = `You are a multilingual data deduplication expert. Analyze the following CSV records and identify duplicates ACROSS different languages. 

Records (as JSON array, each with an "_idx" field for identification):
${JSON.stringify(records, null, 2)}

Task:
1. Detect the language of each record's text fields
2. Identify records that represent the SAME entity/concept even if written in different languages (e.g., "Apple" in English and "Apple" transliterated or translated in French, Spanish, Chinese, Arabic, Hindi, etc.)
3. Within each duplicate group, keep the FIRST occurrence (lowest _idx) and mark the rest as duplicates

Respond with ONLY a valid JSON object in this exact format:
{
  "duplicateIndices": [<list of _idx values to REMOVE - these are the duplicates to eliminate>],
  "languageBreakdown": {<language_name>: <count_of_records_in_that_language>},
  "analysis": "<brief explanation of what you found>"
}

Be conservative: only mark as duplicate if you are highly confident they refer to the same real-world entity.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const responseText = message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  // Extract JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse AI response as JSON");
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Main deduplication function - processes records in chunks
 */
async function deduplicateRecords(records) {
  const CHUNK_SIZE = 50; // Process 50 records at a time
  const allDuplicateIndices = new Set();
  const combinedLanguageBreakdown = {};
  const analyses = [];

  // Add index to each record for tracking
  const indexedRecords = records.map((r, i) => ({ ...r, _idx: i }));

  const chunks = [];
  for (let i = 0; i < indexedRecords.length; i += CHUNK_SIZE) {
    chunks.push(indexedRecords.slice(i, i + CHUNK_SIZE));
  }

  console.log(`Processing ${chunks.length} chunk(s) of up to ${CHUNK_SIZE} records each...`);

  for (let ci = 0; ci < chunks.length; ci++) {
    const chunk = chunks[ci];
    console.log(`  Chunk ${ci + 1}/${chunks.length}: ${chunk.length} records`);

    const result = await analyzeChunkForDuplicates(chunk, ci, chunks.length);

    // Collect duplicate indices
    (result.duplicateIndices || []).forEach((idx) => allDuplicateIndices.add(idx));

    // Merge language breakdown
    Object.entries(result.languageBreakdown || {}).forEach(([lang, count]) => {
      combinedLanguageBreakdown[lang] = (combinedLanguageBreakdown[lang] || 0) + count;
    });

    if (result.analysis) analyses.push(result.analysis);

    // Small delay between chunks to be polite to the API
    if (ci < chunks.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // Filter out duplicates
  const cleanRecords = records.filter((_, i) => !allDuplicateIndices.has(i));

  return {
    cleanRecords,
    duplicatesRemoved: allDuplicateIndices.size,
    languageBreakdown: combinedLanguageBreakdown,
    languagesDetected: Object.keys(combinedLanguageBreakdown),
    analyses,
  };
}

module.exports = { deduplicateRecords };
