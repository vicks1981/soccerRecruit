# College Men's Soccer Recruiting 2029 Dashboard

Production dashboard, NCAA compliance engine, and Antigravity roster-scouting workflows for a **Class of 2029 ECNL Goalkeeper** based in **Delaware County, PA (Delco)** targeting NCAA Division I, Division II, and high-academic Division III programs across **PA, NJ, DE, and MD**.

---

## Quick Start

In your terminal from `/Users/danvickers/projects/soccerRecruit`:

```bash
npm install
npm run dev
```

To validate the 82-school dataset and Class of 2029 Goalkeeper Need Scores via the CLI script:

```bash
python3 scripts/scrape_rosters.py
```

---

## Spec Fixes Applied in This Build

1. **Dynamic Program Counts (`82` total programs):**
   - Corrected the hardcoded `67` count in the specification (`26 D1 + 21 D2 + 35 D3 = 82` programs in `src/data/programs.json`). `DivisionTabs.tsx` dynamically computes counts from the dataset.
2. **Dataset & URL Fixes (`src/data/programs.json`):**
   - Fixed the malformed URL for Seton Hill University (`setonhill-d2` -> `https://athletics.setonhill.edu/sports/mens-soccer`).
   - Updated Bloomsburg and Lock Haven institutional names from `PennWest` to `Commonwealth U` (matching the PASSHE consolidation).
   - Added `estimatedDriveHoursFromDelco` to all 82 programs and a **`<= 4h from Delco`** filter toggle in `FilterBar.tsx` (72 of 82 programs are within a 4-hour drive of Delaware County, PA).
3. **Antigravity Skill & Dynamic Workflow Integration:**
   - Added a valid Antigravity skill at `.agents/skills/roster-scout/SKILL.md` (while preserving `.agents/agents/roster-scout.md` for reference).
   - Added `scripts/workflow_scout.py` for Antigravity's `run_workflow` tool (`parallel()` fan-out across target programs) and `scripts/scrape_rosters.py` for standalone CLI validation.
4. **TypeScript, Tailwind & Template Cleanups:**
   - Fixed code block formatting errors in `src/types/program.ts`, `src/data/emailTemplates.ts`, and `src/types/recruiting.ts`.
   - Unified `OutreachStatus` across types and UI (`Drafted`, `Sent`, `Coach Replied`, `Pre-Contact Logged`, `Archived`).
   - Updated the Villanova June 22, 2027 ID Camp note in `src/data/seedCamps.ts` to accurately reflect that June 22, 2027 is 1 week *after* the June 15, 2027 NCAA D1 direct contact window opens.
   - Configured Tailwind CSS v3 (`tailwindcss@^3.4.15`) to match `tailwind.config.js` and `postcss.config.js`, and added `src/App.tsx` re-exporting `src/components/App.tsx`.
