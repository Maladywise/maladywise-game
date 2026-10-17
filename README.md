# Diagnosis Wordle · Malady Wise

A daily medical puzzle. One fictional case per day (Sydney time), six clues, one diagnosis.

## Files
- `game.js` – the game (loads its own styles and today's case)
- `game.css` – styles, all scoped under `#dxw`
- `cases/YYYY-MM.json` – one file per month; each case has a `date`
- `index.html` – standalone page for testing

## Embed in Squarespace (Code block, HTML)
```html
<div id="dxw"></div>
<script src="https://maladywise.github.io/maladywise-game/game.js"></script>
```

## Difficulty rhythm
Mon–Tue Easy · Wed–Thu Medium · Fri–Sat Hard · Sun Genius

## Preview a future day
`https://maladywise.github.io/maladywise-game/?date=2026-11-01` (doesn't count towards stats)

## Adding cases
Add objects to the right month file with a new `date` and the next `number`.
All cases are fictional. General education, not personal medical advice.
