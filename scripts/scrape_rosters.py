#!/usr/bin/env python3
"""
Live SIDEARM Sports Roster Scraper & Need-Score Calculator for Class of 2029 GK Recruiting.

Usage:
  1. Validate current `src/data/programs.json` dataset:
       python3 scripts/scrape_rosters.py

  2. Scrape live NCAA Men's Soccer rosters directly from each school's `rosterUrl`
     and update `src/data/programs.json`:
       python3 scripts/scrape_rosters.py --live
       python3 scripts/scrape_rosters.py --live --division D3
"""

from __future__ import annotations

import argparse
import html
import json
import re
import urllib.request
from pathlib import Path

YEAR_MAP = {
    "FR": "FR",
    "FR.": "FR",
    "FRESHMAN": "FR",
    "FY": "FR",
    "FY.": "FR",
    "FIRST-YEAR": "FR",
    "FIRST YEAR": "FR",
    "1ST": "FR",
    "R-FR": "FR",
    "R-FR.": "FR",
    "RS FR": "FR",
    "SO": "SO",
    "SO.": "SO",
    "SOPHOMORE": "SO",
    "R-SO": "SO",
    "R-SO.": "SO",
    "JR": "JR",
    "JR.": "JR",
    "JUNIOR": "JR",
    "R-JR": "JR",
    "R-JR.": "JR",
    "SR": "SR",
    "SR.": "SR",
    "SENIOR": "SR",
    "R-SR": "SR",
    "R-SR.": "SR",
    "GR": "GR",
    "GR.": "GR",
    "GRAD": "GR",
    "GRADUATE": "GR",
    "5TH": "GR",
}


def normalize_year(raw: str) -> str:
    cleaned = re.sub(r"\s+", " ", raw.strip().upper())
    for k, v in YEAR_MAP.items():
        if cleaned == k or cleaned.startswith(k + " "):
            return v
    if "FRESH" in cleaned or "FIRST" in cleaned or "FY" in cleaned:
        return "FR"
    if "SOPH" in cleaned:
        return "SO"
    if "JUN" in cleaned:
        return "JR"
    if "SEN" in cleaned:
        return "SR"
    if "GRAD" in cleaned or "5TH" in cleaned:
        return "GR"
    return "SO"


def calculate_need_score(goalkeepers: list[dict]) -> str:
    """
    Calculates Class of 2029 Need Score from goalkeeper roster entries:
    - High: 0 underclassmen (only JR/SR/GR), or 2+ GKs with <= 1 underclassman.
    - Medium: 2 underclassmen, or single GK who is a Sophomore (SO).
    - Low: 3+ underclassmen, or single GK on file is a Freshman (FR) starter.
    """
    if not goalkeepers:
        return "Unverified"
    underclassmen = [g for g in goalkeepers if g.get("classYear") in ("FR", "SO")]
    freshmen = [g for g in goalkeepers if g.get("classYear") == "FR"]
    if len(underclassmen) >= 3 or (len(goalkeepers) == 1 and len(freshmen) == 1):
        return "Low"
    if len(underclassmen) == 2 or (len(goalkeepers) == 1 and len(underclassmen) == 1):
        return "Medium"
    return "High"


