export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  category: string;
  featured?: boolean;
}

/**
 * Agent catalog for 20 to 1. Categories are job fields/sectors.
 * Descriptions reflect typical agent skill sets: calling, emails,
 * data collection, research, drafting, and workflow automation.
 */
export const products: Product[] = [
  {
    id: "real-estate-assistant",
    name: "Real Estate Assistant",
    slug: "real-estate-assistant",
    category: "Real Estate",
    description:
      "Trained for calling, email follow-up, and data collection. Qualifies inbound leads, schedules showings, drafts follow-up emails, and keeps listing information organized. Handles buyer/seller intake and property data so agents stay focused on closing deals.",
    price: 89,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop",
    featured: true,
  },
  {
    id: "roofing-company-assistant",
    name: "Roofing Company Assistant",
    slug: "roofing-company-assistant",
    category: "Operations",
    description:
      "Trained for job intake, data collection, and notifications. Captures job requests, gathers photos and on-site details, drafts estimates, and keeps homeowners updated via email and status notifications as crews are dispatched and work progresses.",
    price: 79,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=400&fit=crop",
    featured: true,
  },
  {
    id: "social-media-manager",
    name: "Social Media Manager",
    slug: "social-media-manager",
    category: "Marketing",
    description:
      "Trained for content drafting, research, and data summarization. Plans content calendars, drafts posts across channels, summarizes performance data, and organizes assets. Handles caption generation, hashtag research, and reporting so teams ship campaigns faster.",
    price: 129,
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=400&fit=crop",
    featured: true,
  },
  {
    id: "product-manager",
    name: "Product Manager",
    slug: "product-manager",
    category: "Product & Delivery",
    description:
      "Trained for research synthesis, drafting, and stakeholder communication. Transforms raw feedback and tickets into prioritized backlogs, crisp PRDs, and status updates. Handles user feedback synthesis, release notes, and backlog grooming support.",
    price: 149,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop",
    featured: true,
  },
  {
    id: "project-manager",
    name: "Project Manager",
    slug: "project-manager",
    category: "Product & Delivery",
    description:
      "Trained for timeline and risk tracking, drafting, and follow-up. Structures milestones, tracks risks and dependencies, drafts weekly updates and meeting notes. Handles action-item follow-up and status reports for executives and delivery teams.",
    price: 99,
    image: "https://images.unsplash.com/photo-1552581234-26160f608093?w=400&h=400&fit=crop",
    featured: true,
  },
  {
    id: "software-architect",
    name: "Software Architect Assistant",
    slug: "software-architect",
    category: "Technical",
    description:
      "Trained for research, drafting, and documentation. Organizes requirements, compares design options, drafts ADRs and system diagrams. Maintains technical glossaries and RFC summarization for senior engineers and architects.",
    price: 149,
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop",
  },
  {
    id: "brand-manager",
    name: "Brand Manager",
    slug: "brand-manager",
    category: "Marketing",
    description:
      "Trained for guideline lookup, copy checks, and brief drafting. Surfaces brand guidelines, checks copy against guardrails, drafts creative briefs. Handles campaign recap summaries and stakeholder deck support so teams stay on-brand at speed.",
    price: 89,
    image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=400&fit=crop",
  },
  {
    id: "marketing-manager",
    name: "Marketing Manager",
    slug: "marketing-manager",
    category: "Marketing",
    description:
      "Trained for campaign tracking, drafting, and data summarization. Coordinates multi-channel campaigns end-to-end: tracks assets, deadlines, approvals; drafts internal comms and post-launch analysis. Handles channel briefs and launch checklists.",
    price: 129,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop",
    featured: true,
  },
  {
    id: "sales-development-rep",
    name: "Sales Development Rep",
    slug: "sales-development-rep",
    category: "Sales & Growth",
    description:
      "Trained for research, email sequences, and call-note summarization. Supports SDRs with account research, personalized outreach drafts, follow-up suggestions, and CRM note cleanup. Keeps the pipeline warm without overwhelming reps.",
    price: 89,
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop",
  },
  {
    id: "customer-support-agent",
    name: "Customer Support Agent",
    slug: "customer-support-agent",
    category: "People & Support",
    description:
      "Trained for ticket triage, knowledge-base lookup, and response drafting. Organizes tickets, proposes replies from knowledge bases, surfaces escalation summaries and trend themes. Helps support teams respond faster and flag product issues.",
    price: 119,
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop",
    featured: true,
  },
  {
    id: "executive-assistant",
    name: "Executive Assistant",
    slug: "executive-assistant",
    category: "People & Support",
    description:
      "Trained for inbox summarization, calendar coordination, and briefing drafts. Summarizes inboxes, proposes calendar adjustments, prepares meeting briefs, tracks follow-ups. Handles travel and logistics planning and action-item tracking for busy leaders.",
    price: 129,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
  },
  {
    id: "hr-recruiter",
    name: "HR Recruiter Assistant",
    slug: "hr-recruiter",
    category: "People & Support",
    description:
      "Trained for intake, drafting, and data organization. Captures role requirements, drafts job descriptions, organizes candidate profiles and interview scorecards. Handles pipeline status reporting and streamlines hiring workflows.",
    price: 79,
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop",
  },
  {
    id: "legal-research-assistant",
    name: "Legal Research Assistant",
    slug: "legal-research-assistant",
    category: "Specialized",
    description:
      "Trained for document summarization, research, and drafting. Supports legal and compliance with structured research notes, clause comparisons, redline summaries. Handles issue-spotting assistance and research note structuring—preparation layer, not legal advice.",
    price: 149,
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=400&fit=crop",
  },
  {
    id: "ecommerce-merchandiser",
    name: "E‑commerce Merchandiser",
    slug: "ecommerce-merchandiser",
    category: "Marketing",
    description:
      "Trained for copy drafting, data surfacing, and summarization. Drafts product descriptions, proposes bundles and promotions, surfaces underperforming SKUs. Handles catalog hygiene checks and review summarization for online stores.",
    price: 89,
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop",
  },
  {
    id: "content-strategist",
    name: "Content Strategist",
    slug: "content-strategist",
    category: "Marketing",
    description:
      "Trained for research, outlining, and brief drafting. Turns business goals into content pillars, outlines, and creative briefs. Handles multi-channel briefs, repurposing suggestions, and editorial calendar support for blogs, video, and social.",
    price: 119,
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop",
  },
  {
    id: "seo-specialist",
    name: "SEO Specialist",
    slug: "seo-specialist",
    category: "Marketing",
    description:
      "Trained for research, data organization, and copy suggestions. Pairs with SEO tools to organize keyword maps, propose on-page improvements, brief writers on intent and structure. Handles content gap summaries and meta copy suggestions.",
    price: 99,
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=400&fit=crop",
  },
  {
    id: "ppc-campaign-manager",
    name: "PPC Campaign Manager",
    slug: "ppc-campaign-manager",
    category: "Marketing",
    description:
      "Trained for ad copy drafting, test proposals, and performance summarization. Drafts ad variations, proposes A/B test matrices, summarizes performance into weekly recaps. Handles landing page brief support and non-binding budget suggestions.",
    price: 129,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
  },
  {
    id: "data-analyst",
    name: "Data Analyst Companion",
    slug: "data-analyst",
    category: "Technical",
    description:
      "Trained for question shaping, narrative drafting, and result explanation. Cleans up ad-hoc questions, suggests query shapes (no DB access), drafts slides and narratives around results. Handles metric definitions and experiment recap templates.",
    price: 129,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
  },
  {
    id: "financial-planning-assistant",
    name: "Financial Planning Assistant",
    slug: "financial-planning-assistant",
    category: "Specialized",
    description:
      "Trained for scenario comparison, variance drafting, and memo structuring. Organizes scenario assumptions, drafts variance explanations, prepares lightweight memos for leadership. Handles budget change narratives and KPI glossary support for FP&A.",
    price: 119,
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop",
  },
  {
    id: "operations-coordinator",
    name: "Operations Coordinator",
    slug: "operations-coordinator",
    category: "Operations",
    description:
      "Trained for checklist and playbook drafting, runbook lookup, and recap summaries. Centralizes workflows into checklists, playbooks, and daily recaps. Handles exception tracking and keeps operators aligned without living in spreadsheets.",
    price: 89,
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=400&fit=crop",
    featured: true,
  },
  {
    id: "supply-chain-assistant",
    name: "Supply Chain Assistant",
    slug: "supply-chain-assistant",
    category: "Operations",
    description:
      "Trained for vendor and shipment data organization, drafting, and notifications. Organizes vendor info, tracks inbound shipments, drafts stakeholder updates. Handles issue and delay logs and SOP suggestion support for inventory and logistics teams.",
    price: 119,
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=400&fit=crop",
  },
  {
    id: "healthcare-intake-assistant",
    name: "Healthcare Intake Assistant",
    slug: "healthcare-intake-assistant",
    category: "Specialized",
    description:
      "Trained for intake structuring, summarization, and reminder drafting. Standardizes non-diagnostic intake, summarizes visit reasons, coordinates appointment reminders. Handles care instruction recaps (non-clinical) and documentation organization for clinics.",
    price: 99,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=400&fit=crop",
  },
  {
    id: "insurance-claims-assistant",
    name: "Insurance Claims Assistant",
    slug: "insurance-claims-assistant",
    category: "Specialized",
    description:
      "Trained for incident structuring, document checklists, and status drafting. Structures incident details, tracks required documents, summarizes claim status for internal and external audiences. Handles pattern and theme surfacing for claims teams.",
    price: 119,
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=400&fit=crop",
  },
  {
    id: "construction-estimator",
    name: "Construction Estimator Assistant",
    slug: "construction-estimator",
    category: "Operations",
    description:
      "Trained for scope structuring, materials drafting, and data collection. Turns rough notes and site photos into structured scopes, materials lists, client-friendly summaries. Handles assumption tracking and revision history for estimators.",
    price: 89,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop",
  },
  {
    id: "field-service-dispatcher",
    name: "Field Service Dispatcher",
    slug: "field-service-dispatcher",
    category: "Operations",
    description:
      "Trained for job queue organization, briefing drafts, and customer notifications. Organizes job queues, summarizes site context, prepares technician briefs. Handles customer notification templates and end-of-day recap drafting for field teams.",
    price: 89,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop",
  },
  {
    id: "event-coordinator",
    name: "Event Coordinator",
    slug: "event-coordinator",
    category: "Operations",
    description:
      "Trained for run-of-show drafting, vendor tracking, and guest communications. Drafts run-of-show documents, tracks vendor commitments, prepares guest communication templates. Handles logistics checklists and post-event recap notes.",
    price: 99,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=400&fit=crop",
  },
  {
    id: "community-manager",
    name: "Community Manager",
    slug: "community-manager",
    category: "Marketing",
    description:
      "Trained for engagement prompts, moderation summarization, and drafting. Supports communities with engagement ideas, moderation summaries, monthly health snapshots. Handles member feedback synthesis and announcement copy for online communities.",
    price: 89,
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=400&fit=crop",
  },
  {
    id: "technical-support-engineer",
    name: "Technical Support Engineer",
    slug: "technical-support-engineer",
    category: "Technical",
    description:
      "Trained for incident structuring, runbook lookup, and escalation drafting. Structures incident reports, clarifies repro steps, connects cases to runbooks and product teams. Handles escalation packet drafting and post-incident review notes.",
    price: 119,
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=400&fit=crop",
  },
  {
    id: "onboarding-specialist",
    name: "Onboarding Specialist",
    slug: "onboarding-specialist",
    category: "People & Support",
    description:
      "Trained for plan drafting, checklist creation, and feedback synthesis. Creates onboarding plans, tracks touchpoints, captures early new-hire feedback. Handles manager reminder prompts and first-90-day summaries for people teams.",
    price: 79,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop",
  },
  {
    id: "training-enablement-coach",
    name: "Training & Enablement Coach",
    slug: "training-enablement-coach",
    category: "People & Support",
    description:
      "Trained for learning path structuring, quiz drafting, and session summarization. Organizes learning playlists, drafts knowledge checks, summarizes session recordings. Handles playbook suggestions and certification tracking for enablement programs.",
    price: 89,
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=400&fit=crop",
  },
  {
    id: "partnerships-manager",
    name: "Partnerships Manager",
    slug: "partnerships-manager",
    category: "Sales & Growth",
    description:
      "Trained for partner documentation, plan drafting, and pipeline summarization. Keeps partner programs organized with account notes, mutual action plans, exec-ready pipeline snapshots. Handles QBR narrative support and renewal/expansion prompts.",
    price: 129,
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=400&fit=crop",
  },
  {
    id: "customer-success-manager",
    name: "Customer Success Manager",
    slug: "customer-success-manager",
    category: "People & Support",
    description:
      "Trained for health summarization, renewal prep drafting, and meeting recaps. Turns touchpoints, tickets, and usage notes into health summaries and renewal packets. Handles success plan structuring and risk/opportunity flags for CSMs.",
    price: 129,
    image: "https://images.unsplash.com/photo-1560264280-88b68371db39?w=400&h=400&fit=crop",
    featured: true,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}
