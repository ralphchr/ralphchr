"""Fetch only the public profile statistics needed for the typing artwork."""
import argparse
import json
import math
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
URL = "https://api.monkeytype.com/users/ralphchr/profile"


def number(value, low=0, high=1e12):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or not low <= value <= high:
        raise ValueError("Invalid public typing statistic")
    return value


def parse_profile(response):
    data = response["data"]
    if data.get("name", "").lower() != "ralphchr":
        raise ValueError("Unexpected Monkeytype account")
    stats = data["typingStats"]
    started = number(stats["startedTests"])
    completed = number(stats["completedTests"], high=started)
    pbs = []
    for duration in ["15", "30"]:
        candidates = data.get("personalBests", {}).get("time", {}).get(duration, [])
        # Compare the same baseline mode, never blend languages or modifiers.
        candidates = [p for p in candidates if p.get("language") == "english" and p.get("difficulty") == "normal"
                      and not any(p.get(k, False) for k in ["punctuation", "numbers", "lazyMode"])]
        if candidates:
            best = max(candidates, key=lambda p: number(p["wpm"], high=1000))
            pbs.append({"seconds": int(duration), "wpm": number(best["wpm"], high=1000),
                        "accuracy": number(best["acc"], high=100),
                        "consistency": number(best["consistency"], high=100) if "consistency" in best else None})
    if not pbs:
        raise ValueError("No public personal bests for the selected mode")
    return {"username": "ralphchr", "profile": "https://monkeytype.com/profile/ralphchr", "source": URL,
            "updated": datetime.now(timezone.utc).date().isoformat(), "completedTests": completed,
            "startedTests": started, "timeTyping": number(stats["timeTyping"]),
            "mode": "English / normal / no punctuation or numbers", "personalBests": pbs}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path)
    args = parser.parse_args()
    if args.source:
        response = json.loads(args.source.read_text(encoding="utf-8-sig"))
    else:
        with urlopen(Request(URL, headers={"User-Agent": "ralphchr-profile-artwork"}), timeout=30) as result:
            response = json.load(result)
    data = parse_profile(response)
    out = ROOT / "assets/data/monkeytype.json"
    out.parent.mkdir(exist_ok=True)
    temp = out.with_suffix(".json.tmp")
    temp.write_text(json.dumps(data, indent=2)+"\n", encoding="utf-8")
    temp.replace(out)
    print(f"Verified Monkeytype @{data['username']}: {len(data['personalBests'])} public time-mode bests")


if __name__ == "__main__":
    main()
