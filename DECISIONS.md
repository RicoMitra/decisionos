# Decision Log

This file records approved product and technical decisions. Add new entries instead of silently changing historical rationale. If a decision is replaced, mark it as superseded and link to the replacement entry.

## Superseded Historical Decisions

The following decisions belonged to the earlier stock portfolio dashboard direction. They are preserved as history but are no longer active for this repository because DecisionOS has replaced the project direction.

### D-001: Educational Portfolio Dashboard

- **Status:** Superseded by D-013
- **Decision:** Build a visual portfolio analysis tool for beginner investors, not an AI trading agent or recommendation engine.
- **Rationale:** The product should improve understanding while avoiding opaque or prescriptive financial behavior.
- **Consequence:** Replaced by DecisionOS non-advisory decision calibration scope.

### D-002: Manual Data for Portfolio MVP

- **Status:** Superseded by D-014
- **Decision:** Users manually enter holdings, current prices, and cash.
- **Rationale:** This kept the first release reliable, inexpensive, and independent of provider licensing and rate limits.
- **Consequence:** Replaced by local browser decision records as the source of truth.

### D-003: English User Interface

- **Status:** Superseded by D-020
- **Decision:** Use English for all user-facing MVP copy and technical documentation.
- **Rationale:** English improves international GitHub portfolio readability.
- **Consequence:** English remains active for DecisionOS under D-020.

### D-004: Local Browser Persistence

- **Status:** Superseded by D-014
- **Decision:** Persist validated portfolio inputs in versioned browser `localStorage`.
- **Rationale:** Users retain their work across refreshes without accounts, servers, or third-party data sharing.
- **Consequence:** Replaced by IndexedDB persistence for DecisionOS records.

### D-005: Transparent Rule-Based Insights

- **Status:** Superseded by D-016
- **Decision:** Use deterministic thresholds rather than an LLM for MVP insights.
- **Rationale:** Rule-based output is testable, explainable, private, and free from model hallucination or API cost.
- **Consequence:** Replaced by deterministic DecisionOS scoring and warning rules.

### D-006: Initial Portfolio Insight Thresholds

- **Status:** Superseded by D-016
- **Decision:** Flag concentration and cash exposure with documented thresholds.
- **Rationale:** Explicit defaults make the first implementation deterministic and reviewable.
- **Consequence:** Replaced by DecisionOS calibration and bias warning thresholds.

### D-007: Knowledge Stored in the Repository

- **Status:** Superseded by D-021
- **Decision:** Use `AGENTS.md`, `PROJECT_CONTEXT.md`, and `DECISIONS.md` as repository knowledge sources.
- **Rationale:** Repository documentation survives thread changes and keeps future implementation aligned without relying on chat memory.
- **Consequence:** This governance pattern remains active for DecisionOS under D-021.

### D-008: Best-Effort Yahoo Finance Price Refresh

- **Status:** Superseded by D-015
- **Decision:** Provide on-demand IDX price refreshes through a server-side Yahoo Finance adapter.
- **Rationale:** Yahoo provided a convenient no-key source for portfolio estimates.
- **Consequence:** DecisionOS has no production API, backend route, or external data source.

### D-009: Transparent Portfolio Health Score

- **Status:** Superseded by D-016
- **Decision:** Compute a 0-10 portfolio health score from diversification, concentration, cash allocation, and stock performance.
- **Rationale:** A visible factor breakdown is more useful and testable than a hardcoded score.
- **Consequence:** Replaced by a DecisionOS decision health score based on documented calibration and review factors.

### D-010: Educational Daily Market Watch

- **Status:** Superseded by D-015
- **Decision:** Rank three symbols from a fixed liquid-IDX universe using Yahoo OHLCV data.
- **Rationale:** Free Yahoo data avoided paid order-book sources.
- **Consequence:** Removed from active scope. DecisionOS has no market data feature.

### D-011: Deterministic Sector Allocation

- **Status:** Superseded by D-016
- **Decision:** Map known IDX tickers to broad sectors locally and group unknown symbols under `Other`.
- **Rationale:** This provided understandable sector exposure without requiring another external profile API.
- **Consequence:** Replaced by local decision categories and accuracy-by-category analytics.

### D-012: Client-Side PDF Export

- **Status:** Superseded by D-017
- **Decision:** Generate portfolio summary PDFs in the browser with jsPDF and AutoTable.
- **Rationale:** Private inputs and calculations remained on-device while users received a portable report.
- **Consequence:** Replaced by JSON export/import backup for DecisionOS MVP.

## Active DecisionOS Decisions

### D-013: DecisionOS Product Direction

- **Status:** Accepted
- **Decision:** Replace the stock portfolio dashboard with DecisionOS, a local-first personal decision calibration system.
- **Rationale:** DecisionOS is a unique, realistic, free, privacy-safe GitHub portfolio project that demonstrates Data Science, product thinking, frontend engineering, testing, and documentation without paid infrastructure.
- **Consequence:** All future product work must support decision capture, outcome review, calibration analytics, and non-advisory learning.

