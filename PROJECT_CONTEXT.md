# Project Context

## Product Summary

DecisionOS is a local-first personal decision calibration system. It helps users record important decisions before they happen, capture expected outcomes and confidence levels, then review actual outcomes later to measure calibration and learn from patterns.

The product is not an AI advisor, recommendation engine, journaling app, coaching product, or decision automation tool. It does not tell users what to choose. It helps users understand how accurate and calibrated their own expectations have been.

## Target User and Experience

The project is built as a realistic GitHub portfolio project for a Data Science student. It should be unique enough to show product thinking and data science fundamentals, but practical enough to build with ChatGPT Plus and Codex, test locally, and deploy on Vercel Hobby without extra cost.

The app's end user is an individual tracking meaningful decisions across projects, learning, purchases, career, or personal planning. The interface is written in English for GitHub and HR readability.

The experience should feel like a premium personal analytics dashboard: calm, private, structured, and easy to scan. It should avoid generic AI-product styling, excessive decoration, and any language that implies advice or prediction.

## MVP Capabilities

- Create a decision with title, category, expected outcome, confidence percentage, reasoning, decision date, and review date.
- List decisions that are pending review and highlight decisions due today or overdue.
- Review a decision with actual outcome status, satisfaction score, and lesson learned.
- Show recent decisions and recent lessons.
- Calculate Brier Score, calibration gap, confidence buckets, overconfidence index, accuracy by category, and decision health score.
- Show rule-based bias warnings such as possible overconfidence or planning fallacy with the exact condition that triggered them.
- Visualize analytics with Recharts and include textual values so color is not the only source of meaning.
- Store all records locally in IndexedDB.
- Export and import JSON backups.
- Provide clearly labeled demo data for onboarding and testing.
- Run deterministic engine and data tests with Vitest before broader UI test coverage.

## MVP Pages

- **Dashboard:** Summary metrics, pending reviews, recent decisions, recent lessons, and key warnings.
- **New Decision:** Form for capturing a decision before the outcome is known.
- **Review Decision:** Workflow for evaluating due decisions and recording outcome details.
- **Analytics:** Calibration charts, confidence buckets, category accuracy, trends, and scoring explanations.
- **Settings:** Demo data controls, JSON export/import, reset action, privacy explanation, limitations, and methodology links.

## Decision Data Model

Version 1 records are user-created and stored only in the browser.

Core decision fields:

- `id`
- `title`
- `category`
- `decisionDate`
- `reviewDate`
- `expectedOutcome`
- `confidencePercentage`
- `reasoning`
- `status`: `pending` or `reviewed`
- `actualOutcomeStatus`: `happened`, `did_not_happen`, or `partial`
- `satisfactionScore`
- `lessonLearned`
- `createdAt`
- `updatedAt`

Implementation may refine exact TypeScript names, but any semantic change to fields, outcome meanings, or scoring interpretation requires owner approval and a `DECISIONS.md` update.

## Scoring Model

DecisionOS uses deterministic scoring, not AI-generated assessment.

Initial scoring outputs:

- **Brier Score:** Measures prediction error from confidence and actual outcome.
- **Calibration Gap:** Difference between average confidence and observed accuracy.
- **Confidence Buckets:** Groups decisions by confidence range and compares predicted confidence against actual results.
- **Overconfidence Index:** Flags when confidence persistently exceeds realized outcomes.
- **Accuracy by Category:** Shows reviewed outcome accuracy grouped by category.
- **Decision Health Score:** A visible composite score derived from documented calibration, review completion, lesson quality, and category spread factors.
- **Rule-Based Bias Warnings:** Descriptive warnings such as possible overconfidence or planning fallacy, always paired with the triggering condition.

The scoring methodology must be documented and tested. Scores are educational signals, not universal measures of decision quality.

## Data and Application Flow

1. Capture and validate decision inputs in the browser.
2. Normalize dates, confidence percentages, categories, outcome statuses, and scores into typed domain records.
3. Save validated records to versioned IndexedDB storage.
4. Retrieve records locally and pass them into pure scoring functions.
5. Derive dashboard summaries, chart data, warnings, and lessons from scoring outputs.
6. Present derived values in cards, tables, and charts with textual equivalents.
7. Export/import JSON backups entirely in the browser.
8. Reset local data only through an explicit user action.

The data flow is one-directional: user input becomes validated records, records become derived scores, and scores become presentation models. UI components must not duplicate scoring formulas.

## Privacy and Access Model

DecisionOS has no production API, no authentication, no backend, no Supabase or Firebase, no cloud database, no paid API, and no OpenAI API.

All decision data remains on the user's current browser and device unless the user manually exports a JSON file. Importing JSON restores data from a user-selected local file. The app must not send decision content, lessons, confidence values, analytics, or exports to any server or third party.

The app may be deployed to Vercel Hobby as a frontend/client-first application. Deployment must not introduce server-side persistence, account systems, telemetry, or external data transfer.

## Technical Architecture

- Next.js App Router with TypeScript
- Tailwind CSS for styling
- Recharts for analytics visualization
- IndexedDB for local persistence
- Vitest for deterministic engine and data tests
- Optional `shadcn/ui` later if useful for UI primitives
- Vercel Hobby-compatible deployment

The architecture should keep domain logic framework-independent. Scoring, validation, import/export parsing, and storage mapping should be testable without rendering UI.

No backend routes, API integrations, authentication providers, cloud databases, OpenAI API calls, paid services, or production AI dependencies are part of the MVP.

## Delivery Sequence

1. **Engine + Vitest tests:** Define types, validation rules, scoring functions, chart-data mappers, warning rules, and deterministic fixtures.
2. **Storage:** Add IndexedDB persistence, schema versioning, export/import JSON, malformed data handling, and reset behavior.
3. **Core UI:** Build Dashboard, New Decision, Review Decision, Analytics, and Settings around the tested domain layer.
4. **Polish:** Improve copy, layout, accessibility, responsive behavior, empty states, demo data, and methodology documentation.
5. **Browser checking:** Run local browser checking for required pages, export/import JSON, responsive layout, and console errors.
6. **Vercel:** Deploy through a free, Vercel Hobby-compatible workflow and document the deployment URL.

## Browser Checking Requirements

Before deployment, Codex must locally verify:

- Dashboard renders and summarizes data correctly.
- New Decision can create a valid decision.
- Review Decision can review a due decision.
- Analytics renders calibration and category views.
- Settings exposes export JSON, import JSON, reset, privacy, and limitations.
- Export/import JSON round trip works in the browser.
- Responsive layout works on mobile and desktop viewport sizes.
- Browser console has no relevant runtime errors.

## Definition of Done

The MVP is complete when a user can create decisions, review outcomes, inspect calibration analytics, understand scoring methodology, back up and restore data with JSON, reset local data, and use the app on mobile and desktop without accounts or external services.

Linting, type checking, Vitest tests, production build, and local browser checking must pass before deployment. The deployed Vercel URL and project limitations must be documented.
