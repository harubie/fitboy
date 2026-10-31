# Fitboy

A small installable web app (PWA) for tracking protein/calories, workouts and daily accountability on an Android phone. Everything is stored locally on the device. Use **Settings → Backup** to export it.

## Features

- **Today**: protein and calorie meters (pixel dial, RPG stat bars or classic dial), daily meals, a Monday–Sunday day picker at the top and streak. Tap any past day, including a missed day, to open its daily log; arrows move between weeks. Mark Workout or Rest, or Undo a manual check-in, for the selected day. Dates use the phone's local calendar and future dates are not allowed. A logged session counts as a workout; delete it in Dojo history before marking that day as Rest.
  - Numeric date labels use **DD/MM/YYYY**; week headings use short month names (e.g. **26 Oct – 1 Nov 2026**). The native calendar input follows the phone/browser locale; stored dates and backups retain YYYY-MM-DD.
- **Base companion**: a compact monster/Lair card above a separate workout card. The workout card shows your next plan, Start workout, weekly check-ins and streak. Detailed evolution messages and star progress live in the Lair. Your pixel monster eats workouts (rest days keep it warm but don't feed it).
  - Growth: Egg (0) → Baby I (1) → Baby II (3) → Child (7, 3 forms) → Adult (21, 5 forms) → Perfect (50, 7 forms) → Ultimate (100, 5 forms) → Super Ultimate (200). Each evolution randomly picks one of the forms the current one can grow into.
  - Miss a day and it gets sleepy; 7 days without any check-in and it devolves one stage (never below Baby I).
  - Tap the monster or **Enter the Lair** to open **The Lair**: put it in cryo sleep (it keeps its level and never gets hungry) and hatch a new egg, thaw it later, or fuse two Ultimates into the secret Chimera. The Beastiary lists every form: discovered ones show their art and evolution links, undiscovered ones are dark silhouettes (tap for hints).
  - Past Super Ultimate it changes colour every 100 workouts, forever. You also earn a ⭐ for every 30 workouts in one streak; stars are kept forever.
- **+ button**: add food for the day selected on Base, with calories before protein. The **Logging for** date button opens a calendar if you need to change it.
  - **Quick total**: enter an optional name and your calorie/protein total, or fill from a recent meal. Mark estimates (including AI estimates) explicitly; the app does not guess nutrition from names.
  - **Build a meal**: save your own foods with a serving size, unit and label values, then tap foods and portion shortcuts to combine ingredients. Pin frequent foods; **All foods** and optional search retain access beyond the last eight recent foods. Grams, servings, eggs, scoops, tablespoons and teaspoons are supported. Spoon nutrition must use your product label's defined serving, not an assumed grams-to-spoons conversion.
  - Older logged meal totals remain reusable as one serving of the entire meal, not inferred ingredients. Save distinct brand/serving names, and use **Edit food values** in the portion panel to correct a saved food. Changing saved values does not rewrite previously logged meal totals. Saved foods and estimate flags are included in backups; older backups still work.
- **Dojo** (workouts): your workout plans. Tap **+** to create one (blank, the original 90-Day Full Body template, or six Day 1–6 templates: Chest & Triceps, Back & Biceps, Shoulders & Abs, Legs & Cardio, Full-Body Retargeting, and Hybrid Routine & Conditioning). **Edit** lets you rename it, add/remove/reorder exercises, or change sets, reps, rest, muscles, effort, plan notes and form tips. Template targets and alternatives are editable; nothing is added until you save, and existing plans/history are unchanged. Each copy has its own exercise IDs/history. Cardio logs **minutes** and farmer's walks log **metres**. The cardio timer starts at the lower end of a range (20 minutes for 20–30) and fills completed minutes when it finishes; you can also enter the actual duration manually. These templates do not add new instructional artwork. Each plan shows when you last did it and how many sessions you have logged. **Start workout** on Base opens the plan you did most recently.
  - During a workout, each exercise shows its targets and form tip. Logging a set starts a rest timer (with vibration); timed exercises like the plank have a hold timer.
  - Workouts started from Base inherit the selected day; tap **Logging for** to change the date, or **Change date** in Dojo history to correct a logged session. History, last sets and the next plan use workout dates, not the order you entered them.
  - Backdated Workout/Rest entries recalculate streaks. Companion XP and care count only from the active monster's activation date; older corrections do not reassign banked XP to frozen monsters or reverse previously earned forms. The companion always shows its state as of today, even when viewing a past daily log. Reminders/notifications are not implemented.
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
