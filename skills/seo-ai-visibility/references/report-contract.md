# Strategic Growth Report Contract

Use this order in every final report.

1. **Business identification:** niche, model, audience, offers, locations, conversion paths, confidence, and evidence tags.
2. **Diagnosis:** technical, SEO, GEO/AEO, local, content, authority, UX/conversion, accessibility, performance, and measurement. Omit an inapplicable module with a reason.
3. **Strategy:** P0, P1, P2, P3 actions. Each action includes problem, evidence, opportunity, recommendation, implementation, impact, effort, risk, dependency, affected page/file, expected result, and metric.
4. **Architecture:** current pages, proposed pages, consolidations, URLs, hubs, sublinks, clusters, and internal-link paths.
5. **Content:** approved pillars, commercial pages, local pages, comparisons, questions, and a maintenance-aware calendar. Include a Page Brief for every proposed page.
6. **Implementation:** altered files, components, schemas, tests, dependencies, and intentionally unchanged areas.
7. **Validation:** command, result, duration when available, warnings, failures, browser/device checks, security/privacy boundaries, and deployment state.
8. **Metrics:** business outcomes, event plan, dashboard inputs, review cadence, and measurement limitations.
9. **Pending items:** missing data, approvals, risks, external dependencies, and client-provided evidence.

For every finding/action, keep this structure:

```text
ID:
Priority: P0 | P1 | P2 | P3
Category:
Page/file:
Problem:
Evidence:
Opportunity:
Recommendation:
Implementation:
Impact:
Effort:
Risk:
Dependency:
Expected result:
Metric:
Validation:
Evidence status:
```

End with exactly one main verdict:

- `APPROVE_STRATEGIC_DISCOVERY`: business is understood, strategy remains to be completed.
- `APPROVE_STRATEGY_READY`: diagnosis and plan are complete; no changes were implemented.
- `APPROVE_IMPLEMENTATION_LOCAL`: scoped changes and local validation passed; deployment was not verified.
- `APPROVE_FULL_GROWTH_ENGINE`: discovery, strategy, approved implementation, and required validation all completed.
- `BLOCK_PROJECT_NOT_IDENTIFIED`: no defensible business/project classification.
- `BLOCK_BUSINESS_INFORMATION_MISSING`: missing facts make strategy or claims unsafe.
- `BLOCK_AMBIGUOUS_NICHE`: competing classifications require an operator decision.
- `BLOCK_UNSUPPORTED_ENVIRONMENT`: required inspection or validation cannot run.
- `BLOCK_DIRTY_WORKTREE`: unrelated changes make safe implementation impossible.
- `BLOCK_IMPLEMENTATION_FAILED`: authorized implementation did not complete.
- `BLOCK_VALIDATION_FAILED`: implementation exists but required checks failed.
- `BLOCK_SECURITY_RISK`: change risks privacy, security, licensing, or sensitive data.
- `BLOCK_CONTENT_EVIDENCE_MISSING`: proposed content requires proof not supplied.
- `BLOCK_DEPLOYMENT_REQUIRED`: local work is complete but production verification is needed.
- `BLOCK_OPERATOR_DECISION_REQUIRED`: a material scope or business decision cannot be inferred safely.
