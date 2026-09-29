# Launchpad — Release A

A separate foundation build for the replacement learning academy.

## Current status

Implemented:

- Application startup and startup-error handling
- Dark/light appearance
- Collapsible navigation
- Nine-phase course map
- Settings with a versioned storage adapter
- Preferences backup and validated restore
- Reset limited to this application's storage key
- Content-schema validation
- Browser-run verification checks

Not implemented yet:

- Detailed course topics
- Lesson workspace and checkpoints
- Search and command palette
- Dashboard learning statistics
- Weekly planner and activity tracker
- Achievements
- Python or TypeScript execution
- Live AI integration

Empty course pages are intentional in this foundation release.
They are not presented as completed learning material.

## Files

Keep these files together:

- index.html
- styles.css
- schema.js
- catalog.js
- store.js
- app.js
- checks.html
- README.md

No other files are imported by this release.

## Existing website

Do not change the existing repository-root website files.

This build belongs inside next-academy/ and has a separate URL.

It does not migrate or delete the previous academy's progress.

## Storage

Key:

    launchpad-next-foundation-v1

Release A stores:

- Display name
- Theme
- Weekly goal in minutes

This is a preferences schema, not a learning-progress schema.

Unreadable data blocks automatic writing.
Explicit restore or reset is required to replace it.

Do not use localStorage.clear() in this application.

## Content structure

The content catalog separates:

- Phase
- Module
- Lesson
- Topic

Relationships:

- Module.phaseId → Phase.id
- Lesson.moduleId → Module.id
- Topic.lessonId → Lesson.id

Every record requires:
- id
- title
- order

A published topic additionally requires:

- status: "published"
- summary
- whyItMatters
- difficulty
- content: [{ heading, body }]
- handsOn: { steps, deliverable }
- challenge: { task, solution }
- checkpoint: [{ question, answer }]
- proTips
- commonMistakes
- codeExamples: [{ language, filename, source }]
- furtherReading

Detailed-note bodies must total 300–800 whitespace-separated words.
Checkpoint, pro-tip, and common-mistake counts are validated.
Both Python and TypeScript examples are required.

The validator checks structure, not technical correctness.
Examples and references still require review and execution.

Use stable IDs. Do not rename IDs merely to change visible titles.

## Running checks

Open checks.html through the preview server.
Press Run checks.

The checks use in-memory storage and do not modify your settings.

Passing these checks does not prove:
- Browser UI accessibility
- Lighthouse scores
- Python example correctness
- Production readiness

## Fonts and motion

The stylesheet requests Inter and JetBrains Mono.
System fallbacks are used if those fonts are unavailable.

No font files or external font requests are included.

Reduced-motion preferences disable animations and transitions.

## Release sequence

A. Foundation — this release
B. Learning workspace and navigation
C. Dashboard, weekly planner, and tracker
D. Phase 0 content batches
E. Phase 1 content batches
F. Phase 2–8 inventory and later content authoring
G. Verification and refinement
H. Public-site replacement

## Verification disclosure

This code was provided without executing it in the chat environment.
Run the supplied checks and manual checklist before considering it verified.