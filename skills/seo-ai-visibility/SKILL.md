---
name: seo-ai-visibility
description: Universal strategic growth engine for discovering a project's business model, niche, acquisition model, SEO, local SEO, GEO, AEO, content, conversion, UX, accessibility, performance, analytics, and technical implementation. Use when the user asks to audit, grow, reposition, improve, plan, implement, validate, or measure a website/app's organic visibility, AI visibility, local presence, content architecture, conversion, acquisition, digital strategy, structured data, crawlability, or market opportunity.
---

# Universal Strategic Growth Engine

Discover before deciding. Build a strategy that is proportionate to the actual business, then implement only the approved, evidence-backed work.

## Start Here

1. Inspect the repository and its Git state before proposing changes. Read the README, package/config files, routes, shared layouts, content, public assets, metadata, sitemap, robots, JSON-LD, public environment configuration, forms, analytics, tests, and recent Git history when it can clarify intent.
2. Run `scripts/discover_project.py <project-root> --format markdown` to establish a reproducible initial inventory. Treat it as evidence, not a substitute for reading relevant files.
3. Produce the discovery map in the report contract. Mark every conclusion as `confirmed_by_project`, `inferred_high_confidence`, `inferred_low_confidence`, `needs_confirmation`, or `external_research`.
4. Classify the business and acquisition model before choosing scope. Never assume that a project is a blog, local business, store, SaaS, or public website.
5. Select the mode below. Do not create pages, content, locations, products, services, claims, or schema before confirming that they are real and strategically justified.

Read [references/discovery-and-strategy.md](references/discovery-and-strategy.md) for the classification, evidence, architecture, market, local, content, GEO/AEO, conversion, accessibility, performance, and measurement rules.

## Adaptive Scope

Match the solution to the business.

- **Presentation or institutional site:** prioritize proposition clarity, trust, contact, conversion, baseline technical SEO, and speed. Do not turn it into a portal.
- **Local business or multi-location business:** prioritize real locations, service areas, maps, NAP consistency, local proof, appropriate local schema, and visit/contact conversion. Never create doorway pages.
- **E-commerce or catalog:** prioritize categories, products, filters/facets, inventory, transactional intent, comparison, product data, and purchase flow.
- **SaaS or web application:** separate public acquisition from the authenticated product. Prioritize problems, solutions, use cases, integrations, proof, demo/trial activation, and private-route protection.
- **Publisher or portal:** prioritize topical clusters, expertise, authorship, sources, freshness, thematic navigation, and distribution.
- **Other or hybrid:** state the classification, uncertainty, and the smallest evidence-gathering step needed to choose safely.

Classify acquisition independently: local, regional, national, international, B2B, B2C, B2B2C, lead generation, direct sale, booking, physical visit, phone, WhatsApp, quote, demo, subscription, download, content, community, recurrence, or one-time sale.

## Modes

### Strategic Discovery

Use when the business or scope is not yet clear. Inspect first and return the discovery map, maturity assessment, gaps, and `APPROVE_STRATEGIC_DISCOVERY` when the business is understood but strategy is not yet complete. Return a `BLOCK_*` verdict when evidence is insufficient or the worktree prevents safe implementation.

### Strategy

Use for a plan without code changes. Diagnose technical SEO, content, GEO/AEO, local, authority, UX, conversion, accessibility, performance, architecture, and measurement. Prioritize P0 through P3 using evidence, impact, effort, risk, dependency, owner/page/file, expected result, and metric. Return `APPROVE_STRATEGY_READY` only when the plan is actionable.

### Implementation

Use only after explicit authorization to change code or content. Follow [references/implementation-and-validation.md](references/implementation-and-validation.md). Reuse the project's patterns and implement the smallest sufficient change. Never alter production data, authentication, permissions, billing, infrastructure, or critical integrations unless explicitly in scope. Return `APPROVE_IMPLEMENTATION_LOCAL` only after local validation succeeds; do not imply deployment occurred.

### Research

Use external research only after project discovery. Prefer primary and current sources; record the verification date and separate external facts from project facts, hypotheses, and recommendations. Use competitors to understand terminology, expectations, and gaps, never as copy to reproduce.

## Required Analysis

### Business, market, and architecture

Identify brand, offer, audience, sector, products/services, locations, units, contact paths, languages, conversion paths, maturity, and constraints from multiple project signals. Map each product/service and each real locality using the matrix in the discovery reference.

