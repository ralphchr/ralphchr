"""Refresh public LeetCode counts; preserve the last valid snapshot on errors."""
import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
URL = "https://leetcard.jacoblin.cool/ralphchr?animation=false"


def parse_card(svg):
    doc = ET.fromstring(svg)
    labels = {node.get("id"): "".join(node.itertext()).strip() for node in doc.iter() if node.get("id")}
    if labels.get("username-text", "").lower() != "ralphchr":
        raise ValueError("Missing or unexpected LeetCode account")
    total = int(labels["total-solved-text"])
    rank = int(labels["ranking"].replace("#", "").replace(",", ""))
    difficulties = {}
    for name in ["easy", "medium", "hard"]:
        match = re.fullmatch(r"([\d,]+)\s*/\s*([\d,]+)", labels[f"{name}-solved-count"])
        if not match:
            raise ValueError(f"Invalid {name} counts")
        solved, available = [int(v.replace(",", "")) for v in match.groups()]
        if not 0 <= solved <= available or available <= 0:
            raise ValueError("Counts outside expected bounds")
        difficulties[name] = {"solved": solved, "available": available}
    if sum(v["solved"] for v in difficulties.values()) != total or rank < 1:
        raise ValueError("Inconsistent LeetCode statistics")
    return {"username": "ralphchr", "profile": "https://leetcode.com/u/ralphchr/", "source": URL,
            "updated": datetime.now(timezone.utc).date().isoformat(),
            "solved": total, "ranking": rank, "difficulties": difficulties}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, help="Saved provider SVG for offline validation")
    args = parser.parse_args()
    if args.source:
        svg = args.source.read_bytes()
    else:
        with urlopen(Request(URL, headers={"User-Agent": "ralphchr-profile-stats"}), timeout=30) as response:
            svg = response.read()
    data = parse_card(svg)
    output = ROOT / "assets/data/leetcode.json"
    output.parent.mkdir(exist_ok=True)
    temporary = output.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    temporary.replace(output)
    print(f"Verified @{data['username']}: {data['solved']} solved")


if __name__ == "__main__":
    main()
