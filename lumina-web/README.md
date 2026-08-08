# Lumina — web frontend

A pen-first AI learning experience, built for low-cost Android tablets.

Lumina watches *how* a student solves a problem, not just whether they got it
right. A student writes their working on a full-screen board; when the pen
stops, Lumina reads the work, names the misconception behind the mistake, and
asks a question that points at it — without giving the answer away.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## What's here

| Path | What it holds |
| --- | --- |
| `src/theme/` | Design tokens — colour, radius, type, motion. Nothing hard-codes a hex value. |
| `src/components/ui/` | Primitives: buttons, circular controls, glass surfaces, gooey inputs, the AI orb. |
| `src/components/handwriting/` | The board. Pressure-aware ink with stroke-level undo and palm rejection. |
| `src/components/lesson/` | Learning path, lesson nodes, expression highlighting, the tutor bubble. |
| `src/screens/` | One folder per screen. |
| `src/services/ai/` | **The tutoring boundary.** See below. |
| `src/data/` | Curriculum, CA CCSSM standards, the Grade 7 problem bank, collectibles. |

## Connecting the real tutoring engine

Everything the UI knows about the AI lives behind two interfaces in
`src/services/ai/`:

- `TutorService.evaluate(request, problem)` → a structured `TutorResponse`
  (`status`, `skill`, `misconception`, `hintLevel`, `hint`, `highlight`,
  `confidence`).
- `RecognitionService.recognize(strokes, problem)` → ordered lines of text.

Both are currently mock implementations. Swapping in the real engine is a
one-line change in `src/services/ai/index.ts` — no screen or component reaches
for a concrete implementation, and no component parses free text or decides
pedagogy for itself.

Because recognition is mocked, the demo plays a student who takes the hint: the
first read finds the common slip for that problem, the next finds it fixed.
Settings → demo → "always read as solved" walks the clean path instead.

## Content

Grade 7 equations, 14 problems, each anchored to a California Common Core
standard (CA CCSSM) — `7.EE.B.4a`, `7.NS.A.1`, `6.EE.B.7`, `8.EE.C.7b`,
`7.EE.A.1`. Problems carry the misconceptions they are designed to surface, so
the engine has something to compare working against rather than only an answer
to mark.
