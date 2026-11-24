"""
Antigravity `run_workflow` script to scout NCAA Men's Soccer rosters in parallel.

Run via the `run_workflow` tool:
    run_workflow(
        ScriptPath="/Users/danvickers/projects/soccerRecruit/scripts/workflow_scout.py",
        Description="Scout NCAA Men's Soccer goalkeeper rosters",
        Args={"division": "D1", "limit": 5}
    )
"""

import json
from pathlib import Path

PROGRAM_SCHEMA = {
    "type": "object",
    "properties": {
        "id": {"type": "string"},
        "headCoach": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "title": {"type": "string"},
                "email": {"type": "string"},
                "phone": {"type": "string"},
            },
            "required": ["name", "title"],
        },
        "gkCoach": {
            "type": "object",
            "properties": {
                "name": {"type": "string"},
                "title": {"type": "string"},
                "email": {"type": "string"},
                "phone": {"type": "string"},
            },
        },
        "goalkeepers": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "classYear": {"type": "string", "enum": ["FR", "SO", "JR", "SR", "GR"]},
                    "height": {"type": "string"},
                    "hometown": {"type": "string"},
                },
                "required": ["name", "classYear"],
            },
        },
        "classOf2029NeedScore": {
            "type": "string",
            "enum": ["High", "Medium", "Low", "Unverified"],
        },
        "campUrl": {"type": "string"},
    },
    "required": ["id", "headCoach", "goalkeepers", "classOf2029NeedScore"],
}

data_path = Path(WORKSPACES[0]) / "src" / "data" / "programs.json"
programs = json.loads(data_path.read_text())

target_div = args.get("division") if isinstance(args, dict) else None
limit = args.get("limit") if isinstance(args, dict) else None

targets = [p for p in programs if not target_div or p["division"] == target_div]
if limit:
    targets = targets[: int(limit)]

phase(f"Scouting {len(targets)} NCAA Men's Soccer Rosters")


def make_scout(prog):
    prompt = (
        f"Read `.agents/skills/roster-scout/SKILL.md` and audit {prog['schoolName']} "
        f"({prog['division']} - {prog['conference']}).\n"
        f"Roster URL: {prog['rosterUrl']}\n"
        f"Men's Soccer URL: {prog['mensSoccerUrl']}\n"
        "Extract current Goalkeepers (name, classYear, height, hometown), verify Head Coach & GK Coach "
        "contact info, locate any ID camp URL, and compute classOf2029NeedScore."
    )
    return agent(
        prompt=prompt,
        schema=PROGRAM_SCHEMA,
        role=f"Scout {prog['schoolName']}",
    )


results = await parallel(targets, make_scout)
updates_by_id = {r["id"]: r for r in results if isinstance(r, dict) and "id" in r}

for prog in programs:
    if prog["id"] in updates_by_id:
        upd = updates_by_id[prog["id"]]
        prog["headCoach"] = upd.get("headCoach", prog["headCoach"])
        if upd.get("gkCoach"):
            prog["gkCoach"] = upd["gkCoach"]
        prog["goalkeepers"] = upd.get("goalkeepers", prog["goalkeepers"])
        prog["classOf2029NeedScore"] = upd.get(
            "classOf2029NeedScore", prog["classOf2029NeedScore"]
        )
        if upd.get("campUrl"):
            prog["campUrl"] = upd["campUrl"]

out_path = Path(WORKSPACES[0]) / "src" / "data" / "programs.updated.json"
out_path.write_text(json.dumps(programs, indent=2) + "\n")
log(f"Updated {len(updates_by_id)} programs -> {out_path}")
