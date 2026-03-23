const fs = require("fs");
const path = require("path");
const PptxGenJS = require("pptxgenjs");

const {
  warnIfSlideHasOverlaps,
  warnIfSlideElementsOutOfBounds,
} = require("./pptxgenjs_helpers/layout");
const { imageSizingContain } = require("./pptxgenjs_helpers/image");

const OUT_FILE = path.join(__dirname, "Redoubt_Pitch_Deck.pptx");
const ASSET_DIR = path.join(__dirname, "assets");

const IMAGES = {
  landing: path.join(ASSET_DIR, "landing.png"),
  dashboard: path.join(ASSET_DIR, "dashboard.png"),
  onboarding: path.join(ASSET_DIR, "onboarding.png"),
  compliance: path.join(ASSET_DIR, "compliance.png"),
};

const COLORS = {
  bg: "040B1A",
  panel: "0B1730",
  panelSoft: "0F2140",
  accent: "17B7FF",
  accent2: "23D3EE",
  good: "22C55E",
  warn: "F59E0B",
  text: "E7EEF9",
  muted: "A9BCD8",
  line: "1E335D",
  white: "FFFFFF",
  dark: "061226",
};

const TOTAL_SLIDES = 12;

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Redoubt";
pptx.company = "Redoubt";
pptx.subject = "Investor Pitch Deck";
pptx.title = "Redoubt Pitch Deck";
pptx.lang = "en-US";
pptx.theme = {
  headFontFace: "Segoe UI",
  bodyFontFace: "Segoe UI",
  lang: "en-US",
};

function addBg(slide) {
  slide.background = { color: COLORS.bg };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.18,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent, transparency: 100 },
  });
}

function addHeader(slide, title, subtitle) {
  slide.addText(title, {
    x: 0.55,
    y: 0.35,
    w: 8.8,
    h: 0.5,
    fontFace: "Segoe UI",
    bold: true,
    color: COLORS.white,
    fontSize: 27,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.55,
      y: 0.88,
      w: 9.8,
      h: 0.3,
      fontFace: "Segoe UI",
      color: COLORS.muted,
      fontSize: 12,
    });
  }
  slide.addShape(pptx.ShapeType.line, {
    x: 0.55,
    y: 1.24,
    w: 12.2,
    h: 0,
    line: { color: COLORS.line, pt: 1 },
  });
}

function addFooter(slide, page) {
  slide.addShape(pptx.ShapeType.line, {
    x: 0.55,
    y: 7.15,
    w: 12.2,
    h: 0,
    line: { color: COLORS.line, pt: 1 },
  });
  slide.addText("Redoubt Confidential | Repo-based prototype deck | March 2026", {
    x: 0.55,
    y: 7.2,
    w: 8.8,
    h: 0.2,
    fontSize: 9,
    color: "7D93B5",
  });
  slide.addText(`${page}/${TOTAL_SLIDES}`, {
    x: 12.2,
    y: 7.2,
    w: 0.7,
    h: 0.2,
    fontSize: 9,
    align: "right",
    color: "7D93B5",
  });
}

function addBullets(slide, items, x, y, w, fontSize = 15, lineGap = 0.42, color = COLORS.text) {
  items.forEach((item, idx) => {
    slide.addText(item, {
      x,
      y: y + idx * lineGap,
      w,
      h: 0.32,
      fontSize,
      color,
      bullet: { indent: 16 },
      margin: 0,
    });
  });
}

function imageOrPlaceholder(slide, imagePath, x, y, w, h, label) {
  if (fs.existsSync(imagePath)) {
    slide.addImage({
      path: imagePath,
      ...imageSizingContain(imagePath, x, y, w, h),
    });
    return;
  }

  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    radius: 0.08,
    fill: { color: COLORS.panelSoft },
    line: { color: COLORS.line, pt: 1 },
  });
  slide.addText(label || "Image unavailable", {
    x: x + 0.2,
    y: y + h / 2 - 0.1,
    w: w - 0.4,
    h: 0.2,
    align: "center",
    color: COLORS.muted,
    fontSize: 11,
  });
}

