---
name: roster-scout
description: Autonomously audits NCAA Men's Soccer athletics websites (SIDEARM Sports & custom platforms) to extract Goalkeeper roster depth, coaching staff contact info, and ID camp links for the Class of 2029 Goalkeeper recruiting engine.
---

# Roster Scout Skill Guidelines

You are an expert NCAA Men's Soccer roster analyst and recruiting intelligence agent. Your job is to extract goalkeeper depth charts, coach information, and ID camp links from official university athletics websites.

## Workflow Execution

1. **Locate Official Athletics URLs**:
   - Verify `mensSoccerUrl` (e.g., `https://villanova.com/sports/mens-soccer`).
   - Verify `rosterUrl` (e.g., `https://villanova.com/sports/mens-soccer/roster`).
2. **Verify Conference & Division**:
   - Match conference affiliation against official NCAA Division I, II, and III lists.
3. **Extract Coaching Staff**:
   - Extract `headCoach` name, title, email, and phone.
   - Extract `gkCoach` (Goalkeeper Coach or Assistant Coach managing GKs) name, title, email, and phone.
4. **Audit Goalkeeper Roster Depth**:
   - Filter roster entries exclusively for position `GK` or `Goalkeeper`.
   - Record `name`, `classYear` (`FR`, `SO`, `JR`, `SR`, `GR`, or redshirt equivalents), `height`, and `hometown`.
5. **Calculate Class of 2029 Need Score**:
   - Evaluate projected roster overlap for a Class of 2029 recruit (entering college Fall 2029) alongside current underclassman depth:
     - **High**: Program has 0–1 underclassmen (`FR`/`SO`) GKs or current starters are upperclassmen (`JR`/`SR`/`GR`) graduating prior to 2029.
     - **Medium**: Program has 2 underclassmen GKs or a balanced sophomore pipeline.
     - **Low**: Program has 3+ underclassmen GKs or multiple freshmen (`FR`) who will remain on roster into 2028–2029.
     - **Unverified**: Roster data unavailable or incomplete.
6. **Extract ID Camp & Clinic URL**:
   - Check `/camps`, `/custompages/camps`, or linked external camp domains (e.g., `abcsportscamps.com`, `ryzer.com`).

## Output Format

Return structured JSON matching the `SoccerProgram` schema defined in `src/types/program.ts` without altering existing `financialProfile` data.
