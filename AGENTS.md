# Project Governance

## Owner

This project is owned by **Rico Majesty Daniel Mitra** ([@RicoMitra](https://github.com/RicoMitra)).

## Purpose

DecisionOS is a clean, educational, local-first web application for personal decision calibration. It helps users record important decisions before acting, define expected outcomes and confidence levels, then review the real outcome later to learn whether their judgment is calibrated.

The project is designed as a public GitHub portfolio project for a Data Science student. It should demonstrate product thinking, deterministic scoring, frontend engineering, privacy-aware design, testing, and technical documentation without depending on paid services or production AI.

DecisionOS is **not** an AI advisor, therapy product, productivity coach, financial advisor, or automated recommendation system. It must never present its output as professional advice or tell users what decision to make.

### Core Capabilities

- Create decisions with a title, category, expected outcome, confidence percentage, reasoning, decision date, and review date.
- Show pending reviews, recent decisions, recent lessons, and high-level calibration metrics on a dashboard.
- Review due decisions with actual outcome status, satisfaction score, and lesson learned.
- Calculate deterministic scoring metrics such as Brier Score, calibration gap, confidence buckets, overconfidence index, accuracy by category, and decision health score.
- Generate rule-based bias warnings such as possible overconfidence or planning fallacy using documented conditions.
- Visualize calibration, category accuracy, and confidence buckets with accessible charts and textual equivalents.
- Store all user data locally in the browser with IndexedDB.
- Export and import JSON backups so users can move or restore their data manually.
- Provide demo data that is clearly labeled and never presented as user data.

### Locked Scope Boundaries

DecisionOS must remain:

- local-first
- free to build and deploy
- Vercel Hobby compatible
- no API
- no authentication
- no backend
- no Supabase or Firebase
- no cloud database
- no paid API
- no OpenAI API in production

Do not add external services, server routes, cloud sync, login, analytics tracking, AI-generated advice, or background data transfer unless the owner explicitly approves a new documented decision.

## Project Context and Goals

Many people make important decisions with high confidence but rarely return later to measure whether their expectations were accurate. DecisionOS turns those decisions into a structured feedback loop: prediction, confidence, outcome review, calibration score, and lesson learned.

The product should feel like a focused personal analytics workspace rather than a journal. Its value is the scoring engine and transparent feedback, not generic note-taking or AI advice.

### Primary User

The primary user is a Data Science student or early-career builder who wants a unique, realistic, privacy-safe portfolio project that can be built with ChatGPT Plus and Codex, tested locally, and deployed to Vercel without extra cost.

The end user is any individual who wants to track decisions in areas such as projects, learning, purchases, career, or personal planning.

### Product Goals

- Help users record predictions before decisions are evaluated by hindsight.
- Make confidence calibration understandable through simple metrics and charts.
- Turn reviewed outcomes into deterministic, transparent learning signals.
- Keep private decision data on the user's device.
- Demonstrate a production-minded, data-driven web app that is safe for a public GitHub portfolio.
- Stay small enough to finish as a polished MVP without backend or paid infrastructure.

### Success Criteria

- A user can create, edit, review, and delete decisions without an account.
- A user can see which decisions are due for review and complete those reviews.
- Scoring outputs reconcile with documented formulas and visible decision data.
- Analytics remain understandable without relying on chart colors alone.
- Every warning or insight states the condition behind it and avoids prescriptive advice.
- Export/import JSON works as a private manual backup workflow.
- The experience is usable on mobile and desktop.
- Engine and data behavior have deterministic Vitest coverage before UI work expands.
- Before deployment, Codex performs local browser checking for the required pages, export/import JSON, responsive layout, and console errors.

### Non-Goals

- Recommending what decision a user should make
- Predicting the future
- AI-generated coaching or advice
- OpenAI API or model calls in production
- Login, authentication, accounts, or user profiles
- Backend routes or server-side persistence
- Supabase, Firebase, or any cloud database
- Paid APIs or paid SaaS dependencies
- Collaborative sharing or cross-device sync in the initial release
- Sensitive health, legal, financial, or emergency decision support

## Data Sources, Tools, and Access

### Version 1 Data Source

The source of truth is data entered directly by the user in the browser:

- decision title
- category
- decision date
- review date
- expected outcome
- confidence percentage
- reasoning
- actual outcome status: `happened`, `did_not_happen`, or `partial`
- satisfaction score
- lesson learned

Demo data may be shipped as static fixtures for onboarding, screenshots, and tests. Demo data must be clearly labeled and must never be presented as live, remote, or user-owned data.

### Data Access and Authentication

- Version 1 is a single-user, client-side experience and requires no account or authentication.
- Store decision records, reviews, lessons, and calculated results on-device in IndexedDB.
- Provide export/import JSON for manual backup and migration.
- Treat stored decisions as private. Provide a clear reset action.
- Never send user decision data to a server, analytics provider, AI model, or third party.
- Never commit personal exports, secrets, tokens, credentials, or private decision data to the repository.

### Required Development Tools

- Use the required application stack defined below.
- Use TypeScript types and framework-independent scoring utilities as the data contract and processing layer.
- Use Vitest for free, deterministic engine and data tests.
- Use the repository's package-manager lockfile consistently; do not mix package managers.
- Do not install dependencies during docs/governance-only phases.
- Use environment variables only if an owner-approved future integration needs them, and provide safe placeholder names in `.env.example`.

## Decision Data Workflow

Use the following sequence for every decision and analytics change:

1. **Capture:** Accept user inputs with explicit labels, clear validation rules, and actionable validation messages.
2. **Normalize:** Parse dates, confidence percentages, outcome status, satisfaction score, and category into typed canonical decision records.
3. **Store:** Persist validated records in IndexedDB with a versioned schema.
4. **Review:** Let users evaluate due decisions with actual outcome status, satisfaction score, and lesson learned.
5. **Score:** Calculate Brier Score, calibration gap, confidence buckets, overconfidence index, accuracy by category, decision health score, and related aggregates through pure functions.
6. **Explain:** Generate deterministic rule-based warnings with visible trigger conditions.
7. **Present:** Map derived results into dashboard cards, tables, and Recharts data while retaining textual equivalents.
8. **Backup:** Export/import JSON without involving any server.
9. **Verify:** Reconcile metrics, test edge cases, and confirm formatting does not change underlying numeric values.

The data flow must remain one-directional: raw user input becomes validated domain data, domain data becomes derived results, and derived results become presentation models. UI components must not duplicate or independently recalculate scoring formulas.

## Workflow Automation

Automate repeatable engineering checks after the application is updated:

- Provide package scripts for development, linting, type checking, testing, and production builds.
- Prioritize engine and data tests first with Vitest; add component tests later after core UI stabilizes.
- Keep test fixtures deterministic and independent of network access.
- Treat failed scoring tests, storage tests, type checks, lint checks, or production builds as release blockers.
- Before Vercel deployment, run local browser checking and verify:
  - Dashboard
  - New Decision
  - Review Decision
  - Analytics
  - Settings
  - export JSON
  - import JSON
  - responsive layout
  - browser console errors
- Document local workflow and deployment URL in `README.md` during the documentation phase that updates README.

Do not automate advice, decision-making, unattended changes to user data, network transfer, or production AI behavior.

## Required Technology Stack

- Next.js with TypeScript
- Tailwind CSS
- Recharts
- IndexedDB
- Vitest for engine and data tests
- Vercel Hobby for deployment

`shadcn/ui` may be added later as an optional UI primitive source if it improves implementation quality and remains compatible with the free, frontend-only deployment model. It is not required for the initial governance or engine phases.

## Project Knowledge Sources

Agents must read these files before making product or architectural changes:

1. `AGENTS.md` defines project governance, engineering constraints, and decision authority.
2. `PROJECT_CONTEXT.md` defines the product model, user experience, data flow, architecture, and delivery sequence.
3. `DECISIONS.md` records approved product and technical decisions with their rationale and consequences.

Keep these documents synchronized when an approved change affects project scope, architecture, data handling, scoring semantics, privacy, deployment, or user experience. Do not rely on chat history as the only record of an important decision.

Do not introduce a major framework, state-management library, backend, API, database, authentication provider, AI service, charting replacement, or paid dependency without owner approval. Prefer built-in platform capabilities and the required stack before adding dependencies.

## Product and Design Direction

The interface should feel like a premium personal analytics dashboard: calm, focused, trustworthy, minimal, and easy to scan.

- Favor off-white, charcoal, gray, and restrained accent colors.
- Avoid neon purple, bright blue-led themes, visual clutter, excessive decoration, and dense layouts.
- Keep hierarchy obvious: review status and calibration metrics first, supporting analytics second, lessons and warnings third.
- Clearly distinguish user-entered decision data from calculated scores and warnings.
- Ensure responsive behavior, keyboard usability, readable contrast, and meaningful labels for charts and controls.
- When building UI, use the available frontend/UI skills to improve quality while preserving deployability and avoiding unnecessary dependencies.

## Engineering Rules

- Use modular, focused components and reusable UI primitives.
- Keep scoring calculations in typed, framework-independent functions so they are deterministic and straightforward to test.
- Define explicit TypeScript types for decisions, reviews, outcomes, categories, scores, chart data, warnings, export files, and storage records. Avoid `any`.
- Use clear domain naming and consistent units. Document whether a value represents probability, percentage, score, count, date, or category.
- Handle empty datasets, invalid input, partial reviews, zero confidence boundaries, and missing optional text without producing `NaN`, `Infinity`, or misleading output.
- Format percentages and scores consistently while preserving unrounded numeric values for calculations.
- Keep rule-based warnings descriptive, transparent, and non-prescriptive. Never imply guaranteed outcomes or instruct users what to decide.
- Prefer semantic HTML and accessible chart patterns. Do not encode essential meaning through color alone.
- Maintain portfolio-quality documentation describing purpose, features, scoring methodology, privacy model, limitations, local setup, and Vercel deployment.
- Keep code, identifiers, comments, commits, and technical documentation in clear English unless user-facing localization requirements say otherwise.

## Decision-Making Policy

Agents may independently make reversible, low-risk decisions that follow this document and established repository patterns. Examples include component boundaries, naming refinements, small accessibility improvements, test organization, and implementation details that do not alter user-visible behavior or scoring semantics.

Agents must ask the owner before making decisions that affect:

- Product scope or the meaning of a feature
- Scoring formulas, thresholds, units, assumptions, or calculation semantics
- Data storage, privacy, authentication, APIs, or external integrations
- Major dependencies or replacements to the required stack
- The approved visual direction or primary interaction model
- Application architecture, deployment strategy, or backward compatibility
- Any behavior that could be interpreted as advice

When requirements are incomplete, use this order of precedence:

1. Protect data privacy, local-first behavior, scoring correctness, and non-advisory positioning.
2. Follow the explicit owner request and this document.
3. Follow existing repository conventions and reusable patterns.
4. Choose the smallest reversible solution that satisfies the requirement.
5. Record important assumptions and escalate high-impact ambiguity to the owner.

## Delivery Order

Use this phase order unless the owner explicitly changes it:

1. Engine + Vitest tests
2. IndexedDB storage
3. Core UI
4. Polish
5. Browser checking
6. Vercel deployment

## Quality Guardrails

- Scoring outputs must be deterministic, testable, and derived from visible or documented inputs.
- Engine and data tests come before broader component tests.
- Unit tests must cover normal datasets, empty datasets, zero/edge confidence values, happened/did-not-happen/partial outcomes, category aggregation, and warning thresholds.
- Storage tests must cover schema versioning, malformed imports, export/import round trips, and reset behavior.
- UI behavior should later be tested for creation, validation, review completion, analytics updates, export/import, and responsive presentation.
- Warnings must explain the observation or threshold that produced them and remain educational rather than prescriptive.
- Charts must have textual values or summaries so users are not required to infer exact figures visually.
- Before considering a deployable change complete, run relevant type checks, lint checks, tests, production build, and local browser checking.