function finalizeSlide(slide, pageNumber) {
  addFooter(slide, pageNumber);
  warnIfSlideHasOverlaps(slide, pptx, {
    muteContainment: true,
    ignoreLines: false,
    ignoreDecorativeShapes: false,
  });
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

// Slide 1: Cover
{
  const slide = pptx.addSlide();
  addBg(slide);

  slide.addText("REDOUBT", {
    x: 0.7,
    y: 1.05,
    w: 6.0,
    h: 0.8,
    bold: true,
    fontSize: 48,
    color: COLORS.accent2,
  });
  slide.addText("Trust-First Data Access Infrastructure", {
    x: 0.72,
    y: 1.9,
    w: 5.7,
    h: 0.35,
    fontSize: 18,
    color: COLORS.white,
  });
  slide.addText("Built for regulated industries that need verified, governed, and auditable data exchange.", {
    x: 0.72,
    y: 2.3,
    w: 6.0,
    h: 0.75,
    fontSize: 13,
    color: COLORS.muted,
  });

  addBullets(
    slide,
    [
      "Invite-only provider onboarding",
      "AI-powered dataset confidence scoring",
      "Compliance-first workflows with immutable auditability",
      "Identity-safe collaboration between buyers and providers",
    ],
    0.75,
    3.08,
    5.95,
    13,
    0.45,
    COLORS.text
  );

  const tags = ["Healthcare", "Finance", "Government"];
  tags.forEach((tag, idx) => {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.75 + idx * 1.75,
      y: 5.35,
      w: 1.55,
      h: 0.42,
      radius: 0.08,
      fill: { color: COLORS.panelSoft },
      line: { color: COLORS.accent, pt: 0.8 },
    });
    slide.addText(tag, {
      x: 0.75 + idx * 1.75,
      y: 5.47,
      w: 1.55,
      h: 0.2,
      align: "center",
      fontSize: 11,
      color: COLORS.accent2,
      bold: true,
    });
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.0,
    y: 0.9,
    w: 5.75,
    h: 5.95,
    radius: 0.08,
    fill: { color: "07162E" },
    line: { color: COLORS.line, pt: 1.2 },
  });
  imageOrPlaceholder(slide, IMAGES.landing, 7.1, 1.02, 5.55, 5.72, "Landing screen");

  slide.addText("Project stage: Prototype / investor demo", {
    x: 0.75,
    y: 6.45,
    w: 4.0,
    h: 0.25,
    fontSize: 10,
    color: COLORS.warn,
  });

  slide.addText("Prepared from repository artifacts", {
    x: 10.7,
    y: 6.45,
    w: 2.0,
    h: 0.25,
    fontSize: 10,
    color: COLORS.muted,
    align: "right",
  });

  finalizeSlide(slide, 1);
}

// Slide 2: Problem
{
  const slide = pptx.addSlide();
  addBg(slide);
  addHeader(slide, "Problem: Data Trust Breaks in Regulated Markets", "Current data marketplaces optimize for volume, not verifiable confidence.");

  slide.addText(
    "Regulated teams need high-quality data, but today they face fragmented verification, weak accountability, and high compliance risk.",
    {
      x: 0.7,
      y: 1.5,
      w: 6.2,
      h: 0.8,
      fontSize: 14,
      color: COLORS.text,
      valign: "top",
    }
  );

  addBullets(
    slide,
    [
      "Buyers spend cycles vetting dataset credibility manually",
      "Providers lack a structured mechanism to prove trustworthiness",
      "Compliance checks are often bolted on after data exchange",
      "Open listings increase exposure for sensitive providers",
    ],
    0.75,
    2.35,
    6.2,
    13,
    0.45,
    COLORS.text
  );

  const painCards = [
    ["Slow Procurement", "Security and legal teams block or delay approvals."],
    ["Opaque Quality", "No persistent confidence signal across datasets."],
    ["Audit Gaps", "Inconsistent event logging complicates compliance reviews."],
    ["Identity Risk", "Contributors may avoid participation without privacy controls."],
  ];

  painCards.forEach((card, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 7.2 + col * 2.75;
    const y = 1.6 + row * 2.15;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: 2.55,
      h: 1.85,
      radius: 0.08,
      fill: { color: COLORS.panel },
      line: { color: COLORS.line, pt: 1 },
    });
    slide.addText(card[0], {
      x: x + 0.18,
      y: y + 0.2,
      w: 2.2,
      h: 0.3,
      fontSize: 15,
      bold: true,
      color: COLORS.accent2,
    });
    slide.addText(card[1], {
      x: x + 0.18,
      y: y + 0.62,
      w: 2.2,
      h: 0.95,
      fontSize: 11,
      color: COLORS.muted,
      valign: "top",
    });
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7,
    y: 5.6,
    w: 12.0,
    h: 1.2,
    radius: 0.05,
    fill: { color: "0A1A35" },
    line: { color: COLORS.line, pt: 1 },
  });
  slide.addText(
    "Repo statement: Regulated buyers need guarantees on trustworthiness, compliance, and provider accountability - and current marketplaces do not provide them.",
    {
      x: 0.95,
      y: 5.9,
      w: 11.5,
      h: 0.8,
      fontSize: 12,
      color: COLORS.text,
      italic: true,
      valign: "top",
    }
  );

  finalizeSlide(slide, 2);
}

