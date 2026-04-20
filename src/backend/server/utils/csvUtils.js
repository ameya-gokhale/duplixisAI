const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");

/**
 * Parse CSV buffer into array of objects
 */
function parseCSV(buffer) {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });
  return records;
}

/**
 * Stringify array of objects back to CSV
 */
function stringifyCSV(records, columns) {
  if (!records || records.length === 0) return "";
  return stringify(records, {
    header: true,
    columns: columns || Object.keys(records[0]),
  });
}

/**
 * Get column headers from CSV buffer
 */
function getHeaders(buffer) {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    to_line: 2,
    bom: true,
  });
  return records.length > 0 ? Object.keys(records[0]) : [];
}

module.exports = { parseCSV, stringifyCSV, getHeaders };
