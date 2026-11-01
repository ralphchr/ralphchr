"""Save verified public HackerRank track counts for the profile artwork."""
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
URL = "https://www.hackerrank.com/rest/hackers/ralphchr/badges"


def integer(value, minimum=0):
    if isinstance(value, bool) or not isinstance(value, int) or value < minimum:
        raise ValueError("Invalid HackerRank count or rank")
    return value


def parse_profile(response):
    if response.get("status") is not True or not isinstance(response.get("models"), list):
        raise ValueError("Missing public HackerRank stats")
    tracks = []
    for track in response["models"]:
        solved = integer(track["solved"])
        available = integer(track["total_challenges"], 1)
        rank = integer(track["hacker_rank"], 1)
        name = track["badge_name"]
        if solved > available or not isinstance(name, str) or not name.strip() or len(name) > 40:
            raise ValueError("Unexpected HackerRank track data")
        tracks.append({"name": name, "type": track["badge_type"], "solved": solved,
                       "available": available, "rank": rank})
    if not tracks:
        raise ValueError("No verified public tracks")
    if len({t["type"] for t in tracks}) != len(tracks):
        raise ValueError("Duplicate HackerRank tracks")
    return {"username": "ralphchr", "profile": "https://www.hackerrank.com/profile/ralphchr",
            "source": URL, "updated": datetime.now(timezone.utc).date().isoformat(), "tracks": tracks}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path)
    args = parser.parse_args()
    if args.source:
        response = json.loads(args.source.read_text(encoding="utf-8-sig"))
    else:
        with urlopen(Request(URL, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"}), timeout=30) as result:
            response = json.load(result)
    data = parse_profile(response)
    output = ROOT / "assets/data/hackerrank.json"
    output.parent.mkdir(exist_ok=True)
    temporary = output.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(data, indent=2)+"\n", encoding="utf-8")
    temporary.replace(output)
    print(f"Verified {len(data['tracks'])} public HackerRank tracks for @ralphchr")


if __name__ == "__main__":
    main()