def strip_tags(raw_html: str) -> str:
    text = re.sub(r"<[^>]+>", " ", raw_html)
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def parse_sidearm_rosters(page_html: str) -> list[dict]:
    """
    Extracts Goalkeeper entries from SIDEARM Sports player blocks & table rows.
    """
    gks: list[dict] = []
    seen_names: set[str] = set()

    # Pattern 1: SIDEARM list/card items (`sidearm-roster-player`)
    player_blocks = re.split(r'class="[^"]*sidearm-roster-player[^"]*"', page_html)
    for block in player_blocks[1:]:
        pos_match = re.search(
            r'sidearm-roster-player-position-long-short[^>]*>([^<]+)<|sidearm-roster-player-position[^>]*>(.*?)</div>',
            block,
            re.S | re.I,
        )
        pos_text = strip_tags(pos_match.group(0)) if pos_match else ""
        if not re.search(r"\b(GK|Goalkeeper|Goalie)\b", pos_text, re.I):
            continue

        name_match = re.search(
            r'sidearm-roster-player-name[^>]*>.*?<a[^>]*>(.*?)</a>', block, re.S | re.I
        )
        if not name_match:
            continue
        name = strip_tags(name_match.group(1))
        if not name or name in seen_names:
            continue

        yr_match = re.search(
            r'sidearm-roster-player-academic-year[^>]*>([^<]+)<', block, re.I
        )
        ht_match = re.search(r'sidearm-roster-player-height[^>]*>([^<]+)<', block, re.I)
        town_match = re.search(
            r'sidearm-roster-player-hometown[^>]*>([^<]+)<', block, re.I
        )

        entry: dict = {
            "name": name,
            "classYear": normalize_year(yr_match.group(1)) if yr_match else "SO",
        }
        if ht_match:
            ht = strip_tags(ht_match.group(1))
            if ht:
                entry["height"] = ht
        if town_match:
            town = strip_tags(town_match.group(1))
            if town:
                entry["hometown"] = town

        seen_names.add(name)
        gks.append(entry)

    # Pattern 2: Table rows (`<tr ...>`) for newer SIDEARM / PrestoSports tables
    if not gks:
        for tr_match in re.finditer(r"<tr[^>]*>(.*?)</tr>", page_html, re.S | re.I):
            row_html = tr_match.group(1)
            cells = [
                strip_tags(td)
                for td in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", row_html, re.S | re.I)
            ]
            if len(cells) < 3:
                continue
            row_joined = " | ".join(cells)
            if not re.search(r"\b(GK|Goalkeeper)\b", row_joined, re.I):
                continue
            # Find likely name cell and academic year cell
            name_candidate = None
            year_candidate = "SO"
            height_candidate = None
            for cell in cells:
                if re.match(r"^\d+-\d+$|^\d+'\d+\"?$", cell):
                    height_candidate = cell
                elif cell.upper().rstrip(".") in YEAR_MAP:
                    year_candidate = normalize_year(cell)
                elif (
                    not name_candidate
                    and len(cell.split()) >= 2
                    and not re.search(r"\b(GK|Goalkeeper|Jr\.|Sr\.|Fr\.|So\.)\b", cell, re.I)
                    and not any(ch.isdigit() for ch in cell)
                ):
                    name_candidate = cell
            if name_candidate and name_candidate not in seen_names:
                seen_names.add(name_candidate)
                entry = {"name": name_candidate, "classYear": year_candidate}
                if height_candidate:
                    entry["height"] = height_candidate
                gks.append(entry)

    return gks


def fetch_url(url: str) -> str:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
            )
        },
    )
    with urllib.request.urlopen(req, timeout=12) as resp:
        return resp.read().decode("utf-8", errors="ignore")


def validate_dataset(data_path: Path) -> None:
    programs = json.loads(data_path.read_text())
    by_div: dict[str, int] = {}
    by_need: dict[str, int] = {}
    within_4h = 0
    multi_gk = 0

    for p in programs:
        div = p["division"]
        need = p["classOf2029NeedScore"]
        by_div[div] = by_div.get(div, 0) + 1
        by_need[need] = by_need.get(need, 0) + 1
        if p.get("estimatedDriveHoursFromDelco", 99) <= 4.0:
            within_4h += 1
        if len(p.get("goalkeepers", [])) >= 2:
            multi_gk += 1

    print(f"Validated {len(programs)} NCAA Men's Soccer programs in {data_path.name}:")
    print(f"  By Division       : {by_div}")
    print(f"  By 2029 Need      : {by_need}")
    print(f"  <= 4h from Delco  : {within_4h}/{len(programs)} programs")
    print(f"  Multi-GK Depth    : {multi_gk}/{len(programs)} programs audited")


def scrape_live(data_path: Path, division_filter: str | None = None) -> None:
    programs = json.loads(data_path.read_text())
    updated_count = 0

    for p in programs:
        if division_filter and p["division"] != division_filter:
            continue
        url = p["rosterUrl"]
        print(f"Scouting [{p['division']}] {p['schoolName']} -> {url} ...", end=" ", flush=True)
        try:
            page_html = fetch_url(url)
            gks = parse_sidearm_rosters(page_html)
            if gks:
                p["goalkeepers"] = gks
                p["classOf2029NeedScore"] = calculate_need_score(gks)
                updated_count += 1
                print(f"Found {len(gks)} GKs (Need: {p['classOf2029NeedScore']})")
            else:
                print("No standard SIDEARM GK blocks matched (keeping existing)")
        except Exception as exc:
            print(f"Skipped ({exc})")

    data_path.write_text(json.dumps(programs, indent=2) + "\n")
    print(f"\nCompleted live scrape: updated {updated_count} programs in {data_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate or scrape NCAA Men's Soccer GK rosters.")
    parser.add_argument("--live", action="store_true", help="Fetch live rosterUrl pages over HTTP")
    parser.add_argument("--division", choices=["D1", "D2", "D3"], help="Filter by NCAA division")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    target_file = repo_root / "src" / "data" / "programs.json"

    if args.live:
        scrape_live(target_file, args.division)
    else:
        validate_dataset(target_file)
