# Daily Dx · Malady Wise

A daily medical puzzle. One fictional case per day (Sydney time), six clues, one diagnosis.

## Files
- `game.js` – the game (loads its own styles and today's case)
- `game.css` – styles, all scoped under `#dxw`
- `cases/YYYY-MM.json` – one file per month; each case has a `date`
- `index.html` – standalone page for testing

## Embed in Squarespace (Code block, HTML)
```html
<div id="dxw"></div>
<script src="https://play.maladywise.com/game.js"></script>
```

## Difficulty rhythm
Mon–Tue Easy · Wed–Thu Medium · Fri–Sat Hard · Sun Genius

## Preview a future day
`https://play.maladywise.com/?date=2026-11-01` (doesn't count towards stats)

## Adding cases
Add objects to the right month file with a new `date` and the next `number`.
All cases are fictional. General education, not personal medical advice.

## Einstein days
Rare top tier, about 1 day in 100 per game. Listed in `assets/games.js` (`MW_EINSTEIN`) and set as `"difficulty": "Einstein"` in that day's puzzle.
When generating new batches, roll ~1% per day per game for Einstein. Displaced puzzles go to each game's `reserve.json`.
