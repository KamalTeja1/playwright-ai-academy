(() => {
  "use strict";

  const C = window.COURSE;
  const P = window.Planner;
  const TASKS = P.tasks(C.lessons);
  const KEY = "launchpad-python-foundation-v1";
  const $ = selector => document.querySelector(selector);
  const main = $("#main");

  let state = P.empty();
  let storageWarning = false;
  let noticeTimer;
  let selectedWeek = P.monday(P.today());

  try {
    const saved = localStorage.getItem(KEY);
    if (saved) state = P.validateBackup(JSON.parse(saved), C.lessons);
  } catch {
    storageWarning = true;
  }

  function notify(text) {
    clearTimeout(noticeTimer);
    $("#notice").textContent = text;
    noticeTimer = setTimeout(() => { $("#notice").textContent = ""; }, 6500);
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      storageWarning = true;
      notify("Browser storage is unavailable or full. Export a backup before leaving.");
    }
  }

  function e(text) {
    return String(text).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  const paths = {
    home: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2"/>',
    map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16"/>',
    folder: '<path d="M3 7V4h7l2 3h9v13H3V7Z"/>',
    code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3m6 0h4"/>',
    tools: '<path d="m14 4 3 3 4-2a7 7 0 0 1-8 9l-7 7-3-3 7-7a7 7 0 0 1 4-7Z"/>',
    shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    star: '<path d="m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6Z"/>',
    save: '<path d="M4 3h13l3 3v15H4V3Zm3 0v7h10V3M8 21v-7h8v7"/>'
  };

  function icon(name) {
    return `<svg class="icon" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
      stroke-linejoin="round" aria-hidden="true" focusable="false">
      ${paths[name] || paths.code}</svg>`;
  }

  function expand(text) {
    const system = C.systems[state.profile?.os || "windows"];
    return String(text).replace(/\{(BOOT|RUN|LIST|LOCATION)\}/g, (_, key) => ({
      BOOT: system.boot, RUN: system.run, LIST: system.list, LOCATION: system.location
    }[key]));
  }

  function list(items, ordered = false) {
    const tag = ordered ? "ol" : "ul";
    return `<${tag}>${items.map(item => `<li>${e(expand(item))}</li>`).join("")}</${tag}>`;
  }

  function code(text) {
    return `<div class="codebox"><button type="button" data-copy>Copy text</button>
      <pre><code>${e(expand(text))}</code></pre></div>`;
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      notify("Copied.");
    } catch {
      notify("Clipboard unavailable. Select the text and copy it manually.");
    }
  }

  function download(text, filename, type = "text/plain") {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-copy]");
    if (button) copy(button.closest(".codebox").querySelector("code").textContent);
  });

  function work(lesson) {
    if (!state.work[lesson.id]) {
      state.work[lesson.id] = {
        notes: "", draft: expand(lesson.starter), evidence: "",
        checks: lesson.checks.map(() => false), answer: null
      };
    }
    return state.work[lesson.id];
  }

  function completeLesson(id) {
    return P.stages.every(stage => Boolean(state.done[`${id}:${stage.id}`]));
  }

  function nav() {
    const links = [
      ["dashboard", "home", "My dashboard"],
      ["onboarding", "tools", "My learning profile"],
      ["planner", "calendar", "Weekly planner"],
      ["roadmap", "map", "Full learning roadmap"],
      ["ai", "star", "AI Integration Academy"],
      ["backup", "save", "Backup & restore"]
    ];

    $("#navigation").innerHTML = links.map(([route, symbol, title]) =>
      `<a href="#${route}">${icon(symbol)}<span>${title}</span></a>`
    ).join("");

    const query = $("#search").value.toLowerCase().trim();
    const found = C.lessons.filter(lesson =>
      `${lesson.title} ${lesson.objective}`.toLowerCase().includes(query)
    );

    $("#lessons").innerHTML = found.length ? found.map(lesson =>
      `<a href="#lesson/${lesson.id}">
        <span class="number" aria-hidden="true">${completeLesson(lesson.id) ? "✓" : C.lessons.indexOf(lesson) + 1}</span>
        <span>${e(lesson.title)}</span>
      </a>`
    ).join("") : '<p class="muted small">No matching lessons.</p>';

    document.querySelectorAll("nav a").forEach(link => {
      if (link.getAttribute("href") === (location.hash || "#dashboard")) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function cards() {
    return `<div class="lesson-grid">${C.lessons.map(lesson => `
      <a class="lesson-card" href="#lesson/${lesson.id}">
        <div class="lesson-art">${icon(lesson.icon)}</div>
        <span class="badge ${completeLesson(lesson.id) ? "good" : ""}">
          ${completeLesson(lesson.id) ? "Checkpoint complete" : "Beginner · about 60 minutes"}
        </span>
        <h3>${e(lesson.title)}</h3><p>${e(lesson.objective)}</p>
        <strong>Open lesson →</strong>
      </a>`).join("")}</div>`;
  }

  const art = `
    <svg class="hero-art" viewBox="0 0 340 270" aria-hidden="true">
      <circle cx="170" cy="135" r="118" fill="#a996ff" opacity=".17"/>
      <rect x="27" y="47" width="271" height="175" rx="22" fill="#6546d9"/>
      <path d="M27 84h271" stroke="#bca9ff"/>
      <circle cx="49" cy="65" r="4" fill="#ffc2cf"/>
      <circle cx="64" cy="65" r="4" fill="#ffe099"/>
      <circle cx="79" cy="65" r="4" fill="#93e5ce"/>
      <path d="m94 112-23 25 23 25m119-50 23 25-23 25m-49-65-20 80"
        stroke="white" fill="none" stroke-width="8" stroke-linecap="round"/>
      <rect x="234" y="177" width="75" height="68" rx="20" fill="#bcebd9"/>
      <path d="m252 211 12 12 23-27" fill="none" stroke="#217458" stroke-width="7" stroke-linecap="round"/>
      <circle cx="291" cy="28" r="12" fill="#ffcf7b"/>
      <circle cx="25" cy="224" r="9" fill="#64cbb1"/>
    </svg>`;

  function dashboard() {
    if (!state.profile) {
      main.innerHTML = `
        <section class="hero"><div>
          <p class="eyebrow">NO TECH BACKGROUND? START HERE.</p>
          <h1>Your first step.<br><em>Not your last limit.</em></h1>
          <p>Learn the tools before the tests. Build a schedule that fits your real life.</p>
          <a class="button primary" href="#onboarding">Create my learning plan →</a>
        </div>${art}</section>
        <section class="card"><h2>What is included?</h2>
          <p>Nine complete lessons, practical checkpoints, a weekly planner, and browser-local progress.</p>
          <p>The later Python, Playwright, AI, and capstone tracks are shown as planned—not completed course material.</p>
        </section>${cards()}`;
      return;
    }

    const doneCount = TASKS.filter(task => state.done[task.id]).length;
    const next = TASKS.find(task => !state.done[task.id]);
    const overdue = TASKS.filter(task => !state.done[task.id] && state.plan[task.id] < P.today());
    const goalText = {
      personal: "Build personal confidence",
      team: "Automate team workflows",
      portfolio: "Build a portfolio"
    }[state.profile.goal];

    main.innerHTML = `
      <section class="hero"><div>
        <p class="eyebrow">YOUR PYTHON JOURNEY</p>
        <h1>Small steps.<br><em>Real capabilities.</em></h1>
        <p>${e(goalText)} · ${state.profile.minutes}-minute sessions · ${state.profile.days.length} study days per week.</p>
        <div class="actions">
          <a class="button primary" href="#lesson/${next?.lesson || state.last}">Continue learning →</a>
          <a class="button" href="#planner">View my week</a>
        </div>
      </div>${art}</section>

      <section class="metrics">
        <div class="metric"><strong>${doneCount}/${TASKS.length}</strong><span>Activity blocks completed</span></div>
        <div class="metric"><strong>${C.lessons.filter(l => completeLesson(l.id)).length}/${C.lessons.length}</strong><span>Lesson checkpoints</span></div>
        <div class="metric"><strong>${overdue.length}</strong><span>Overdue activity blocks</span></div>
      </section>

      <section class="card">
        <h2>Your next recommended activity</h2>
        ${next ? `<p>${e(next.title)}</p><p class="muted">Scheduled: ${e(P.pretty(state.plan[next.id]))}</p>` :
          '<p>You completed the foundation checkpoints. Re-run your first test and explain each tool before moving on.</p>'}
        <progress value="${doneCount}" max="${TASKS.length}" aria-label="Activity completion"></progress>
        <p class="small muted">Completion is learner-recorded. The website has not verified your local Python installation or test results.</p>
      </section>

      ${overdue.length ? `<section class="card">
        <span class="badge warning">Your plan can change</span>
        <p>Missed sessions? Move unfinished work forward from the planner. Completed work stays recorded.</p>
        <a class="button" href="#planner">Adjust my plan</a>
      </section>` : ""}

      <section class="card"><h2>Your foundation lessons</h2>${cards()}</section>`;
  }

  function onboarding() {
    const p = state.profile || {
      os: "windows", experience: "new", goal: "personal",
      start: P.today(), minutes: 60, days: [1, 2, 3, 4, 5]
    };

    const option = (value, label, current) =>
      `<option value="${value}" ${current === value ? "selected" : ""}>${label}</option>`;

    main.innerHTML = `
      <p class="eyebrow">MAKE THIS COURSE FIT YOUR LIFE</p>
      <h1>Your learning profile</h1>
      <section class="card">
        <p>No name, email, or account is required. These preferences stay in this browser.</p>
        <form id="profile-form">
          <div class="grid">
            <div>
              <label for="os">Which computer will you practice on?</label>
              <select id="os">
                ${option("windows", "Windows", p.os)}
                ${option("mac", "macOS", p.os)}
                ${option("linux", "Ubuntu 24.04 Linux", p.os)}
              </select>
              <p class="small muted">Other Linux distributions and phone-only setup are not covered by this guided installation path.</p>
            </div>
            <div>
              <label for="experience">Your experience</label>
              <select id="experience">
                ${option("new", "I have never written code", p.experience)}
                ${option("some", "I know a little coding", p.experience)}
                ${option("experienced", "I already write code", p.experience)}
              </select>
            </div>
            <div>
              <label for="goal">Your main goal</label>
              <select id="goal">
                ${option("personal", "Understand automation", p.goal)}
                ${option("team", "Automate my team's testing", p.goal)}
                ${option("portfolio", "Build a portfolio", p.goal)}
              </select>
            </div>
            <div>
              <label for="start">Start or reschedule unfinished work from</label>
              <input id="start" type="date" required min="2000-01-01" max="2100-12-31" value="${p.start}">
            </div>
            <div>
              <label for="minutes">Available time on each study day</label>
              <select id="minutes">
                ${[30, 60, 90].map(n => option(n, `${n} minutes`, p.minutes)).join("")}
              </select>
            </div>
          </div>

          <fieldset><legend>Your study days</legend><div class="days">
            ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => `
              <label class="choice"><input type="checkbox" name="day" value="${index}"
                ${p.days.includes(index) ? "checked" : ""}>${day}</label>`).join("")}
          </div></fieldset>

          <p class="small muted">
            Activities are estimated at 15 minutes each. You can take longer.
            Experience changes the guidance, not the evidence required.
            Editing this profile reschedules unfinished work; completed dates and notes are retained.
          </p>
          <button class="primary">Save my personalized plan</button>
          <p id="profile-error" role="alert"></p>
        </form>
      </section>`;

    $("#profile-form").onsubmit = event => {
      event.preventDefault();
      try {
        const p = P.profile({
          os: $("#os").value, experience: $("#experience").value, goal: $("#goal").value,
          start: $("#start").value, minutes: Number($("#minutes").value),
          days: [...document.querySelectorAll('[name="day"]:checked')].map(x => Number(x.value))
        });
        const plan = P.schedule(TASKS, p, state.done, p.start);
        state.profile = p;
        state.plan = plan;
        save();
        selectedWeek = P.monday(p.start);
        location.hash = "planner";
        notify("Your plan is ready. Start with one small activity.");
      } catch (error) {
        $("#profile-error").textContent = error.message;
      }
    };
  }

  function requireProfile() {
    if (state.profile) return true;
    main.innerHTML = `<section class="card"><h1>Choose your setup first</h1>
      <p>Your operating system determines the commands and your study days determine the planner.</p>
      <a class="button primary" href="#onboarding">Create my learning profile</a></section>`;
    return false;
  }

  function taskLink(task) {
    return `<a class="task ${state.done[task.id] ? "done" : ""}" href="#lesson/${task.lesson}">
      ${state.done[task.id] ? "✓ " : ""}${e(task.title)}
      <small>15 minutes · ${state.done[task.id] ? "learner-recorded complete" : "open lesson to work"}</small>
    </a>`;
  }

  function planner() {
    if (!requireProfile()) return;
    const today = P.today();
    const overdue = TASKS.filter(t => !state.done[t.id] && state.plan[t.id] < today);
    const pending = TASKS.filter(t => !state.done[t.id]);
    const end = pending.length ? state.plan[pending[pending.length - 1].id] : null;

    main.innerHTML = `
      <p class="eyebrow">CONSISTENCY WITHOUT GUILT</p>
      <h1>Your weekly planner</h1>
      <p class="muted">Only the nine delivered lessons are scheduled.
        ${end ? `Estimated foundation finish: ${e(P.pretty(end))}.` : "Foundation activities complete."}
        Dates are day-based, not timed appointments.</p>

      <section class="card">
        <div class="actions">
          <button id="previous-week">← Previous week</button>
          <button id="this-week">This week</button>
          <button id="next-week">Next week →</button>
          <button id="next-work">Next unfinished activity</button>
          <button id="calendar">Export calendar</button>
        </div>
        <h2 style="margin-top:20px">Week of ${e(P.pretty(selectedWeek))}</h2>
        <p class="small muted">Calendar export contains unfinished activities as all-day reminders.
        Re-import behavior depends on your calendar app; remove an older imported calendar if duplicates appear.</p>
      </section>

      <div class="week-grid">
        ${Array.from({ length: 7 }, (_, index) => {
          const day = P.add(selectedWeek, index);
          const entries = TASKS.filter(task => state.plan[task.id] === day);
          return `<section class="day ${day === today ? "today" : ""}">
            <h3>${e(P.pretty(day))}</h3>
            <p class="small muted">${entries.length * 15} planned/recorded minutes</p>
            ${entries.length ? entries.map(taskLink).join("") : '<p class="small muted">Rest, review, or free time.</p>'}
          </section>`;
        }).join("")}
      </div>

      <section class="card" style="margin-top:22px">
        <h2>Adjust the plan—not your self-worth</h2>
        <p>${overdue.length} unfinished blocks are before today.</p>
        <div class="actions">
          <button id="catch-up">Reschedule unfinished work from today</button>
          <button id="pause">Take a 7-day break, then resume</button>
          <a class="button" href="#onboarding">Change study days or session length</a>
        </div>
        <p class="small muted">These actions rebuild future activity dates in lesson order.
        They preserve completion records, drafts, quizzes, and notes.</p>
      </section>

      ${overdue.length ? `<section class="card"><h2>Unfinished earlier work</h2>
        ${overdue.map(taskLink).join("")}</section>` : ""}`;

    $("#previous-week").onclick = () => { selectedWeek = P.add(selectedWeek, -7); planner(); };
    $("#next-week").onclick = () => { selectedWeek = P.add(selectedWeek, 7); planner(); };
    $("#this-week").onclick = () => { selectedWeek = P.monday(today); planner(); };
    $("#next-work").onclick = () => {
      selectedWeek = P.monday(pending.length ? state.plan[pending[0].id] : today);
      planner();
    };
    $("#calendar").onclick = () => download(
      P.calendar(TASKS, state.plan, state.done), "launchpad-plan.ics", "text/calendar;charset=utf-8"
    );

    function replan(from, message) {
      if (!confirm(message)) return;
      const anchor = from > state.profile.start ? from : state.profile.start;
      state.plan = P.schedule(TASKS, state.profile, state.done, anchor);
      save();
      selectedWeek = P.monday(anchor);
      planner();
      notify("Unfinished work rescheduled. Completed work was preserved.");
    }

    $("#catch-up").onclick = () => replan(today, "Move all unfinished work forward from today, preserving completed records?");
    $("#pause").onclick = () => replan(P.add(today, 7), "Resume unfinished work on an allowed study day at least seven days from today?");
  }

  function lessonPage(id) {
    if (!requireProfile()) return;
    const lesson = C.lessons.find(item => item.id === id);
    if (!lesson) return notFound();

    state.last = id;
    const entry = work(lesson);
    save();

    const index = C.lessons.indexOf(lesson);
    const previous = C.lessons[index - 1];
    const next = C.lessons[index + 1];
    const system = C.systems[state.profile.os];

    main.innerHTML = `
      <p class="small muted"><a href="#dashboard">Dashboard</a> / Foundation / Lesson ${index + 1}</p>
      <span class="badge">BEGINNER · ${e(system.label)}</span>
      <h1>${e(lesson.title)}</h1>

      ${previous && !completeLesson(previous.id) ? `<section class="card">
        <span class="badge warning">Prerequisite reminder</span>
        <p>The previous checkpoint is incomplete. You can preview this lesson, but finish
        <a href="#lesson/${previous.id}">${e(previous.title)}</a> before relying on its setup.</p>
      </section>` : ""}

      <section class="card">
        <h2>Your outcome</h2><p>${e(lesson.objective)}</p>
        <p><strong>Prerequisite:</strong> ${e(lesson.prerequisite)}</p>
        <p class="small muted">${state.profile.experience === "new"
          ? "New to technology? Read each step before performing it. Stop at errors rather than copying the next command."
          : "Already familiar? You may review quickly, but still verify the checkpoint evidence."}</p>
      </section>

      <section class="card">
        <h2>The idea in plain English</h2><p>${e(lesson.explanation)}</p>
        <h3>New words</h3>${list(lesson.vocabulary)}
        ${lesson.diagram ? `<div class="flow">${lesson.diagram.map(x => `<span>${e(x)}</span>`).join('<b aria-hidden="true">→</b>')}</div>` : ""}
      </section>

      <section class="card">
        <h2>Follow along</h2>${list(lesson.steps, true)}
        ${lesson.osSteps ? `<h3>${e(system.label)} instructions</h3>${list(lesson.osSteps[state.profile.os], true)}` : ""}
        <h3>Example / commands</h3>${code(lesson.example)}
        <p class="small muted">Copy code into the file when instructed; commands go in the terminal.
        Run one command at a time. Do not paste every block indiscriminately.</p>
      </section>

      <section class="card">
        <h2>Your independent exercise</h2><p>${e(lesson.exercise)}</p>
        <label for="draft">Your draft or response</label>
        <textarea id="draft" class="editor" maxlength="20000" spellcheck="false"></textarea>
        <div class="actions">
          <button id="copy-draft">Copy draft</button>
          <button id="download-draft">Download draft</button>
          <button id="compare">Compare sample text</button>
        </div>
        <p id="comparison" role="status"></p>
        <p class="small muted">This editor does not execute code. Text comparison is not a test result.</p>
        ${lesson.hints.map((hint, i) => `<details><summary>Hint ${i + 1}</summary><p>${e(expand(hint))}</p></details>`).join("")}
        <details id="solution"><summary>Reveal reference solution</summary>${code(lesson.solution)}</details>
      </section>

      <section class="card">
        <h2>What should happen?</h2><p>${e(lesson.expected)}</p>
        <h3>If something goes wrong</h3>${list(lesson.mistakes)}
        <h3>Stretch challenge</h3><p>${e(lesson.challenge)}</p>
      </section>

      <section class="card">
        <h2>Knowledge checkpoint</h2>
        <form id="quiz"><fieldset><legend>${e(lesson.quiz.question)}</legend>
          ${lesson.quiz.options.map((option, i) => `
            <label class="choice"><input type="radio" name="answer" value="${i}" required
              ${entry.answer === i ? "checked" : ""}>${e(option)}</label>`).join("")}
        </fieldset><button class="primary">Check answer</button>
        <p id="quiz-result" role="status"></p></form>
      </section>

      <section class="card">
        <h2>Evidence, not just a checkbox</h2>
        <p class="small muted">Record your actual result. Do not include usernames, private paths, keys, or personal information.</p>
        ${lesson.checks.map((check, i) => `<label class="choice">
          <input type="checkbox" data-evidence-check="${i}" ${entry.checks[i] ? "checked" : ""}>
          ${e(check)}</label>`).join("")}
        <label for="evidence">What did you observe or produce?</label>
        <textarea id="evidence" rows="4" maxlength="20000"></textarea>
        <label for="notes">Personal learning notes</label>
        <textarea id="notes" rows="4" maxlength="20000"></textarea>
      </section>

      <section class="card">
        <h2>Your four activity blocks</h2>
        <p class="small muted">Complete these in order. The final block requires the correct quiz answer,
        all evidence checks, and a written observation. Local execution remains self-reported.</p>
        ${P.stages.map(stage => {
          const done = state.done[`${id}:${stage.id}`];
          return `<div class="stage"><span>${e(stage.title)} · 15-minute estimate</span>
            <button data-stage="${stage.id}" ${done ? "disabled" : ""}>${done ? "✓ Recorded complete" : "Mark this activity complete"}</button></div>`;
        }).join("")}
        <button id="reopen" style="margin-top:15px">Reopen this lesson's progress</button>
      </section>

      <section class="card"><h2>Official references</h2>
        <ul>${lesson.docs.map(url => `<li><a href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(url)}</a></li>`).join("")}</ul>
      </section>

      <div class="actions">
        ${previous ? `<a class="button" href="#lesson/${previous.id}">← Previous lesson</a>` : ""}
        <a class="button" href="#planner">My planner</a>
        ${next ? `<a class="button primary" href="#lesson/${next.id}">Next lesson →</a>` : '<a class="button primary" href="#roadmap">See the full roadmap</a>'}
      </div>`;

    for (const field of ["draft", "evidence", "notes"]) {
      $("#" + field).value = entry[field];
      $("#" + field).oninput = event => {
        entry[field] = event.target.value;
        save();
      };
    }

    document.querySelectorAll("[data-evidence-check]").forEach(input => {
      input.onchange = () => {
        entry.checks[Number(input.dataset.evidenceCheck)] = input.checked;
        save();
      };
    });

    $("#copy-draft").onclick = () => copy(entry.draft);
    $("#download-draft").onclick = () => download(
      entry.draft,
      id === "first-test" ? "test_first.py" : id === "hello" ? "hello.py" : `${id}-notes.txt`
    );
    $("#compare").onclick = () => {
      $("#solution").open = true;
      $("#comparison").textContent = entry.draft.trim() === expand(lesson.solution).trim()
        ? "Text matches the reference. It has not been executed."
        : "Text differs. Compare the reference below; different answers may still be valid.";
    };

    function quizFeedback() {
      if (entry.answer === null) return;
      $("#quiz-result").textContent =
        (entry.answer === lesson.quiz.answer ? "Correct. " : "Not quite. ") + lesson.quiz.why;
    }
    quizFeedback();
    $("#quiz").onsubmit = event => {
      event.preventDefault();
      entry.answer = Number(new FormData(event.currentTarget).get("answer"));
      save();
      quizFeedback();
    };

    document.querySelectorAll("[data-stage]").forEach(button => {
      button.onclick = () => {
        const stage = button.dataset.stage;
        const position = P.stages.findIndex(s => s.id === stage);
        if (P.stages.slice(0, position).some(s => !state.done[`${id}:${s.id}`])) {
          notify("Complete the earlier activity blocks first.");
          return;
        }
        if (stage === "check" &&
            (entry.answer !== lesson.quiz.answer ||
             !lesson.checks.every((_, i) => entry.checks[i]) ||
             !entry.evidence.trim())) {
          notify("First pass the quiz, complete the evidence checks, and write your actual observation.");
          return;
        }

        const taskId = `${id}:${stage}`;
        state.done[taskId] = P.today();
        state.plan[taskId] = P.today();
        save();
        button.disabled = true;
        button.textContent = "✓ Recorded complete";
        nav();
        notify("Activity recorded. This is your learning record, not an automated verification.");
      };
    });

    $("#reopen").onclick = () => {
      if (!confirm("Reopen all four activities for this lesson? Notes and quiz answers will remain.")) return;
      P.stages.forEach(stage => delete state.done[`${id}:${stage.id}`]);
      const anchor = state.profile.start > P.today() ? state.profile.start : P.today();
      state.plan = P.schedule(TASKS, state.profile, state.done, anchor);
      save();
      lessonPage(id);
      nav();
    };
  }

  function roadmap() {
    main.innerHTML = `
      <p class="eyebrow">THE LONG-TERM JOURNEY</p><h1>From first folder to framework</h1>
      <section class="card"><p>The proposed long-term program is roughly 24 weeks at five
      one-hour sessions per week, but that is a planning estimate—not a promise of expertise.</p>
      <p>Your working planner currently schedules only this delivered foundation package.</p></section>
      ${C.roadmap.map(([title, status], i) => `<section class="card roadmap">
        <span class="badge">${e(status)}</span><h2>${i + 1}. ${e(title)}</h2>
      </section>`).join("")}`;
  }

  function ai() {
    main.innerHTML = `
      <p class="eyebrow">A SEPARATE LEARNING TRACK</p><h1>AI Integration Academy</h1>
      <section class="card">
        <span class="badge warning">INTRODUCTION ONLY · NO LIVE PROVIDER</span>
        <h2>Start with safe assistance</h2>
        <p>Use AI to explain terminology, ask for smaller steps, or review a sanitized draft.
        Do not paste credentials, private company code, personal information, or unredacted logs.</p>
        <p>Ask for evidence and uncertainty. Check suggested APIs against official documentation.
        Run tests yourself. A generated explanation is not proof of execution.</p>
        <h3>Try this prompt in an approved tool</h3>
        ${code("I am learning Python with no technical background.\nExplain the difference between an editor, terminal, and interpreter.\nUse a simple example, ask me one understanding question, and do not assume I installed anything.")}
      </section>
      <div class="grid">
        <section class="card"><h2>Track A: Use AI critically</h2>
          <p>Planned: scenario design, code review, hallucinated APIs, weak assertions, and safe failure investigation.</p></section>
        <section class="card"><h2>Track B: Assisted automation</h2>
          <p>Planned: supervised editor workflows, browser evidence, and reviewing proposed test repairs.</p></section>
        <section class="card"><h2>Track C: Build a real tutor</h2>
          <p>Planned: a Python backend, provider credentials on the server, request validation, usage limits,
          error handling, and tests. No frontend API keys.</p></section>
      </div>`;
  }

  function backup() {
    main.innerHTML = `
      <h1>Your learning data</h1>
      <section class="card">
        <h2>Export a backup</h2>
        <p>Download your profile, dates, notes, drafts, quizzes, and completion records.
        Treat the file as personal data. No server receives it.</p>
        <button id="export" class="primary">Download JSON backup</button>
      </section>
      <section class="card">
        <h2>Restore on this browser</h2>
        <p>Importing replaces the current learning record after validation and confirmation.
        It does not merge two learners' records.</p>
        <label for="import">Choose a Launchpad JSON backup</label>
        <input type="file" id="import" accept=".json,application/json">
        <p id="import-result" role="status"></p>
      </section>
      <section class="card">
        <h2>Implementation checks</h2>
        <p>Run the included scheduler checks in a separate page. These test planner logic,
        not the learner's Python installation or the complete website UI.</p>
        <a class="button" href="./checks.html">Open planner checks</a>
      </section>`;

    $("#export").onclick = () => download(
      JSON.stringify(state, null, 2), `launchpad-backup-${P.today()}.json`, "application/json"
    );

    $("#import").onchange = async event => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        if (file.size > 2_000_000) throw new Error("Backup exceeds the 2 MB limit.");
        const restored = P.validateBackup(JSON.parse(await file.text()), C.lessons);
        if (!confirm("Replace this browser's learning record with the validated backup? Export your current record first if needed.")) return;
        state = restored;
        save();
        applyTheme();
        nav();
        $("#import-result").textContent = "Backup restored. Open the dashboard or planner.";
      } catch (error) {
        $("#import-result").textContent = `Import rejected: ${error.message}`;
      }
    };
  }

  function notFound() {
    main.innerHTML = `<section class="card"><h1>Page not found</h1><a href="#dashboard">Return to dashboard</a></section>`;
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    $("#theme").textContent = state.theme === "dark" ? "Light mode" : "Dark mode";
  }

  function render() {
    const route = location.hash.slice(1) || "dashboard";
    if (route.startsWith("lesson/")) lessonPage(route.slice(7));
    else {
      const pages = { dashboard, onboarding, planner, roadmap, ai, backup };
      if (Object.prototype.hasOwnProperty.call(pages, route)) pages[route]();
      else notFound();
    }
    nav();
    document.title = `${main.querySelector("h1")?.textContent || "Learn"} | Launchpad`;
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  $("#theme").onclick = () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    applyTheme();
    save();
  };
  $("#menu").onclick = () => {
    const hidden = $("#layout").classList.toggle("collapsed");
    $("#menu").setAttribute("aria-expanded", String(!hidden));
  };
  $("#search").oninput = nav;
  $("#sidebar").onclick = event => {
    if (event.target.closest("a") && matchMedia("(max-width:760px)").matches) {
      $("#layout").classList.add("collapsed");
      $("#menu").setAttribute("aria-expanded", "false");
    }
  };
  $(".skip").onclick = event => {
    event.preventDefault();
    main.focus();
    main.scrollIntoView();
  };

  if (matchMedia("(max-width:760px)").matches) {
    $("#layout").classList.add("collapsed");
    $("#menu").setAttribute("aria-expanded", "false");
  }

  window.addEventListener("hashchange", render);
  applyTheme();
  render();
  if (storageWarning) notify("Saved data could not be loaded. Restore a backup if available.");
})();