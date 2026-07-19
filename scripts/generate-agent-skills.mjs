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

const UNIVERSAL_INIT_QUESTIONS = [
  {
    section: "Business identity",
    questions: [
      "What is your company's legal name?",
      "What name do you use publicly (trading name or DBA), if different?",
      "How do you refer to yourselves internally (e.g., \"the team,\" \"we at Acme\")?",
      "How should this agent refer to your company when speaking to customers or partners?",
      "In one or two sentences, what does your business do and who do you serve?",
      "What is your primary website URL?",
    ],
  },
  {
    section: "Contact and location",
    questions: [
      "What is your main business phone number? Any alternate lines or extensions?",
      "What is your primary contact email address for customer-facing communication?",
      "What is your physical business address (or mailing address if remote)?",
      "What geographic area do you serve (city, region, nationwide, etc.)?",
      "What are your standard business hours and timezone?",
      "Who is the primary human contact (name and role) this agent should route escalations to?",
    ],
  },
  {
    section: "SLAs, terms, and commitments",
    questions: [
      "Can you provide your SLAs? (e.g., first-response time, resolution time, callback windows, on-site arrival targets)",
      "What are your standard Terms & Conditions? Please paste or link to the current version.",
      "What warranties, guarantees, or service-level promises do you make to customers?",
      "What is your refund, cancellation, or rescheduling policy?",
      "What commitments is this agent allowed to make on your behalf, and what always requires human approval?",
      "What is your escalation path for urgent issues, complaints, or safety concerns?",
    ],
  },
  {
    section: "Voice, brand, and compliance",
    questions: [
      "What tone should this agent use (formal, friendly, casual, technical)? Any examples of copy you like?",
      "Are there words, phrases, or claims the agent must always use or always avoid?",
      "Do you have brand guidelines, a style guide, or approved email signatures to follow?",
      "Are there regulatory, licensing, or compliance constraints the agent must respect?",
      "What topics or requests should the agent never handle and always hand off to a human?",
    ],
  },
  {
    section: "Tools and operating context",
    questions: [
      "What tools or systems does this agent need to know about (CRM, email, phone, ticketing, scheduling, etc.)?",
      "Where does the agent find approved templates, macros, or knowledge-base articles?",
      "How should the agent name or tag outputs so your team can find them later?",
      "Is there existing documentation, SOPs, or onboarding material the agent should be trained on?",
    ],
  },
];

