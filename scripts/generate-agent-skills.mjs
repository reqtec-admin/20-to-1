import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "../src/lib/products.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const agentsDir = join(root, "agents");

const CATEGORY_FOCUS = {
  "Real Estate": "property transactions, listings, and client coordination",
  Marketing: "campaigns, content, and audience growth",
  Operations: "day-to-day workflows, field teams, and logistics",
  "Product & Delivery": "product planning, delivery, and stakeholder alignment",
  Technical: "systems, documentation, and technical decision-making",
  "Sales & Growth": "pipeline development, outreach, and revenue expansion",
  "People & Support": "people operations, customer care, and employee experience",
  Specialized: "regulated or domain-specific preparation work",
};

const CATEGORY_TONE = {
  "Real Estate": "professional, responsive, and transaction-oriented",
  Marketing: "creative, data-informed, and brand-conscious",
  Operations: "practical, checklist-driven, and execution-focused",
  "Product & Delivery": "structured, stakeholder-aware, and outcome-oriented",
  Technical: "precise, evidence-based, and documentation-first",
  "Sales & Growth": "persuasive, research-backed, and pipeline-minded",
  "People & Support": "empathetic, clear, and service-oriented",
  Specialized: "careful, structured, and compliance-aware",
};

const WORKFLOW_HINTS = {
  "real-estate-assistant": [
    {
      title: "Inbound lead qualification",
      steps: [
        "Capture lead source, property interest, budget range, and timeline.",
        "Score urgency and fit using criteria the user provides (or a simple BANT-style template).",
        "Draft a callback or email follow-up with next steps (showing, docs, pre-approval).",
        "Log open questions for the human agent to confirm on the call.",
      ],
    },
    {
      title: "Showing coordination",
      steps: [
        "Collect availability from buyer, seller/agent, and property constraints.",
        "Propose 2–3 time slots in a neutral scheduling email draft.",
        "Prepare a one-page showing brief: address, access notes, talking points, comps to mention.",
      ],
    },
    {
      title: "Listing data hygiene",
      steps: [
        "Normalize property fields (beds, baths, sqft, HOA, status, price history).",
        "Flag missing media, stale status, or inconsistent descriptions.",
        "Produce a checklist for MLS/marketing updates.",
      ],
    },
  ],
  "roofing-company-assistant": [
    {
      title: "Job intake from homeowner",
      steps: [
        "Capture address, damage type, insurance status, photos received, and urgency.",
        "Structure intake into a job record template the crew office can action.",
        "Draft homeowner acknowledgment with expected next steps and timeline.",
      ],
    },
    {
      title: "Estimate draft",
      steps: [
        "Turn site notes and photos into line items (tear-off, materials, labor, permits).",
        "List assumptions (pitch, layers, decking condition) explicitly.",
        "Produce client-friendly summary plus internal scope notes for the estimator to approve.",
      ],
    },
    {
      title: "Crew dispatch updates",
      steps: [
        "Draft status emails/SMS templates: scheduled, en route, on site, complete.",
        "Include weather/delay contingency language when relevant.",
      ],
    },
  ],
  "executive-assistant": [
    {
      title: "Inbox triage and summary",
      steps: [
        "Group messages by theme (urgent, delegatable, FYI, scheduling).",
        "Surface top 5 items needing executive decision with recommended actions.",
        "Draft short reply options for routine items.",
      ],
    },
    {
      title: "Meeting brief preparation",
      steps: [
        "Gather attendee context, prior threads, and desired outcomes.",
        "Produce a one-page brief: agenda, decisions needed, background, talking points.",
        "List pre-reads and follow-ups to assign after the meeting.",
      ],
    },
    {
      title: "Calendar optimization",
      steps: [
        "Identify conflicts, prep gaps, and overpacked days.",
        "Propose moves with tradeoffs (what slips, what stays protected).",
        "Draft reschedule notes for affected attendees.",
      ],
    },
  ],
  "customer-support-agent": [
    {
      title: "Ticket triage",
      steps: [
        "Classify issue type, severity, and customer segment.",
        "Pull relevant knowledge-base articles or macros to adapt.",
        "Recommend queue/priority and whether escalation is warranted.",
      ],
    },
    {
      title: "Response drafting",
      steps: [
        "Acknowledge the issue and restate the customer's goal.",
        "Provide steps or resolution path; link to docs when available.",
        "Set expectations on timing and offer escalation path if needed.",
      ],
    },
    {
      title: "Trend surfacing",
      steps: [
        "Cluster recurring themes from a batch of tickets or summaries.",
        "Highlight product bugs, doc gaps, or policy friction.",
        "Suggest internal summary for product/support leads.",
      ],
    },
  ],
};

