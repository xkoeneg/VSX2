# VSX Trading Journal

Reorganized from a single 16,552-line `App.tsx` into a proper folder structure.
All original logic and JSX was preserved — this is a structural refactor, not a rewrite.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

## Structure

```
src/
  types/index.ts          All shared TypeScript interfaces/types
  constants/               Static config: trading options, rule pillars, wiki
                            categories, life-discipline routines, tag colors, etc.
  utils/                    Pure helper functions: formatting, data normalization,
                            MT4/MT5 import parsing, economic calendar parsing,
                            account metrics, image handling
  hooks/
    useAppState.tsx         The entire app's state + business logic (was the top
                            of the old App() function — ~500 pieces of state,
                            handlers, and computed values)
    useEconomicCalendarFeed.ts, useViewportWidth.ts, useClickOutside.ts
  context/AppContext.tsx    Makes useAppState()'s output available to every
                            screen/modal via useAppContext(), instead of a huge
                            prop list
  components/
    shared/                 Reusable UI pieces: inputs, dropdowns, badges,
                            the notification bell, the popup calculator, etc.
    Sidebar.tsx
  screens/                  One file per main view (Dashboard, Trades,
                            Discipline, Life Discipline, Playbook, Notices,
                            Wiki, Calendar)
  modals/                   All 24 modals, grouped into 7 files by feature area
  App.tsx                   Thin orchestrator — renders the shell, switches
                            between screens, and mounts all modals (~590 lines,
                            down from 16,552)
```

## How it fits together

Every screen and modal component calls `useAppContext()` and destructures
whatever state/handlers it needs — the same names that existed as closures
in the original giant component, now coming from context instead. This means:

- No screen needs a huge prop list.
- Moving/renaming a screen doesn't touch any other file's signature.
- The one tradeoff: every screen/modal file destructures the *full* shared
  state object at the top (not just what it uses), which keeps the split
  mechanical and low-risk instead of me needing to hand-trace exactly which
  of ~500 fields each of 44 view functions touches. It costs a slightly
  longer destructure block per file; it does not cost you anything at
  runtime. Trim individual files' destructuring later if you want.

## Before you trust it fully

This was extracted from your original file mechanically (via scripted line
extraction, not retyped by hand) and checked for:
- Zero syntax errors across all 59 source files
- Zero broken imports (every `from '../x'` resolves to a real file)
- Zero missing exports
- Zero duplicate top-level names within any file

What it has **not** been checked against: a real TypeScript compiler with
your actual `lucide-react`/`react` types installed, or an actual browser
render. Run `npm install && npm run dev` and click through it — if
something doesn't compile or render right, it's most likely one function
that needs a field added to its context destructure list, which is a
one-line fix.