// Slide 3: Solution
{
  const slide = pptx.addSlide();
  addBg(slide);
  addHeader(slide, "Solution: A Trust-First Access Layer", "Redoubt inserts governance, scoring, and control between contributor and consumer.");

  const steps = [
    "Invite-only Onboarding",
    "AI Quality Validation",
    "Trust Score Assignment",
    "Audited Controlled Access",
  ];

  steps.forEach((step, idx) => {
    const x = 0.75 + idx * 3.1;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 1.75,
      w: 2.75,
      h: 0.95,
      radius: 0.08,
      fill: { color: idx % 2 === 0 ? COLORS.panel : COLORS.panelSoft },
      line: { color: COLORS.accent, pt: 0.8 },
    });
    slide.addText(`${idx + 1}. ${step}`, {
      x: x + 0.2,
      y: 2.05,
      w: 2.35,
      h: 0.4,
      fontSize: 12,
      color: COLORS.white,
      bold: true,
      align: "center",
    });

    if (idx < steps.length - 1) {
      slide.addShape(pptx.ShapeType.chevron, {
        x: x + 2.8,
        y: 2.08,
        w: 0.2,
        h: 0.28,
        fill: { color: COLORS.accent2 },
        line: { color: COLORS.accent2, pt: 0.5 },
      });
    }
  });

  const pillars = [
    ["Verification", "Provider identity and intent checks before participation."],
    ["Scoring", "Dataset confidence based on quality and anomaly signals."],
    ["Protection", "Provider anonymity and policy-driven access boundaries."],
    ["Compliance", "Audit trail, consent, and governance workflows built in."],
  ];

  pillars.forEach((pillar, idx) => {
    const x = 0.75 + idx * 3.1;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 3.15,
      w: 2.75,
      h: 2.25,
      radius: 0.08,
      fill: { color: "0A1A34" },
      line: { color: COLORS.line, pt: 1 },
    });
    slide.addText(pillar[0], {
      x: x + 0.2,
      y: 3.38,
      w: 2.35,
      h: 0.3,
      fontSize: 14,
      bold: true,
      color: COLORS.accent2,
      align: "center",
    });
    slide.addText(pillar[1], {
      x: x + 0.2,
      y: 3.78,
      w: 2.35,
      h: 1.45,
      fontSize: 11,
      color: COLORS.muted,
      valign: "top",
      align: "center",
    });
  });

  slide.addText("Positioning: Not a public marketplace. A governed confidence infrastructure for enterprise data collaboration.", {
    x: 0.75,
    y: 5.9,
    w: 12.0,
    h: 0.5,
    fontSize: 12,
    color: COLORS.text,
    bold: true,
    align: "center",
  });

  finalizeSlide(slide, 3);
}

// Slide 4: Product snapshots
{
  const slide = pptx.addSlide();
  addBg(slide);
  addHeader(slide, "Product Snapshot", "Selected screens from the current frontend prototype.");

  const cards = [
    ["Landing", IMAGES.landing, "Trust-first positioning and controlled access CTA."],
    ["Participant Dashboard", IMAGES.dashboard, "Telemetry, trust posture, escrow, and audit surfaces."],
    ["Onboarding Flow", IMAGES.onboarding, "5-step intake with identity and usage declarations."],
  ];

  cards.forEach((card, idx) => {
    const x = 0.62 + idx * 4.25;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 1.5,
      w: 4.05,
      h: 4.95,
      radius: 0.08,
      fill: { color: COLORS.panel },
      line: { color: COLORS.line, pt: 1 },
    });
    slide.addText(card[0], {
      x: x + 0.15,
      y: 1.7,
      w: 3.7,
      h: 0.25,
      fontSize: 12,
      color: COLORS.white,
      bold: true,
      align: "center",
    });
    imageOrPlaceholder(slide, card[1], x + 0.16, 2.02, 3.72, 2.58, card[0]);
    slide.addText(card[2], {
      x: x + 0.2,
      y: 4.74,
      w: 3.65,
      h: 1.25,
      fontSize: 10.5,
      color: COLORS.muted,
      align: "left",
      valign: "top",
    });
  });

  finalizeSlide(slide, 4);
}

