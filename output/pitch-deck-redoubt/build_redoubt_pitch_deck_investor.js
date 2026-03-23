const fs = require("fs");
const path = require("path");
const PptxGenJS = require("pptxgenjs");

const {
  warnIfSlideHasOverlaps,
  warnIfSlideElementsOutOfBounds,
} = require("./pptxgenjs_helpers/layout");
const { imageSizingContain } = require("./pptxgenjs_helpers/image");

const OUT_FILE = path.join(__dirname, "Redoubt_Pitch_Deck_Investor_Security.pptx");
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
pptx.subject = "Investor Security & Compliance Pitch Deck";
pptx.title = "Redoubt Investor Security Deck";
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
  slide.addText("Redoubt Confidential | Investor + security/compliance edition | March 2026", {
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
  slide.addText("Security-first data collaboration for healthcare, finance, and government buyers.", {
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
      "Security and compliance as primary product surfaces",
      "AI-powered confidence scoring with auditable policy controls",
      "Governed access workflows for regulated enterprise buyers",
      "Clear path from prototype to cert-backed enterprise platform",
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

  slide.addText("Fundraising edition | Stage: prototype / investor demo", {
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
  addHeader(slide, "Why Now: Trust and Compliance Bottlenecks Are Expensive", "Regulated teams cannot scale AI/data programs without verifiable governance.");

  slide.addText(
    "Data buyers in regulated industries face security review delays, legal uncertainty, and low confidence in third-party data quality.",
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
      "Security/legal reviews delay access and increase cost-to-acquire data",
      "No persistent trust score to guide procurement decisions",
      "Compliance evidence is fragmented across tools and teams",
      "Sensitive providers avoid open marketplaces due to exposure risk",
    ],
    0.75,
    2.35,
    6.2,
    13,
    0.45,
    COLORS.text
  );

  const painCards = [
    ["Long Sales Cycles", "Procurement stalls when trust and policy proof are missing."],
    ["Quality Uncertainty", "Low confidence in external data degrades model outcomes."],
    ["Compliance Drag", "Audit readiness is manual and expensive to maintain."],
    ["Provider Risk", "Contributors need anonymity and policy-safe distribution."],
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
    "Investment thesis: the market is missing a trust-and-compliance execution layer between data supply and regulated AI demand.",
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
  addHeader(slide, "Solution: Security-Native Trust Layer", "Redoubt embeds governance, confidence scoring, and auditable controls into every transaction.");

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
    ["Verification", "Corporate identity, role, and usage-intent checks before access."],
    ["Scoring", "Multi-factor confidence scoring tied to quality and anomaly signals."],
    ["Protection", "Policy guardrails, escrow controls, and provider identity shielding."],
    ["Compliance", "Audit trail, consent records, and evidence workflows by default."],
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

  slide.addText("Positioning: Not an open marketplace. A defensible security/compliance infrastructure for regulated data exchange.", {
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
  addHeader(slide, "Product Evidence: Security and Governance UX", "Screens captured from the live prototype in this repository.");

  const cards = [
    ["Landing", IMAGES.landing, "Trust-first market positioning and controlled-access motion."],
    ["Participant Dashboard", IMAGES.dashboard, "Security telemetry, trust posture, and compliance status."],
    ["Compliance Locker", IMAGES.compliance, "Shared-responsibility and certification evidence in-product."],
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
  addHeader(slide, "Security and Compliance Posture", "A core investment moat: controls are productized, visible, and workflow-native.");

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.7,
    y: 1.55,
    w: 5.75,
    h: 4.8,
    radius: 0.08,
    fill: { color: COLORS.panel },
    line: { color: COLORS.line, pt: 1 },
  });

  slide.addText("Compliance posture and control depth", {
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
      "SOC 2 Type II milestone reflected in status surface",
      "HIPAA and GDPR-aligned controls visible in product flows",
      "ISO 27001 program tracked with target Q3 2026",
      "Shared-responsibility model articulated for enterprise buyers",
      "Immutable audit + consent + escrow workflows already prototyped",
      "Deployment options: SaaS, private cloud, and on-prem",
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
  addHeader(slide, "Security Readiness Evidence (Repo-backed)", "Current implementation depth reduces execution risk on the path to production.");

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
      "Security modules: RBAC, red-team mode, secure enclave",
      "Compliance modules: audit trail, evidence locker, consent tracker",
      "Governance modules: escrow center, lineage, and usage analytics",
      "Deployment checklist already documented for production rollout",
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
  addHeader(slide, "Initial Buyer Profiles", "Investor focus: highest urgency segments with acute compliance and trust pain.");

  const segments = [
    ["Regulated Enterprises", "Governed access plus audit-ready controls for production workloads."],
    ["Model Risk & Security Teams", "Continuous confidence and policy enforcement for AI operations."],
    ["Compliance & Legal Functions", "Evidence-first workflows to accelerate approvals and audits."],
    ["Data Contributors", "Controlled monetization with identity shielding and escrow protection."],
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
  slide.addText("Beachhead markets from repo positioning: Healthcare, Finance, and Government.", {
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
  addHeader(slide, "Revenue Model and Security Upsell Path", "Tiered API packaging plus enterprise compliance/deployment expansion.");

  const tiers = [
    ["Starter", "$500/mo", "1,000 API calls/month", "Foundational trust-scored API access"],
    ["Growth", "$2,000/mo", "10,000 API calls/month", "Priority support + governed integrations"],
    ["Enterprise", "Custom", "Unlimited API calls", "Private deployment + SLA + compliance support"],
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
      "Land with API value, expand with governance and compliance depth",
      "Enterprise tier unlocks private cloud/on-prem deployment economics",
      "Security and audit features justify premium ACV in regulated accounts",
      "Long-term model: usage + policy automation + trust analytics",
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
  addHeader(slide, "Go-To-Market and Capital Deployment", "Execution plan aligned to design partners, compliance wins, and enterprise conversion.");

  const phases = [
    ["Phase 1", "Design Partner Revenue", "Convert 3-5 lighthouse institutions into paid pilot accounts."],
    ["Phase 2", "Compliance Conversion", "Win security/legal stakeholders with measurable control outcomes."],
    ["Phase 3", "Enterprise Expansion", "Scale via private deployment and strategic channel alliances."],
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

  slide.addText("Use of proceeds priorities (first 18 months)", {
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
      "Platform engineering: production backend + policy engine hardening",
      "Security/compliance: audit exports, controls automation, cert execution",
      "Go-to-market: design partner onboarding and enterprise sales motion",
      "Customer success: pilot-to-production implementation support",
    ],
    1.0,
    5.28,
    5.45,
    10.5,
    0.34,
    COLORS.text
  );

  slide.addText("Status today: prototype with deploy checklist and end-to-end trust/compliance UX already demonstrated.", {
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
  addHeader(slide, "Defensible Moat: Security + Compliance Execution Layer", "Redoubt wins where procurement requires proof, controls, and auditable outcomes.");

  const rows = [
    ["Verified onboarding and identity controls", "Inconsistent", "Yes"],
    ["Persistent trust scoring across workflows", "Partial", "Yes"],
    ["Policy-enforced access and revocation", "Limited", "Yes"],
    ["Escrow and dispute-aware transaction model", "Rare", "Yes"],
    ["Immutable audit and consent logging", "Inconsistent", "Yes"],
    ["Compliance evidence UX for enterprise buyers", "No", "Yes"],
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

  slide.addText("Strategic moat: compliance and security become daily workflow primitives, not post-processing add-ons.", {
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
  addHeader(slide, "18-Month Security and Certification Roadmap", "Milestones designed to de-risk enterprise procurement and support premium pricing.");

  const roadmap = [
    ["Q2 2026", "Production security baseline", "Backend hardening, policy engine APIs, and first paid pilots."],
    ["Q3 2026", "ISO 27001 milestone", "Certification execution and deeper control automation."],
    ["Q4 2026", "Regional + private deployment", "AP-Southeast target and private cloud expansion."],
    ["Q1 2027", "Enterprise scale", "Repeatable sales, implementation, and compliance operations."],
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

  slide.addText("Fund the trust layer for regulated AI", {
    x: 0.8,
    y: 1.05,
    w: 12.0,
    h: 0.7,
    fontSize: 34,
    bold: true,
    color: COLORS.white,
    align: "center",
  });
  slide.addText("Redoubt converts compliance friction into defensible enterprise revenue.", {
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

  slide.addText("Fundraising Ask", {
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
      "Target raise (draft): $3.0M Seed to reach enterprise pilot scale",
      "Focus: security/compliance productization and production hardening",
      "Milestones: paid pilots, certification progress, private deployments",
      "Investor value: category-defining trust moat in regulated data access",
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

  slide.addText("Use of Funds (Draft)", {
    x: 7.55,
    y: 3.2,
    w: 4.1,
    h: 0.25,
    fontSize: 14,
    color: COLORS.white,
    bold: true,
  });
  slide.addText(
    "45% engineering and platform hardening | 30% security/compliance execution | 25% GTM and enterprise delivery.",
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
