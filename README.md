# Fitboy

A small installable web app (PWA) for tracking protein/calories, workouts and daily accountability on an Android phone. Everything is stored locally on the device. Use **Settings → Backup** to export it.

## Features

- **Today**: protein and calorie progress bars, today's meals, a 7-day check-in strip and streak
- **+ button**: add food (name, protein, calories) with quick-add from recent meals
- **Workouts**: rotating routine (e.g. Push/Pull/Legs) with "Up next", per-set weight × reps logging, last-session numbers and history
- **Settings**: daily goals, kg/lb, routine editor, backup export/import

## Develop

```sh
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests (vitest)
npm run lint
npm run build    # production build in dist/
```

## Install on Android

The app must be served over HTTPS to install as a PWA.

1. Push this repo to GitHub and enable **Settings → Pages → Source: GitHub Actions**. The workflow in `.github/workflows/deploy.yml` publishes on every push to `main`.
2. Open the Pages URL in Chrome on your phone → ⋮ menu → **Add to Home screen / Install app**.

Updates are picked up automatically the next time you open the app.
