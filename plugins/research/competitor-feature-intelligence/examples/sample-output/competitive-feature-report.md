# Competitive Feature Intelligence Report

## 1. Executive Summary

The repository exposes 3 supported feature areas. 6 competitor advantages and 3 app advantages were identified from available evidence. Scores are decision support, not objective truth.

## 2. Scope and Method

Repository behavior was matched across multiple code signals; public/manual sources retained URL, retrieval time, reliability, and failures. Inaccessible pages are never treated as absence.

## 3. App Summary

3 repository-supported feature areas detected. Stage: MVP. Target users: researchers, small teams.

## 4. App Feature Inventory

| Feature | Category | Status | Maturity | Confidence | Evidence | Missing Pieces |
|---|---|---:|---:|---:|---|---|
| Authentication | Identity | partial | 3 | medium | src/auth.ts | Verify the end-to-end workflow, authorization, validation, and failure states. |
| Data export | Data portability | partial | 3 | medium | src/export.ts | Verify the end-to-end workflow, authorization, validation, and failure states. |
| Team workspaces | Collaboration | partial | 3 | medium | src/workspace.ts | Verify the end-to-end workflow, authorization, validation, and failure states. |

## 5. Competitor Overview

- Nebula Desk (direct): https://nebula.example

## 6. Competitor Feature Matrix

See `competitor-feature-matrix.csv`.

## 7. Features Competitors Have That the App Lacks

### ai recommendations

- Evidence-backed status: missing; 1 competitor(s) with evidence
- Priority: Validate First (2.38/5)
- Recommendation: Validate First
- MVP: Implement the smallest end-to-end ai recommendations workflow with authorization, validation, and tests.
- Confidence: low

### email notifications

- Evidence-backed status: missing; 1 competitor(s) with evidence
- Priority: Consider (2.67/5)
- Recommendation: Consider
- MVP: Implement the smallest end-to-end email notifications workflow with authorization, validation, and tests.
- Confidence: medium

### enterprise sso

- Evidence-backed status: missing; 1 competitor(s) with evidence
- Priority: Build Now (3.91/5)
- Recommendation: Build Now
- MVP: Implement the smallest end-to-end enterprise sso workflow with authorization, validation, and tests.
- Confidence: high

### native mobile app

- Evidence-backed status: missing; 1 competitor(s) with evidence
- Priority: Do Not Build Yet (2.44/5)
- Recommendation: Do Not Build Yet
- MVP: Implement the smallest end-to-end native mobile app workflow with authorization, validation, and tests.
- Confidence: low

### real time collaboration

- Evidence-backed status: missing; 1 competitor(s) with evidence
- Priority: Consider (2.79/5)
- Recommendation: Consider
- MVP: Implement the smallest end-to-end real time collaboration workflow with authorization, validation, and tests.
- Confidence: high

### webhooks

- Evidence-backed status: missing; 1 competitor(s) with evidence
- Priority: Consider (2.69/5)
- Recommendation: Consider
- MVP: Implement the smallest end-to-end webhooks workflow with authorization, validation, and tests.
- Confidence: high


## 8. App Features Not Found in Reviewed Competitor Sources

- authentication: No evidence of this feature was found in the reviewed public sources (medium confidence).
- data export: No evidence of this feature was found in the reviewed public sources (medium confidence).
- team workspaces: No evidence of this feature was found in the reviewed public sources (medium confidence).

## 9. Shared Features Implemented Differently

Detailed UX comparison requires workflow-level public evidence; unknown ratings remain unknown.

## 10. Table Stakes

- authentication: Build Now
- data export: Build Next
- enterprise sso: Build Now

## 11. Differentiators

authentication

## 12. UX and Onboarding

Evidence-limited; no rating is invented from private dashboard claims.

## 13. Pricing and Monetization

No current price is stated without a dated source.

## 14. Trust, Security, Privacy, and Credibility

Repository signals are not proof of legal compliance. Qualified review is required.

## 15. Growth and Retention

Recommendations require product and user evidence; deceptive loops are excluded.

## 16. SEO, Content, and Distribution

Exact search volume is not claimed without an external source.

## 17. Accessibility

Code signals do not establish WCAG conformance; conduct keyboard, screen-reader, contrast, and responsive testing.

## 18. Technical Feasibility

See `technical-feasibility.md`.

## 19. Priority Roadmap

See `recommended-roadmap.md`.

## 20. Do Not Build Yet

See `do-not-build-yet.md`.

## 21. Better-Than-Competitor Opportunities

Validate significant competitor advantages before designing a superior implementation.

## 22. Positioning Recommendations

See `positioning-recommendations.md`.

## 23. Changes Since Previous Scan

Run the `diff` command with previous and current reports.

## 24. Final Action Plan

Build the highest-evidence Build Now items, validate costly weak-evidence items, and protect verified app advantages.

## 25. Evidence and Sources

- https://nebula.example/docs/features (2026-06-20T12:00:00.000Z; high): manual
- https://reviews.example/nebula (2026-06-18T12:00:00.000Z; low): manual
- https://nebula.example/features (2026-06-19T12:00:00.000Z; medium): manual
- https://quasar.example/unavailable (2026-06-20T12:00:00.000Z; unknown): failed

## 26. Uncertainty and Missing Data

- 1 source(s) were unavailable or blocked; absence claims are not supported by those failures.

Bottom line:
- Build these first: authentication, enterprise sso
- Validate these before building: ai recommendations
- Do not build these yet: native mobile app
- The strongest current advantage is: authentication
- The biggest competitive risk is: ai recommendations
- The next best move is: verify the top recommendation with users and source evidence.