// Slide 5: Trust and compliance
{
  const slide = pptx.addSlide();
  addBg(slide);
  addHeader(slide, "Trust, Compliance, and Deployment Model", "Operational controls surfaced directly in the product experience.");

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7,
    y: 1.55,
    w: 5.75,
    h: 4.8,
    radius: 0.08,
    fill: { color: COLORS.panel },
    line: { color: COLORS.line, pt: 1 },
  });

  slide.addText("Compliance posture visible in-product", {
    x: 0.95,
    y: 1.85,
    w: 5.25,
    h: 0.25,
    fontSize: 13,
    color: COLORS.accent2,
    bold: true,
  });

  addBullets(
    slide,
    [
      "SOC 2 Type II certified (Jan 2026)",
      "HIPAA compliance target achieved (Feb 2026)",
      "GDPR alignment marked (Dec 2025)",
      "ISO 27001 in progress (target Q3 2026)",
      "Shared-responsibility model documented",
      "Deployment options: SaaS, private cloud, on-prem",
    ],
    0.95,
    2.25,
    5.2,
    11.5,
    0.42,
    COLORS.text
  );

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.0,
    y: 1.55,
    w: 5.65,
    h: 4.8,
    radius: 0.08,
    fill: { color: COLORS.panel },
    line: { color: COLORS.line, pt: 1 },
  });
  imageOrPlaceholder(slide, IMAGES.compliance, 7.12, 1.7, 5.42, 4.52, "Compliance screen");

  finalizeSlide(slide, 5);
}

// Slide 6: Build evidence from repo
{
  const slide = pptx.addSlide();
  addBg(slide);
  addHeader(slide, "Prototype Evidence From Repository", "Depth of product surface already implemented in frontend routes and pages.");

  const stats = [
    ["53", "Page components"],
    ["52", "App routes"],
    ["28", "Workspace routes"],
    ["12", "Admin routes"],
    ["7", "Onboarding routes"],
    ["5", "Onboarding steps"],
  ];

  stats.forEach((stat, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 0.72 + col * 2.05;
    const y = 1.55 + row * 1.2;

    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: 1.85,
      h: 1.0,
      radius: 0.08,
      fill: { color: COLORS.panel },
      line: { color: COLORS.line, pt: 1 },
    });
    slide.addText(stat[0], {
      x,
      y: y + 0.18,
      w: 1.85,
      h: 0.3,
      fontSize: 22,
      color: COLORS.accent2,
      bold: true,
      align: "center",
    });
    slide.addText(stat[1], {
      x: x + 0.08,
      y: y + 0.58,
      w: 1.7,
      h: 0.24,
      fontSize: 9.5,
      color: COLORS.muted,
      align: "center",
    });
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.95,
    y: 1.65,
    w: 5.5,
    h: 2.6,
    radius: 0.08,
    fill: { color: COLORS.panel },
    line: { color: COLORS.line, pt: 1 },
  });
  slide.addText("Route distribution", {
    x: 7.15,
    y: 1.85,
    w: 2.2,
    h: 0.24,
    fontSize: 12,
    color: COLORS.accent2,
    bold: true,
  });

  const routeBars = [
    ["Onboarding", 7, COLORS.warn],
    ["Workspace", 28, COLORS.accent2],
    ["Admin", 12, COLORS.accent],
  ];
  routeBars.forEach((bar, idx) => {
    const y = 2.2 + idx * 0.62;
    const maxW = 2.9;
    const width = (bar[1] / 30) * maxW;
    slide.addText(bar[0], {
      x: 7.15,
      y: y + 0.05,
      w: 1.45,
      h: 0.2,
      fontSize: 10.5,
      color: COLORS.muted,
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.7,
      y,
      w: maxW,
      h: 0.28,
      radius: 0.06,
      fill: { color: "1A2E54" },
      line: { color: "1A2E54", transparency: 100 },
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.7,
      y,
      w: width,
      h: 0.28,
      radius: 0.06,
      fill: { color: bar[2] },
      line: { color: bar[2], transparency: 100 },
    });
    slide.addText(String(bar[1]), {
      x: 11.75,
      y: y + 0.04,
      w: 0.45,
      h: 0.2,
      fontSize: 10.5,
      color: COLORS.text,
      align: "right",
      bold: true,
    });
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.95,
    y: 4.45,
    w: 5.5,
    h: 1.92,
    radius: 0.08,
    fill: { color: COLORS.panel },
    line: { color: COLORS.line, pt: 1 },
  });
  addBullets(
    slide,
    [
      "Security modules include RBAC, red-team mode, secure enclave",
      "Compliance modules include audit trail and evidence locker",
      "Data exchange modules include escrow center and usage analytics",
      "Deployment prep documented for Vercel with SPA-safe routing",
    ],
    7.15,
    4.75,
    5.2,
    10.5,
    0.36,
    COLORS.text
  );

  finalizeSlide(slide, 6);
}