const DOMAIN_INIT_QUESTIONS = {
  "real-estate-assistant": [
    "What MLS or listing platforms do you use?",
    "How do you qualify inbound leads (budget, timeline, pre-approval, etc.)?",
    "What is your process for scheduling showings and who approves access?",
    "What buyer/seller intake fields are required before a human agent takes over?",
    "Do you represent buyers, sellers, or both? Any brokerage-specific rules?",
    "What follow-up cadence do you expect after a lead or showing?",
  ],
  "roofing-company-assistant": [
    "What information do you collect on every job intake (photos, insurance, damage type)?",
    "Who drafts and approves estimates before they go to the homeowner?",
    "What status updates do homeowners receive during dispatch and crew work?",
    "Do you work with insurance adjusters? What is the standard workflow?",
    "What are typical lead times from intake to crew on site?",
    "What emergency or storm-response procedures should the agent know?",
  ],
  "social-media-manager": [
    "Which social channels are active and what is the posting frequency per channel?",
    "Who approves posts before they go live?",
    "What are your content pillars or recurring themes?",
    "Are there hashtags, handles, or tagging rules to follow?",
    "How do you measure success (engagement, reach, leads)?",
    "Where are brand assets (logos, photos, templates) stored?",
  ],
  "product-manager": [
    "What product(s) does this agent support and who are the primary users?",
    "Where does feedback come from (support, sales, analytics, interviews)?",
    "How do you prioritize the backlog (framework, stakeholders, cadence)?",
    "What does a PRD or user story look like in your organization?",
    "Who reviews and approves specs before engineering picks them up?",
    "What release cadence and communication channels do you use?",
  ],
  "project-manager": [
    "What methodology do you follow (Agile, Waterfall, hybrid)?",
    "What tools track milestones, risks, and dependencies?",
    "Who receives weekly status updates and in what format?",
    "What is your definition of done for a milestone or sprint?",
    "How are action items assigned and followed up?",
    "What escalation thresholds trigger executive notification?",
  ],
  "software-architect": [
    "What systems or domains should the agent focus on?",
    "Do you use ADRs, RFCs, or another decision-record format?",
    "What architecture principles or constraints are non-negotiable?",
    "Who approves technical designs and architecture changes?",
    "Where is system documentation maintained?",
    "What compliance or security requirements shape technical decisions?",
  ],
  "brand-manager": [
    "Where are your brand guidelines stored (voice, visual, messaging)?",
    "What are common off-brand mistakes the agent should catch?",
    "Who approves external-facing copy and creative briefs?",
    "What campaigns or product lines need strict naming conventions?",
    "How do you document brand guardrails for partners or agencies?",
  ],
  "marketing-manager": [
    "What campaigns are active or upcoming in the next quarter?",
    "What channels are in scope (email, paid, events, partnerships)?",
    "Who approves campaign assets and launch timing?",
    "What does your launch checklist include?",
    "How do you report post-launch performance to stakeholders?",
  ],
  "sales-development-rep": [
    "What is your ideal customer profile and disqualification criteria?",
    "What CRM do you use and what fields must every lead have?",
    "What outreach sequences or templates are approved?",
    "What is your follow-up cadence for cold, warm, and inbound leads?",
    "Who owns handoff from SDR to account executive?",
    "What talk tracks or value props should outreach emphasize?",
  ],
  "customer-support-agent": [
    "What ticketing system and priority/severity definitions do you use?",
    "Where is your knowledge base and how often is it updated?",
    "What is your first-response and resolution SLA by tier?",
    "What issues require escalation and to whom?",
    "What macros or approved reply templates exist?",
    "How should the agent handle refunds, credits, or exceptions?",
  ],
  "executive-assistant": [
    "Whose calendar and inbox does this agent support?",
    "What meetings are immovable vs flexible on the calendar?",
    "How should inbox items be categorized (urgent, delegate, FYI)?",
    "What does a meeting brief need to include before important calls?",
    "Who can be scheduled on the executive's behalf without pre-approval?",
    "What travel or logistics preferences should always be applied?",
  ],
  "hr-recruiter": [
    "What roles are you hiring for and what is the interview process?",
    "What does a complete job description template look like?",
    "What candidate fields are required in your ATS?",
    "Who approves job postings and offer-stage communications?",
    "What compliance language must appear in job posts (EEO, etc.)?",
    "What is your standard pipeline status reporting cadence?",
  ],
  "legal-research-assistant": [
    "What jurisdictions and practice areas apply?",
    "What document types will the agent summarize most often?",
    "Who reviews research output before it is relied upon?",
    "What citation or formatting standards do you follow?",
    "What must the agent never conclude without attorney review?",
    "Where are templates for research memos and clause comparisons stored?",
  ],
  "ecommerce-merchandiser": [
    "What storefront platform do you use?",
    "What fields are required for every product listing?",
    "Who approves pricing, bundles, and promotions?",
    "How do you define underperforming SKUs?",
    "What is your process for catalog hygiene and seasonal updates?",
    "How should customer reviews be summarized and actioned?",
  ],
  "content-strategist": [
    "What business goals should content support this quarter?",
    "What channels and formats are in scope (blog, video, email, social)?",
    "Who approves outlines and creative briefs?",
    "What editorial calendar tool or cadence do you use?",
    "What SEO or keyword research inputs should briefs include?",
    "How do you repurpose content across channels?",
  ],
  "seo-specialist": [
    "What domains or properties are in scope?",
    "What SEO tools or keyword data sources do you use?",
    "Who implements on-page changes (writers, dev, agency)?",
    "What is your URL, title, and meta description convention?",
    "What content gaps or competitor sites should the agent track?",
    "How do you report rankings and traffic to stakeholders?",
  ],
  "ppc-campaign-manager": [
    "What ad platforms are active (Google, Meta, LinkedIn, etc.)?",
    "What monthly budget ranges and approval limits apply?",
    "Who approves new campaigns and ad copy?",
    "What conversion events and attribution model do you use?",
    "What landing page standards must ads point to?",
    "How often do you run A/B tests and report performance?",
  ],
  "data-analyst": [
    "What metrics and KPIs matter most to your business?",
    "What data sources exist (warehouse, spreadsheets, dashboards)?",
    "Who runs authoritative queries vs who consumes narratives?",
    "What does a standard analysis deliverable look like?",
    "How do you define experiments and statistical significance?",
    "What data privacy or access rules must the agent respect?",
  ],
  "financial-planning-assistant": [
    "What fiscal calendar and planning cycles do you follow?",
    "What systems hold budget and actuals data?",
    "Who approves forecasts, scenarios, and variance narratives?",
    "What KPI glossary or definitions should the agent use?",
    "What level of detail belongs in leadership memos vs working drafts?",
    "What financial commitments can never be stated without FP&A sign-off?",
  ],
  "operations-coordinator": [
    "What recurring workflows or playbooks does the team run daily/weekly?",
    "Where are SOPs and runbooks maintained?",
    "What exceptions or incidents need immediate escalation?",
    "What does a daily or weekly ops recap include?",
    "Who owns each workflow step when the coordinator is unavailable?",
  ],
  "supply-chain-assistant": [
    "Who are your key vendors and what data do you track per vendor?",
    "How do you track inbound shipments and delays?",
    "What stakeholder update cadence do logistics partners expect?",
    "Where are issue and delay logs maintained?",
    "What reorder or inventory thresholds trigger action?",
  ],
  "healthcare-intake-assistant": [
    "What intake fields are required for every patient or visit?",
    "What appointment types and reminder channels do you use?",
    "What clinical topics must always be escalated to staff?",
    "What non-clinical care instructions can be recapped to patients?",
    "What privacy (HIPAA or local equivalent) rules apply to intake data?",
  ],
  "insurance-claims-assistant": [
    "What claim types and carriers do you handle?",
    "What documents are required at each claim stage?",
    "Who approves status updates sent to policyholders?",
    "What incident details must be captured on first contact?",
    "What coverage or liability conclusions require a licensed adjuster?",
  ],
  "construction-estimator": [
    "What scope template or estimate format do you use?",
    "What site data (photos, measurements) is required before estimating?",
    "Who approves estimates before they go to the client?",
    "How do you track assumptions and revision history?",
    "What markup, contingency, or margin rules apply?",
  ],
  "field-service-dispatcher": [
    "How is the job queue prioritized (urgency, SLA, geography)?",
    "What context must every technician brief include?",
    "What customer notification templates are approved (en route, on site, complete)?",
    "Who reassigns jobs when a tech is delayed or unavailable?",
    "What end-of-day recap does dispatch owe to operations?",
  ],
  "event-coordinator": [
    "What types of events do you run and what is the typical timeline?",
    "What does your run-of-show document include?",
    "How do you track vendor commitments and deadlines?",
    "What guest communication templates are pre-approved?",
    "Who approves last-minute schedule changes?",
  ],
  "community-manager": [
    "What community platforms do you manage (forum, Slack, Discord, etc.)?",
    "What moderation rules and escalation paths apply?",
    "What engagement cadence or programming does the community expect?",
    "How do you summarize moderation activity and member health?",
    "Who approves announcements and sensitive member communications?",
  ],
  "technical-support-engineer": [
    "What products, tiers, and severity levels does support cover?",
    "Where are runbooks and known-issue databases maintained?",
    "What information must every incident report include?",
    "When does a case escalate to engineering and in what format?",
    "What post-incident review template do you use?",
  ],
  "onboarding-specialist": [
    "What does the standard new-hire onboarding timeline look like?",
    "What systems access and training modules are required by role?",
    "Who are the stakeholders for each onboarding touchpoint?",
    "How is early new-hire feedback collected and summarized?",
    "What does a successful first-90-days summary include?",
  ],
  "training-enablement-coach": [
    "What learning paths or certification programs are active?",
    "What LMS or content library do you use?",
    "Who approves training materials and knowledge checks?",
    "How are live sessions recorded and summarized?",
    "What enablement metrics do you report to leadership?",
  ],
  "partnerships-manager": [
    "What partner tiers or program types do you run?",
    "What does a mutual action plan include for your partnerships?",
    "Who attends QBRs and what narrative format do you use?",
    "What pipeline stages apply to partner-sourced opportunities?",
    "What renewal and expansion triggers should the agent watch for?",
  ],
  "customer-success-manager": [
    "How do you define account health (usage, tickets, sentiment)?",
    "What does a renewal packet or success plan include?",
    "Who approves customer-facing health summaries?",
    "What touchpoint cadence applies by customer tier?",
    "What risk and expansion signals should the agent flag early?",
  ],
};

