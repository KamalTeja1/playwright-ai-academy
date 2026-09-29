# Release C — Dashboard, Planning, and Activity

## Content scope

The installed course still contains one interface-review topic.
This release does not install the full curriculum.

Dashboard percentages describe installed published topics only.
They must not be described as completion of the full academy.

## New files

- activity.js
- activity-ui.js
- activity.css
- activity-checks.html
- RELEASE-C.md

Replaced:
- index.html
- app.js

All Release A/B dependencies remain required.

## Storage categories

Preferences:
    launchpad-next-foundation-v1

Notes, drafts, and bookmarks:
    launchpad-next-learning-v1

Activity and schedule:
    launchpad-next-activity-v1

No automatic migration is needed: each previous category remains unchanged.

Export all three categories before moving origins or devices.
Release C imports replace only Release C records.

## Actual activity versus estimates

Planner minutes are estimates.

Daily study minutes are manually entered totals.
Saving a day replaces its total rather than adding another session.

Check-ins do not add minutes.
Opening a page does not add minutes.
Completing a topic does not add minutes.

Topic completion and challenge success are self-reported.
Checkpoint answers do not automatically certify completion.

## Planning

Topic estimates are split into blocks of up to 15 minutes.
Supported study-day capacity: 30, 60, or 90 minutes.

Only published topics are scheduled.
Curriculum order follows phase, module, lesson, and topic order.

Completing a topic removes its remaining visible reminders.
Partial reminder-block completion is not tracked.

Saving planner settings rebuilds unfinished allocations.
Catch-up and seven-day-break controls preserve activity records.

If a completed topic is reopened after the schedule was rebuilt,
rebuild the planner again to add that topic back.

Calendar export is a snapshot, not synchronization.
Calendar apps may duplicate imported reminders.
Remove older imported copies when necessary.

## Streaks

A day is active when it has:
- A check-in
- Positive recorded minutes
- A topic completion
- A challenge completion

Notes alone do not create activity.

The current streak may end today or yesterday.
The longest streak is calculated from recorded activity dates.

Dates use the learner's local calendar date.
Date arithmetic uses normalized calendar-day values.

## Achievements

Achievements are derived from current activity records.

They can relock after records are corrected or removed.
They are not permanent certificates.

Installed rules:
- One topic complete
- Three consecutive active days
- Sixty recorded study minutes

## Data validation and concurrency

Future activity dates are rejected.
Daily minutes must be whole numbers between 0 and 1440.
Unknown published-topic IDs are rejected on import.
Invalid backups are rejected before replacement.

Failed writes do not change the store's committed in-memory state.

Release C checks for an activity record changed by another tab before saving.
Reload if a conflicting write is detected.

Preferences and learning stores retain their previous behavior.
Use one editing tab for those records.

## Export

- Activity JSON backup
- Planner ICS calendar snapshot
- Selected-week Markdown report
- Browser print / Save as PDF

Print output is a browser-generated document, not a dedicated PDF library.

## Verification

Run:
- checks.html
- learning-checks.html
- activity-checks.html

Release C includes 20 in-memory logic checks.

Also manually verify:
- Dashboard updates
- Plan creation and catch-up
- Topic completion and undo
- Daily minute replacement
- Check-in idempotence
- Markdown/calendar export
- Backup restore
- Light/dark/mobile views
- Keyboard navigation
- Charts' accompanying data tables

These files were not executed in the chat environment.
Do not report passing results until you run the checks.

## Still pending

- Full curriculum
- Real backend or cross-device sync
- Live AI
- Browser-based code execution
- Automatic exercise verification
- Partial plan-block progress
- Comprehensive browser UI automation
- Measured accessibility and Lighthouse results