// Slide 7: Segments and value
{
  const slide = pptx.addSlide();
  addBg(slide);
  addHeader(slide, "Who Redoubt Serves", "Segment-specific value surfaced directly in solutions and workflow pages.");

  const segments = [
    ["Researchers", "Verified datasets for scientific and institutional work."],
    ["AI/ML Teams", "Confidence-scored training data and lineage visibility."],
    ["Enterprises", "Governed access, compliance evidence, and policy controls."],
    ["Data Contributors", "Controlled contribution with trust and licensing guardrails."],
  ];

  segments.forEach((segment, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 0.8 + col * 6.35;
    const y = 1.7 + row * 2.15;

    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y,
      w: 5.95,
      h: 1.85,
      radius: 0.08,
      fill: { color: COLORS.panel },
      line: { color: COLORS.line, pt: 1 },
    });
    slide.addText(segment[0], {
      x: x + 0.25,
      y: y + 0.28,
      w: 5.4,
      h: 0.3,
      fontSize: 18,
      color: COLORS.accent2,
      bold: true,
    });
    slide.addText(segment[1], {
      x: x + 0.25,
      y: y + 0.72,
      w: 5.4,
      h: 0.8,
      fontSize: 12,
      color: COLORS.text,
      valign: "top",
    });
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 6.18,
    w: 12.0,
    h: 0.7,
    radius: 0.05,
    fill: { color: "0A1A35" },
    line: { color: COLORS.line, pt: 1 },
  });
  slide.addText("Initial focus industries from README: Healthcare, Finance, and Government organizations.", {
    x: 1.0,
    y: 6.38,
    w: 11.6,
    h: 0.24,
    fontSize: 12,
    color: COLORS.text,
    align: "center",
  });

  finalizeSlide(slide, 7);
}