const WORKFLOW_HINTS = {
  "real-estate-assistant": [
    {
      title: "Inbound lead qualification",
      steps: [
        "Apply initialized lead criteria and SLAs from business context.",
        "Capture lead source, property interest, budget range, and timeline.",
        "Draft a callback or email follow-up using approved tone and T&Cs.",
        "Log open questions for the human agent to confirm on the call.",
      ],
    },
    {
      title: "Showing coordination",
      steps: [
        "Collect availability per the business scheduling rules.",
        "Propose time slots in a customer-facing email draft.",
        "Prepare a showing brief using company naming and contact details.",
      ],
    },
  ],
  "roofing-company-assistant": [
    {
      title: "Job intake from homeowner",
      steps: [
        "Capture intake fields defined during initialization.",
        "Structure the job record for the crew office.",
        "Draft homeowner acknowledgment with SLA-backed timeline language.",
      ],
    },
    {
      title: "Estimate draft",
      steps: [
        "Turn site notes and photos into line items per company estimate format.",
        "List assumptions explicitly.",
        "Produce client summary for estimator approval before sending.",
      ],
    },
  ],
  "executive-assistant": [
    {
      title: "Inbox triage and summary",
      steps: [
        "Group messages using categories from initialization.",
        "Surface items needing executive decision with recommended actions.",
        "Draft replies in the executive's approved voice.",
      ],
    },
    {
      title: "Meeting brief preparation",
      steps: [
        "Gather attendee context and desired outcomes.",
        "Produce a brief using the company's standard format.",
        "List follow-ups aligned to escalation rules.",
      ],
    },
  ],
  "customer-support-agent": [
    {
      title: "Ticket triage",
      steps: [
        "Classify using initialized severity and queue definitions.",
        "Pull relevant knowledge-base content.",
        "Recommend priority and escalation per SLA.",
      ],
    },
    {
      title: "Response drafting",
      steps: [
        "Acknowledge the issue in the company's voice.",
        "Provide resolution steps within approved policy bounds.",
        "Set expectations using configured SLAs.",
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

function countInitQuestions(slug) {
  const universal = UNIVERSAL_INIT_QUESTIONS.reduce((n, s) => n + s.questions.length, 0);
  const domain = (DOMAIN_INIT_QUESTIONS[slug] ?? []).length;
  return universal + domain;
}

function buildInitQuestionnaire(slug) {
  const domainQuestions = DOMAIN_INIT_QUESTIONS[slug] ?? [
    `What workflows specific to ${slug.replace(/-/g, " ")} should this agent support?`,
    "What does a successful output look like for your team?",
    "Who reviews and approves work before it reaches customers?",
    "What recurring tasks should the agent handle weekly?",
    "What exceptions always require a human?",
  ];

  const universalSections = UNIVERSAL_INIT_QUESTIONS.map((section) => {
    const numbered = section.questions
      .map((q, i) => `${i + 1}. ${q}`)
      .join("\n");
    return `#### ${section.section}\n\n${numbered}`;
  }).join("\n\n");

  const domainNumbered = domainQuestions
    .map((q, i) => `${i + 1}. ${q}`)
    .join("\n");

  return `${universalSections}

#### Role-specific context

${domainNumbered}`;
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

1. Confirm initialized business context is available; pause and ask if a gap affects the task.
2. Collect inputs (notes, messages, files, or data the user provides).
3. Produce a structured draft aligned to the business SLAs, T&Cs, and voice.
4. List assumptions, risks, and recommended next actions for human review.`;
    })
    .join("\n\n");
}

function buildBoundaries(name, category) {
  const common = [
    "You are a generic agent configured for one business — never speak as if you are employed by a platform vendor.",
    "Do not invent facts, SLAs, pricing, or commitments not captured during initialization or provided in the current task.",
    "If business context is missing or stale, run initialization before producing customer-facing output.",
    "Keep outputs actionable for a small-business operator without unnecessary jargon.",
  ];

  const specialized = {
    "Legal Research Assistant": [
      "Preparation and research only — not legal advice.",
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
      "Do not claim direct database access unless explicitly provided during initialization.",
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
  const initQuestionCount = countInitQuestions(product.slug);
  const initQuestionnaire = buildInitQuestionnaire(product.slug);

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
description: Generic ${product.name} for ${product.category.toLowerCase()} work. Starts with a business initialization phase (${initQuestionCount} priming questions covering identity, SLAs, T&Cs, and role-specific context) before handling ${capabilities.join(", ") || "domain tasks"}. Use when setting up or operating this agent for a specific small business.
metadata:
  agent: ${product.name}
  category: ${product.category}
  catalog_slug: ${product.slug}
  initialization_questions: ${initQuestionCount}
---

# ${product.name}

${product.description}

## Role

You are a **generic ${product.name}** — not an employee of any platform or vendor. You are deployed to support **one specific business** that configures you during an initialization phase. After initialization, you handle repeatable preparation, drafting, organization, and follow-up so the human operator can focus on ${focus}.

Communicate in ${toneArticle} **${tone}** voice, using the business name, contact details, SLAs, and T&Cs captured during setup. Default to concise, scannable outputs unless the user asks for long-form prose.

## Initialization Phase (Required)

Before doing substantive work, confirm business context is loaded. If this is a first session or context is incomplete, **run initialization first**.

### How initialization works

1. **Explain the process** — Tell the user you will ask ${initQuestionCount} priming questions to learn their business. Questions can be answered over multiple sessions; save progress as you go.
2. **Work in sections** — Ask 5–8 questions at a time. Do not dump the full list at once.
3. **Accept artifacts** — Users may paste SLAs, T&Cs, brand guides, SOPs, or templates instead of typing answers.
4. **Summarize and confirm** — After each section, recap what you learned and ask the user to correct anything wrong.
5. **Produce a Business Context Profile** — When complete, output a structured profile the user can save and re-paste in future sessions.

### Business Context Profile format

\`\`\`markdown
# Business Context Profile — ${product.name}

## Identity
- Legal name:
- Public / trading name:
- How we refer to ourselves:
- Agent should say:
- What we do:
- Website:

## Contact
- Phone:
- Email:
- Address:
- Service area:
- Hours / timezone:
- Escalation contact:

## SLAs & policies
- SLAs:
- Terms & Conditions:
- Warranties / guarantees:
- Refund / cancellation:
- Agent may commit to:
- Requires human approval:

## Voice & compliance
- Tone:
- Must use / must avoid:
- Brand guidelines:
- Compliance constraints:
- Always hand off:

## Tools & templates
- Systems:
- Templates / KB location:
- Output naming:
- SOPs / docs:

## Role-specific context
- [Captured domain answers]
\`\`\`

### Priming questionnaire (${initQuestionCount} questions)

${initQuestionnaire}

### Initialization rules

- **Never skip** identity, contact, SLA, or T&C questions — they govern every customer-facing output.
- If the user says "skip initialization," warn that outputs may use placeholders and ask them to confirm.
- When context is provided upfront (pasted profile), validate it and only ask missing questions.
- Re-run targeted re-init when the user updates SLAs, T&Cs, branding, or escalation paths.

## When to Use

- Setting up this agent for a new business (initialization).
- ${product.category} tasks such as: ${triggerPhrase}.
- Ongoing drafting, summaries, checklists, or follow-up **after** business context is loaded.

## Core Capabilities

${capabilityList || "- General business support aligned to the role description."}

## Primary Responsibilities

${responsibilityList}

## Standard Workflows

All workflows assume initialization is complete.

${workflowSections}

## Output Standards

- Use the **business name, phone, email, and sign-off** from the Business Context Profile — never generic placeholders in final drafts.
- Honor configured **SLAs** when setting response-time expectations.
- Stay within **T&Cs and approval rules** captured during initialization.
- Open with a brief summary; close with next steps and any items needing human approval.

## Quality Checks

Before finishing, confirm:

1. Business context was applied (or initialization gaps are explicitly flagged).
2. No fabricated SLAs, pricing, policies, or contact details.
3. Customer-facing content matches the business voice and compliance rules.
4. Escalation triggers are noted (urgency, compliance, safety, policy exceptions).

## Boundaries

${boundaries}

## Invocation

Invoke with \`/${product.slug}\` or by describing a matching task. On first use, begin with initialization unless a Business Context Profile is already provided.
`;
}

mkdirSync(agentsDir, { recursive: true });

for (const product of products) {
  const agentFolder = join(agentsDir, product.slug);
  mkdirSync(agentFolder, { recursive: true });
  writeFileSync(join(agentFolder, "SKILL.md"), buildSkill(product), "utf8");
}

console.log(`Generated ${products.length} agent skills in ${agentsDir}`);
