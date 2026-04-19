import { ResultsCard } from "@/components/ResultsCard";
import { SearchFilter } from "@/components/SearchFilter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGE_OPTIONS } from "@/data/languages";
import { cn, formatProcessingTime, getSimilarityLevel } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type { DuplicateResult, Language, SimilarityGroup } from "@/types";
import {
  AlertCircle,
  CheckCheck,
  ChevronDown,
  Download,
  Search,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type ExportFormat = "json" | "csv";

const EXPORT_LANGUAGE_LABELS: Record<Language, string> = {
  en: "English",
  hi: "Hindi",
  mr: "Marathi",
  ja: "Japanese",
  zh: "Chinese",
  ar: "Arabic",
  fr: "French",
  de: "German",
  es: "Spanish",
  ko: "Korean",
  pt: "Portuguese",
  ru: "Russian",
  it: "Italian",
  id: "Indonesian",
};

const CSV_HEADER_TRANSLATIONS: Record<Language, string[]> = {
  en: ["Group ID", "Original ID", "Original Name", "Original Description", "Original Language", "Duplicate ID", "Duplicate Name", "Duplicate Description", "Duplicate Language", "Score"],
  hi: ["समूह आईडी", "मूल आईडी", "मूल नाम", "मूल विवरण", "मूल भाषा", "डुप्लिकेट आईडी", "डुप्लिकेट नाम", "डुप्लिकेट विवरण", "डुप्लिकेट भाषा", "स्कोर"],
  mr: ["गट आयडी", "मूळ आयडी", "मूळ नाव", "मूळ वर्णन", "मूळ भाषा", "डुप्लिकेट आयडी", "डुप्लिकेट नाव", "डुप्लिकेट वर्णन", "डुप्लिकेट भाषा", "स्कोर"],
  ja: ["グループID", "元ID", "元の名前", "元の説明", "元の言語", "重複ID", "重複名", "重複説明", "重複言語", "スコア"],
  zh: ["组ID", "原始ID", "原始名称", "原始描述", "原始语言", "重复ID", "重复名称", "重复描述", "重复语言", "分数"],
  ar: ["معرّف المجموعة", "المعرّف الأصلي", "الاسم الأصلي", "الوصف الأصلي", "اللغة الأصلية", "معرّف التكرار", "اسم التكرار", "وصف التكرار", "لغة التكرار", "الدرجة"],
  fr: ["ID du groupe", "ID original", "Nom original", "Description originale", "Langue originale", "ID du doublon", "Nom du doublon", "Description du doublon", "Langue du doublon", "Score"],
  de: ["Gruppen-ID", "Original-ID", "Originalname", "Originalbeschreibung", "Originalsprache", "Duplikat-ID", "Duplikatname", "Duplikatbeschreibung", "Duplikatsprache", "Wert"],
  es: ["ID del grupo", "ID original", "Nombre original", "Descripción original", "Idioma original", "ID duplicado", "Nombre duplicado", "Descripción duplicada", "Idioma duplicado", "Puntuación"],
  ko: ["그룹 ID", "원본 ID", "원본 이름", "원본 설명", "원본 언어", "중복 ID", "중복 이름", "중복 설명", "중복 언어", "점수"],
  pt: ["ID do grupo", "ID original", "Nome original", "Descrição original", "Idioma original", "ID duplicado", "Nome duplicado", "Descrição duplicada", "Idioma duplicado", "Pontuação"],
  ru: ["ID группы", "Исходный ID", "Исходное имя", "Исходное описание", "Исходный язык", "ID дубликата", "Имя дубликата", "Описание дубликата", "Язык дубликата", "Оценка"],
  it: ["ID gruppo", "ID originale", "Nome originale", "Descrizione originale", "Lingua originale", "ID duplicato", "Nome duplicato", "Descrizione duplicata", "Lingua duplicata", "Punteggio"],
  id: ["ID grup", "ID asli", "Nama asli", "Deskripsi asli", "Bahasa asli", "ID duplikat", "Nama duplikat", "Deskripsi duplikat", "Bahasa duplikat", "Skor"],
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ResultsPanel() {
  const {
    detectionResults,
    searchFilter,
    languageFilter,
    similarityFilter,
    setDetectionResults,
    setSearchFilter,
    setLanguageFilter,
    setSimilarityFilter,
  } = useAppStore();
  const [results, setResults] = useState<DuplicateResult | null>(detectionResults);
  const [selectedExportFormat, setSelectedExportFormat] =
    useState<ExportFormat | null>(null);
  const [exportLanguage, setExportLanguage] = useState<Language>("en");

  useEffect(() => {
    setResults(detectionResults);
  }, [detectionResults]);

  if (!results) return null;

  const { groups, totalRecordsAnalyzed, duplicatesFound, processingTimeMs } =
    results;

  const filtered = groups.filter((g) => {
    const q = searchFilter.toLowerCase();
    const matchesSearch =
      !q ||
      g.original.name.toLowerCase().includes(q) ||
      g.original.description.toLowerCase().includes(q) ||
      g.similar.some(
        (s) =>
          s.record.name.toLowerCase().includes(q) ||
          s.record.description.toLowerCase().includes(q),
      );

    const matchesLang =
      languageFilter === "all" ||
      g.original.language === languageFilter ||
      g.similar.some((s) => s.record.language === languageFilter);

    const matchesSim =
      similarityFilter === "all" ||
      getSimilarityLevel(g.topScore) === similarityFilter;

    return matchesSearch && matchesLang && matchesSim;
  });

  const persistResults = (nextGroups: SimilarityGroup[]) => {
    const nextResults: DuplicateResult = {
      ...results,
      groups: nextGroups,
      duplicatesFound: nextGroups.reduce(
        (count, group) => count + group.similar.length,
        0,
      ),
    };
    setResults(nextResults);
    setDetectionResults(nextResults);
  };

  const handleDismissGroup = (groupId: string) => {
    persistResults(groups.filter((group) => group.id !== groupId));
  };

  const handleMergeGroup = (groupId: string) => {
    persistResults(groups.filter((group) => group.id !== groupId));
  };

  const handleDeleteDuplicates = (groupId: string) => {
    persistResults(groups.filter((group) => group.id !== groupId));
  };

  const handleReviewDecisions = (
    groupId: string,
    recordIdsToDelete: string[],
  ) => {
    if (!recordIdsToDelete.length) {
      return;
    }

    const nextGroups = groups.flatMap((group) => {
      if (group.id !== groupId) {
        return [group];
      }

      const nextSimilar = group.similar.filter(
        ({ record }) => !recordIdsToDelete.includes(record.id),
      );

      if (!nextSimilar.length) {
        return [];
      }

      return [{ ...group, similar: nextSimilar }];
    });

    persistResults(nextGroups);
  };

  const handleMergeAll = () => {
    if (!groups.length) {
      toast.info("No duplicate groups left to merge.");
      return;
    }

    persistResults([]);
    toast.success("All duplicate records merged", {
      description: "All duplicate groups were merged into their first record.",
    });
  };

  const exportPayload = useMemo(
    () => ({
      exportLanguage,
      exportLanguageLabel: EXPORT_LANGUAGE_LABELS[exportLanguage],
      exportedAt: new Date().toISOString(),
      totalRecordsAnalyzed,
      duplicatesFound,
      processingTimeMs,
      groups,
    }),
    [duplicatesFound, exportLanguage, groups, processingTimeMs, totalRecordsAnalyzed],
  );

  const handleExport = () => {
    if (!selectedExportFormat) return;

    if (selectedExportFormat === "json") {
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
        type: "application/json",
      });
      downloadBlob(blob, `duplixis-results-${exportLanguage}-${Date.now()}.json`);
    } else {
      const header = CSV_HEADER_TRANSLATIONS[exportLanguage];
      const rows = groups.flatMap((group) =>
        group.similar.map((item) => [
          group.id,
          group.original.id,
          group.original.name,
          group.original.description,
          group.original.language,
          item.record.id,
          item.record.name,
          item.record.description,
          item.record.language,
          `${group.topScore}%`,
        ]),
      );

      const csv = [header, ...rows]
        .map((row) =>
          row
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(","),
        )
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      downloadBlob(blob, `duplixis-results-${exportLanguage}-${Date.now()}.csv`);
    }

    toast.success("Export complete", {
      description: `Downloaded ${selectedExportFormat.toUpperCase()} in ${EXPORT_LANGUAGE_LABELS[exportLanguage]}.`,
    });
    setSelectedExportFormat(null);
  };

  const stats = [
    {
      icon: TrendingUp,
      label: "Records Analyzed",
      value: totalRecordsAnalyzed,
      colorClass: "text-primary",
    },
    {
      icon: AlertCircle,
      label: "Duplicates Found",
      value: duplicatesFound,
      colorClass: "text-chart-1",
    },
    {
      icon: SlidersHorizontal,
      label: "Groups",
      value: groups.length,
      colorClass: "text-accent",
    },
  ] as const;

  return (
    <div
      className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6"
      data-ocid="results.panel"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-5"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">
              Detection <span className="text-accent-ai">Results</span>
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Analyzed {totalRecordsAnalyzed} records in{" "}
              {formatProcessingTime(processingTimeMs)} · {groups.length} duplicate{" "}
              {groups.length === 1 ? "group" : "groups"} found
            </p>
            <div className="mt-3">
              <Button
                size="sm"
                onClick={handleMergeAll}
                data-ocid="results.merge-all.button"
                className="btn-primary border-0 text-primary-foreground"
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Merge All Records
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid="results.export.button"
                  className="flex items-center gap-2 glass-card"
                >
                  <Download className="w-4 h-4" />
                  Export
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card min-w-40">
                <DropdownMenuItem onClick={() => setSelectedExportFormat("json")}>
                  JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedExportFormat("csv")}>
                  CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {selectedExportFormat && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-4"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  Export as {selectedExportFormat.toUpperCase()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Choose the language label for the exported file.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Export language
                  </label>
                  <Select
                    value={exportLanguage}
                    onValueChange={(value) => setExportLanguage(value as Language)}
                  >
                    <SelectTrigger className="w-full glass-card sm:w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGE_OPTIONS.map((language) => (
                        <SelectItem key={language.code} value={language.code}>
                          {language.flag} {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedExportFormat(null)}
                    className="glass-card"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleExport}
                    className="btn-primary border-0 text-primary-foreground"
                  >
                    Download {selectedExportFormat.toUpperCase()}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass-card space-y-1 rounded-xl p-4 text-center"
            >
              <stat.icon className={cn("mx-auto w-5 h-5", stat.colorClass)} />
              <div className="font-display text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <SearchFilter />

      {(searchFilter || languageFilter !== "all" || similarityFilter !== "all") && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
            <span className="font-medium text-foreground">{groups.length}</span> groups
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchFilter("");
              setLanguageFilter("all");
              setSimilarityFilter("all");
            }}
            className="text-xs text-primary underline-offset-2 hover:underline"
            data-ocid="results.clear-filters.button"
          >
            Clear all filters
          </button>
        </motion.div>
      )}

      {filtered.length > 0 ? (
        <div className="space-y-5" data-ocid="results.list">
          {filtered.map((group, i) => (
            <ResultsCard
              key={group.id}
              group={group}
              index={i + 1}
              onDismiss={handleDismissGroup}
              onMerge={handleMergeGroup}
              onDeleteDuplicates={handleDeleteDuplicates}
              onReviewDecisions={handleReviewDecisions}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card space-y-5 rounded-2xl p-16 text-center"
          data-ocid="results.empty_state"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/30">
            <Search className="w-8 h-8 text-muted-foreground opacity-50" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              No matches found
            </h3>
            <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">
              Try adjusting your search query or filters to see more results.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchFilter("");
              setLanguageFilter("all");
              setSimilarityFilter("all");
            }}
            data-ocid="results.clear-filters.secondary.button"
            className="glass-card"
          >
            Clear Filters
          </Button>
        </motion.div>
      )}
    </div>
  );
}
