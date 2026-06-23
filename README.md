# Site Visit Scheduler

An interactive weekly planner for scheduling field visits across Metro Manila and nearby provinces, built to handle the real constraints of getting around the city — traffic, vehicle coding (number-coding scheme), and clustering stops by location to minimise travel time.

Built with Next.js, React, TypeScript, and Tailwind CSS. No backend — all data lives in the browser via `localStorage`.

> Built with [Claude](https://claude.ai) as an exercise in turning a recurring manual workflow (previously tracked in a notes app and a table) into a purpose-built tool.

## What it does

- **Weekly board, Monday–Sunday.** Each day is a column showing the visits planned for it, with a running timeline: departure from base, travel time between stops, estimated arrival, an on-site visit duration (adjustable per stop, 30–90 minutes), and an estimated return time.
- **Day filter.** Hide or show any combination of days. A one-tap preset switches between weekdays-only and the full seven days.
- **Drag-and-drop**, powered by [dnd-kit](https://dndkit.com/). Rearrange visits within a day, move them between days, or send them to/from the shared backlog — works with mouse and touch.
- **Multi-select for bulk actions.** A select mode lets you tick multiple cards — or select an entire day at once — then move them all to another day, send them to the backlog, or delete them in one step.
- **Traffic-aware travel times.** Travel estimates between locations default to realistic Metro Manila midday traffic. A toggle recalculates everything at free-flow (no-traffic) speed for comparison.
- **Number-coding awareness.** Each weekday column shows which plate-ending digits are coded, so visits can be planned around the vehicle's coding day. Monday and weekends are flagged as coding-free by default, and any day's coding status can be overridden per week.
- **Per-week schedules.** Every week keeps its own layout. The backlog of unscheduled clients is shared across all weeks and caps at four rows before scrolling.
- **Priority tagging.** Mark important clients; they get a visual accent so they stand out on the board.
- **Add / edit / remove clients.** Full client records — name, address, city, notes, priority, and an editable date — managed in-app. Adding a name that already exists prompts a duplicate warning that shows where the existing client is scheduled.
- **Export / import.** Download all data as a single JSON backup file and load it on another device. This is how data moves between, for example, a laptop and a phone, since there is no backend to sync through.

## How travel time is estimated

Travel times come from a lookup table of location-to-location estimates calibrated for Metro Manila traffic, with a city-to-city fallback for pairs that are not listed individually. With the traffic toggle off, each estimate is scaled down to approximate free-flow conditions. These are planning estimates, not live routing — they are meant to keep a day's stops realistic, not to replace a maps app on the day of travel.

## Data and privacy

All data is stored locally in the browser via `localStorage` (through Zustand's persist middleware). Nothing is sent to a server — there is no backend. Because storage is per-browser and per-device, data does not automatically sync between devices; the Export / Import buttons exist to move a backup file across devices manually.

## Running it locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Tech stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS v4
- [Zustand](https://github.com/pmndrs/zustand) with the `persist` middleware for state management
- [dnd-kit](https://dndkit.com/) for drag-and-drop
- [date-fns](https://date-fns.org/) for date/week math
- [Lucide](https://lucide.dev/) for icons

Deployed on Vercel.

## Legacy version

The original single-file HTML prototype (vanilla JS, no build step) is preserved in [`legacy/index.html`](legacy/index.html) for reference. It is not maintained going forward.
