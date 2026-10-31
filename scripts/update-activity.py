"""Fetch validated public GitHub contribution counts for the profile artwork.

Uses Python's standard library. --source accepts a saved calendar for offline checks.
Invalid responses fail before any existing graph is replaced.
"""

import argparse
import re
import json
from datetime import date, timedelta
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen


class ContributionParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.cells = []
        self.tooltips = {}
        self.active_tooltip = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "td" and "data-date" in attrs:
            self.cells.append(attrs)
        if tag == "tool-tip" and attrs.get("for"):
            self.active_tooltip = attrs["for"]
            self.tooltips[self.active_tooltip] = ""

    def handle_data(self, text):
        if self.active_tooltip:
            self.tooltips[self.active_tooltip] += text

    def handle_endtag(self, tag):
        if tag == "tool-tip":
            self.active_tooltip = None


def parse_calendar(html):
    parser = ContributionParser()
    parser.feed(html)
    days = []
    for cell in parser.cells:
        tooltip = parser.tooltips.get(cell.get("id"), "").strip()
        match = re.match(r"(No|[\d,]+) contributions? on ", tooltip)
        if not match:
            raise ValueError(f"Missing contribution count for {cell.get('data-date')}")
        count = 0 if match[1] == "No" else int(match[1].replace(",", ""))
        level = int(cell["data-level"])
        if not 0 <= level <= 4:
            raise ValueError("Unknown GitHub contribution intensity")
        days.append({"date": date.fromisoformat(cell["data-date"]), "count": count, "level": level})
    days.sort(key=lambda day: day["date"])
    if not 350 <= len(days) <= 371:
        raise ValueError(f"Expected a full contribution year; got {len(days)} days")
    for previous, current in zip(days, days[1:]):
        if current["date"] - previous["date"] != timedelta(days=1):
            raise ValueError("Calendar contains duplicate or missing dates")
    return days



def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--username", default="ralphchr")
    parser.add_argument("--source", type=Path)
    parser.add_argument("--output-dir", type=Path, default=Path(__file__).resolve().parents[1]/"assets")
    args = parser.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?",args.username):
        raise ValueError("Invalid GitHub username")
    if args.source:
        html = args.source.read_text(encoding="utf-8")
    else:
        request = Request(f"https://github.com/users/{args.username}/contributions",headers={"User-Agent":"ralphchr-profile-activity","Accept-Language":"en-US"})
        with urlopen(request,timeout=30) as response:
            html = response.read().decode("utf-8")
    days = parse_calendar(html)
    # The Node renderer owns the visual style; Python only validates source data.
    data = {"username": args.username,
            "source": f"https://github.com/users/{args.username}/contributions",
            "through": days[-1]["date"].isoformat(),
            "days": [{**day, "date": day["date"].isoformat()} for day in days]}
    destination = args.output_dir / "data/github.json"
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(data, indent=2)+"\n", encoding="utf-8")
    temporary.replace(destination)
    print(f"Verified {len(days)} calendar days through {data['through']}.")



if __name__ == "__main__":
    main()
