"""Render the real GitHub contribution calendar with no third-party stats service.

Run with Python 3.10+. --source accepts a saved response for offline checks.
If GitHub's markup or response is invalid, fail without replacing existing assets.
"""

import argparse
import calendar
import re
from datetime import date, timedelta
from html import escape
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


COLORS = ["#171C26", "#293E55", "#456B91", "#6F9FCB", "#8EBBEE"]


def render_calendar(days, username, mobile=False):
    start = days[0]["date"] - timedelta(days=(days[0]["date"].weekday() + 1) % 7)
    last_week = (days[-1]["date"] - start).days // 7
    if mobile:
        start += timedelta(weeks=max(0, last_week - 12))
        shown = [day for day in days if day["date"] >= start]
        width, height, x0, y0, pitch, size = 600, 420, 72, 122, 36, 28
        padding, heading_size, label_size = 32, 25, 18
    else:
        shown = days
        width, height, x0, y0, pitch, size = 1200, 304, 76, 105, 20, 14
        padding, heading_size, label_size = 48, 27, 15
    total = sum(day["count"] for day in shown)
    period = "LAST 13 WEEKS" if mobile else "PAST YEAR"
    dates = f"{shown[0]['date'].isoformat()} / {shown[-1]['date'].isoformat()}"
    title = f"{username}: {total:,} GitHub contributions, {period.lower()}"
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
        f'<title id="title">{escape(title)}</title>',
        f'<desc id="desc">Real contribution counts from the public GitHub profile calendar. {dates}. Darker to brighter cyan indicates fewer to more contributions.</desc>',
        f'<rect width="{width}" height="{height}" fill="#09090F"/>',
        f'<rect x=".5" y=".5" width="{width-1}" height="{height-1}" fill="none" stroke="#C5C6D0" stroke-opacity=".24"/>',
        '<g font-family="Consolas, Courier New, monospace" fill="#C5C6D0">',
        f'<text x="{padding}" y="45" fill="#F0E9DD" font-size="{heading_size}">GITHUB / CONTRIBUTIONS</text>',
        f'<text x="{width-padding}" y="76" text-anchor="end" fill="#8EBBEE" font-size="{label_size}">{total:,} CONTRIBUTIONS / {period}</text>',
    ]
    if not mobile:
        parts.append(f'<text x="{padding}" y="76" font-size="14">@{escape(username.upper())}</text>')
    month_seen = None
    for day in shown:
        week = (day["date"] - start).days // 7
        weekday = (day["date"].weekday() + 1) % 7
        x, y = x0 + week * pitch, y0 + weekday * pitch
        month = (day["date"].year, day["date"].month)
        if weekday == 0 and month != month_seen:
            if week > 0 or day["date"].day < 8:
                parts.append(f'<text x="{x}" y="{y0-12}" font-size="{label_size}">{calendar.month_abbr[month[1]]}</text>')
            month_seen = month
        count = day["count"]
        tooltip = f"{day['date'].isoformat()}: {count} contribution{'s' if count != 1 else ''}"
        parts.append(f'<rect x="{x}" y="{y}" width="{size}" height="{size}" rx="2" fill="{COLORS[day["level"]]}"><title>{tooltip}</title></rect>')
    for weekday, label in [(1, "M"), (3, "W"), (5, "F")]:
        parts.append(f'<text x="{padding}" y="{y0+weekday*pitch+size*.8}" font-size="{label_size}">{label}</text>')
    bottom = height - 24
    parts.append(f'<text x="{padding}" y="{bottom}" font-size="{14 if not mobile else 17}">{dates}</text>')
    if not mobile:
        parts.append(f'<text x="{width-300}" y="{bottom}" font-size="14">LESS</text>')
        for i, color in enumerate(COLORS):
            parts.append(f'<rect x="{width-245+i*22}" y="{bottom-13}" width="14" height="14" rx="2" fill="{color}"/>')
        parts.append(f'<text x="{width-padding}" y="{bottom}" text-anchor="end" font-size="14">MORE</text>')
    parts.append('</g></svg>')
    return "\n".join(parts) + "\n"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--username", default="ralphchr")
    parser.add_argument("--source", type=Path)
    parser.add_argument("--output-dir", type=Path, default=Path(__file__).resolve().parents[1] / "assets")
    args = parser.parse_args()
    if not re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?", args.username):
        raise ValueError("Invalid GitHub username")
    if args.source:
        html = args.source.read_text(encoding="utf-8")
    else:
        request = Request(f"https://github.com/users/{args.username}/contributions", headers={"User-Agent": "ralphchr-profile-calendar", "Accept-Language": "en-US"})
        with urlopen(request, timeout=30) as response:
            html = response.read().decode("utf-8")
    days = parse_calendar(html)
    outputs = {
        "contributions.svg": render_calendar(days, args.username),
        "contributions-mobile.svg": render_calendar(days, args.username, mobile=True),
    }
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for name, svg in outputs.items():
        (args.output_dir / name).write_text(svg, encoding="utf-8")
    print(f"Rendered {len(days)} real calendar days, {sum(day['count'] for day in days):,} contributions; through {days[-1]['date']}.")


if __name__ == "__main__":
    main()
