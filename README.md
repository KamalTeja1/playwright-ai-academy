# Launchpad: Python + Playwright Academy

A static, beginner-friendly learning application.

## Delivered in this package

- Personalized onboarding
- Dated weekly planning
- 30/60/90-minute study sessions using 15-minute activity blocks
- Missed-work rescheduling and a seven-day break option
- Calendar export
- Nine complete computer-basics and setup lessons
- Operating-system-specific instructions
- Quizzes, hints, reference solutions, notes, and exercise drafts
- Learner-recorded evidence checkpoints
- JSON progress backup and restore
- Separate AI Academy introduction
- Browser-based planner verification checks
- Responsive light/dark design

## Not delivered yet

- The full advanced curriculum
- Full Python fundamentals track beyond the first-program introduction
- All five project starter packs
- Live AI tutoring or code review
- Server-side Python or browser execution
- Accounts or cross-device synchronization
- Full automated browser UI coverage
- Formal accessibility audit
- Syntax-highlighted editor or line-by-line code diff

The roadmap labels undelivered material as planned.
Only delivered lessons are scheduled.

## Files

Keep these files together in the repository root:

- index.html
- styles.css
- content.js
- planner.js
- app.js
- checks.html
- README.md

No build step is required.

Old starter files named course.js and ui.js are not loaded.

## Publish with GitHub Pages

1. Add or replace the files in the repository.
2. Open Settings → Pages.
3. Select Deploy from a branch.
4. Select the branch containing the files.
5. Select / (root).
6. Save and wait for deployment.
7. Open the published address shown by GitHub.

A custom domain is optional.

## Local preview

After installing Python, open a terminal in this website folder.

Run the appropriate command:

Windows:
    py -3.13 -m http.server 8000 --bind 127.0.0.1

macOS:
    python3.13 -m http.server 8000 --bind 127.0.0.1

Ubuntu:
    python3 -m http.server 8000 --bind 127.0.0.1

Open:
    http://127.0.0.1:8000

Stop the preview server with Ctrl+C.

Local-preview progress and GitHub Pages progress are separate because
they are stored under different browser origins. Use backup/restore to transfer.

## Planner semantics

Each lesson has four 15-minute estimated blocks:

1. Read and understand
2. Follow the walkthrough
3. Independent exercise
4. Quiz and evidence checkpoint

The planner schedules these in content order on selected study days.

Completion records use the local calendar date on which the learner marks
an activity complete. Completed dates do not move during rescheduling.

Changing a profile or using reschedule rebuilds unfinished dates.
It does not delete completed records, notes, drafts, or evidence.

Calendar events are all-day reminders, not booked time slots.
Calendar applications differ in duplicate/update behavior. Remove an older
imported calendar before importing a replacement if necessary.

A lesson is complete when all four activity blocks are recorded.
The final block requires a correct quiz answer, all evidence checkboxes,
and a written observation.

These are self-reported educational records, not execution verification.

## Data and privacy

Storage key:
    launchpad-python-foundation-v1

No account, email address, provider credential, or backend is required.

Notes, drafts, evidence, and preferences stay in localStorage unless the learner
exports a backup or copies text elsewhere.

Do not store secrets or personal information in learning notes.

Backups are validated, limited to 2 MB on import, and replace rather than merge
the current learning record.

Only restore backups from a trusted source.

Earlier starter progress is not automatically migrated because the new
Python curriculum uses different lesson identifiers.

## Python environment policy

Playwright examples target 1.63.0.

Windows and macOS instructions target Python 3.13.x.
The guided Linux path targets Ubuntu 24.04 with its supported Python 3 packages.

The pytest-playwright plugin and transitive packages resolve during installation.
The learner records installed versions in requirements-installed.txt.

That snapshot is not a verified cross-platform lockfile.

Recheck official Python, VS Code, and Playwright requirements before updating
versions or expanding OS coverage.

## Safety

The website never uses eval or executes submitted Python.

There is no live AI provider and no place to enter an AI API key.

The AI Academy introduction is explicitly labeled as introductory material.
A future live tutor requires a separate secure backend.

GitHub Pages hosts this frontend; it is not the future AI or execution backend.

## Verification

Open checks.html and press Run checks.

These checks exercise scheduling, dates, calendar export, and backup validation.
They do not substitute for a full browser UI test suite.

Also complete the manual acceptance checklist supplied with the implementation.

The code was generated without a browser execution environment in the chat.
Do not claim tests passed until you run them.

## Updating course content

Lesson content lives in content.js.
Use stable lesson IDs so existing progress still maps correctly.

Each lesson includes:
- objective
- prerequisite
- explanation
- vocabulary
- walkthrough
- example
- exercise and starter
- expected behavior
- troubleshooting
- progressive hints
- reference solution
- quiz and explanation
- evidence checklist
- advanced challenge
- official references

Adding or removing lesson IDs requires a deliberate storage/schema migration
before publishing to existing learners. This starter does not automatically
migrate schedules across content-schema changes.