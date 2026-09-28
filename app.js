(() => {
  "use strict";

  const C = window.COURSE;
  const P = window.Planner;
  const ALL = P.tasks(C.lessons);
  const KEY = "launchpad-python-course-v2";
  const OLD = "launchpad-python-foundation-v1";
  const $ = selector => document.querySelector(selector);
  const main = $("#main");
  let state = P.empty();
  let storageLocked = false;
  let startupMessage = "";
  let week = P.monday(P.today());
  let timer;

  try {
    const current = localStorage.getItem(KEY);
    const legacy = localStorage.getItem(OLD);
    if (current) state = P.validate(JSON.parse(current), C.lessons);
    else if (legacy) {
      state = P.migrate(JSON.parse(legacy), C.lessons);
      localStorage.setItem(KEY, JSON.stringify(state));
      startupMessage = "Foundation records migrated. Old notes remain; new MCQs require a new attempt. The original backup key was preserved.";
    }
  } catch (error) {
    storageLocked = true;
    startupMessage = "Saved data could not be safely loaded. Nothing was overwritten. Use Backup & restore. " + error.message;
  }

  function notify(message) {
    clearTimeout(timer);
    $("#notice").textContent = message;
    timer = setTimeout(() => { $("#notice").textContent = ""; }, 7000);
  }

  function save() {
    if (storageLocked) {
      notify("Changes are session-only until you restore a valid backup or explicitly replace unreadable data.");
      return;
    }
    try { localStorage.setItem(KEY, JSON.stringify(state)); }
    catch { notify("Storage unavailable or full. Export a backup before leaving."); }
  }

  function e(value) {
    return String(value).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  function expand(value) {
    const s = C.systems[state.profile?.os || "windows"];
    return String(value).replace(/\{(RUN|BOOT|LIST|LOCATION)\}/g, (_, k) => ({
      RUN: s.run, BOOT: s.boot, LIST: s.list, LOCATION: s.location
    }[k]));
  }

  function list(values, ordered = false) {
    const tag = ordered ? "ol" : "ul";
    return `<${tag}>${values.map(x => `<li>${e(expand(x))}</li>`).join("")}</${tag}>`;
  }

  function code(value) {
    return `<div class="codebox"><button type="button" data-copy>Copy</button>
      <pre><code>${e(expand(value))}</code></pre></div>`;
  }

  async function copy(value) {
    try { await navigator.clipboard.writeText(value); notify("Copied."); }
    catch { notify("Clipboard unavailable. Select and copy manually."); }
  }

  function download(value, filename, type = "text/plain;charset=utf-8") {
    const url = URL.createObjectURL(new Blob([value], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  document.addEventListener("click", event => {
    const b = event.target.closest("[data-copy]");
    if (b) copy(b.closest(".codebox").querySelector("code").textContent);
  });

  function work(lesson) {
    if (!state.work[lesson.id]) state.work[lesson.id] = {
      notes: "", draft: "", legacyEvidence: "", legacyAnswer: null, attempts: []
    };
    return state.work[lesson.id];
  }

  function best(lesson) {
    return Math.max(0, ...work(lesson).attempts.map(a => P.score(lesson, a.answers)));
  }

  function complete(id) {
    return ALL.filter(t => t.lesson === id).every(t => Boolean(state.done[t.id]));
  }

  function icon() {
    return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m8 5-6 7 6 7m8-14 6 7-6 7m-3-17-2 20"/></svg>';
  }

  function nav() {
    const links = [
      ["dashboard", "Dashboard"], ["onboarding", "Learning profile"],
      ["planner", "Weekly planner"], ["reporting", "Reporting academy"],
      ["roadmap", "Course modules"], ["ai", "AI integration"],
      ["backup", "Backup & restore"]
    ];
    $("#navigation").innerHTML = links.map(([route, title]) =>
      `<a href="#${route}">${icon()}<span>${title}</span></a>`
    ).join("");

    const query = $("#search").value.toLowerCase().trim();
    $("#lessons").innerHTML = C.lessons.filter(l =>
      `${l.title} ${l.module} ${l.objective}`.toLowerCase().includes(query)
    ).map(l => `<a href="#lesson/${l.id}">
      <span class="number">${complete(l.id) ? "✓" : C.lessons.indexOf(l) + 1}</span>
      <span>${e(l.title)}</span></a>`).join("") || "<p>No matching lessons.</p>";

    document.querySelectorAll("nav a").forEach(a => {
      if (a.getAttribute("href") === (location.hash || "#dashboard")) {
        a.setAttribute("aria-current", "page");
      }
    });
  }

  function cards(lessons) {
    return `<div class="lesson-grid">${lessons.map(l => `
      <a class="lesson-card" href="#lesson/${l.id}">
        <div class="lesson-art">${icon()}</div>
        <span class="badge">${e(l.level)} · ${l.duration.reduce((a, b) => a + b, 0)} min estimate</span>
        <h3>${e(l.title)}</h3><p>${e(l.objective)}</p>
        <p class="small">MCQs: ${l.quiz.length} · best score ${best(l)}%</p>
        <strong>Open lesson →</strong>
      </a>`).join("")}</div>`;
  }

  function requireProfile() {
    if (state.profile) return true;
    main.innerHTML = `<section class="card"><h1>Choose your learning setup</h1>
      <p>Your operating system controls the commands and your availability controls the schedule.</p>
      <a class="button primary" href="#onboarding">Create my plan</a></section>`;
    return false;
  }

  function dashboard() {
    const next = ALL.find(t => !state.done[t.id]);
    const doneMinutes = ALL.filter(t => state.done[t.id]).length * 15;
    main.innerHTML = `
      <section class="hero"><div>
        <p class="eyebrow">PYTHON · PLAYWRIGHT · REPORTING</p>
        <h1>Learn the behavior.<br><em>Prove the result.</em></h1>
        <p>${C.lessons.length} available lessons. MCQ-only quizzes.
        Practice is separate from knowledge scores.</p>
        <div class="actions">
          <a class="button primary" href="${state.profile ? "#lesson/" + (next?.lesson || state.last) : "#onboarding"}">
            ${state.profile ? "Continue learning" : "Create my plan"} →</a>
          <a class="button" href="#reporting">Reporting lessons</a>
        </div>
      </div></section>
      <section class="metrics">
        <div class="metric"><strong>${C.lessons.length}</strong><span>Available lessons</span></div>
        <div class="metric"><strong>${C.lessons.filter(l => best(l) >= C.passPercent).length}</strong><span>MCQ assessments passed</span></div>
        <div class="metric"><strong>${doneMinutes}</strong><span>Estimated activity minutes recorded</span></div>
      </section>
      ${state.profile ? `<section class="card"><h2>Next scheduled activity</h2>
        <p>${next ? e(next.title) : "All delivered activities are recorded."}</p>
        ${next ? `<p>${e(P.pretty(state.plan[next.id]))}</p>` : ""}
        <a class="button" href="#planner">Open weekly planner</a>
        <p class="small muted">Recorded minutes are estimates, not a timer or proof of test execution.</p>
      </section>` : ""}
      <section class="card"><h2>Available course material</h2>${cards(C.lessons)}</section>`;
  }

  function onboarding() {
    const p = state.profile || {
      os: "windows", start: P.today(), minutes: 60,
      days: [1, 2, 3, 4, 5], experience: "new", goal: "personal"
    };
    const option = (value, title, current) =>
      `<option value="${value}" ${current === value ? "selected" : ""}>${title}</option>`;

    main.innerHTML = `<h1>Your personalized weekly plan</h1>
      <section class="card"><form id="profile">
        <div class="grid">
          <div><label for="os">Practice computer</label><select id="os">
            ${option("windows", "Windows", p.os)}
            ${option("mac", "macOS", p.os)}
            ${option("linux", "Ubuntu 24.04 guided path", p.os)}
          </select></div>
          <div><label for="start">Schedule unfinished work from</label>
            <input id="start" type="date" required value="${p.start}" min="2000-01-01" max="2100-12-01"></div>
          <div><label for="minutes">Minutes per study day</label><select id="minutes">
            ${[30, 60, 90].map(n => option(n, String(n), p.minutes)).join("")}
          </select></div>
          <div><label for="experience">Experience</label><select id="experience">
            ${option("new", "No coding background", p.experience)}
            ${option("some", "Some coding", p.experience)}
            ${option("experienced", "Experienced programmer", p.experience)}
          </select></div>
        </div>
        <fieldset><legend>Study days</legend><div class="days">
          ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) =>
            `<label class="choice"><input type="checkbox" name="day" value="${i}" ${p.days.includes(i) ? "checked" : ""}>${day}</label>`
          ).join("")}
        </div></fieldset>
        <p>Lessons have different estimates. Activities longer than 15 minutes are split into study blocks.
        Completed work remains recorded when your schedule changes.</p>
        <button class="primary">Save plan</button><p id="profile-error" role="alert"></p>
      </form></section>`;

    $("#profile").onsubmit = event => {
      event.preventDefault();
      try {
        const settings = P.profile({
          os: $("#os").value, start: $("#start").value,
          minutes: Number($("#minutes").value),
          experience: $("#experience").value, goal: p.goal,
          days: [...document.querySelectorAll('[name="day"]:checked')].map(x => Number(x.value))
        });
        const plan = P.schedule(ALL, settings, state.done, settings.start);
        state.profile = settings;
        state.plan = plan;
        save();
        week = P.monday(settings.start);
        location.hash = "planner";
      } catch (error) { $("#profile-error").textContent = error.message; }
    };
  }

  function planner() {
    if (!requireProfile()) return;
    const pending = ALL.filter(t => !state.done[t.id]);
    const overdue = pending.filter(t => state.plan[t.id] < P.today());
    main.innerHTML = `<h1>Your weekly planner</h1>
      <section class="card">
        <p>Only delivered lessons are scheduled. Reviews and reporting practice are included.</p>
        <p>${pending.length * 15} estimated minutes remain.
          ${pending.length ? "Estimated finish: " + e(P.pretty(state.plan[pending.at(-1).id])) : ""}
        </p>
        <div class="actions">
          <button id="prev">← Previous</button><button id="today">This week</button>
          <button id="next">Next →</button><button id="jump">Next activity</button>
          <button id="ics">Export calendar</button>
        </div>
        <h2 style="margin-top:20px">Week of ${e(P.pretty(week))}</h2>
      </section>
      <div class="week-grid">
        ${Array.from({ length: 7 }, (_, i) => {
          const day = P.add(week, i);
          const tasks = ALL.filter(t => state.plan[t.id] === day);
          return `<section class="day ${day === P.today() ? "today" : ""}">
            <h3>${e(P.pretty(day))}</h3><p>${tasks.length * 15} estimated minutes</p>
            ${tasks.map(t => `<a class="task ${state.done[t.id] ? "done" : ""}" href="#lesson/${t.lesson}">
              ${state.done[t.id] ? "✓ " : ""}${e(t.title)}</a>`).join("") || "<p class='muted'>Rest or optional revision.</p>"}
          </section>`;
        }).join("")}
      </div>
      <section class="card" style="margin-top:22px">
        <h2>Adjust your schedule</h2><p>${overdue.length} unfinished blocks are overdue.</p>
        <div class="actions"><button id="catchup">Move unfinished work forward</button>
          <button id="pause">Resume after a 7-day break</button>
          <a class="button" href="#onboarding">Change availability</a></div>
        <p class="small muted">Calendar exports are all-day reminders, not automatic synchronization.
        Remove older imported calendars if your calendar app creates duplicates.</p>
      </section>`;

    $("#prev").onclick = () => { week = P.add(week, -7); planner(); };
    $("#next").onclick = () => { week = P.add(week, 7); planner(); };
    $("#today").onclick = () => { week = P.monday(P.today()); planner(); };
    $("#jump").onclick = () => {
      week = P.monday(pending.length ? state.plan[pending[0].id] : P.today());
      planner();
    };
    $("#ics").onclick = () => download(P.calendar(ALL, state.plan, state.done), "launchpad.ics", "text/calendar");

    function replan(from) {
      if (!confirm("Reschedule unfinished work while preserving completed records?")) return;
      try {
        const anchor = from > state.profile.start ? from : state.profile.start;
        const plan = P.schedule(ALL, state.profile, state.done, anchor);
        state.plan = plan;
        save();
        week = P.monday(anchor);
        planner();
      } catch (error) { notify(error.message); }
    }
    $("#catchup").onclick = () => replan(P.today());
    $("#pause").onclick = () => replan(P.add(P.today(), 7));
  }

  function lessonPage(id) {
    if (!requireProfile()) return;
    const l = C.lessons.find(x => x.id === id);
    if (!l) return missing();
    const w = work(l);
    state.last = id;
    save();

    const blocks = ALL.filter(t => t.lesson === id);
    const previous = C.lessons[C.lessons.indexOf(l) - 1];
    const next = C.lessons[C.lessons.indexOf(l) + 1];
    const lastAttempt = w.attempts.at(-1);
    const unmet = (l.requires || []).map(x => C.lessons.find(y => y.id === x))
      .filter(x => x && !complete(x.id));

    main.innerHTML = `
      <p class="small muted"><a href="#dashboard">Dashboard</a> / ${e(l.module)}</p>
      <span class="badge">${e(l.level)} · ${l.duration.reduce((a, b) => a + b, 0)} minute estimate</span>
      <h1>${e(l.title)}</h1>
      ${unmet.length ? `<section class="card"><span class="badge warning">Prerequisite reminder</span>
        <p>Review these first if unfamiliar:</p>
        ${unmet.map(x => `<p><a href="#lesson/${x.id}">${e(x.title)}</a></p>`).join("")}
      </section>` : ""}
      <section class="card"><h2>What you will be able to do</h2><p>${e(l.objective)}</p></section>

      ${l.sections.map(s => `<section class="card"><h2>${e(s.title)}</h2>
        ${s.text.split("\n\n").map(p => `<p>${e(expand(p))}</p>`).join("")}</section>`).join("")}

      <section class="card"><h2>Follow the walkthrough</h2>${list(l.steps, true)}
        ${l.osSteps ? `<h3>${e(C.systems[state.profile.os].label)} instructions</h3>${list(l.osSteps[state.profile.os], true)}` : ""}
        ${l.files.map((file, i) => `<h3>${e(file.name)}</h3>${code(file.code)}
          <button type="button" data-file="${i}">Download ${e(file.name.split("/").at(-1))}</button>`).join("")}
        ${l.commands.length ? `<h3>Run in your project terminal</h3>${l.commands.map(code).join("")}` : ""}
        ${l.extraCommands ? `<h3>Additional commands — read the walkthrough first</h3>${l.extraCommands.map(code).join("")}` : ""}
        <p class="small muted">Downloads contain file contents only. Place them at the stated project path.
        Run commands one at a time. Nothing is executed by this website.</p>
      </section>

      <section class="card"><h2>Independent practice</h2><p>${e(l.exercise)}</p>
        <label for="draft">Optional exercise workspace</label>
        <textarea id="draft" class="editor" maxlength="30000" spellcheck="false"></textarea>
        <div class="actions"><button id="copy-draft">Copy draft</button>
          <button id="download-draft">Download draft</button></div>
        ${l.hints.map((hint, i) => `<details><summary>Hint ${i + 1}</summary><p>${e(expand(hint))}</p></details>`).join("")}
        <details><summary>Reference solution and reasoning</summary>
          ${code(l.solution)}<p>Compare this with the stated expected behavior. A matching draft is not execution evidence.</p>
        </details>
      </section>

      <section class="card"><h2>Expected result</h2><p>${e(l.expected)}</p>
        <h3>Troubleshooting</h3>${list(l.mistakes)}
        <h3>Optional challenge</h3><p>${e(l.challenge)}</p>
      </section>

      <section class="card"><h2>MCQ assessment</h2>
        <p>Choose exactly one answer per question. Pass mark: ${C.passPercent}%.
        Best score: <strong id="best">${best(l)}%</strong>. Attempts: <span id="attempt-count">${w.attempts.length}</span>.</p>
        <form id="quiz">
          ${l.quiz.map((q, i) => `<fieldset><legend>${i + 1}. ${e(q.text)}</legend>
            ${q.options.map((option, j) => `<label class="choice">
              <input type="radio" name="q${i}" value="${j}" required>
              <span>${e(option)}</span></label>`).join("")}
          </fieldset>`).join("")}
          <button class="primary">Submit MCQs</button>
        </form>
        <p id="quiz-result" role="status"></p><div id="feedback"></div>
      </section>

      <section class="card"><h2>Optional personal notes</h2>
        <p class="small muted">Not required for quiz completion. Do not save secrets or personal data.</p>
        <label for="notes">Notes</label><textarea id="notes" rows="4" maxlength="30000"></textarea>
        ${w.legacyEvidence ? `<details><summary>Preserved foundation observation</summary><p>${e(w.legacyEvidence)}</p></details>` : ""}
      </section>

      <section class="card"><h2>Record activity progress</h2>
        <p>Study blocks are 15-minute estimates, not a timer. Practical completion is self-reported.
        MCQ completion is recorded automatically after a passing attempt.</p>
        ${blocks.map(t => `<div class="stage"><span>${e(P.stages.find(s => s.id === t.stage).title)} — block ${t.part}</span>
          <button data-task="${t.id}" ${state.done[t.id] || t.stage === "quiz" ? "disabled" : ""}>
            ${state.done[t.id] ? "✓ Recorded" : t.stage === "quiz" ? "Pass MCQs above" : "Mark block complete"}
          </button></div>`).join("")}
      </section>

      <section class="card"><h2>Official references</h2>
        ${l.docs.map(url => `<p><a href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(url)}</a></p>`).join("")}
      </section>
      <div class="actions">
        ${previous ? `<a class="button" href="#lesson/${previous.id}">← Previous lesson</a>` : ""}
        <a class="button" href="#planner">Weekly planner</a>
        ${next ? `<a class="button primary" href="#lesson/${next.id}">Next lesson →</a>` : ""}
      </div>`;

    $("#draft").value = w.draft || expand(l.starter);
    $("#notes").value = w.notes;
    $("#draft").oninput = event => { w.draft = event.target.value; save(); };
    $("#notes").oninput = event => { w.notes = event.target.value; save(); };
    $("#copy-draft").onclick = () => copy($("#draft").value);
    $("#download-draft").onclick = () => download(
      $("#draft").value, (l.solutionFile || "exercise.txt").split("/").at(-1)
    );
    document.querySelectorAll("[data-file]").forEach(button => {
      button.onclick = () => {
        const file = l.files[Number(button.dataset.file)];
        download(expand(file.code), file.name.split("/").at(-1));
      };
    });

    function feedback(attempt) {
      if (!attempt) return;
      const percent = P.score(l, attempt.answers);
      $("#quiz-result").textContent = `Attempt ${attempt.date}: ${percent}%. ${percent >= C.passPercent ? "Passed." : "Review the explanations and try again."}`;
      $("#feedback").innerHTML = l.quiz.map((q, i) => `
        <details open><summary>Question ${i + 1}: ${attempt.answers[i] === q.answer ? "Correct" : "Review needed"}</summary>
          <p>Your answer: ${e(q.options[attempt.answers[i]])}</p>
          ${q.options.map((option, j) => `<p><strong>${j === q.answer ? "✓ Correct answer: " : ""}${e(option)}</strong><br>${e(q.explanations[j])}</p>`).join("")}
        </details>`).join("");
    }
    feedback(lastAttempt);

    $("#quiz").onsubmit = event => {
      event.preventDefault();
      if (w.attempts.length >= 1000) return notify("Quiz attempt limit reached; export your records before further changes.");
      const form = new FormData(event.currentTarget);
      const answers = l.quiz.map((_, i) => Number(form.get("q" + i)));
      const attempt = { date: P.today(), answers };
      w.attempts.push(attempt);

      if (P.score(l, answers) >= C.passPercent) {
        blocks.filter(t => t.stage === "quiz").forEach(t => {
          if (!state.done[t.id]) {
            state.done[t.id] = P.today();
            state.plan[t.id] = P.today();
          }
        });
      }
      save();
      $("#best").textContent = best(l) + "%";
      $("#attempt-count").textContent = w.attempts.length;
      feedback(attempt);
      updateButtons();
      nav();
    };

    function updateButtons() {
      document.querySelectorAll("[data-task]").forEach(button => {
        if (state.done[button.dataset.task]) {
          button.disabled = true;
          button.textContent = "✓ Recorded";
        }
      });
    }

    document.querySelectorAll("[data-task]").forEach(button => {
      button.onclick = () => {
        const t = blocks.find(x => x.id === button.dataset.task);
        if (!t || t.stage === "quiz") return;
        if (t.stage === "review" && best(l) < C.passPercent) {
          return notify("Pass the lesson MCQs before recording the final review.");
        }
        state.done[t.id] = P.today();
        state.plan[t.id] = P.today();
        save();
        updateButtons();
        nav();
      };
    });
  }

  function reporting() {
    main.innerHTML = `<p class="eyebrow">RESULTS YOU CAN EXPLAIN</p><h1>Reporting academy</h1>
      <section class="card"><p>Start with the mixed-result lab, then generate XML, HTML,
      browser artifacts, and Allure raw results. Actual execution remains local.</p>
      <p>The Allure CLI is a separate optional installation. CI publishing and automatic
      framework-wide attachment hooks are not included in this release.</p></section>
      ${cards(C.lessons.filter(l => l.module.startsWith("06")))}`;
  }

  function roadmap() {
    const modules = [...new Set(C.lessons.map(l => l.module))];
    main.innerHTML = `<h1>Delivered course modules</h1>
      ${modules.map(module => `<section class="card"><h2>${e(module)}</h2>
        ${cards(C.lessons.filter(l => l.module === module))}</section>`).join("")}
      <section class="card"><h2>Still to be authored</h2>
        ${list(C.roadmap.map(([name, status]) => `${name}: ${status}`))}
        <p>There are no scheduled placeholder lessons.</p></section>`;
  }

  function ai() {
    main.innerHTML = `<h1>AI Integration Academy</h1><section class="card">
      <span class="badge warning">Full track not delivered · no live provider</span>
      <p>Use an approved AI tool to explain sanitized examples, but review every generated API and assertion.
      Do not submit credentials, personal data, or proprietary code.</p>
      ${code("Review this Python Playwright test. Explain exactly what each assertion proves. Flag uncertain APIs. Do not claim to have run it. Give hints before a solution.")}
      <p>The reporting and browser examples in this release do not call an AI provider.
      A live tutor needs a separate protected backend.</p>
    </section>`;
  }

  function backup() {
    main.innerHTML = `<h1>Backup, restore, and verification</h1>
      <section class="card"><h2>Export current records</h2><button id="export">Download course backup</button>
        <p>Contains your schedule, notes, drafts, and quiz attempts. Treat it as personal information.</p></section>
      <section class="card"><h2>Restore a backup</h2>
        <label for="import">Foundation-v1 or course-v2 JSON</label><input id="import" type="file" accept=".json,application/json">
        <p id="import-result" role="status"></p></section>
      ${storageLocked ? `<section class="card"><h2>Unreadable stored record</h2>
        <p>Automatic writing is disabled to protect the existing record.</p>
        <button id="raw">Download untouched stored data</button>
        <button id="replace">Explicitly replace it with this session</button></section>` : ""}
      <section class="card"><a class="button" href="./checks.html">Run verification checks</a></section>`;

    $("#export").onclick = () => download(JSON.stringify(state, null, 2), "launchpad-course-backup.json", "application/json");
    $("#import").onchange = async event => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        if (file.size > 2_000_000) throw new Error("Maximum backup size is 2 MB.");
        const restored = P.restore(JSON.parse(await file.text()), C.lessons);
        if (!confirm("Replace current course records with this validated backup?")) return;
        state = restored;
        storageLocked = false;
        save();
        theme();
        nav();
        $("#import-result").textContent = "Restored. Open the dashboard.";
      } catch (error) { $("#import-result").textContent = "Import rejected: " + error.message; }
    };
    if ($("#raw")) $("#raw").onclick = () => {
      try { download(localStorage.getItem(KEY) || localStorage.getItem(OLD) || "", "untouched-storage.txt"); }
      catch { notify("The browser blocked storage access."); }
    };
    if ($("#replace")) $("#replace").onclick = () => {
      if (!confirm("Replace the unreadable course-v2 record with this session? Export the raw record first.")) return;
      storageLocked = false;
      save();
      backup();
    };
  }

  function missing() {
    main.innerHTML = '<h1>Page not found</h1><a href="#dashboard">Dashboard</a>';
  }

  function theme() {
    document.documentElement.dataset.theme = state.theme;
    $("#theme").textContent = state.theme === "dark" ? "Light mode" : "Dark mode";
  }

  function render() {
    const route = location.hash.slice(1) || "dashboard";
    if (route.startsWith("lesson/")) lessonPage(route.slice(7));
    else {
      const pages = { dashboard, onboarding, planner, reporting, roadmap, ai, backup };
      if (Object.prototype.hasOwnProperty.call(pages, route)) pages[route]();
      else missing();
    }
    nav();
    document.title = `${main.querySelector("h1")?.textContent || "Learn"} | Launchpad`;
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  $("#theme").onclick = () => { state.theme = state.theme === "dark" ? "light" : "dark"; theme(); save(); };
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
  $(".skip").onclick = event => { event.preventDefault(); main.focus(); main.scrollIntoView(); };

  if (matchMedia("(max-width:760px)").matches) {
    $("#layout").classList.add("collapsed");
    $("#menu").setAttribute("aria-expanded", "false");
  }
  window.addEventListener("hashchange", render);
  theme();
  render();
  if (startupMessage) notify(startupMessage);
})();