### D-014: Local-First IndexedDB Storage

- **Status:** Accepted
- **Decision:** Store user-created decisions, reviews, lessons, and derived local state in browser IndexedDB.
- **Rationale:** IndexedDB supports private, client-side persistence without accounts, backend services, cloud databases, or paid infrastructure.
- **Consequence:** Data stays on the user's current browser and device unless manually exported. Storage work must include schema versioning, malformed data handling, and reset behavior.

### D-015: No API, Auth, Backend, or Cloud Database

- **Status:** Accepted
- **Decision:** DecisionOS must ship with no production API, no authentication, no backend, no Supabase/Firebase, no cloud database, no paid API, and no OpenAI API.
- **Rationale:** The project must remain free, safe, local-first, and Vercel Hobby compatible.
- **Consequence:** Do not add server routes, remote persistence, user accounts, telemetry, model calls, or external runtime services without a new owner-approved decision.

### D-016: Deterministic Scoring Engine

- **Status:** Accepted
- **Decision:** Use typed, framework-independent functions to calculate Brier Score, calibration gap, confidence buckets, overconfidence index, accuracy by category, decision health score, and rule-based bias warnings.
- **Rationale:** Deterministic scoring is testable, explainable, private, and appropriate for a Data Science portfolio project.
- **Consequence:** UI components must consume scoring outputs rather than duplicating formulas. Any formula, threshold, or interpretation change requires owner approval and a decision log update.

### D-017: JSON Export and Import Backup

- **Status:** Accepted
- **Decision:** Provide browser-only JSON export/import for manual backups and migration.
- **Rationale:** JSON backup keeps the app local-first and avoids accounts, cloud sync, or external storage.
- **Consequence:** Export files must be user-triggered, import parsing must validate schema and tolerate malformed files safely, and no backup data may be sent to a server.

### D-018: Vitest-First Engine and Data Tests

- **Status:** Accepted
- **Decision:** Prioritize Vitest coverage for scoring, validation, chart-data mapping, storage adapters, import/export, and deterministic fixtures before broader component tests.
- **Rationale:** Engine and data correctness are the core portfolio value and should be reliable before UI polish expands.
- **Consequence:** Engine/data tests are release blockers. Component tests are added later after core UI stabilizes.

### D-019: Delivery Order

- **Status:** Accepted
- **Decision:** Build in this order: engine + tests, storage, core UI, polish, browser checking, Vercel.
- **Rationale:** This order reduces risk by proving the core data model and scoring behavior before visual implementation and deployment.
- **Consequence:** Later implementation plans should preserve this sequence unless the owner explicitly changes it.

### D-020: English UI and Documentation

- **Status:** Accepted
- **Decision:** Use English for user-facing MVP copy, technical documentation, identifiers, and comments unless localization is explicitly introduced later.
- **Rationale:** English improves GitHub portfolio readability for HR, reviewers, and international collaborators.
- **Consequence:** Do not mix Indonesian labels into the interface by default.

### D-021: Repository Knowledge Sources

- **Status:** Accepted
- **Decision:** Use `AGENTS.md` for governance, `PROJECT_CONTEXT.md` for living product and architecture context, and `DECISIONS.md` for approved decisions.
- **Rationale:** Repository documentation survives thread changes and keeps future implementation aligned without relying on chat memory.
- **Consequence:** Agents must read and update these documents when relevant decisions change.

### D-022: Optional shadcn/ui

- **Status:** Accepted
- **Decision:** Treat `shadcn/ui` as optional later, not required for the initial governance, engine, or data phases.
- **Rationale:** The project should avoid unnecessary dependency or component-system work before the scoring engine and storage are stable.
- **Consequence:** UI work may add or use shadcn/ui only if it improves quality, remains frontend-only, and does not compromise Vercel Hobby compatibility.

### D-023: Browser Checking Before Deployment

- **Status:** Accepted
- **Decision:** Before Vercel deployment, Codex must run local browser checking for Dashboard, New Decision, Review Decision, Analytics, Settings, export/import JSON, responsive layout, and browser console errors.
- **Rationale:** Local visual and functional verification catches deploy-blocking UI issues that static tests may miss.
- **Consequence:** Browser checking is required before claiming the app is deploy-ready.

### D-024: Vercel Hobby-Compatible Deployment

- **Status:** Accepted
- **Decision:** Deploy DecisionOS through a free, Vercel Hobby-compatible frontend/client-first workflow.
- **Rationale:** The project must remain realistic for a student portfolio without additional hosting cost.
- **Consequence:** Deployment must not require paid services, backend infrastructure, cloud databases, server-side data storage, or production API credentials.
