import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import DatasetUnavailableState from "../components/DatasetUnavailableState";
import {
  DATASET_DETAILS,
  getDatasetDetailById,
  confidenceLevel,
  decisionLabel,
  qualityColor,
} from "../data/datasetDetailData";
import { DATASET_QUALITY_PREVIEW_BY_ID, getDatasetQualityPreviewById } from "../data/datasetCatalogData";
import { askDatasetAssistant, getOllamaConfig } from "../services/ollama";

type ChatRole = "assistant" | "user";
type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

type SchemaRisk = "safe" | "gray" | "high";
type SchemaAccess = "metadata" | "aggregated" | "restricted";
type SchemaResidency = "global" | "local";
type SchemaSort = "risk-desc" | "field-asc" | "null-desc" | "access-asc";

type SchemaPreviewRow = {
  field: string;
  type: string;
  sampleValue: string;
  risk: SchemaRisk;
  access: SchemaAccess;
  residency: SchemaResidency;
  nullPercent: number;
};

const schemaRiskMeta: Record<
  SchemaRisk,
  {
    label: string;
    dotClass: string;
    badgeClass: string;
    description: string;
    sortRank: number;
  }
> = {
  safe: {
    label: "Tier 1: Safe",
    dotClass: "bg-emerald-400",
    badgeClass:
      "bg-emerald-500/15 border border-emerald-500/30 text-emerald-200",
    description:
      "Preview-safe structural metadata that clears policy checks and does not expose sensitive values.",
    sortRank: 0,
  },
  gray: {
    label: "Gray Zone: DPO Review Pending",
    dotClass: "bg-amber-400",
    badgeClass: "bg-amber-500/15 border border-amber-500/30 text-amber-200",
    description:
      "Potentially sensitive when combined with other fields, so free preview stays aggregated until governance review is complete.",
    sortRank: 1,
  },
  high: {
    label: "High Risk: PDPL Flagged",
    dotClass: "bg-red-400",
    badgeClass: "bg-red-500/15 border border-red-500/30 text-red-200",
    description:
      "Direct or highly identifying field that is blocked from free preview and only handled in governed workflows.",
    sortRank: 2,
  },
};

const schemaAccessMeta: Record<
  SchemaAccess,
  { label: string; badgeClass: string; description: string; sortRank: number }
> = {
  metadata: {
    label: "Metadata Only",
    badgeClass: "bg-slate-700/50 border border-slate-600 text-slate-300",
    description:
      "Only field metadata and high-level summaries are visible in the free preview.",
    sortRank: 0,
  },
  aggregated: {
    label: "Aggregated Only",
    badgeClass: "bg-amber-500/15 border border-amber-500/30 text-amber-200",
    description:
      "Only rolled-up or bucketed outputs are available; row-level detail stays hidden.",
    sortRank: 1,
  },
  restricted: {
    label: "Restricted",
    badgeClass: "bg-red-500/15 border border-red-500/30 text-red-200",
    description:
      "Requires paid clean-room access, policy approval, and audit logging before inspection.",
    sortRank: 2,
  },
};

const schemaResidencyMeta: Record<SchemaResidency, string> = {
  global: "Global Transfer Cleared",
  local: "Local Hosting Required",
};

const schemaRowsByDataset: Record<string, SchemaPreviewRow[]> = Object.fromEntries(
  Object.entries(DATASET_QUALITY_PREVIEW_BY_ID).map(([datasetId, preview]) => [
    datasetId,
    preview.schemaRows,
  ]),
);

const buildInitialChatMessages = (
  datasetTitle: string,
  confidenceScore: number,
  freshnessScore: number,
): ChatMessage[] => [
  {
    id: "a-welcome",
    role: "assistant",
    text: "Hi! I'm here to help you understand this dataset. I can answer questions based on its metadata, quality metrics, coverage, and high-level summaries. What would you like to know? (e.g. What is the confidence score? What domains does it cover?)",
  },
  { id: "u-1", role: "user", text: "What is the overall confidence score?" },
  {
    id: "a-1",
    role: "assistant",
    text: `The overall confidence score for this dataset is ${confidenceScore}%, based on rolling quality and access reliability metrics.`,
  },
  { id: "u-2", role: "user", text: "Is the data fresh?" },
  {
    id: "a-2",
    role: "assistant",
    text: `Yes - Freshness is rated at ${freshnessScore}%, meeting SLA with automated anomaly gating.`,
  },
  { id: "u-3", role: "user", text: "Can I get raw data samples?" },
  {
    id: "a-3",
    role: "assistant",
    text: `Sorry, I can only share metadata and summaries for ${datasetTitle}. Raw data access requires approval through the "Request Access" button.`,
  },
];

const pagePanelClass =
  "relative overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/55 shadow-[0_30px_95px_rgba(2,6,23,0.48)] ring-1 ring-inset ring-white/8 backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))]";