Evaluate routes, hierarchy, parent/child relationships, orphan pages, duplicate or cannibalizing intent, unclear URLs, excessive depth, filters/parameters, links, hubs, breadcrumbs, and existing conversion destinations. Before proposing a new URL, define its intent, audience, unique information, parent, inbound/outbound links, CTA, schema, update owner, and maintenance reason.

### Content, SEO, GEO, and AEO

Optimize for traditional search, answer engines, and generative systems together: be found, understood, trusted, cited when deserved, compared, chosen, and converted. Use summary-first structure where it helps: a direct, self-contained answer followed by evidence, detail, limitations, and next action. Do not fragment prose mechanically or promise rankings, sitelinks, traffic, or AI citations.

Create editorial content only when it can answer demand, support sales, establish authority, reduce objections, or become a credible source. Each approved page requires a Page Brief from the report contract. Avoid filler, keyword repetition, fabricated FAQs, generic local pages, and duplicate intent.

### Technical, local, entity, and trust

Audit indexability, canonicalization, redirects, status codes, sitemap, robots, noindex, renderability, security, metadata, headings, images, links, hreflang, pagination, parameters, and private/admin routes. Use the existing static inspectors for focused evidence:

- `scripts/audit_page.py <url-or-html> --format markdown`
- `scripts/inspect_metadata.py <url-or-html> --format json`
- `scripts/inspect_structured_data.py <url-or-html> --format json`
- `scripts/inspect_internal_links.py <url-or-html> --format json`

Choose structured data only when truthful and visible. Build one coherent entity graph with stable IDs; never invent authors, reviews, prices, availability, addresses, credentials, sources, or FAQs. Read [references/schema-selection-guide.md](references/schema-selection-guide.md) before recommending schema.

Activate local SEO only for real local presence or service coverage. Validate NAP, hours, routes, areas served, local proof, local listings, and truthful local schema. Do not recommend broad crawler access without considering privacy, licensing, security, or strategy.

### Experience, performance, and measurement

Identify the primary and secondary conversion actions, intent-stage CTA fit, friction, proof, forms, responsiveness, accessibility, and privacy. Test real browser geometry when browser tools are available: viewport widths from 320 through 1440, overflow, bounding boxes, keyboard/focus, accessible names, touch targets, and screenshots of failures.

Assess performance through LCP, INP, CLS, TTFB, critical content, image delivery, fonts, third parties, JavaScript, hydration, caching, and rendering. Do not trade core functionality for a synthetic score.

Define business-appropriate outcomes and a privacy-respecting event plan. Do not use traffic as the sole success metric. Include conversion, qualified lead, revenue, booking, call, WhatsApp, visit, activation, retention, branded demand, local presence, AI referrals, citation context, and share of voice where measurable.

## Priority and Safety

Use:

- **P0:** broken, unsafe, inaccessible, private exposure, critical indexing, conversion, or factual defects.
- **P1:** high-impact commercial pages, architecture, local presence, schema, accessibility, performance, CTAs, forms, and main content.
- **P2:** sustainable growth through clusters, comparisons, case studies, useful local content, distribution, and links.
- **P3:** defensible advantage such as original data, tools, research, community, controlled programmatic content, or internationalization.

For each action distinguish problem, evidence, opportunity, recommendation, implementation, impact, effort, risk, dependency, expected outcome, and metric. Treat absent evidence as a blocking condition or a request for information, never as permission to fabricate.

## Report and Verdict

Follow [references/report-contract.md](references/report-contract.md) exactly. Include exactly one final verdict:

`APPROVE_STRATEGIC_DISCOVERY`, `APPROVE_STRATEGY_READY`, `APPROVE_IMPLEMENTATION_LOCAL`, `APPROVE_FULL_GROWTH_ENGINE`, `BLOCK_PROJECT_NOT_IDENTIFIED`, `BLOCK_BUSINESS_INFORMATION_MISSING`, `BLOCK_AMBIGUOUS_NICHE`, `BLOCK_UNSUPPORTED_ENVIRONMENT`, `BLOCK_DIRTY_WORKTREE`, `BLOCK_IMPLEMENTATION_FAILED`, `BLOCK_VALIDATION_FAILED`, `BLOCK_SECURITY_RISK`, `BLOCK_CONTENT_EVIDENCE_MISSING`, `BLOCK_DEPLOYMENT_REQUIRED`, or `BLOCK_OPERATOR_DECISION_REQUIRED`.

Use `scripts/validate_growth_report.py <report.json>` before presenting a machine-readable strategic report. Its validation confirms structure, not the truth of the analysis.

