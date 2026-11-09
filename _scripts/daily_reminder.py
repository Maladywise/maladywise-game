#!/usr/bin/env python3
"""Daily "today's 3 are ready" email to Zebra Mail subscribers who ticked the box (Buttondown tag "daily-3").

Runs from .github/workflows/daily-reminder.yml at about 6:50am Sydney time.
Sends nothing unless BOTH are set:
  - repo secret BUTTONDOWN_API_KEY (Buttondown > Settings > API)
  - repo variable DAILY_REMINDER = on   (the workflow checks this)
Dry run (prints the email):  python3 _scripts/daily_reminder.py --dry-run [--date YYYY-MM-DD]
"""
import argparse, datetime, json, os, sys, urllib.request
from zoneinfo import ZoneInfo

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://maladywise.com"
TAG = "daily-3"


def load(p):
    with open(os.path.join(ROOT, p), encoding="utf-8") as f:
        return json.load(f)


def build(day):
    ds = day.isoformat()
    triv = next((q for q in load("triviosis/quizzes.json") if q.get("date") == ds), None)
    theme = triv["theme"] if triv else None
    hday = None
    try:
        for d in load("data/days-soon.json").get("days", []):
            dt = (d.get("dates") or {}).get(str(day.year)) or {}
            if dt.get("start") == ds and d.get("kind") == "day":
                hday = d
                break
    except FileNotFoundError:
        pass
    nice = day.strftime("%A %-d %B")
    subject = "Today's 3 are ready" + (": " + theme if theme else "")
    lines = [
        f"Good morning. Here are today's puzzles ({nice}).",
        "",
        f"1. **[Dxtective]({SITE}/dx/?s=mail)**: six clues, one diagnosis.",
        f"2. **[Wordemic]({SITE}/wordemic/?s=mail)**: the medical word in six tries.",
        f"3. **[Triviosis]({SITE}/triviosis/?s=mail)**: ten questions" + (f" on *{theme}*." if theme else "."),
    ]
    if hday:
        lines += ["", f"Today is **{hday['name']}**. {hday.get('blurb', '')}".strip()]
    lines += ["", f"[All of today's games]({SITE}/?s=mail)", "",
              "_You're getting this because you ticked the 7am puzzle reminder when you signed up for Zebra Mail. "
              "To stop just these, manage your subscription below and untick it._"]
    return subject, "\n".join(lines)


def send(subject, body, key):
    payload = {
        "subject": subject,
        "body": body,
        "status": "about_to_send",
        "filters": {"filters": [{"field": "subscriber.tags", "operator": "contains", "value": TAG}], "groups": [], "predicate": "and"},
    }
    req = urllib.request.Request("https://api.buttondown.com/v1/emails", data=json.dumps(payload).encode(),
                                 headers={"Authorization": "Token " + key, "Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        print("Buttondown:", r.status)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--date")
    a = ap.parse_args()
    day = datetime.date.fromisoformat(a.date) if a.date else datetime.datetime.now(ZoneInfo("Australia/Sydney")).date()
    subject, body = build(day)
    key = os.environ.get("BUTTONDOWN_API_KEY", "").strip()
    if a.dry_run or not key:
        print("DRY RUN" + ("" if key else " (no BUTTONDOWN_API_KEY)"))
        print("Subject:", subject)
        print(body)
        return
    send(subject, body, key)


if __name__ == "__main__":
    sys.exit(main())