// Slide 8: Monetization
{
  const slide = pptx.addSlide();
  addBg(slide);
  addHeader(slide, "Monetization Model (Prototype Pricing Surface)", "Pipelines page already encodes tiered API packaging and enterprise expansion path.");

  const tiers = [
    ["Starter", "$500/mo", "1,000 API calls/month", "Basic API access"],
    ["Growth", "$2,000/mo", "10,000 API calls/month", "Priority support + integrations"],
    ["Enterprise", "Custom", "Unlimited API calls", "Dedicated support + SLA"],
  ];

  tiers.forEach((tier, idx) => {
    const x = 0.75 + idx * 4.25;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 1.75,
      w: 3.95,
      h: 2.9,
      radius: 0.08,
      fill: { color: idx === 1 ? "102448" : COLORS.panel },
      line: { color: idx === 1 ? COLORS.accent2 : COLORS.line, pt: 1.1 },
    });

    slide.addText(tier[0], {
      x: x + 0.2,
      y: 2.0,
      w: 3.5,
      h: 0.3,
      fontSize: 16,
      color: COLORS.white,
      bold: true,
      align: "center",
    });
    slide.addText(tier[1], {
      x: x + 0.2,
      y: 2.42,
      w: 3.5,
      h: 0.35,
      fontSize: 22,
      color: COLORS.accent2,
      bold: true,
      align: "center",
    });
    slide.addText(tier[2], {
      x: x + 0.2,
      y: 2.9,
      w: 3.5,
      h: 0.24,
      fontSize: 10.5,
      color: COLORS.muted,
      align: "center",
    });
    slide.addText(tier[3], {
      x: x + 0.2,
      y: 3.45,
      w: 3.5,
      h: 0.6,
      fontSize: 10.5,
      color: COLORS.text,
      align: "center",
      valign: "top",
    });
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 4.9,
    w: 6.3,
    h: 2.2,
    radius: 0.08,
    fill: { color: COLORS.panel },
    line: { color: COLORS.line, pt: 1 },
  });
  slide.addText("Included API volume by tier", {
    x: 1.02,
    y: 5.08,
    w: 3.0,
    h: 0.24,
    fontSize: 12,
    color: COLORS.accent2,
    bold: true,
  });
  const volumeBars = [
    ["Starter", 1000, COLORS.warn],
    ["Growth", 10000, COLORS.accent2],
  ];
  volumeBars.forEach((bar, idx) => {
    const y = 5.45 + idx * 0.6;
    const maxW = 3.8;
    const width = (bar[1] / 10000) * maxW;
    slide.addText(bar[0], {
      x: 1.05,
      y: y + 0.04,
      w: 1.15,
      h: 0.2,
      fontSize: 10.5,
      color: COLORS.muted,
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 2.25,
      y,
      w: maxW,
      h: 0.28,
      radius: 0.06,
      fill: { color: "1A2E54" },
      line: { color: "1A2E54", transparency: 100 },
    });
    // Intentional overlap: foreground fill sits on top of the bar track.
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 2.25,
      y,
      w: width,
      h: 0.28,
      radius: 0.06,
      fill: { color: bar[2] },
      line: { color: bar[2], transparency: 100 },
    });
    slide.addText(bar[1].toLocaleString(), {
      x: 6.15,
      y: y + 0.03,
      w: 0.7,
      h: 0.2,
      fontSize: 10.5,
      color: COLORS.text,
      align: "right",
      bold: true,
    });
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.35,
    y: 4.9,
    w: 5.45,
    h: 2.2,
    radius: 0.08,
    fill: { color: COLORS.panel },
    line: { color: COLORS.line, pt: 1 },
  });
  addBullets(
    slide,
    [
      "Tiering aligns to API throughput and support depth",
      "Enterprise plan opens private deployment + SLA motion",
      "Escrow and compliance layers support premium positioning",
      "Model can evolve into usage + governance bundles",
    ],
    7.55,
    5.2,
    5.05,
    10.5,
    0.38,
    COLORS.text
  );

  finalizeSlide(slide, 8);
}

// Slide 9: GTM
{
  const slide = pptx.addSlide();
  addBg(slide);
  addHeader(slide, "Go-To-Market Motion", "From prototype to first governed design partners in regulated sectors.");

  const phases = [
    ["Phase 1", "Design Partners", "Land 3-5 lighthouse institutions in healthcare/finance/government."],
    ["Phase 2", "Controlled Pilots", "Run compliance-first pilots with clear trust-score and audit KPIs."],
    ["Phase 3", "Scale", "Expand through private cloud and enterprise channel partnerships."],
  ];

  phases.forEach((phase, idx) => {
    const x = 0.75 + idx * 4.25;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 1.9,
      w: 3.95,
      h: 2.4,
      radius: 0.08,
      fill: { color: COLORS.panel },
      line: { color: COLORS.line, pt: 1 },
    });
    slide.addText(phase[0], {
      x: x + 0.2,
      y: 2.1,
      w: 3.5,
      h: 0.22,
      fontSize: 10,
      color: COLORS.warn,
      bold: true,
      align: "center",
    });
    slide.addText(phase[1], {
      x: x + 0.2,
      y: 2.38,
      w: 3.5,
      h: 0.3,
      fontSize: 17,
      color: COLORS.accent2,
      bold: true,
      align: "center",
    });
    slide.addText(phase[2], {
      x: x + 0.25,
      y: 2.84,
      w: 3.45,
      h: 1.25,
      fontSize: 11,
      color: COLORS.text,
      align: "left",
      valign: "top",
    });
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.75,
    y: 4.65,
    w: 12.05,
    h: 2.0,
    radius: 0.08,
    fill: { color: "0A1A35" },
    line: { color: COLORS.line, pt: 1 },
  });

  slide.addText("Execution priorities from current repo state", {
    x: 1.0,
    y: 4.95,
    w: 4.9,
    h: 0.25,
    fontSize: 13,
    color: COLORS.accent2,
    bold: true,
  });

  addBullets(
    slide,
    [
      "Connect frontend flows to production backend services",
      "Harden trust-score and policy engine APIs",
      "Operationalize compliance export and audit reporting",
      "Convert investor demo into customer pilot playbook",
    ],
    1.0,
    5.28,
    5.45,
    10.5,
    0.34,
    COLORS.text
  );

  slide.addText("Status today: Prototype with deploy checklist and investor-demo UX across onboarding, admin, and workspace views.", {
    x: 6.85,
    y: 5.08,
    w: 5.3,
    h: 1.2,
    fontSize: 12,
    color: COLORS.text,
    valign: "top",
  });

  finalizeSlide(slide, 9);
}

