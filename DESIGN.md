# Design

> Auto-generated and maintained by frontend-god-mode.
> Source of truth for typography, color, motion, layout, and component tokens.
> Read this BEFORE touching the UI in any subsequent session.

## Aesthetic Direction

Premium personal analytics dashboard: warm off-white workspace, charcoal text, restrained amber accent, dense enough for metrics but calm enough for reflection.

## Dials

- DESIGN_VARIANCE: 8 / 10
- MOTION_INTENSITY: 6 / 10
- VISUAL_DENSITY: 4 / 10

## Type Stack

- Display: Geist
- Body: Geist
- Mono: Geist Mono
- Loaded via: `next/font/google`
- Numeric data uses tabular mono-style presentation through `font-mono`

Banned in this project: Inter, Roboto, Arial, system-ui, serif dashboard typography.

## Color Tokens

```css
:root {
  --bg: oklch(0.975 0.01 80);
  --panel: oklch(0.995 0.006 80);
  --surface: oklch(0.94 0.012 80);
  --fg: oklch(0.19 0.012 80);
  --muted: oklch(0.47 0.018 80);
  --border: oklch(0.86 0.014 80);
  --accent: oklch(0.56 0.13 75);
}
```

Banned in this project:

- Pure `#000` / `#FFF`
- Purple-to-blue gradients
- More than one primary accent
- Untinted pure-black shadows

## Layout

- Container: `max-w-[1400px] mx-auto px-4 md:px-8`
- App frame: left navigation rail plus primary content
- Cards: one level only, used for dashboard panels and form surfaces
- Reading width: `max-w-[65ch]`
- Full-height surfaces: `min-h-[100dvh]`
- Mobile: all grids collapse to one column with minimum `px-4`

## Component Inventory

- Custom `Button`, `Input`, and `Card` primitives
- `DecisionOSApp` client shell
- Dashboard, New Decision, Review Decision, Analytics, and Settings views inside the app shell
- Recharts bar and pie charts with textual legends

## Brand Voice

- Tone: direct, private, analytical, non-advisory
- Button labels use specific verbs such as `Save decision`, `Save review`, `Export JSON`, and `Import JSON`
- Banned words: elevate, seamless, unleash, next-gen, revolutionary, game-changing

## Accessibility Floor

- WCAG AA contrast for body copy
- Visible focus rings
- Form fields use visible labels
- Touch targets at least 44px on mobile-critical controls
- Charts include textual equivalents
- `prefers-reduced-motion` respected

## Last Updated

2026-06-26 by DecisionOS MVP build: established app shell, dashboard surfaces, form controls, analytics charts, and local-first privacy styling.