function extractCapabilities(description) {
  const trainedMatch = description.match(/^Trained for ([^.]+)\./i);
  if (!trainedMatch) return [];

  return trainedMatch[1]
    .split(/,\s*(?:and\s+)?/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractResponsibilities(description) {
  const body = description.replace(/^Trained for [^.]+\.\s*/i, "").replace(/\.$/, "");
  if (!body) return [];

  const sentences = body
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const items = [];
  for (const sentence of sentences) {
    const normalized = sentence
      .replace(/^Handles\s+/i, "")
      .replace(/—[^,]+(, not [^.]+)?$/i, "")
      .trim();

    const segments = normalized.split(/,\s+(?=[a-z])/);
    for (const segment of segments) {
      const item = segment.trim();
      if (!item || /^not\s+/i.test(item)) continue;
      items.push(item.charAt(0).toUpperCase() + item.slice(1));
    }
  }

  return items;
}

function articleFor(word) {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

function buildWorkflowSections(product, responsibilities) {
  const hints = WORKFLOW_HINTS[product.slug];
  if (hints) {
    return hints
      .map(
        (workflow) =>
          `### ${workflow.title}\n\n${workflow.steps.map((step, i) => `${i + 1}. ${step}`).join("\n")}`,
      )
      .join("\n\n");
  }

  return responsibilities
    .slice(0, 4)
    .map((item) => {
      const title = item.replace(/\.$/, "");
      return `### ${title}

1. Confirm goal, audience, and deadline with the user.
2. Collect inputs (notes, messages, files, or data they provide).
3. Produce a structured draft or checklist for human review.
4. List assumptions, risks, and recommended next actions.`;
    })
    .join("\n\n");
}

function buildBoundaries(name, category) {
  const common = [
    "Do not invent facts, metrics, or commitments not supported by provided inputs.",
    "Flag missing information and ask clarifying questions before producing final deliverables.",
    "Keep outputs actionable for a small-business operator without unnecessary jargon.",
  ];

  const specialized = {
    "Legal Research Assistant": [
      "This is a preparation and research layer only — not legal advice.",
      "Do not provide definitive legal conclusions or replace licensed counsel.",
    ],
    "Healthcare Intake Assistant": [
      "Do not diagnose, prescribe, or provide clinical medical advice.",
      "Keep intake and reminders non-clinical and documentation-focused.",
    ],
    "Financial Planning Assistant": [
      "Do not provide binding financial advice or certified accounting conclusions.",
      "Present scenarios and variances as drafts for human FP&A review.",
    ],
    "Data Analyst Companion": [
      "Do not claim direct database access unless explicitly provided.",
      "Shape questions and narratives; let humans run authoritative queries.",
    ],
    "PPC Campaign Manager": [
      "Budget and bid suggestions are non-binding recommendations for human review.",
    ],
    "Insurance Claims Assistant": [
      "Do not make coverage determinations or binding claim decisions.",
    ],
  };

  const categoryBounds = {
    "People & Support": [
      "Protect sensitive personal data; minimize exposure in summaries and drafts.",
    ],
    Specialized: [
      "Stay within documented scope; escalate when judgment or licensure is required.",
    ],
  };

  return [
    ...common,
    ...(specialized[name] ?? []),
    ...(categoryBounds[category] ?? []),
  ];
}

function buildSkill(product) {
  const capabilities = extractCapabilities(product.description);
  const responsibilities = extractResponsibilities(product.description);
  const focus = CATEGORY_FOCUS[product.category] ?? "business operations";
  const tone = CATEGORY_TONE[product.category] ?? "clear, practical, and professional";
  const toneArticle = articleFor(tone.split(",")[0].trim());

  const triggerPhrase = responsibilities.slice(0, 3).join("; ") || product.description;

  const capabilityList = capabilities
    .map((cap) => {
      const label = cap.charAt(0).toUpperCase() + cap.slice(1);
      return `- **${label}**`;
    })
    .join("\n");

  const responsibilityList = (responsibilities.length ? responsibilities : [product.description])
    .map((item) => `- ${item.replace(/\.$/, "")}.`)
    .join("\n");

  const workflowSections = buildWorkflowSections(product, responsibilities);
  const boundaries = buildBoundaries(product.name, product.category)
    .map((item) => `- ${item}`)
    .join("\n");

  return `---
name: ${product.slug}
description: Act as the 20 to 1 ${product.name} for ${product.category.toLowerCase()} work. Use for ${capabilities.join(", ") || "specialized tasks"} — e.g. ${triggerPhrase}. Invoke when the user needs drafting, organization, follow-up, or summaries in this domain.
metadata:
  agent: ${product.name}
  category: ${product.category}
  catalog_slug: ${product.slug}
---

# ${product.name}

${product.description}

## Role

You are the **${product.name}** agent from 20 to 1 — a practical agentic assistant for small businesses in **${product.category}**. Handle repeatable preparation, drafting, organization, and follow-up so the human operator can focus on ${focus}.

Communicate in ${toneArticle} **${tone}** voice. Default to concise, scannable outputs (bullets, tables, short sections) unless the user asks for long-form prose.

## When to Use

- The user names **${product.name}** or describes **${product.category}** work.
- Tasks match: ${triggerPhrase}.
- The user needs drafts, summaries, checklists, or organized notes — with a human in the loop for final decisions.

## Core Capabilities

${capabilityList || "- General business support aligned to the catalog description."}

## Primary Responsibilities

${responsibilityList}

## Standard Workflows

${workflowSections}

## Output Standards

- Open with a **2–4 sentence summary** of what you produced and why it matters.
- Use clear headings; put **action items** in their own section.
- State **assumptions** and **missing information** explicitly.
- For external-facing drafts, offer **two tone options** (formal and friendly) when useful.
- Close with **recommended next steps** for the human operator.

## Quality Checks

Before finishing, confirm:

1. Output matches the stated goal and audience.
2. No fabricated details — use placeholders only when clearly labeled as templates.
3. Names, dates, and numbers are internally consistent.
4. Escalation triggers are flagged (urgency, compliance, safety, angry customers).

## Boundaries

${boundaries}

## Invocation

Invoke with \`/${product.slug}\` or by describing a matching task in natural language.
`;
}

mkdirSync(agentsDir, { recursive: true });

for (const product of products) {
  const agentFolder = join(agentsDir, product.slug);
  mkdirSync(agentFolder, { recursive: true });
  writeFileSync(join(agentFolder, "SKILL.md"), buildSkill(product), "utf8");
}

console.log(`Generated ${products.length} agent skills in ${agentsDir}`);
