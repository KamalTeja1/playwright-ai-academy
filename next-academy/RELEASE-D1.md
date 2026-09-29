# Release D1 — Environment Setup

## Delivered content

Six separate topics:

1. Install Python (3.10+), VS Code, Git
2. VS Code extensions: Python, Pylance, Playwright Test, GitLens
3. Terminal basics: cd, ls, mkdir, touch, rm, cp, mv, pwd, cat
4. Virtual environments: python -m venv venv, activation, deactivation
5. pip essentials: pip install, pip freeze, requirements.txt
6. DevTools tour: Elements, Console, Network, Application, Sources,
   Performance, Lighthouse

Each topic contains:
- Summary
- Why it matters
- Detailed notes
- Numbered hands-on instructions
- Deliverable and expected behavior
- Challenge and reference approach
- 3–5 MCQs with answers
- 3–5 tips
- 3–5 mistakes with fixes
- Python and TypeScript examples
- Execution guidance
- Official references

## Important teaching boundary

Browser examples in Topics 1–4 are deferred until Topic 5 prepares
the two local workspaces.

The beginner's immediate tasks in those topics are installation,
verification, editor use, shell practice, and environment preparation.

No browser test is executed by the website.

## Versions and platforms

Teaching baseline:
- Playwright 1.62.0, explicitly pinned
- Windows 11: Python 3.14
- macOS 14+: Python 3.14
- Ubuntu 24.04: distribution-supported Python
- Node.js 24 for the TypeScript workspace

Playwright 1.62.0 is a selected published baseline, not a claim of latest.

The Python plugin and transitive versions resolve at installation time.
The learner records them in the requirements snapshot.

The installer for this website release does not install or change any
Python/npm packages.

## Application integration

The local install-d1.py script:

- Validates exact expected Release C passages
- Preserves the old course as review-course.js
- Creates a new composed course.js
- Updates outdated review-only labels
- Adds a D1 verification link
- Backs up modified files
- Does not access browser storage
- Does not make network requests

Run without --apply first to preview.

## Persistence

No storage key changes.
No existing topic ID changes.

The original review topic remains available to preserve:
- Notes
- Drafts
- Bookmarks
- Completion dates
- Challenge dates
- Old schedules

The new six topics have new IDs and begin incomplete.

Dashboard totals include the retained review topic.
They are not completion percentages for the entire planned academy.

## Planner

An existing schedule is not silently rewritten.

After installing D1:
1. Open Weekly planner.
2. Select the desired start date and availability.
3. Save the schedule.

This schedules new unfinished topics while preserving recorded activity.

## Verification

Run:
- checks.html
- learning-checks.html
- activity-checks.html
- d1-checks.html

D1 adds 12 checks, including:
- Exact topic titles
- Content length
- Language examples
- Schema relationships
- Compatibility with earlier data
- Inclusion of new topics in a rebuilt plan

These are structural and logic checks.

The website and Python/TypeScript examples were not executed in the chat.
Real execution and UI verification still need to be performed locally.

## Rollback

Before installation, commit the working Release C.

The installer also creates:
    .d1-file-backup/

It contains copies of every replaced file plus a manifest.

To manually roll back the integration:
- Restore the original course.js, app.js, activity-ui.js,
  learning-ui.js, and index.html from that folder.
- Remove the generated review-course.js only after restoring course.js.
- Keep or remove the new D1 content/check files as desired.

Do not reset browser storage as part of a file rollback.

If you have already recorded activity on new D1 topics, older code may reject
the newer backup's topic IDs. Export current browser data before rolling back.

## Remaining content

Module 0.2 Web Fundamentals is next.
Module 0.3 and Phases 1–8 are not delivered by this release.