// Slide 10: Differentiation
{
  const slide = pptx.addSlide();
  addBg(slide);
  addHeader(slide, "Differentiation: Confidence Infrastructure vs Open Marketplace", "Redoubt competes on trust assurance and governed execution, not listing volume.");

  const rows = [
    ["Verified onboarding", "No", "Yes"],
    ["Persistent trust scoring", "Partial", "Yes"],
    ["Provider identity protection", "Limited", "Yes"],
    ["Escrow-native workflows", "Rare", "Yes"],
    ["Immutable audit trail", "Inconsistent", "Yes"],
    ["Compliance evidence locker", "No", "Yes"],
  ];

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 1.75,
    w: 11.95,
    h: 4.85,
    radius: 0.06,
    fill: { color: COLORS.panel },
    line: { color: COLORS.line, pt: 1 },
  });

  const colX = [1.1, 7.05, 9.2, 11.0];
  slide.addText("Capability", { x: colX[0], y: 2.05, w: 5.7, h: 0.3, fontSize: 12, color: COLORS.muted, bold: true });
  slide.addText("Typical Marketplace", { x: colX[1], y: 2.05, w: 2.0, h: 0.3, fontSize: 12, color: COLORS.muted, bold: true, align: "center" });
  slide.addText("Redoubt", { x: colX[2], y: 2.05, w: 1.6, h: 0.3, fontSize: 12, color: COLORS.muted, bold: true, align: "center" });

  slide.addShape(pptx.ShapeType.line, {
    x: 1.05,
    y: 2.35,
    w: 11.4,
    h: 0,
    line: { color: COLORS.line, pt: 1 },
  });

  rows.forEach((row, idx) => {
    const y = 2.56 + idx * 0.63;
    if (idx % 2 === 1) {
      slide.addShape(pptx.ShapeType.rect, {
        x: 1.0,
        y: y - 0.06,
        w: 11.45,
        h: 0.52,
        fill: { color: "0D1F3D" },
        line: { color: "0D1F3D", transparency: 100 },
      });
    }

    slide.addText(row[0], { x: colX[0], y, w: 5.7, h: 0.22, fontSize: 12, color: COLORS.text });
    slide.addText(row[1], { x: colX[1], y, w: 2.0, h: 0.22, fontSize: 12, color: COLORS.muted, align: "center" });
    slide.addText(row[2], { x: colX[2], y, w: 1.6, h: 0.22, fontSize: 12, color: COLORS.good, bold: true, align: "center" });
  });

  slide.addText("Strategic moat: integrated trust scoring + policy enforcement + auditability embedded in daily workflows.", {
    x: 0.9,
    y: 6.75,
    w: 11.8,
    h: 0.28,
    fontSize: 11,
    color: COLORS.accent2,
    align: "center",
  });

  finalizeSlide(slide, 10);
}