const surfaceCardClass =
  "relative overflow-hidden rounded-[26px] border border-white/10 bg-slate-950/40 shadow-[0_20px_45px_rgba(2,6,23,0.22),inset_0_1px_0_rgba(255,255,255,0.05)] ring-1 ring-inset ring-white/5 backdrop-blur-xl";
const sectionEyebrowClass =
  "text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/75";

export default function DatasetQualityBreakdownPage() {
  const { id } = useParams();
  const routeDataset = getDatasetDetailById(id);
  const routeQualityPreview = getDatasetQualityPreviewById(id);
  const dataset = routeDataset ?? Object.values(DATASET_DETAILS)[0];
  const qualityPreview =
    routeQualityPreview ?? Object.values(DATASET_QUALITY_PREVIEW_BY_ID)[0];
  const ollamaConfig = getOllamaConfig();
  const schemaRows = schemaRowsByDataset[dataset.id] ?? qualityPreview.schemaRows;
  const previewDecision = decisionLabel(dataset.preview.decision);

  const [showConfidence, setShowConfidence] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
    buildInitialChatMessages(
      dataset.title,
      dataset.confidenceScore,
      dataset.quality.freshnessScore,
    ),
  );
  const [chatInput, setChatInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [chatNotice, setChatNotice] = useState("");
  const [schemaSearch, setSchemaSearch] = useState("");
  const [schemaRiskFilter, setSchemaRiskFilter] = useState<"all" | SchemaRisk>(
    "all",
  );
  const [schemaAccessFilter, setSchemaAccessFilter] = useState<
    "all" | SchemaAccess
  >("all");
  const [schemaResidencyFilter, setSchemaResidencyFilter] = useState<
    "all" | SchemaResidency
  >("all");
  const [schemaSort, setSchemaSort] = useState<SchemaSort>("risk-desc");
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const datasetSnapshot = useMemo(() => {
    const licenseNote =
      dataset.access.allowedUsage.find((note) =>
        note.toLowerCase().includes("derived works"),
      ) ??
      dataset.access.allowedUsage[0] ??
      "Governed use only";

    return [
      {
        label: "Provider posture",
        value: dataset.contributorTrust,
        detail: dataset.contributionHistory,
      },
      {
        label: "Source network",
        value: qualityPreview.sourceNetwork,
        detail: "Curated through verified contributor pipelines.",
      },
      {
        label: "Geography",
        value: qualityPreview.geographyLabel,
        detail: "Cross-provider metadata is harmonized before preview.",
      },
      {
        label: "Coverage window",
        value: qualityPreview.coverageWindow,
        detail: "Preview shows window-level metadata only.",
      },
      {
        label: "Record volume",
        value: dataset.recordCount,
        detail: `${dataset.size} footprint in managed storage.`,
      },
      {
        label: "Update cadence",
        value: dataset.preview.freshnessLabel,
        detail: dataset.quality.freshnessNote,
      },
      {
        label: "Access model",
        value: "Free preview -> paid clean room",
        detail:
          dataset.access.instructions[0] ??
          "Governed workspace access required.",
      },
      {
        label: "Usage rights",
        value: licenseNote,
        detail: dataset.access.usageLimits,
      },
    ];
  }, [dataset, qualityPreview]);

  const freePreviewItems = useMemo(
    () => [
      `AI summary and confidence signal for ${dataset.title}`,
      "Schema field names, types, risk labels, and residency requirements",
      `Protected record-count range: ${dataset.preview.recordCountRange}`,
      "Metadata-only inspection with no raw rows or direct exports",
    ],
    [dataset.preview.recordCountRange, dataset.title],
  );

  const paidEvaluationItems = useMemo(
    () => [
      "Governed clean-room workspace with protected query execution",
      "Policy-scoped access to deeper samples, joins, and derived outputs",
      dataset.access.usageLimits,
      dataset.access.instructions[1] ??
        "Scoped credentials and activity logging included",
    ],
    [dataset.access.instructions, dataset.access.usageLimits],
  );

  const explainThisItems = useMemo(
    () => [
      {
        eyebrow: "Confidence",
        label: `${dataset.confidenceScore}% confidence`,
        toneClass: "text-cyan-100",
        description:
          "Weighted from completeness, freshness, structural consistency, contributor trust, and access reliability. Higher scores suggest the preview should hold up well in governed evaluation.",
      },
      {
        eyebrow: "Schema Risk",
        label: "Tier 1 Safe",
        toneClass: "text-emerald-200",
        description: schemaRiskMeta.safe.description,
      },
      {
        eyebrow: "Schema Risk",
        label: "Gray Zone",
        toneClass: "text-amber-200",
        description: schemaRiskMeta.gray.description,
      },
      {
        eyebrow: "Access Control",
        label: "Restricted",
        toneClass: "text-red-200",
        description: schemaAccessMeta.restricted.description,
      },
    ],
    [dataset.confidenceScore],
  );

  const suggestedPrompts = useMemo(
    () => [
      {
        section: "Confidence",
        prompt: `Why is the confidence score ${dataset.confidenceScore}%?`,
      },
      {
        section: "Schema",
        prompt: "Which fields are restricted in this preview?",
      },
      { section: "Risk", prompt: "What does Gray Zone mean for this dataset?" },
      { section: "Freshness", prompt: "How fresh is this dataset right now?" },
    ],
    [dataset.confidenceScore],
  );

  const filteredSchemaRows = useMemo(() => {
    const normalizedSearch = schemaSearch.trim().toLowerCase();
    const filtered = schemaRows.filter((row) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          row.field,
          row.type,
          row.sampleValue,
          schemaRiskMeta[row.risk].label,
          schemaAccessMeta[row.access].label,
          schemaResidencyMeta[row.residency],
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesRisk =
        schemaRiskFilter === "all" || row.risk === schemaRiskFilter;
      const matchesAccess =
        schemaAccessFilter === "all" || row.access === schemaAccessFilter;
      const matchesResidency =
        schemaResidencyFilter === "all" ||
        row.residency === schemaResidencyFilter;

      return matchesSearch && matchesRisk && matchesAccess && matchesResidency;
    });

    const sorted = [...filtered];
    sorted.sort((left, right) => {
      if (schemaSort === "field-asc")
        return left.field.localeCompare(right.field);
      if (schemaSort === "null-desc")
        return right.nullPercent - left.nullPercent;
      if (schemaSort === "access-asc")
        return (
          schemaAccessMeta[left.access].sortRank -
          schemaAccessMeta[right.access].sortRank
        );
      return (
        schemaRiskMeta[right.risk].sortRank - schemaRiskMeta[left.risk].sortRank
      );
    });

    return sorted;
  }, [
    schemaAccessFilter,
    schemaResidencyFilter,
    schemaRiskFilter,
    schemaRows,
    schemaSearch,
    schemaSort,
  ]);

  const schemaSummary = useMemo(
    () => ({
      total: schemaRows.length,
      highRisk: schemaRows.filter((row) => row.risk === "high").length,
      grayZone: schemaRows.filter((row) => row.risk === "gray").length,
      compliance: 94,
    }),
    [schemaRows],
  );

  useEffect(() => {
    setShowConfidence(true);
    setChatInput("");
    setIsThinking(false);
    setChatNotice("");
    setChatMessages(
      buildInitialChatMessages(
        dataset.title,
        dataset.confidenceScore,
        dataset.quality.freshnessScore,
      ),
    );
    setSchemaSearch("");
    setSchemaRiskFilter("all");
    setSchemaAccessFilter("all");
    setSchemaResidencyFilter("all");
    setSchemaSort("risk-desc");
  }, [dataset]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
  }, [chatMessages, isThinking]);

  const getMockReply = (input: string) => {
    const value = input.toLowerCase();
    if (value.includes("gray zone")) {
      return "Gray Zone fields are analytically useful but potentially sensitive in combination, so the free preview keeps them aggregated until governance review is complete.";
    }
    if (value.includes("restricted")) {
      return "Restricted fields are blocked from the free preview. They require paid clean-room controls, explicit approval, and full audit logging before they can be evaluated.";
    }
    if (
      value.includes("tier 1") ||
      (value.includes("safe") && value.includes("field"))
    ) {
      return "Tier 1 Safe means the field metadata clears policy checks and can be shown in the preview without exposing sensitive values or row-level data.";
    }
    if (
      value.includes("masked") ||
      value.includes("hidden") ||
      value.includes("raw row")
    ) {
      return `Sensitive values are intentionally masked in this free preview. You can inspect schema shape, risk labels, and protected record-count ranges like ${dataset.preview.recordCountRange}, but raw rows stay unavailable until governed access is approved.`;
    }
    if (value.includes("confidence")) {
      return `Current confidence is ${dataset.confidenceScore}%, combining completeness (${dataset.quality.completeness}%), freshness (${dataset.quality.freshnessScore}%), consistency (${dataset.quality.consistency}%), and structure quality (${dataset.preview.structureQuality}%) with contributor and access reliability checks.`;
    }
    if (value.includes("fresh") || value.includes("update")) {
      return `Freshness is ${dataset.quality.freshnessScore}% and latest update is ${dataset.lastUpdated}. ${dataset.quality.freshnessNote}`;
    }
    if (value.includes("raw") || value.includes("sample")) {
      return "I can only share metadata and summaries here. Raw rows are protected and require approved secure access.";
    }
    if (
      value.includes("domain") ||
      value.includes("cover") ||
      value.includes("category")
    ) {
      return `This dataset is in ${dataset.category} and focuses on: ${dataset.description}`;
    }
    return "Fallback assistant: I can help with confidence score, freshness, consistency, access model, and high-level coverage details.";
  };

  const handleSendChatMessage = (inputOverride?: string) => {
    if (isThinking) return;

    const trimmed = (inputOverride ?? chatInput).trim();
    if (!trimmed) return;

    const history = chatMessages;
    setChatMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: trimmed },
    ]);
    setChatInput("");
    setChatNotice(`Asking Ollama (${ollamaConfig.model})...`);
    setIsThinking(true);

    askDatasetAssistant(trimmed, dataset, history)
      .then((reply) => {
        setChatMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: "assistant", text: reply },
        ]);
        setChatNotice(`Connected to Ollama at ${ollamaConfig.baseUrl}`);
      })
      .catch(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            text: getMockReply(trimmed),
          },
        ]);
        setChatNotice(
          "Ollama unavailable right now. Falling back to local metadata replies.",
        );
      })
      .finally(() => {
        setIsThinking(false);
      });
  };

  if (!routeDataset || !routeQualityPreview) {
    return (
      <DatasetUnavailableState
        contextLabel="Quality Breakdown"
        detail="Redoubt could not find the dataset tied to this quality preview route. Return to Dataset Discovery and reopen the dataset before reviewing schema and governance signals."
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-10%] top-1/4 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1680px] px-6 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-20 xl:px-16">
        <div className="space-y-20 sm:space-y-24 lg:space-y-32">
          <section
            className={`${pagePanelClass} px-10 py-10 sm:px-12 sm:py-12 lg:px-16 lg:py-16`}
          >
            <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-5xl space-y-6">
                <div className="text-sm text-slate-400">
                  <Link
                    to="/datasets"
                    className="hover:text-white transition-colors"
                  >
                    Datasets
                  </Link>
                  <span className="mx-2 text-slate-600">/</span>
                  <Link
                    to={`/datasets/${dataset.id}`}
                    className="hover:text-white transition-colors"
                  >
                    {dataset.title}
                  </Link>
                  <span className="mx-2 text-slate-600">/</span>
                  <span className="text-slate-200">Quality Breakdown</span>
                </div>
                <div className="space-y-5">
                  <h1 className="max-w-5xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.9rem] lg:leading-[1.05]">
                    Quality Breakdown for {dataset.title}
                  </h1>
                  <p className="max-w-3xl text-base leading-8 text-slate-300 sm:text-lg sm:leading-8">
                    Signal-by-signal view of the checks backing the confidence
                    score and AI-generated summary.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
                  Free metadata preview
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 xl:max-w-[430px] xl:justify-end">
                <Link
                  to={`/datasets/${dataset.id}/escrow-checkout`}
                  className="inline-flex items-center rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-6 py-3.5 text-sm font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/20"
                >
                  Start Clean-Room Evaluation
                </Link>
                <Link
                  to={`/datasets/${dataset.id}/rights-quote`}
                  className="inline-flex items-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-3.5 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/15"
                >
                  Compare Paid Options
                </Link>
                <Link
                  to={`/datasets/${dataset.id}`}
                  className="inline-flex items-center px-4 py-2 text-sm text-slate-300 transition-colors hover:text-white"
                >
                  Back to Dataset Detail
                </Link>
              </div>
            </div>
          </section>

          <section className="space-y-8 lg:space-y-10">
            <div className="space-y-4 border-b border-white/8 pb-5">
              <p className={sectionEyebrowClass}>Quality Signals</p>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Core Quality Metrics
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-4 xl:gap-9">
              <div
                className={`${pagePanelClass} min-h-[260px] p-8 lg:min-h-[280px] lg:p-9`}
              >
                <div className="flex h-full flex-col justify-between space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-300">
                      Completeness
                    </span>
                    <span className="text-2xl font-semibold text-white">
                      {dataset.quality.completeness}%
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2.5 w-full rounded-full bg-slate-700/70">
                      <div
                        className={`h-2.5 rounded-full ${qualityColor(dataset.quality.completeness)}`}
                        style={{ width: `${dataset.quality.completeness}%` }}
                      />
                    </div>
                    <p className="text-sm leading-7 text-slate-400">
                      {qualityPreview.completenessNarrative}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`${pagePanelClass} min-h-[260px] p-8 lg:min-h-[280px] lg:p-9`}
              >
                <div className="flex h-full flex-col justify-between space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-300">
                      Data Freshness
                    </span>
                    <span className="text-2xl font-semibold text-white">
                      {dataset.quality.freshnessScore}%
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2.5 w-full rounded-full bg-slate-700/70">
                      <div
                        className={`h-2.5 rounded-full ${qualityColor(dataset.quality.freshnessScore)}`}
                        style={{ width: `${dataset.quality.freshnessScore}%` }}
                      />
                    </div>
                    <p className="text-sm leading-7 text-slate-400">
                      {dataset.quality.freshnessNote}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`${pagePanelClass} min-h-[260px] p-8 lg:min-h-[280px] lg:p-9`}
              >
                <div className="flex h-full flex-col justify-between space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-300">
                      Consistency
                    </span>
                    <span className="text-2xl font-semibold text-white">
                      {dataset.quality.consistency}%
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2.5 w-full rounded-full bg-slate-700/70">
                      <div
                        className={`h-2.5 rounded-full ${qualityColor(dataset.quality.consistency)}`}
                        style={{ width: `${dataset.quality.consistency}%` }}
                      />
                    </div>
                    <p className="text-sm leading-7 text-slate-400">
                      {qualityPreview.consistencyNarrative}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`${pagePanelClass} min-h-[260px] p-8 lg:min-h-[280px] lg:p-9`}
              >
                <div className="flex h-full flex-col justify-between space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-slate-300">
                      Validation Status
                    </span>
                    <span className="rounded-full border border-green-400/40 bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-200">
                      {dataset.quality.validationStatus}
                    </span>
                  </div>
                  <p className="text-sm leading-7 text-slate-400">
                    {qualityPreview.validationNarrative}
                  </p>
                  <div className="pt-2 text-sm font-medium text-slate-300">
                    Escalations: {qualityPreview.escalationStatus}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-8 lg:space-y-10">
            <div className="space-y-4 border-b border-white/8 pb-5">
              <p className={sectionEyebrowClass}>Decision Support</p>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Preview Positioning
              </h2>
            </div>

            <div className="space-y-10 lg:space-y-12">
              <section className={`${pagePanelClass} p-10 lg:p-12`}>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold tracking-tight text-white">
                      Dataset Snapshot
                    </h3>
                    <p className="max-w-2xl text-sm leading-7 text-slate-400">
                      Fast context on source posture, coverage, cadence, and
                      access shape before deeper evaluation.
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${previewDecision.classes}`}
                  >
                    {previewDecision.text}
                  </span>
                </div>

                <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-4">
                  {datasetSnapshot.map((item) => (
                    <article
                      key={item.label}
                      className={`${surfaceCardClass} flex min-h-[220px] flex-col justify-between p-7 lg:p-8`}
                    >
                      <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                        {item.label}
                      </p>
                      <p
                        className={`mt-4 font-semibold text-white ${
                          item.label === "Source network"
                            ? "text-sm leading-7 break-words"
                            : "text-base leading-8"
                        }`}
                      >
                        {item.value}
                      </p>
                      <p className="mt-4 text-sm leading-7 text-slate-400">
                        {item.detail}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section
                className={`${pagePanelClass} bg-gradient-to-br from-slate-900/80 via-slate-900/65 to-cyan-950/20 p-10 lg:p-12`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold tracking-tight text-white">
                      Free Preview vs Paid Evaluation
                    </h3>
                    <p className="max-w-xl text-sm leading-7 text-slate-400">
                      Show users exactly what they can inspect now and what
                      unlocks in the governed clean-room path.
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-100">
                    Decision support
                  </span>
                </div>

                <div className="mt-10 grid items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] xl:gap-8">
                  <div
                    className={`${surfaceCardClass} flex flex-col p-7 lg:p-8`}
                  >
                    <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      Included now
                    </p>
                    <ul className="mt-5 divide-y divide-white/6">
                      {freePreviewItems.map((item) => (
                        <li
                          key={item}
                          className="flex gap-4 py-5 first:pt-0 last:pb-0"
                        >
                          <span className="mt-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/10 ring-1 ring-inset ring-cyan-400/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/80" />
                          </span>
                          <span className="text-sm leading-7 text-slate-200">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="hidden xl:block w-px rounded-full bg-gradient-to-b from-transparent via-white/12 to-transparent" />

                  <div className="flex flex-col rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl lg:p-8">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-200">
                      Unlock with paid clean-room evaluation
                    </p>
                    <ul className="mt-5 divide-y divide-emerald-500/10">
                      {paidEvaluationItems.map((item) => (
                        <li
                          key={item}
                          className="flex gap-4 py-5 first:pt-0 last:pb-0"
                        >
                          <span className="mt-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/10 ring-1 ring-inset ring-emerald-400/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/80" />
                          </span>
                          <span className="text-sm leading-7 text-slate-100">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-10 border-t border-white/10 pt-8">
                  <div className={`${surfaceCardClass} p-7 lg:p-8`}>
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">
                          Recommended next step
                        </p>
                        <p className="mt-2 text-xs leading-6 text-slate-400">
                          Review preview-safe schema and risk posture here,
                          compare paid access scopes if you need commercial or
                          policy clarity, then start clean-room evaluation when
                          you need governed access to protected rows or derived
                          outputs.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-300">
                          <span className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1.5">
                            1. Validate preview fit
                          </span>
                          <span className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1.5">
                            2. Compare paid scopes
                          </span>
                          <span className="rounded-full border border-white/10 bg-slate-900/60 px-3 py-1.5">
                            3. Start governed evaluation
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Link
                          to={`/datasets/${dataset.id}/escrow-checkout`}
                          className="inline-flex items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-6 py-3.5 text-sm font-semibold text-emerald-100 transition-colors hover:bg-emerald-500/20"
                        >
                          Start Clean-Room Evaluation
                        </Link>
                        <Link
                          to={`/datasets/${dataset.id}/rights-quote`}
                          className="inline-flex items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-3.5 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/20"
                        >
                          Compare Paid Options
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </section>

          <section className="space-y-8 lg:space-y-10">
            <div className="space-y-4 border-b border-white/8 pb-5">
              <p className={sectionEyebrowClass}>AI Review</p>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Interpretation And Confidence
              </h2>
            </div>

            <div className="grid gap-10 xl:grid-cols-[0.94fr_1.06fr]">
              <div className={`${pagePanelClass} flex flex-col p-10 lg:p-12`}>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-2xl font-semibold tracking-tight text-white">
                    AI Insight
                  </h3>
                  <span className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-200">
                    AI Evaluation Powered by Ollama
                  </span>
                </div>
                <div className={`${surfaceCardClass} mt-8 p-6 lg:p-7`}>
                  <p className="text-sm leading-7 text-slate-200">
                    {dataset.preview.aiSummary}
                  </p>
                  <p className="mt-3 text-xs leading-6 text-slate-400">
                    Grounded only in preview-safe metadata: confidence,
                    freshness, schema risk labels, and access policy signals.
                  </p>
                </div>
                <div className="mt-8 space-y-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Suggested questions
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedPrompts.map((item) => (
                      <button
                        key={item.prompt}
                        type="button"
                        onClick={() => handleSendChatMessage(item.prompt)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-3.5 py-2.5 text-left text-xs text-slate-200 transition-colors hover:border-cyan-500/40 hover:text-white"
                      >
                        <span className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                          {item.section}
                        </span>
                        <span>{item.prompt}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-8 overflow-hidden rounded-[28px] border border-cyan-500/15 bg-slate-900/60 shadow-[0_0_0_1px_rgba(56,189,248,0.12),0_0_40px_rgba(56,189,248,0.08)]">
                  <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Ask AI about this dataset
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Best for quick questions about confidence, hidden
                        fields, and access controls.
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Model: {ollamaConfig.model}
                    </span>
                  </div>

                  <div
                    ref={chatContainerRef}
                    className="h-[320px] overflow-y-auto px-7 py-6 space-y-4"
                  >
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed border ${
                            message.role === "user"
                              ? "border-blue-500/40 bg-blue-600/20 text-blue-100"
                              : "border-white/10 bg-slate-800/90 text-slate-200"
                          }`}
                        >
                          {message.role === "assistant" && (
                            <div className="mb-1 text-[10px] uppercase tracking-[0.12em] text-slate-400">
                              Dataset Assistant
                            </div>
                          )}
                          {message.text}
                        </div>
                      </div>
                    ))}
                    {isThinking && (
                      <div className="flex justify-start">
                        <div className="max-w-[90%] rounded-2xl border border-white/10 bg-slate-800/90 px-4 py-3 text-sm text-slate-300">
                          AI is thinking...
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 border-t border-white/10 px-6 py-5">
                    {chatNotice && (
                      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                        {chatNotice}
                      </div>
                    )}
                    <div className="rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-xs text-slate-400">
                      Sensitive values stay masked here. The assistant can
                      reference preview-safe schema signals, but not raw rows or
                      direct exports.
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSendChatMessage();
                          }
                        }}
                        placeholder="Ask about confidence, hidden fields, or access policy..."
                        className="flex-1 rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSendChatMessage()}
                        disabled={isThinking}
                        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
                <p className="mt-5 text-xs leading-6 text-slate-400">
                  Chat uses your local Ollama endpoint at {ollamaConfig.baseUrl}
                  . If Ollama is unavailable, this panel falls back to
                  deterministic metadata replies.
                </p>
              </div>

              <div className={`${pagePanelClass} flex flex-col p-10 lg:p-12`}>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-2xl font-semibold tracking-tight text-white">
                    AI Confidence Engine
                  </h3>
                  <button
                    className="text-xs font-medium text-blue-300 transition-colors hover:text-white"
                    onClick={() => setShowConfidence((prev) => !prev)}
                  >
                    {showConfidence ? "Hide" : "Show"}
                  </button>
                </div>

                {showConfidence && (
                  <div className="mt-8 flex-1 space-y-7">
                    <div className={`${surfaceCardClass} p-7`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm text-slate-300">
                            Confidence Level
                          </div>
                          <div className="mt-2 flex items-baseline gap-2">
                            <div className="text-5xl font-bold text-white">
                              {dataset.confidenceScore}%
                            </div>
                            <div className="text-xs text-slate-500">
                              overall
                            </div>
                          </div>
                        </div>
                        <span
                          title="Confidence is a weighted rollup of completeness, freshness, structural consistency, contributor trust, and access reliability."
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${confidenceLevel(dataset.confidenceScore).classes}`}
                        >
                          {confidenceLevel(dataset.confidenceScore).label}
                        </span>
                      </div>

                      <div className="mt-7">
                        <div className="h-5 w-full overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400"
                            style={{ width: `${dataset.confidenceScore}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                      </div>

                      <div className="mt-8 grid grid-cols-3 gap-4">
                        {[
                          {
                            label: "Freshness",
                            value: dataset.quality.freshnessScore,
                          },
                          {
                            label: "Consistency",
                            value: dataset.quality.consistency,
                          },
                          {
                            label: "Structure",
                            value: dataset.preview.structureQuality,
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-xl border border-white/10 bg-slate-950/40 p-4 text-center"
                          >
                            <div className="text-xs text-slate-400">
                              {item.label}
                            </div>
                            <div className="mt-2 text-lg font-bold text-white">
                              {item.value}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <details className={`${surfaceCardClass} p-6`}>
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-semibold text-white">
                            Explain this score and labels
                          </div>
                          <p className="mt-1 text-xs leading-6 text-slate-400">
                            Inline guidance for confidence, Tier 1 Safe, Gray
                            Zone, and Restricted labels used across this page.
                          </p>
                        </div>
                        <span className="text-xs font-medium text-cyan-200">
                          Open guide
                        </span>
                      </summary>
                      <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {explainThisItems.map((item) => (
                          <article
                            key={item.label}
                            className="rounded-xl border border-white/10 bg-slate-950/40 p-4"
                          >
                            <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                              {item.eyebrow}
                            </p>
                            <p
                              className={`mt-2 text-sm font-semibold ${item.toneClass}`}
                            >
                              {item.label}
                            </p>
                            <p className="mt-2 text-xs leading-6 text-slate-400">
                              {item.description}
                            </p>
                          </article>
                        ))}
                      </div>
                    </details>

                    <div className={`${surfaceCardClass} p-6 space-y-3`}>
                      <div className="text-sm font-semibold text-white">
                        AI evaluation summary
                      </div>
                      <p className="text-sm leading-7 text-slate-300">
                        {dataset.preview.aiSummary}
                      </p>
                    </div>

                    <div className={`${surfaceCardClass} p-6 space-y-3`}>
                      <div className="text-sm font-semibold text-white">
                        Risk flags
                      </div>
                      {dataset.preview.riskFlags.length === 0 ? (
                        <div className="text-sm text-green-200">
                          No active risks detected in preview checks.
                        </div>
                      ) : (
                        <ul className="list-inside list-disc space-y-2 text-sm text-amber-200">
                          {dataset.preview.riskFlags.map((flag) => (
                            <li key={flag}>{flag}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className={`${surfaceCardClass} p-6 space-y-4`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">
                          Preview safety
                        </span>
                        <span className="text-xs text-slate-400">
                          Sensitive values masked
                        </span>
                      </div>
                      <p className="text-sm leading-7 text-slate-300">
                        Sensitive values are intentionally masked in free
                        preview. You can inspect schema shape, risk labels, and
                        protected count ranges here, while raw rows and direct
                        exports unlock only inside governed clean-room
                        evaluation.
                      </p>
                      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-xs">
                        <span className="text-slate-400">
                          Record count range
                        </span>
                        <span className="text-slate-200">
                          {dataset.preview.recordCountRange}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-8 lg:space-y-10">
            <div className="space-y-4 border-b border-white/8 pb-5">
              <p className={sectionEyebrowClass}>Governance Preview</p>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Schema And Access Signals
              </h2>
            </div>

            <details open className={`${pagePanelClass} overflow-hidden`}>
              <summary className="flex cursor-pointer select-none items-center justify-between px-10 py-8 lg:px-12 lg:py-9">
                <div>
                  <div className="text-lg font-semibold text-white">
                    Schema Preview
                  </div>
                  <div className="mt-1 text-sm text-slate-400">
                    Search, filter, and sort preview-safe schema signals
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  Sensitive values masked in free preview
                </span>
              </summary>
              <div className="border-t border-white/10 bg-slate-900/35 px-10 py-10 lg:px-12 lg:py-12">
                <div className="mb-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,0.82fr))]">
                    <label className="block">
                      <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-slate-500">
                        Search
                      </span>
                      <input
                        type="search"
                        value={schemaSearch}
                        onChange={(event) =>
                          setSchemaSearch(event.target.value)
                        }
                        placeholder="Field, type, risk, access, residency..."
                        className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-slate-500">
                        Risk
                      </span>
                      <select
                        value={schemaRiskFilter}
                        onChange={(event) =>
                          setSchemaRiskFilter(
                            event.target.value as "all" | SchemaRisk,
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="all">All risk levels</option>
                        <option value="high">High risk only</option>
                        <option value="gray">Gray zone only</option>
                        <option value="safe">Tier 1 safe only</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-slate-500">
                        Access
                      </span>
                      <select
                        value={schemaAccessFilter}
                        onChange={(event) =>
                          setSchemaAccessFilter(
                            event.target.value as "all" | SchemaAccess,
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="all">All access tiers</option>
                        <option value="restricted">Restricted</option>
                        <option value="aggregated">Aggregated only</option>
                        <option value="metadata">Metadata only</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-slate-500">
                        Residency
                      </span>
                      <select
                        value={schemaResidencyFilter}
                        onChange={(event) =>
                          setSchemaResidencyFilter(
                            event.target.value as "all" | SchemaResidency,
                          )
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="all">All residency rules</option>
                        <option value="local">Local hosting required</option>
                        <option value="global">Global transfer cleared</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-slate-500">
                        Sort
                      </span>
                      <select
                        value={schemaSort}
                        onChange={(event) =>
                          setSchemaSort(event.target.value as SchemaSort)
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="risk-desc">Risk severity</option>
                        <option value="field-asc">Field name</option>
                        <option value="null-desc">Highest null %</option>
                        <option value="access-asc">Access tier</option>
                      </select>
                    </label>
                  </div>
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-400">
                      {filteredSchemaRows.length} visible
                    </span>
                    <span className="mx-2 text-slate-600">•</span>
                    <span className="text-slate-400">
                      {schemaSummary.total} fields scanned
                    </span>
                    <span className="mx-2 text-slate-600">•</span>
                    <span className="text-emerald-300 font-medium">
                      Overall Compliance: {schemaSummary.compliance}%
                    </span>
                  </div>
                </div>

                <div className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-50">
                  <span className="font-semibold">
                    Sensitive values are intentionally masked in free preview.
                  </span>{" "}
                  <span className="text-slate-300">
                    This table exposes structure, risk, access, and residency
                    only. Raw rows and direct exports require paid clean-room
                    controls.
                  </span>
                </div>

                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-xs flex-wrap">
                    <span className="text-slate-400 font-medium">
                      Risk Legend:
                    </span>
                    {(["safe", "gray", "high"] as const).map((risk) => (
                      <span
                        key={risk}
                        title={schemaRiskMeta[risk].description}
                        className="inline-flex items-center gap-1.5"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${schemaRiskMeta[risk].dotClass}`}
                        />
                        <span
                          className={
                            risk === "safe"
                              ? "text-emerald-200"
                              : risk === "gray"
                                ? "text-amber-200"
                                : "text-red-200"
                          }
                        >
                          {schemaRiskMeta[risk].label}
                        </span>
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-400">
                      {schemaSummary.total} fields scanned
                    </span>
                    <span className="mx-2 text-slate-600">•</span>
                    <span className="text-red-300">
                      {schemaSummary.highRisk} High Risk
                    </span>
                    <span className="mx-2 text-slate-600">•</span>
                    <span className="text-amber-300">
                      {schemaSummary.grayZone} Gray Zone
                    </span>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
                  <div className="max-h-[40rem] overflow-auto">
                    <table className="min-w-full text-xs">
                      <thead className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/95 text-[10px] uppercase tracking-[0.1em] text-slate-400 backdrop-blur">
                        <tr>
                          <th className="py-4 pr-3 pl-5 text-left font-medium">
                            Field
                          </th>
                          <th className="px-3 py-4 text-left font-medium">
                            Type
                          </th>
                          <th className="px-3 py-4 text-left font-medium">
                            Sample Value
                          </th>
                          <th className="px-3 py-4 text-left font-medium">
                            Compliance & PII
                          </th>
                          <th className="px-3 py-4 text-left font-medium">
                            Access Level Required
                          </th>
                          <th className="px-3 py-4 text-left font-medium">
                            Residency
                          </th>
                          <th className="pr-5 pl-3 py-4 text-left font-medium">
                            Null %
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredSchemaRows.map((row) => (
                          <tr
                            key={row.field}
                            className="hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="py-4 pr-3 pl-5 text-white font-mono">
                              {row.field}
                            </td>
                            <td className="px-3 py-4 text-slate-300">
                              {row.type}
                            </td>
                            <td className="px-3 py-4 text-slate-300 font-mono">
                              {row.sampleValue}
                            </td>
                            <td className="px-3 py-4">
                              <span
                                title={schemaRiskMeta[row.risk].description}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium ${schemaRiskMeta[row.risk].badgeClass}`}
                              >
                                {schemaRiskMeta[row.risk].label}
                              </span>
                            </td>
                            <td className="px-3 py-4">
                              <span
                                title={schemaAccessMeta[row.access].description}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium ${schemaAccessMeta[row.access].badgeClass}`}
                              >
                                {schemaAccessMeta[row.access].label}
                              </span>
                            </td>
                            <td
                              className={`px-3 py-4 ${row.residency === "local" ? "text-amber-300" : "text-slate-300"}`}
                            >
                              {schemaResidencyMeta[row.residency]}
                            </td>
                            <td className="pr-5 pl-3 py-4 text-slate-300">
                              {row.nullPercent.toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {filteredSchemaRows.length === 0 && (
                  <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-slate-900/40 px-4 py-8 text-center">
                    <p className="text-sm font-semibold text-white">
                      No schema fields match the current filters.
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Try clearing one or more filters to inspect the full
                      preview-safe schema again.
                    </p>
                  </div>
                )}
              </div>
            </details>
          </section>
        </div>
      </div>
    </div>
  );
}
