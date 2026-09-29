# Launchpad — Release B

A separate review build for the replacement learning academy.

## Implemented

- Release A preferences remain compatible
- Phase → Module → Lesson → Topic navigation
- Direct topic routes
- Notes, Hands-On, Challenge, and Checkpoint tabs
- Keyboard-operated tab navigation
- Topic table of contents
- Lightweight code highlighting and copy buttons
- Search page and command palette
- Bookmarks and resume-topic record
- Personal notes and exercise drafts
- Separate preferences and learning-data backups
- Validated restore and scoped resets
- Release A and Release B verification pages

## Content boundary

There is one labelled interface-review topic.

It is not the full Phase 0 or Phase 1 curriculum.
Its IDs are review-specific and will not silently map to future curriculum topics.

The code examples require already prepared Python or TypeScript workspaces.
The website does not install tools or execute examples.

## Not implemented yet

- Full curriculum content
- Weekly planner and activity tracker
- Study-time measurement
- Topic completion records
- Persistent quiz scores
- Achievements
- Live AI
- Server-side test execution
- Monaco Editor
- Full browser UI automation
- Formal accessibility or performance certification

## Files

Keep all files inside next-academy.

Release A dependencies kept unchanged:
- styles.css
- catalog.js
- schema.js
- store.js
- checks.html

Release B files:
- index.html
- app.js
- course.js
- learning-store.js
- learning-ui.js
- learning.css
- learning-checks.html
- README.md

The original repository-root website remains unchanged.

## Storage

Preferences:
    launchpad-next-foundation-v1

Learning data:
    launchpad-next-learning-v1

Learning data contains:
- Bookmarked topic IDs
- Last visited topic ID
- Personal notes
- Exercise drafts

Checkpoint feedback is intentionally not persisted as course completion.

Unreadable storage blocks automatic writes.
Export untouched data before explicitly restoring or resetting.

Never call localStorage.clear().

## Backups

Preferences and learning data are exported separately.
Restore the matching file into the matching section.

Learning imports reject unknown topic IDs rather than silently deleting notes.
Future content-schema changes must include an explicit migration.

Storage-write failures are shown to the learner.
Unsaved text remains in the current editor, but must be copied before leaving.

## Routes

- #/
- #/phases
- #/phases/phase-0
- #/modules/review-workspace
- #/lessons/review-first-check
- #/topics/review-actions-and-assertions
- #/search
- #/bookmarks
- #/settings
- #/release

Unknown routes display a 404 view.

## Verification

Run:
- checks.html
- learning-checks.html

Both use in-memory storage for their test cases.

Then manually verify:
- Tab keyboard navigation
- Search dialog and Escape behavior
- Code copying
- Notes and draft persistence
- Bookmark persistence
- Backup/restore
- Mobile layout
- Light/dark readability

These files were not executed in the chat environment.
Do not report a passing result until the checks actually run.

## Content validation

schema.js validates content relationships and required published-topic fields.

course.js extends validation for multiple-choice questions.

The detailed notes must contain 300–800 words.
There must be Python and TypeScript examples.
Further-reading references must be HTTPS URLs.

Validation checks structure, not whether APIs and explanations are correct.
Technical content still requires review and actual example execution.

## Next release

Release C adds the dashboard, weekly planner, tracker,
learning progress, and achievement rules.

Detailed curriculum content follows in module-sized batches.