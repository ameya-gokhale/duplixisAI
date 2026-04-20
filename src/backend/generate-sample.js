#!/usr/bin/env node
/**
 * Generates a sample multilingual CSV for testing LinguaDedup
 * Run: node generate-sample.js > sample.csv
 */

const records = [
  // Tech companies - same entity in different languages
  { id: 1, name: "Apple Inc.", category: "Technology", country: "USA", language: "English" },
  { id: 2, name: "Apple Inc.", category: "Technologie", country: "États-Unis", language: "French" },
  { id: 3, name: "苹果公司", category: "科技", country: "美国", language: "Chinese" },
  { id: 4, name: "アップル", category: "テクノロジー", country: "アメリカ", language: "Japanese" },
  { id: 5, name: "Microsoft Corporation", category: "Technology", country: "USA", language: "English" },
  { id: 6, name: "Microsoft Corporation", category: "Tecnología", country: "EE.UU.", language: "Spanish" },
  { id: 7, name: "مايكروسوفت", category: "تقنية", country: "الولايات المتحدة", language: "Arabic" },
  { id: 8, name: "माइक्रोसॉफ्ट", category: "प्रौद्योगिकी", country: "संयुक्त राज्य", language: "Hindi" },
  { id: 9, name: "Google LLC", category: "Technology", country: "USA", language: "English" },
  { id: 10, name: "Google LLC", category: "Technologie", country: "USA", language: "German" },
  { id: 11, name: "구글", category: "기술", country: "미국", language: "Korean" },
  { id: 12, name: "Amazon.com Inc.", category: "E-Commerce", country: "USA", language: "English" },
  { id: 13, name: "Amazon.com Inc.", category: "E-Ticaret", country: "ABD", language: "Turkish" },
  { id: 14, name: "Amazonas", category: "Comercio electrónico", country: "EE.UU.", language: "Spanish" },

  // Cities - same city in different languages
  { id: 15, name: "Paris", category: "City", country: "France", language: "English" },
  { id: 16, name: "París", category: "Ciudad", country: "Francia", language: "Spanish" },
  { id: 17, name: "巴黎", category: "城市", country: "法国", language: "Chinese" },
  { id: 18, name: "باريس", category: "مدينة", country: "فرنسا", language: "Arabic" },
  { id: 19, name: "Tokyo", category: "City", country: "Japan", language: "English" },
  { id: 20, name: "東京", category: "都市", country: "日本", language: "Japanese" },
  { id: 21, name: "도쿄", category: "도시", country: "일본", language: "Korean" },
  { id: 22, name: "Tokio", category: "Ciudad", country: "Japón", language: "Spanish" },

  // Unique records (no duplicates)
  { id: 23, name: "Spotify", category: "Music Streaming", country: "Sweden", language: "English" },
  { id: 24, name: "Shopify", category: "E-Commerce Platform", country: "Canada", language: "English" },
  { id: 25, name: "Netflix", category: "Streaming", country: "USA", language: "English" },
  { id: 26, name: "نتفليكس", category: "بث", country: "الولايات المتحدة", language: "Arabic" },
  { id: 27, name: "Alibaba Group", category: "Technology", country: "China", language: "English" },
  { id: 28, name: "阿里巴巴集团", category: "科技", country: "中国", language: "Chinese" },
  { id: 29, name: "Samsung Electronics", category: "Electronics", country: "South Korea", language: "English" },
  { id: 30, name: "삼성전자", category: "전자", country: "대한민국", language: "Korean" },
  { id: 31, name: "Toyota Motor Corporation", category: "Automotive", country: "Japan", language: "English" },
  { id: 32, name: "トヨタ自動車", category: "自動車", country: "日本", language: "Japanese" },
  { id: 33, name: "Volkswagen AG", category: "Automotive", country: "Germany", language: "English" },
  { id: 34, name: "フォルクスワーゲン", category: "自動車", country: "ドイツ", language: "Japanese" },
  { id: 35, name: "Tesla Inc.", category: "Electric Vehicles", country: "USA", language: "English" },
  { id: 36, name: "特斯拉", category: "电动汽车", country: "美国", language: "Chinese" },
  { id: 37, name: "OpenAI", category: "Artificial Intelligence", country: "USA", language: "English" },
  { id: 38, name: "Anthropic", category: "AI Safety", country: "USA", language: "English" },
];

// CSV header
const headers = ["id", "name", "category", "country", "language"];
const lines = [
  headers.join(","),
  ...records.map((r) =>
    headers.map((h) => `"${String(r[h]).replace(/"/g, '""')}"`).join(",")
  ),
];

process.stdout.write(lines.join("\n") + "\n");
process.stderr.write(`Generated ${records.length} records (expect ~15 duplicates removed)\n`);
