Specialists directory source data (public sources only).
- spec-medical.json, spec-surgical.json: listings by specialty (format: see brief in the quarterly task).
- Rebuild pages: python3 specialists/_data/build.py specialists/_data  (run from the repo root), then add any new /specialists/<slug>/ URLs from specialists/_data/sp-urls.json to sitemap.xml and delete sp-urls.json
- Referral-fit scores are private (Adam's Claude Doc), never in this repo.
