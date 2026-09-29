import {
  today, addDays, monday, formatDay, blankDay,
  orderedTopics, publishedTopics, dailyMetrics,
  streaks, achievementStatus, calendarExport,
  validateActivity
} from "./activity.js";

import { escapeHTML as e, topicCards } from "./learning-ui.js";

export function createActivityViews({
  root, course, preferences, learning, activity, notify, download
}) {
  let plannerWeek = monday(today());
  let trackerWeek = monday(today());

  function attempt(action, after) {
    try {
      const before = new Set(
        achievementStatus(activity.get())
          .filter(a => a.unlockedAt)
          .map(a => a.id)
      );

      action();

      const fresh = achievementStatus(activity.get())
        .filter(a => a.unlockedAt && !before.has(a.id))
        .map(a => a.title);

      if (after) after();
      if (fresh.length) notify("Achievement unlocked: " + fresh.join(", "));
      return true;
    } catch (error) {
      notify(String(error.message || error));
      return false;
    }
  }

  function reviewNotice() {
    return `<p class="notice small">
      This installation currently contains ${publishedTopics(course).length} published
      interface-review topic(s), not the full curriculum. Completion and challenge
      outcomes are learner-recorded; study minutes are entered manually.
    </p>`;
  }

  function ring(done, total) {
    const percent = total ? Math.round(done / total * 100) : 0;
    return `<div class="progress-ring" style="--progress:${percent}"
      role="img" aria-label="${done} of ${total} installed topics recorded complete">
      <span>${percent}%</span></div>`;
  }

  function badgeCards() {
    return `<div class="grid">${achievementStatus(activity.get()).map(a => `
      <section class="card achievement ${a.unlockedAt ? "earned" : ""}">
        <span class="achievement-symbol" aria-hidden="true">${a.unlockedAt ? "✦" : "◇"}</span>
        <h3>${e(a.title)}</h3>
        <p>${e(a.description)}</p>
        <strong>${a.unlockedAt ? "Unlocked " + a.unlockedAt : "Locked"}</strong>
      </section>`).join("")}</div>`;
  }

  function dashboard() {
    const state = activity.get();
    const topics = orderedTopics(course);
    const done = topics.filter(t => state.completed[t.id]);
    const next = topics.filter(t => !state.completed[t.id]).slice(0, 3);
    const last = learning.get().lastTopic;
    const resume = topics.find(t => t.id === last) || next[0] || topics[0];
    const start = monday(today());
    const weekRows = Array.from({ length: 7 }, (_, i) =>
      dailyMetrics(state, course, addDays(start, i)));
    const minutes = weekRows.reduce((n, d) => n + d.minutesSpent, 0);
    const goal = preferences.get().weeklyGoalMinutes;
    const streak = streaks(state);

    const currentTopic = next[0] || resume;
    const currentLesson = course.lessons.find(l => l.id === currentTopic?.lessonId);
    const currentModule = course.modules.find(m => m.id === currentLesson?.moduleId);
    const currentPhase = course.phases.find(p => p.id === currentModule?.phaseId);

    root.innerHTML = `
      <section class="hero">
        <div>
          <p class="eyebrow">YOUR PLAN · YOUR PACE</p>
          <h1>Welcome, ${e(preferences.get().name)}.<br><em>Keep moving forward.</em></h1>
          <p>${currentPhase ? "Current available phase: " + e(currentPhase.title) : "No published topics yet."}</p>
          <div class="actions">
            ${resume ? `<a class="button primary" href="#/topics/${resume.id}">Resume learning →</a>` : ""}
            <a class="button" href="#/planner">My planner</a>
            <a class="button" href="#/tracker">Record study time</a>
          </div>
        </div>
      </section>

      ${reviewNotice()}

      <div class="grid">
        <section class="card stat">
          ${ring(done.length, topics.length)}
          <p>${done.length}/${topics.length} installed topics recorded complete</p>
        </section>
        <section class="card stat">
          <strong>${streak.current} days</strong>
          <span>Current activity streak · longest ${streak.longest}</span>
        </section>
        <section class="card stat">
          <strong>${minutes} min</strong>
          <span>Manually recorded this week · goal ${goal}</span>
          <progress value="${Math.min(minutes, goal)}" max="${goal}"
                    aria-label="Weekly study goal"></progress>
          <div class="mini-bars" aria-hidden="true">
            ${weekRows.map(d => `<span style="height:${4 + Math.min(60, d.minutesSpent / Math.max(1, ...weekRows.map(x => x.minutesSpent)) * 60)}px"></span>`).join("")}
          </div>
        </section>
      </div>

      <section class="card">
        <h2>Recommended next topics</h2>
        ${next.length ? topicCards(next, learning) :
          '<p>All installed topics are recorded complete. Review them or wait for the next content release.</p>'}
      </section>

      <section class="card">
        <h2>Phase progress</h2>
        ${course.phases.map(phase => {
          const moduleIds = new Set(course.modules.filter(m => m.phaseId === phase.id).map(m => m.id));
          const lessonIds = new Set(course.lessons.filter(l => moduleIds.has(l.moduleId)).map(l => l.id));
          const available = topics.filter(t => lessonIds.has(t.lessonId));
          const count = available.filter(t => state.completed[t.id]).length;

          return `<div class="phase-progress">
            <strong>Phase ${phase.order}: ${e(phase.title)}</strong>
            ${available.length
              ? `<p class="small muted">${count}/${available.length} installed topics · not the complete phase syllabus</p>
                 <progress value="${count}" max="${available.length}" aria-label="Installed Phase ${phase.order} topic progress"></progress>`
              : '<p class="small muted">No published topics installed.</p>'}
          </div>`;
        }).join("")}
      </section>

      <section class="card">
        <h2>Recent topic activity</h2>
        ${done.length
          ? done.sort((a, b) => state.completed[b.id].localeCompare(state.completed[a.id]))
            .slice(0, 10).map(t => `<p><a href="#/topics/${t.id}">${e(t.title)}</a> — ${state.completed[t.id]}</p>`).join("")
          : "<p>No completions recorded. Open a topic to begin.</p>"}
      </section>

      <h2>Your achievements</h2>
      ${badgeCards()}

      <section class="card">
        <h2>A reminder</h2>
        <p>${[
          "Understanding beats copying.",
          "A useful failure tells you what to investigate next.",
          "A consistent small step is still progress."
        ][Number(today().slice(-2)) % 3]}</p>
        <div class="actions">
          <a class="button" href="#/achievements">Achievements</a>
          <a class="button" href="#/search">Search</a>
          <a class="button" href="#/activity-data">Activity backup</a>
        </div>
      </section>`;
  }

  function planner() {
    const state = activity.get();
    const settings = state.plan || {
      start: today(), days: [1, 2, 3, 4, 5], minutes: 60
    };
    const topics = new Map(course.topics.map(t => [t.id, t]));
    const pending = (state.plan?.entries || []).filter(x => !state.completed[x.topicId]);
    const overdue = pending.filter(x => x.date < today());

    root.innerHTML = `
      <h1>Your weekly planner</h1>
      ${reviewNotice()}
      <p>The planner divides topic estimates into blocks of up to 15 minutes.
      Completing a whole topic removes its remaining reminders.
      Partial block completion is not recorded in this release.</p>

      <section class="card">
        <h2>${state.plan ? "Update" : "Create"} your schedule</h2>
        <form id="planner-form">
          <div class="grid">
            <div>
              <label for="plan-start">Schedule unfinished topics from</label>
              <input id="plan-start" type="date" required min="2000-01-01"
                     max="2100-01-01" value="${settings.start}">
            </div>
            <div>
              <label for="plan-minutes">Available minutes on each selected day</label>
              <select id="plan-minutes">
                ${[30, 60, 90].map(n => `<option value="${n}" ${settings.minutes === n ? "selected" : ""}>${n} minutes</option>`).join("")}
              </select>
            </div>
          </div>

          <fieldset><legend>Study days</legend><div class="study-days">
            ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => `
              <label class="day-choice"><input type="checkbox" name="study-day"
                value="${i}" ${settings.days.includes(i) ? "checked" : ""}>${day}</label>`).join("")}
          </div></fieldset>

          <button class="primary">Save schedule</button>
          <p id="plan-error" role="alert"></p>
        </form>
        <p class="small muted">Saving rebuilds unfinished topic allocations in curriculum order.
        Recorded completions and actual study minutes remain unchanged.</p>
      </section>

      <section class="card">
        <div class="actions">
          <button id="plan-prev">← Previous</button>
          <button id="plan-now">This week</button>
          <button id="plan-next">Next →</button>
          <button id="plan-jump">Next scheduled work</button>
          <button id="plan-calendar" ${!state.plan ? "disabled" : ""}>Export calendar</button>
        </div>
        <h2 class="spaced">Week of ${e(formatDay(plannerWeek))}</h2>
        <p>${pending.reduce((n, x) => n + x.minutes, 0)} estimated minutes remain scheduled.
        ${overdue.length} reminder blocks are overdue.</p>

        <div class="week-grid">
          ${Array.from({ length: 7 }, (_, i) => {
            const day = addDays(plannerWeek, i);
            const entries = pending.filter(x => x.date === day);
            return `<section class="calendar-day ${day === today() ? "is-today" : ""}">
              <h3>${e(formatDay(day))}</h3>
              <p class="small muted">${entries.reduce((n, x) => n + x.minutes, 0)} planned minutes</p>
              ${entries.map(x => `<a class="plan-task" href="#/topics/${x.topicId}">
                ${e(topics.get(x.topicId).title)}
                <small>Part ${x.part} · ${x.minutes} estimated minutes</small>
              </a>`).join("") || '<p class="small muted">No unfinished reminder.</p>'}
            </section>`;
          }).join("")}
        </div>

        <div class="actions spaced">
          <button id="catch-up" ${!state.plan ? "disabled" : ""}>Reschedule from today</button>
          <button id="pause" ${!state.plan ? "disabled" : ""}>Resume after a 7-day break</button>
        </div>

        <p class="small muted">
          Calendar export is a snapshot of all-day reminders, not live synchronization.
          Remove older imported copies if your calendar app creates duplicates.
        </p>
      </section>`;

    root.querySelector("#planner-form").onsubmit = event => {
      event.preventDefault();
      const error = root.querySelector("#plan-error");

      try {
        activity.setPlan({
          start: root.querySelector("#plan-start").value,
          minutes: Number(root.querySelector("#plan-minutes").value),
          days: [...root.querySelectorAll('[name="study-day"]:checked')].map(x => Number(x.value))
        });
        plannerWeek = monday(activity.get().plan.start);
        planner();
        notify("Schedule saved. No study time was added.");
      } catch (problem) {
        error.textContent = problem.message;
      }
    };

    root.querySelector("#plan-prev").onclick = () => {
      attempt(() => { plannerWeek = addDays(plannerWeek, -7); }, planner);
    };
    root.querySelector("#plan-next").onclick = () => {
      attempt(() => { plannerWeek = addDays(plannerWeek, 7); }, planner);
    };
    root.querySelector("#plan-now").onclick = () => { plannerWeek = monday(today()); planner(); };
    root.querySelector("#plan-jump").onclick = () => {
      plannerWeek = monday(pending[0]?.date || today());
      planner();
    };
    root.querySelector("#plan-calendar").onclick = () =>
      attempt(() => download(calendarExport(activity.get(), course), "launchpad-plan.ics", "text/calendar"));

    function replan(from) {
      if (!confirm("Rebuild unfinished reminders from this date? Completed records and daily logs will remain.")) return;
      const current = activity.get().plan;
      const start = from > current.start ? from : current.start;
      attempt(() => activity.setPlan({ ...current, start }), () => {
        plannerWeek = monday(start);
        planner();
      });
    }

    root.querySelector("#catch-up").onclick = () => replan(today());
    root.querySelector("#pause").onclick = () => replan(addDays(today(), 7));
  }

  function tracker() {
    const state = activity.get();
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(trackerWeek, i));
    const rows = weekDays.map(d => dailyMetrics(state, course, d));
    const minutes = rows.reduce((n, d) => n + d.minutesSpent, 0);
    const goal = preferences.get().weeklyGoalMinutes;
    const streak = streaks(state);
    const historyStart = addDays(monday(today()), -77);

    const history = Array.from({ length: 12 }, (_, i) => {
      const start = addDays(historyStart, i * 7);
      const days = Array.from({ length: 7 }, (_, n) => addDays(start, n));
      return {
        start,
        topics: days.reduce((n, d) => n + dailyMetrics(state, course, d).topicsCompleted, 0),
        minutes: days.reduce((n, d) => n + dailyMetrics(state, course, d).minutesSpent, 0),
        cumulative: Object.values(state.completed).filter(d => d <= days[6]).length
      };
    });

    const topicMax = Math.max(1, ...history.map(r => r.topics));
    const cumulativeMax = Math.max(1, ...history.map(r => r.cumulative));

    root.innerHTML = `
      <h1>Your activity tracker</h1>
      ${reviewNotice()}

      <section class="card">
        <div class="actions">
          <button id="track-prev">← Previous</button>
          <button id="track-now">This week</button>
          <button id="track-next">Next →</button>
        </div>
        <h2 class="spaced">Week of ${e(formatDay(trackerWeek))}</h2>
        <p>${minutes}/${goal} goal minutes · current streak ${streak.current} · longest ${streak.longest}</p>
        <progress value="${Math.min(minutes, goal)}" max="${goal}" aria-label="Selected week's goal"></progress>

        <div class="week-grid">
          ${rows.map(d => `<section class="calendar-day ${d.date === today() ? "is-today" : ""}">
            <h3>${e(formatDay(d.date))}</h3>
            <p>${d.minutesSpent} minutes</p>
            <p class="small">${d.topicsCompleted} topics · ${d.lessonsCompleted} lessons</p>
            <p class="small">${d.challengesPassed} self-reported challenges</p>
            <p class="small">${d.checkedIn ? "✓ Checked in" : "No check-in"}</p>
          </section>`).join("")}
        </div>

        <div class="actions spaced">
          <button id="check-in">Check in today</button>
          <button id="export-week">Export selected week as Markdown</button>
          <button id="print-week">Print / Save as PDF</button>
        </div>
        <p class="small muted">Check-in does not add minutes. Printing uses your browser's print dialog.</p>
      </section>

      <section class="card">
        <h2>Record or correct a study day</h2>
        <form id="daily-form">
          <label for="log-date">Date</label>
          <input id="log-date" type="date" min="2000-01-01" max="${today()}" value="${today()}" required>

          <label for="log-minutes">Actual total minutes that day — replaces the previous total</label>
          <input id="log-minutes" type="number" min="0" max="1440" step="1" required>

          <label for="log-notes">Daily notes — no secrets or personal data</label>
          <textarea id="log-notes" rows="4" maxlength="5000"></textarea>

          <label for="log-mood">Optional mood</label>
          <select id="log-mood">
            <option value="">Not recorded</option>
            <option value="🙂">🙂 Positive</option>
            <option value="😐">😐 Neutral</option>
            <option value="😓">😓 Challenging</option>
          </select>

          <label class="day-choice">
            <input id="log-checkin" type="checkbox">
            Record a check-in for this day
          </label>

          <button class="primary">Save daily record</button>
          <p id="daily-error" role="alert"></p>
        </form>
      </section>

      <section class="card">
        <h2>Twelve-week activity history</h2>
        <p class="small muted">A filled day has a check-in, positive study minutes, a completion,
        or a challenge record. Notes alone do not create a streak.</p>

        <div class="heatmap" role="img" aria-label="Activity heatmap; daily values are available in the table below">
          ${Array.from({ length: 84 }, (_, i) => {
            const day = addDays(historyStart, i);
            const m = dailyMetrics(state, course, day);
            const active = m.checkedIn || m.minutesSpent || m.topicsCompleted || m.challengesPassed;
            return `<span class="${active ? "active" : ""}" title="${day}: ${m.minutesSpent} minutes, ${m.topicsCompleted} topics"></span>`;
          }).join("")}
        </div>

        <h3>Topics completed each week</h3>
        <svg class="activity-chart" viewBox="0 0 600 140" role="img" aria-label="Weekly topic counts; exact values follow in the table">
          ${history.map((r, i) => `<rect x="${i * 50 + 7}" y="${125 - r.topics / topicMax * 110}"
            width="32" height="${r.topics / topicMax * 110}" rx="4" fill="#7C5CFF"/>`).join("")}
        </svg>

        <h3>Cumulative topic completions</h3>
        <svg class="activity-chart" viewBox="0 0 600 140" role="img" aria-label="Cumulative completions; exact values follow in the table">
          <polyline fill="none" stroke="#22D3EE" stroke-width="3"
            points="${history.map((r, i) => `${i * 50 + 20},${125 - r.cumulative / cumulativeMax * 110}`).join(" ")}"/>
        </svg>

        <div class="table-scroll"><table>
          <caption>Chart values</caption>
          <thead><tr><th>Week starting</th><th>Topics</th><th>Minutes</th><th>Cumulative topics</th></tr></thead>
          <tbody>${history.map(r => `<tr><td>${r.start}</td><td>${r.topics}</td><td>${r.minutes}</td><td>${r.cumulative}</td></tr>`).join("")}</tbody>
        </table></div>

        <details class="history-details">
          <summary>Daily heatmap values</summary>
          <div class="table-scroll"><table>
            <thead><tr><th>Date</th><th>Minutes</th><th>Topics</th><th>Check-in</th></tr></thead>
            <tbody>${Array.from({ length: 84 }, (_, i) => {
              const d = dailyMetrics(state, course, addDays(historyStart, i));
              return `<tr><td>${d.date}</td><td>${d.minutesSpent}</td><td>${d.topicsCompleted}</td><td>${d.checkedIn ? "Yes" : "No"}</td></tr>`;
            }).join("")}</tbody>
          </table></div>
        </details>
      </section>`;

    function loadDay() {
      const d = activity.get().days[root.querySelector("#log-date").value] || blankDay();
      root.querySelector("#log-minutes").value = d.minutes;
      root.querySelector("#log-notes").value = d.notes;
      root.querySelector("#log-mood").value = d.mood;
      root.querySelector("#log-checkin").checked = d.checkedIn;
    }

    loadDay();
    root.querySelector("#log-date").onchange = loadDay;

    root.querySelector("#daily-form").onsubmit = event => {
      event.preventDefault();
      const day = root.querySelector("#log-date").value;
      const error = root.querySelector("#daily-error");

      try {
        const before = achievementStatus(activity.get()).filter(a => a.unlockedAt).length;
        activity.setDay(day, {
          minutes: Number(root.querySelector("#log-minutes").value),
          notes: root.querySelector("#log-notes").value,
          mood: root.querySelector("#log-mood").value,
          checkedIn: root.querySelector("#log-checkin").checked
        });
        tracker();
        const after = achievementStatus(activity.get()).filter(a => a.unlockedAt).length;
        notify(after > before ? "Daily record saved. Achievement unlocked!" : "Daily record saved.");
      } catch (problem) {
        error.textContent = problem.message;
      }
    };

    root.querySelector("#check-in").onclick = () => attempt(() => activity.checkIn(), tracker);
    root.querySelector("#track-prev").onclick = () => attempt(() => {
      trackerWeek = addDays(trackerWeek, -7);
    }, tracker);
    root.querySelector("#track-next").onclick = () => attempt(() => {
      trackerWeek = addDays(trackerWeek, 7);
    }, tracker);
    root.querySelector("#track-now").onclick = () => { trackerWeek = monday(today()); tracker(); };
    root.querySelector("#print-week").onclick = () => window.print();

    root.querySelector("#export-week").onclick = () => {
      const latest = activity.get();
      const text = `# Launchpad study week ${trackerWeek}\n\n` +
        `Activity is learner-recorded. Challenge outcomes are self-reported.\n\n` +
        weekDays.map(day => {
          const d = dailyMetrics(latest, course, day);
          return `## ${day}\n\n- Minutes: ${d.minutesSpent}\n- Topics: ${d.topicsCompleted}\n- Lessons: ${d.lessonsCompleted}\n- Self-reported challenges: ${d.challengesPassed}\n- Check-in: ${d.checkedIn ? "yes" : "no"}\n\n${d.notes}\n`;
        }).join("\n");

      download(text, `launchpad-week-${trackerWeek}.md`, "text/markdown;charset=utf-8");
    };
  }

  function achievements() {
    root.innerHTML = `<h1>Your achievements</h1>
      ${reviewNotice()}
      <p>Badges are derived from current records. Correcting or deleting records can relock a badge.
      They recognize activity, not professional certification.</p>
      ${badgeCards()}`;
  }

  function dataPage() {
    const status = activity.status();

    root.innerHTML = `<h1>Activity data and recovery</h1>
      ${status.blocked ? `<div class="notice danger">${e(status.startupError)}</div>` : ""}
      <section class="card">
        <h2>Backup</h2>
        <p>This backup contains only Release C schedules, completion dates, daily logs,
        and challenge records. Preferences and Release B notes have separate backups.</p>
        <div class="actions">
          <button id="activity-export">Export validated current data</button>
          <button id="activity-raw">Export untouched stored data</button>
        </div>
      </section>
      <section class="card">
        <h2>Restore</h2>
        <p>Import replaces activity records after validation and confirmation. It does not merge learners.</p>
        <label for="activity-import">Release C JSON backup</label>
        <input id="activity-import" type="file" accept=".json,application/json">
        <p id="activity-import-result" role="status"></p>
      </section>
      <section class="card">
        <h2>Reset only Release C</h2>
        <p>This does not delete Release A preferences or Release B notes and bookmarks.</p>
        <button id="activity-reset">Reset activity records</button>
      </section>
      <section class="card"><a class="button" href="./activity-checks.html">Run Release C checks</a></section>`;

    root.querySelector("#activity-export").onclick = () =>
      download(JSON.stringify(activity.get(), null, 2), "launchpad-activity.json", "application/json");

    root.querySelector("#activity-raw").onclick = () => attempt(() =>
      download(activity.raw() ?? "", "launchpad-activity-raw.txt", "text/plain")
    );

    root.querySelector("#activity-import").onchange = async event => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        if (file.size > 2_000_000) throw new Error("Maximum import size is 2 MB.");
        const candidate = validateActivity(JSON.parse(await file.text()), course);
        if (!confirm("Replace Release C activity data with this validated backup?")) return;
        activity.restore(candidate);
        dataPage();
        notify("Activity backup restored.");
      } catch (error) {
        root.querySelector("#activity-import-result").textContent = "Import rejected: " + error.message;
      }
    };

    root.querySelector("#activity-reset").onclick = () => {
      if (!confirm("Delete only Release C activity records? Export a backup first.")) return;
      attempt(() => activity.reset(), dataPage);
    };
  }

  function addTopicControls(topic) {
    const box = document.createElement("section");
    box.className = "card activity-controls";
    root.querySelector(".topic-actions").after(box);

    function draw() {
      const s = activity.get();
      const completed = Boolean(s.completed[topic.id]);
      const challenge = Boolean(s.challenges[topic.id]);

      box.innerHTML = `
        <h2>Your learning record</h2>
        <p class="small muted">Mark only work you actually did.
        These controls do not run tests or inspect checkpoint answers.</p>
        <div class="actions">
          <button id="record-topic" type="button">${completed ? "✓ Topic recorded complete — undo" : "I completed this topic"}</button>
          <button id="record-challenge" type="button">${challenge ? "✓ Challenge recorded — undo" : "I completed the challenge locally"}</button>
          <a class="button" href="#/tracker">Record actual study minutes</a>
        </div>
        ${completed ? `<p class="small">Topic recorded on ${s.completed[topic.id]}.</p>` : ""}
      `;

      box.querySelector("#record-topic").onclick = () => {
        if (completed && !confirm("Remove this topic's completion record? Notes and study minutes remain. Rebuild the planner if you want to schedule it again.")) return;
        attempt(() => activity.mark(topic.id, "completed", !completed), draw);
      };
      box.querySelector("#record-challenge").onclick = () => {
        if (challenge && !confirm("Remove this self-reported challenge record?")) return;
        attempt(() => activity.mark(topic.id, "challenges", !challenge), draw);
      };
    }

    draw();
  }

  return {
    dashboard,
    planner,
    tracker,
    achievements,
    dataPage,
    addTopicControls
  };
}