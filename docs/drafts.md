# Writing drafts

Each reference on the homepage is split into a few sections. Under the film, every section
gets a plain HyperFrames draft: a 640×360 black-and-white scene driven by a paused GSAP
timeline. A draft is described by one or two **beats** — a beat kind, its text, and its
options — in `public/references/drafts.json` (your own imported references) or
`showcase/references/drafts.json` (the three published examples). The local file wins when
both exist.

The engine and every beat kind live in `public/drafts.mjs`. This guide lists the file shape,
the timing rules, and one short example per kind.

## File shape

```json
{
  "aliases": {},
  "drafts": {
    "69614b10fa87": {
      "palette": { "bg": "#070708", "fg": "#f2f2f2", "accent": "#43d3c9" },
      "sections": [
        {
          "name": "Hook",
          "beats": [
            ["text", "Global payments", { "size": 30, "y": 0.47 }],
            ["text", "a pain", { "size": 150, "x": 0.58, "y": 0.55 }]
          ]
        }
      ]
    }
  }
}
```

- `drafts` is keyed by reference id. `aliases` maps a reference id to another draft id when
  two references share a draft design.
- `sections` follows the sections that `scripts/plan-sections.mjs` writes to
  `public/references/sections.json`: one entry per section, in order. A section without an
  entry gets the placeholder beat `["text", "Part N"]`.
- `name` is the label under the draft.
- `beats` is one or two `[kind, text?, options?]` arrays. `text` is optional and defaults to
  `""`; `options` defaults to `{}`. `["burst"]` is a valid one-element beat.

### Palette

`palette` has `bg`, `fg` and `accent`. Drafts are strictly black and white: the engine keeps
only whether the palette's background is light or dark, and turns every colour into black,
white or a grey. A beat can override its own background with `"bg": "accent"` or a hex colour,
which is useful to flip one beat from light to dark.

## Timing

Section start/end and the film's scene cuts come from `scripts/plan-sections.mjs`, and the
page turns them into each beat's start time:

- **Two beats:** the draft switches exactly where the film cuts — the scene change inside the
  section, between 30% and 80% of its length, closest to the middle (55%). If the section has
  no cut there, the second beat starts at 55%.
- **Any other beat count:** the beats split the section evenly.

The starts are computed in `beatStarts()` in `public/demo.mjs`; beats are not individually
hand-timed in the file today (there is no per-beat `at` field on `main`). To change when a
draft switches, change the beats or split the section into more sections.

## Beat kinds

Every kind is a deliberately simple layout: flat shapes, plain type, one entrance and a slow
drift. `text` is never required — most kinds fall back to a sensible empty state.

| Kind | `text` is | Options |
| --- | --- | --- |
| `text` | the headline, wrapped into words | `size`, `weight`, `x`, `y` |
| `logo` | the wordmark | `mark`, `markSize`, `size`, `sub` |
| `input` | the text being typed | `h` |
| `chat` | the message bubble | — |
| `window` | the window title | — |
| `phone` | the caption beside the phone | `stack` |
| `cards` | the heading above a grid of cards | — |
| `list` | checklist items, separated by `|` | — |
| `chart` | the label on the line chart | — |
| `notify` | the notification text | — |
| `icons` | — | — |
| `hub` | the label under the core | — |
| `cloud` | `main|second|third…` | — |
| `collage` | the line over the photo tiles | — |
| `logos` | — | — |
| `shape` | the caption beside the hero tile | — |
| `burst` | the label under the burst | — |
| `grid` | up to four cells, separated by `|` | `cells` |
| `split` | the text in the coloured side panel | — |
| `face` | the caption beside the face | — |

`x` and `y` are fractions of the 640×360 canvas (`0.5` is the centre) and only apply to
beats that centre text (`text`). An unknown kind falls back to `text`.

## Examples

One beat per kind, copied from the shipped drafts where possible. A section's `beats` is an
array of these.

### `text`

```json
["text", "Powered by Stablecoins", { "size": 34, "y": 0.2 }]
```

### `logo`

```json
["logo", "Infinite", { "mark": "∞", "markSize": 60, "size": 40, "sub": "INFINITE.DEV" }]
```

`mark` sets a glyph instead of the default rounded square; omit `sub` for a one-line logo.

### `input`

```json
["input", "Ask anything", { "h": "What do you want to make?" }]
```

`h` is an optional heading above the prompt box; the text is typed into the box.

### `chat`

```json
["chat", "Ship it today"]
```

Message bubble on the right and a typing reply on the left.

### `window`

```json
["window", "Newsroom"]
```

A browser/app window with a sidebar, three tiles and a moving pointer.

### `phone`

```json
["phone", "Sign Up In Seconds", { "stack": true }]
```

Phone mockup with five rows; `stack` puts the caption above the phone instead of beside it.

### `cards`

```json
["cards", "Everything in one place"]
```

A heading and a 3×2 grid of cards.

### `list`

```json
["list", "Fast setup|No install|Works offline"]
```

One checklist row per `|`-separated item, each dot filling in as the beat plays.

### `chart`

```json
["chart", "+312%"]
```

A bouncing line chart with an axis and a label tag.

### `notify`

```json
["notify", "New release is ready"]
```

A notification pill dropping in from the top.

### `icons`

```json
["icons", "", { "bg": "#8c0f4a" }]
```

A 5×3 grid of rounded tiles popping in; `bg` flips this beat to a dark background on a light
palette.

### `hub`

```json
["hub", "Global"]
```

A core tile with four pills orbiting it and a label underneath.

### `cloud`

```json
["cloud", "One API|payments|payouts|ledger|FX|reports|SDKs"]
```

The first item is the large centred word; the rest are scattered smaller words.

### `collage`

```json
["collage", "Made for teams"]
```

Five photo tiles with a line of text across the middle.

### `logos`

```json
["logos"]
```

Three rows of scrolling logo cards; no text needed.

### `shape`

```json
["shape", "SDK"]
```

A hero tile dropping in tilted, then turning in 3D with a highlight sweep and a caption.

### `burst`

```json
["burst", "Launch"]
```

A horizontal line and a rotating star burst with a label under it.

### `grid`

```json
["grid", "Fast|Simple|Private|Local"]
```

Up to four cells in a 2×2 grid; use `"cells": ["A", "B", "C", "D"]` instead of `|` when the
text itself contains pipes.

### `split`

```json
["split", "Ship faster"]
```

A coloured left panel sliding in, with a column of bars on the right.

### `face`

```json
["face", "Hear the difference"]
```

A round face with blinking eyes and a caption.

## Checking your draft

```sh
npm test        # node --test
npm run check   # syntax-checks every UI file
npm start       # http://127.0.0.1:4343
```

Open the homepage and switch to the reference you edited. Undescribed sections show
placeholders, which makes it easy to see which section still needs beats. `npm run showcase`
rebuilds the published `showcase/` copy from your local references.
