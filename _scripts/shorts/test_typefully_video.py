#!/usr/bin/env python3
"""Mocked-API test for the weekly Short in _scripts/typefully_push.py: upload, status polling and thread payload.

    python3 _scripts/shorts/test_typefully_video.py        (no network, no API key; the render is stubbed)
"""
import datetime, json, os, shutil, sys, tempfile, unittest
from unittest import mock

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
sys.path.insert(0, HERE)
import typefully_push as tp  # noqa: E402
import shorts  # noqa: E402


class FakeTypefully:
    def __init__(self, processing_polls=2, fail=False):
        self.calls, self.puts, self.polls, self.left, self.fail = [], [], 0, processing_polls, fail

    def call(self, method, path, body=None):
        self.calls.append((method, path, body))
        if method == "POST" and path.endswith("/media/upload"):
            return {"media_id": "11111111-2222-3333-4444-555555555555", "upload_url": "https://s3.example/put?sig=x"}
        if method == "GET" and "/media/" in path:
            self.polls += 1
            if self.fail:
                return {"status": "failed"}
            if self.left > 0:
                self.left -= 1
                return {"status": "processing"}
            return {"status": "ready"}
        if method == "POST" and path.endswith("/drafts"):
            return {"id": 987}
        if method == "GET" and "/drafts" in path:
            return {"results": []}
        raise AssertionError("unexpected call %s %s" % (method, path))

    def put(self, url, data):
        self.puts.append((url, data))


def fake_render(series, puzzle_date, out, browser=None, check=True):
    with open(out, "wb") as f:
        f.write(b"\x00\x00\x00\x18ftypmp42fake-video")
    return out


class ShortPushTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp(prefix="mw-tp-test-")
        self.queue = os.path.join(self.tmp, "queue.json")
        thread = shorts.post_text("ecg", shorts.puzzle("ecg", "2026-10-19"))
        self.entry = {"date": "2026-11-19", "note": "Weekly Short", "thread": thread,
                      "short": {"series": "ecg", "puzzle_date": "2026-10-19"}}
        json.dump({"posts": [self.entry]}, open(self.queue, "w"))

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)

    def run_push(self, fake, *args):
        browser = mock.MagicMock()
        pw = mock.MagicMock()
        pw.chromium.launch.return_value = browser
        with mock.patch.object(tp, "QUEUE", self.queue), mock.patch.object(tp, "KEY", "test"), \
                mock.patch.object(tp, "call", fake.call), mock.patch.object(tp, "put_file", fake.put), \
                mock.patch.object(tp, "auto_post", lambda day: None), mock.patch.object(tp.time, "sleep", lambda s: None), \
                mock.patch.object(shorts, "render_short", fake_render), \
                mock.patch("playwright.sync_api.sync_playwright", return_value=mock.MagicMock(start=lambda: pw)), \
                mock.patch.dict(os.environ, {"TYPEFULLY_SOCIAL_SET_ID": "42"}), \
                mock.patch.object(sys, "argv", ["typefully_push.py", "--today", "2026-11-12", "--out", self.tmp] + list(args)):
            return tp.main()

    def test_upload_poll_and_thread(self):
        fake = FakeTypefully(processing_polls=2)
        self.assertEqual(self.run_push(fake), 0)
        up = [c for c in fake.calls if c[1].endswith("/media/upload")]
        self.assertEqual(len(up), 1)
        self.assertEqual(up[0][1], "/social-sets/42/media/upload")
        self.assertTrue(up[0][2]["file_name"].endswith(".mp4"), up[0][2])
        self.assertIn("alt_text", up[0][2])
        self.assertEqual(len(fake.puts), 1)
        self.assertTrue(fake.puts[0][1].startswith(b"\x00\x00\x00\x18ftyp"))
        self.assertEqual(fake.polls, 3)  # processing, processing, ready
        drafts = [c for c in fake.calls if c[0] == "POST" and c[1].endswith("/drafts")]
        self.assertEqual(len(drafts), 1)
        body = drafts[0][2]
        posts = body["platforms"]["x"]["posts"]
        self.assertEqual(posts[0]["media_ids"], ["11111111-2222-3333-4444-555555555555"])
        self.assertNotIn("http", posts[0]["text"])
        self.assertIn("https://maladywise.com/arrhythmix/", posts[1]["text"])
        self.assertNotIn("media_ids", posts[1])
        self.assertEqual(body["publish_at"], "2026-11-18T20:30:00Z")  # 7:30am Sydney (AEDT) on 19 Nov
        saved = json.load(open(self.queue))["posts"][0]
        self.assertEqual(saved["typefully_id"], "987")
        self.assertEqual(saved["short"], self.entry["short"])

    def test_failed_processing_holds_entry_back(self):
        fake = FakeTypefully(fail=True)
        self.assertEqual(self.run_push(fake), 1)
        self.assertFalse([c for c in fake.calls if c[0] == "POST" and c[1].endswith("/drafts")])
        self.assertNotIn("typefully_id", json.load(open(self.queue))["posts"][0])

    def test_dry_run_saves_mp4(self):
        fake = FakeTypefully()
        self.assertEqual(self.run_push(fake, "--dry-run"), 0)
        self.assertFalse(fake.calls)
        self.assertTrue(os.path.isfile(os.path.join(self.tmp, "short-2026-11-19-arrhythmix.mp4")))


class PlanTest(unittest.TestCase):
    def test_thursday_then_next_free_weekday(self):
        today = datetime.date(2026, 11, 12)
        self.assertEqual(shorts.plan_day(today, [])[0], datetime.date(2026, 11, 19))
        self.assertEqual(shorts.plan_day(today, [{"date": "2026-11-19"}])[0], datetime.date(2026, 11, 20))
        busy = [{"date": d} for d in ("2026-11-19", "2026-11-20")]
        self.assertEqual(shorts.plan_day(today, busy)[0], datetime.date(2026, 11, 18))
        self.assertIsNone(shorts.plan_day(today, [{"date": "2026-11-17", "short": {"series": "ecg"}}])[0])  # one Short a week

    def test_pick_is_past_unused_and_rotates(self):
        self.assertEqual([shorts.series_for(datetime.date(2026, 11, 19) + datetime.timedelta(weeks=i)) for i in range(4)],
                         ["ecg", "sign", "rarest", "ecg"])
        p = shorts.pick("ecg", datetime.date(2026, 11, 19), datetime.date(2026, 11, 12), used={("ecg", "2026-10-19")})
        self.assertEqual(p["date"], "2026-10-22")
        p = shorts.pick("sign", datetime.date(2026, 11, 26), datetime.date(2026, 11, 19), used=set())
        self.assertLessEqual(p["date"], "2026-11-19")
        self.assertTrue(shorts.licence_ok(p["img"]["licence"]))
        for bad in ("CC BY-NC 4.0", "CC BY-ND 2.0", "All rights reserved", ""):
            self.assertFalse(shorts.licence_ok(bad), bad)
        for good in ("Public domain", "CC0", "CC BY 4.0", "CC BY-SA 3.0"):
            self.assertTrue(shorts.licence_ok(good), good)


if __name__ == "__main__":
    unittest.main(verbosity=2)
