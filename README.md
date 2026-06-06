# Site Visit Scheduler

An interactive weekly planner for scheduling field visits across Metro Manila and nearby provinces, built to handle the real constraints of getting around the city — traffic, vehicle coding (number-coding scheme), and clustering stops by location to minimise travel time.

Built as a single self-contained HTML file with no build step, no framework, and no backend. All data lives in the browser.

**Live demo:** `https://schuyl3r.github.io/site-visit-scheduler/`

> Built with [Claude](https://claude.ai) as an exercise in turning a recurring manual workflow (previously tracked in a notes app and a table) into a purpose-built tool.

## What it does

- **Weekly board, Monday–Sunday.** Each day is a column showing the visits planned for it, with a running timeline: departure from base, travel time between stops, estimated arrival and a 30–90 minute visit window per client, and an estimated return time.
- **Day filter.** Hide or show any combination of days. A one-tap preset switches between weekdays-only and the full seven days.
- **Drag-and-drop (desktop) and tap-to-move (touch).** Rearrange visits within a day, move them between days, or send them back to the shared backlog. The tap-to-move flow makes the same actions work on a phone, where native drag-and-drop does not.
- **Multi-select for bulk actions.** A select mode lets you tick multiple cards — or select an entire day at once — then move them all to another day, send them to the backlog, or delete them in one step.
- **Traffic-aware travel times.** Travel estimates between locations default to realistic Metro Manila midday traffic. A toggle recalculates everything at free-flow (no-traffic) speed for comparison.
- **Number-coding awareness.** Each weekday column shows which plate-ending digits are coded, so visits can be planned around the vehicle's coding day. Monday and weekends are flagged as coding-free.
- **Per-week schedules.** Every week keeps its own layout. The backlog of unscheduled clients is shared across all weeks and caps at four rows before scrolling.
- **Priority tagging.** Mark important clients; they get a visual accent so they stand out on the board.
- **Add / edit / remove clients.** Full client records — name, address, city, notes, priority, and an editable date — managed in-app. Adding a name that already exists prompts a duplicate warning that shows where the existing client is scheduled.
- **Export / import.** Download all data as a single JSON backup file and load it on another device. This is how data moves between, for example, a laptop and a phone.
- **Image export.** Capture the board or the full page as a PNG for sharing.

## How travel time is estimated

Travel times come from a lookup table of location-to-location estimates calibrated for Metro Manila traffic, with a city-to-city fallback for pairs that are not listed individually. With the traffic toggle off, each estimate is scaled down to approximate free-flow conditions. These are planning estimates, not live routing — they are meant to keep a day's stops realistic, not to replace a maps app on the day of travel.

## Data and privacy

All data is stored locally in the browser via `localStorage`. Nothing is sent to a server — there is no backend. Because storage is per-browser and per-device, data does not automatically sync between devices; the Export / Import buttons exist to move a backup file across devices manually.

For anyone opening the public demo, the app starts empty and they work with their own local data. No personal client information is published with the site.

## Running it

There is no build step. Open `index.html` in any modern browser, or serve the folder with any static host. To run locally:

```bash
# from the project folder
python3 -m http.server 8000
# then open http://localhost:8000
```

## Tech notes

- Single HTML file: structure, styling, and logic in one document.
- Vanilla JavaScript — no framework, no bundler, no dependencies to install.
- One runtime dependency loaded from a CDN: [html2canvas](https://html2canvas.hertzfeld.com/) for PNG export.
- Responsive layout: side-by-side day columns on desktop, a single stacked column on mobile.

## Deploying to GitHub Pages

1. Create a public repository and add `index.html` (and this `README.md`) to it.
2. In the repository's **Settings → Pages**, set the source to **Deploy from a branch**, branch **main**, folder **/ (root)**, and save.
3. After a minute or two, the site is live at `https://<your-username>.github.io/<repo-name>/`.
