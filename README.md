# DecisionOS

DecisionOS is a local-first personal decision calibration dashboard. It helps users record important decisions before the outcome is known, review what actually happened later, and inspect deterministic calibration metrics.

The app is designed as a realistic Data Science portfolio project: no production AI, no paid APIs, no backend, no login, no Supabase/Firebase, and no cloud database.

## Features

- Create decisions with expected outcome, confidence, category, reasoning, and review date
- Review due decisions with happened / did not happen / partial status
- Capture satisfaction score and lesson learned
- Dashboard for pending reviews, recent decisions, recent lessons, and warnings
- Analytics for Brier Score, calibration gap, confidence buckets, overconfidence index, accuracy by category, and decision health score
- Rule-based warnings with visible trigger values
- IndexedDB persistence in the current browser
- JSON export/import backup
- Demo data for screenshots and onboarding
- Responsive UI for desktop and mobile

## Privacy Model

DecisionOS is local-first. Decision records, lessons, confidence values, and analytics stay in the browser's IndexedDB storage.

The MVP has:

- no API
- no authentication
- no backend
- no Supabase or Firebase
- no cloud database
- no paid API
- no OpenAI API in production
- no analytics tracking

Export/import JSON is manual and user-triggered. Exported files are created in the browser.

## Scoring Methodology

- **Brier Score:** mean squared error between confidence probability and outcome value.
- **Outcome values:** happened = `1`, partial = `0.5`, did not happen = `0`.
- **Calibration Gap:** average confidence minus observed accuracy.
- **Overconfidence Index:** positive calibration gap only.
- **Confidence Buckets:** reviewed decisions grouped into `0-20`, `21-40`, `41-60`, `61-80`, and `81-100`.
- **Accuracy by Category:** observed accuracy grouped by user-entered category.
- **Decision Health Score:** 0-100 composite from calibration quality, review completion, lesson quality, and category spread.

Scores are educational feedback, not advice or prediction.

## Technology

- Next.js App Router
- TypeScript
- Tailwind CSS
- Recharts
- IndexedDB
- Vitest
- Vercel Hobby-compatible deployment

`shadcn/ui` is optional later and is not required for the current MVP.

## Run Locally

Prerequisites: Node.js 22.13 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality Checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Before deployment, run local browser checking for:

- Dashboard
- New Decision
- Review Decision
- Analytics
- Settings
- export JSON
- import JSON
- responsive layout
- browser console errors

## Deployment

1. Push the repository to GitHub.
2. In Vercel, choose **Add New Project** and import the repository.
3. Keep the detected Next.js defaults.
4. No environment variables are required.
5. Deploy on the Hobby plan.

Production URL: not deployed yet.

## Project Knowledge

- [`AGENTS.md`](./AGENTS.md) - governance and engineering rules
- [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) - product model and architecture
- [`DECISIONS.md`](./DECISIONS.md) - approved decision log
- [`DESIGN.md`](./DESIGN.md) - UI design system and visual constraints

## Limitations

DecisionOS does not recommend what to decide, predict outcomes, sync across devices, support accounts, or recover data after browser storage is cleared unless the user exported a JSON backup.