// Slide 11: Roadmap
{
  const slide = pptx.addSlide();
  addBg(slide);
  addHeader(slide, "Product and Compliance Roadmap", "Execution priorities mapped to visible milestones in the prototype.");

  const roadmap = [
    ["Q2 2026", "Pilot readiness", "Backend integration, API hardening, first design-partner pilots."],
    ["Q3 2026", "Trust and cert depth", "ISO 27001 target milestone and expanded policy controls."],
    ["Q4 2026", "Regional expansion", "AP-Southeast residency target and enterprise deployments."],
    ["Q1 2027", "Scale confidence network", "Operationalize repeatable sales, onboarding, and governance ops."],
  ];

  slide.addShape(pptx.ShapeType.line, {
    x: 1.15,
    y: 3.65,
    w: 11.0,
    h: 0,
    line: { color: COLORS.accent, pt: 2 },
  });

  roadmap.forEach((item, idx) => {
    const x = 1.2 + idx * 2.75;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 2.05,
      w: 2.35,
      h: 1.2,
      radius: 0.08,
      fill: { color: COLORS.panel },
      line: { color: COLORS.line, pt: 1 },
    });
    slide.addText(item[0], {
      x: x + 0.1,
      y: 2.22,
      w: 2.1,
      h: 0.2,
      fontSize: 10,
      color: COLORS.warn,
      bold: true,
      align: "center",
    });
    slide.addText(item[1], {
      x: x + 0.1,
      y: 2.5,
      w: 2.1,
      h: 0.24,
      fontSize: 12,
      color: COLORS.white,
      bold: true,
      align: "center",
    });

    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + 1.05,
      y: 3.48,
      w: 0.25,
      h: 0.25,
      fill: { color: COLORS.accent2 },
      line: { color: COLORS.accent2, pt: 0.5 },
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 4.0,
      w: 2.35,
      h: 1.9,
      radius: 0.08,
      fill: { color: "0A1A35" },
      line: { color: COLORS.line, pt: 1 },
    });
    slide.addText(item[2], {
      x: x + 0.12,
      y: 4.25,
      w: 2.1,
      h: 1.45,
      fontSize: 10.2,
      color: COLORS.muted,
      valign: "top",
      align: "left",
    });
  });

  finalizeSlide(slide, 11);
}

// Slide 12: Ask and close
{
  const slide = pptx.addSlide();
  addBg(slide);

  slide.addText("Build the trusted data layer for regulated AI", {
    x: 0.8,
    y: 1.05,
    w: 12.0,
    h: 0.7,
    fontSize: 34,
    bold: true,
    color: COLORS.white,
    align: "center",
  });
  slide.addText("Redoubt turns compliance friction into a defensible network advantage.", {
    x: 1.4,
    y: 1.85,
    w: 10.6,
    h: 0.35,
    fontSize: 14,
    color: COLORS.muted,
    align: "center",
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.1,
    y: 2.55,
    w: 11.15,
    h: 3.25,
    radius: 0.08,
    fill: { color: COLORS.panel },
    line: { color: COLORS.line, pt: 1 },
  });

  slide.addText("Current Ask", {
    x: 1.45,
    y: 2.9,
    w: 4.0,
    h: 0.3,
    fontSize: 18,
    color: COLORS.accent2,
    bold: true,
  });

  addBullets(
    slide,
    [
      "Strategic investors to accelerate prototype-to-production delivery",
      "Design partners in healthcare, finance, and government",
      "Cloud/compliance partners for private deployment and certifications",
      "Enterprise introductions for first controlled pilots",
    ],
    1.45,
    3.35,
    5.6,
    12,
    0.42,
    COLORS.text
  );

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.3,
    y: 2.95,
    w: 4.6,
    h: 2.55,
    radius: 0.08,
    fill: { color: "0D2346" },
    line: { color: COLORS.accent, pt: 1 },
  });

  slide.addText("Deck Notes", {
    x: 7.55,
    y: 3.2,
    w: 4.1,
    h: 0.25,
    fontSize: 14,
    color: COLORS.white,
    bold: true,
  });
  slide.addText(
    "All product claims in this deck are grounded in repository artifacts reviewed on 23 March 2026.",
    {
      x: 7.55,
      y: 3.58,
      w: 4.1,
      h: 1.3,
      fontSize: 11,
      color: COLORS.text,
      valign: "top",
    }
  );

  slide.addText("Thank you", {
    x: 0.8,
    y: 6.15,
    w: 12.0,
    h: 0.45,
    fontSize: 28,
    bold: true,
    color: COLORS.accent2,
    align: "center",
  });

  finalizeSlide(slide, 12);
}

pptx
  .writeFile({ fileName: OUT_FILE })
  .then(() => {
    console.log(`Created deck: ${OUT_FILE}`);
  })
  .catch((err) => {
    console.error("Failed to write deck", err);
    process.exitCode = 1;
  });
