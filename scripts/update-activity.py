"""Generate an activity line graph from real public GitHub contribution counts.

Uses Python's standard library. --source accepts a saved calendar for offline checks.
Invalid responses fail before any existing graph is replaced.
"""

import argparse
import re
import math
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


def render_activity(days, username, mobile=False):
    shown = days[-31:]
    width, height = (600, 360) if mobile else (1000, 360)
    left, right, top, bottom = (58, 24, 88, 294) if mobile else (66, 32, 78, 306)
    plot_width, plot_height = width-left-right, bottom-top
    max_count = max(1, max(day["count"] for day in shown))
    rough_step = max_count/5
    magnitude = 10 ** math.floor(math.log10(rough_step))
    tick_step = max(1, next(mult*magnitude for mult in [1, 2, 5, 10] if mult*magnitude >= rough_step))
    ceiling = math.ceil(max_count/tick_step)*tick_step
    spacing = plot_width/(len(shown)-1)
    points = [(left+i*spacing, bottom-day["count"]/ceiling*plot_height) for i,day in enumerate(shown)]
    deltas = [shown[i+1]["count"]-shown[i]["count"] for i in range(len(shown)-1)]
    slopes = [0.0]
    for previous, following in zip(deltas, deltas[1:]):
        slopes.append(0.0 if previous*following <= 0 else 2*previous*following/(previous+following))
    slopes.append(0.0)
    curve = f"M{points[0][0]:.2f},{points[0][1]:.2f}"
    for i, ((x,y),(nx,ny)) in enumerate(zip(points,points[1:])):
        curve += f" C{x+spacing/3:.2f},{y-slopes[i]*plot_height/ceiling/3:.2f} {nx-spacing/3:.2f},{ny+slopes[i+1]*plot_height/ceiling/3:.2f} {nx:.2f},{ny:.2f}"
    dates = f"{shown[0]['date'].isoformat()} - {shown[-1]['date'].isoformat()}"
    label_size = 20 if mobile else 12
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
        f'<title id="title">{escape(username)}: Git activity</title>',
        f'<desc id="desc">Daily GitHub contributions from the public profile calendar, {dates}. Real daily counts; no sample or fabricated data.</desc>',
        f'<rect width="{width}" height="{height}" fill="#09090F"/>',
        '<g font-family="Arial, Helvetica, sans-serif" fill="#C5C6D0">',
        f'<text x="{width/2}" y="31" text-anchor="middle" fill="#F0E9DD" font-size="{22 if mobile else 18}" font-weight="600">{escape(username)}’s Contribution Graph</text>',
        f'<text x="{width/2}" y="56" text-anchor="middle" font-size="{18 if mobile else 13}">{dates}</text>',
    ]
    for tick in range(int(ceiling/tick_step)+1):
        value = tick*tick_step
        y = bottom-value/ceiling*plot_height
        parts.append(f'<path d="M{left} {y:.2f}H{width-right}" stroke="#C5C6D0" stroke-opacity=".24" stroke-dasharray="2 3"/>')
        parts.append(f'<text x="{left-12}" y="{y+5:.2f}" text-anchor="end" font-size="{label_size}">{value:g}</text>')
    for i, (day,(x,y)) in enumerate(zip(shown,points)):
        parts.append(f'<path d="M{x:.2f} {top}V{bottom}" stroke="#C5C6D0" stroke-opacity=".16" stroke-dasharray="2 3"/>')
        if not mobile or i%5==0:
            parts.append(f'<text x="{x:.2f}" y="{bottom+23}" text-anchor="middle" font-size="{label_size}">{day["date"].day}</text>')
    parts.append(f'<path d="{curve} L{points[-1][0]:.2f},{bottom} L{points[0][0]:.2f},{bottom}Z" fill="#8EBBEE" fill-opacity=".09"/>')
    parts.append(f'<path d="{curve}" fill="none" stroke="#8EBBEE" stroke-width="2.5"/>')
    for day,(x,y) in zip(shown,points):
        parts.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{3.8 if mobile else 3.4}" fill="#8B5CF6"><title>{day["date"].isoformat()}: {day["count"]} contributions</title></circle>')
    if not mobile:
        parts.append(f'<text transform="rotate(-90 18 192)" x="18" y="192" text-anchor="middle" font-size="12">Contributions</text>')
    parts.append(f'<text x="{width/2}" y="{height-12}" text-anchor="middle" font-size="{18 if mobile else 12}">Days</text>')
    parts.append('</g></svg>')
    return "\n".join(parts)+"\n"


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
    outputs = {"activity.svg":render_activity(days,args.username),"activity-mobile.svg":render_activity(days,args.username,mobile=True)}
    args.output_dir.mkdir(parents=True,exist_ok=True)
    for name,svg in outputs.items():
        destination = args.output_dir/name
        temporary = destination.with_suffix(".svg.tmp")
        temporary.write_text(svg,encoding="utf-8")
        temporary.replace(destination)
    print(f"Rendered {len(days[-31:])} actual days, through {days[-1]['date']}, {sum(day['count'] for day in days[-31:])} contributions in the displayed period.")


if __name__ == "__main__":
    main()
