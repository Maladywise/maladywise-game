Specialists directory source data (public sources only).
- spec-medical.json, spec-surgical.json: listings by specialty (format: see brief in the quarterly task).
- Rebuild pages: python3 specialists/_data/build.py specialists/_data  (run from the repo root), then add any new /specialists/<slug>/ URLs from specialists/_data/sp-urls.json to sitemap.xml and delete sp-urls.json
- Referral-fit scores are private (owner's private doc), never in this repo.
- Optional "listed_by": [{"org", "label", "url", "checked", "tag"}] when a practitioner appears on a condition organisation's public provider list (shown as a badge; "tag" feeds the interest search). The organisation links themselves live in ORGS in build.py.
- build.py also writes specialists/search-index.json (hub "find by interest" search). Interest tags come from TAGMAP in build.py: add a synonym there when a new interest wording appears.
- Languages: practical.languages (only as stated on a public professional page; add the URL to sources and "lang_checked"). Never infer a language from a name or photo. "Auslan" counts for the Auslan / Deaf-friendly filter, as does practical.deaf_friendly {"quote", "url", "checked"}; practical.interpreters (true) or an interpreter quote in extra/practical.json gives "Interpreter-friendly". The hub box (LANGBOX in build.py) holds the NSLP/Deaf Connect, TIS and HNE interpreter details.
