# Implementation and Validation Reference

## Safe Change Flow

1. Confirm explicit authorization and scope.
2. Inspect Git status, branch, worktree, framework, rendering approach, existing patterns, tests, and environment.
3. Record the relevant pre-change evidence and identify the smallest sufficient fix.
4. Reuse existing components, styles, helpers, layouts, CMS, and dependencies.
5. Do not change production data, payments, authentication, permissions, infrastructure, or critical integrations unless explicitly scoped and protected.
6. Do not publish unverified facts, placeholders, reviews, credentials, prices, locations, claims, or statistics.
7. Implement the change with an explicit rollback path when risk warrants it.
8. Run the repository's applicable typecheck, lint, tests, build, HTML/schema/link checks, and `git diff --check`.
9. Use browser validation for changed interactive or visual flows when browser tools are available. Test representative mobile and desktop sizes and record actual failures.
10. Report changed files, validation commands and results, risks, deployment requirements, and pending inputs.

## Page Brief Before a New Page

Do not create a page until this brief is complete:

```text
URL:
Type:
Intent:
Audience:
Problem:
Objective:
Primary entity and related terms:
Information gain:
Outline and direct answer:
Proof required:
CTA:
Inbound and outbound internal links:
Schema:
Author/reviewer/review date:
Metric:
Maintenance owner:
Cannibalization check:
```

Use an editorial placeholder only when it is clearly marked and cannot be mistaken for production fact. Prefer blocking publication when critical evidence is missing.

## Validation Boundaries

Do not call a local check a production validation. Distinguish source inspection, local rendered HTML, deployed URL inspection, browser interaction, performance measurement, and external-platform observation. State unavailable validation honestly.
