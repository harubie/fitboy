# Fitboy

A small installable web app (PWA) for tracking protein/calories, workouts and daily accountability on an Android phone. Everything is stored locally on the device. Use **Settings → Backup** to export it.

## Features

- **Today**: protein and calorie meters (pixel dial, RPG stat bars or classic dial), today's meals, a 7-day check-in strip and streak
- **Feed the beast**: a Digimon-style pixel monster that eats your workouts (rest days keep it warm but don't feed it).
  - Growth: Egg (0) → Baby I (1) → Baby II (3) → Child (7, 3 forms) → Adult (21, 5 forms) → Perfect (50, 7 forms) → Ultimate (100, 5 forms) → Super Ultimate (200). Each evolution randomly picks one of the forms the current one can grow into.
  - Miss a day and it gets sleepy; 7 days without any check-in and it devolves one stage (never below Baby I).
  - Tap the monster or **Enter the Lair** to open **The Lair**: put it in cryo sleep (it keeps its level and never gets hungry) and hatch a new egg, thaw it later, or fuse two Ultimates into the secret Chimera. The Beastiary lists every form: discovered ones show their art and evolution links, undiscovered ones are dark silhouettes (tap for hints).
  - Past Super Ultimate it changes colour every 100 workouts, forever. You also earn a ⭐ for every 30 workouts in one streak; stars are kept forever.
- **+ button**: add food (name, protein, calories) with quick-add from recent meals
- **Dojo** (workouts): your workout plans. Tap **+** to create one (blank, or from the 90-Day Full Body template) and **Edit** to rename it, add/remove/reorder exercises, or change sets, reps, rest, muscles, effort and form tips. Each plan shows when you last did it and how many sessions you have logged. **Start workout** on Base opens the plan you did most recently.
  - During a workout, each exercise shows its targets and form tip. Logging a set starts a rest timer (with vibration); timed exercises like the plank have a hold timer.
  - Tap the circled **?** beside an exercise in Dojo or during a session for step-by-step instructions, muscles worked, common mistakes and easier/harder options. All seven Full Body exercises open on **Animation**, using chunky pixel characters, with original anatomical line drawings on the **Diagram** tab. Animations are static with reduced motion; plank shows a steady hold. Guides work offline after the app is cached. Closing a guide, including with Android Back, keeps your entered sets and running timer.
  - Add your own instructions in **Edit plan → More details → How-to steps**, one step per line. These replace the built-in steps; clearing them restores the built-in guide if the exercise name matches. Other exercises show your instructions and form tip without inventing an illustration.
- **Gear** (settings): daily goals, kg/lb, meter style, backup export/import
- Sub-screens keep **Back** and **Add / Save / Finish** in a bottom action bar for one-handed use; exercise guides have a persistent **Close guide** button at the bottom. Android Back still works.

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
