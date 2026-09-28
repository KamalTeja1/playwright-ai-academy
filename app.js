(() => {
  "use strict";

  const DATA = window.ACADEMY;
  const $ = (selector) => document.querySelector(selector);
  const main = $("#main");

  // Retains compatibility with progress saved by the earlier starter.
  const STORAGE_KEY = "playwright-academy-v1";

  const state = {
    completed: [],
    bookmarks: [],
    notes: {},
    drafts: {},
    quizzes: {},
    lastLesson: "basics",
    theme: "light"
  };

  let storageFailed = false;
  let noticeTimer;

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[character]));
  }

  function notify(message) {
    clearTimeout(noticeTimer);
    $("#notice").textContent = message;

    noticeTimer = setTimeout(() => {
      $("#notice").textContent = "";
    }, 6000);
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || typeof saved !== "object") return;

      for (const key of ["completed", "bookmarks"]) {
        if (Array.isArray(saved[key])) {
          state[key] = DATA.lessons
            .filter((lesson) => saved[key].includes(lesson.id))
            .map((lesson) => lesson.id);
        }
      }

      for (const lesson of DATA.lessons) {
        for (const key of ["notes", "drafts"]) {
          const value = saved[key]?.[lesson.id];
          if (typeof value === "string") {
            state[key][lesson.id] = value;
          }
        }

        const answer = saved.quizzes?.[lesson.id];

        if (
          Number.isInteger(answer) &&
          answer >= 0 &&
          answer < lesson.quiz.choices.length
        ) {
          state.quizzes[lesson.id] = answer;
        }
      }

      if (DATA.lessons.some((lesson) => lesson.id === saved.lastLesson)) {
        state.lastLesson = saved.lastLesson;
      }

      if (saved.theme === "dark") state.theme = "dark";
    } catch {
      storageFailed = true;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      if (!storageFailed) {
        notify("Browser storage is unavailable or full. Changes remain in this session only.");
      }
      storageFailed = true;
    }
  }

  const paths = {
    dashboard:
      '<rect x="3" y="3" width="7" height="7" rx="2"/>' +
      '<rect x="14" y="3" width="7" height="7" rx="2"/>' +
      '<rect x="3" y="14" width="7" height="7" rx="2"/>' +
      '<rect x="14" y="14" width="7" height="7" rx="2"/>',

    book:
      '<path d="M4 3h12a3 3 0 0 1 3 3v15H7a3 3 0 0 1-3-3V3Z"/>' +
      '<path d="M4 17h15M8 7h7M8 11h5"/>',

    route:
      '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/>' +
      '<path d="M8 5h7a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h7"/>',

    code:
      '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>',

    sparkles:
      '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',

    terminal:
      '<rect x="3" y="4" width="18" height="16" rx="3"/>' +
      '<path d="m7 9 3 3-3 3m6 0h4"/>',

    target:
      '<circle cx="12" cy="12" r="9"/>' +
      '<circle cx="12" cy="12" r="5"/>' +
      '<circle cx="12" cy="12" r="1"/>',

    shield:
      '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/>' +
      '<path d="m8 12 3 3 5-6"/>',

    bug:
      '<rect x="7" y="7" width="10" height="13" rx="5"/>' +
      '<path d="m9 3 3 4 3-4M3 10h4m10 0h4M3 15h4m10 0h4M5 21l3-3m8 0 3 3M12 8v11"/>',

    trophy:
      '<path d="M8 3h8v6a4 4 0 0 1-8 0V3Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4M12 13v5m-4 3h8m-7-3h6v3H9z"/>',

    arrow:
      '<path d="M4 12h16m-6-6 6 6-6 6"/>',

    check:
      '<path d="m5 12 4 4L19 6"/>',

    note:
      '<path d="M5 3h14v14l-4 4H5V3Zm10 18v-4h4M8 7h8M8 11h8"/>'
  };

  function icon(name) {
    return `<svg class="icon" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="1.8"
      stroke-linecap="round" stroke-linejoin="round"
      aria-hidden="true" focusable="false">
      ${paths[name] || paths.book}
    </svg>`;
  }

  function heading(text, name = "book") {
    return `<h2 class="section-heading">
      <span class="section-icon">${icon(name)}</span>
      ${escapeHTML(text)}
    </h2>`;
  }

  function list(items, ordered = false) {
    const tag = ordered ? "ol" : "ul";

    return `<${tag}>${items.map((item) =>
      `<li>${escapeHTML(item)}</li>`
    ).join("")}</${tag}>`;
  }

  // Lightweight highlighting for strings, comments, and common JS/TS keywords.
  // This is display formatting, not parsing or validation.
  function highlight(code) {
    const pattern =
      /\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:import|from|const|let|async|await|return|if|else|export|function)\b/g;

    let output = "";
    let cursor = 0;

    for (const match of code.matchAll(pattern)) {
      output += escapeHTML(code.slice(cursor, match.index));

      const token = match[0];
      const type = token.startsWith("//")
        ? "comment"
        : /^["']/.test(token)
          ? "string"
          : "keyword";

      output += `<span class="token-${type}">${escapeHTML(token)}</span>`;
      cursor = match.index + token.length;
    }

    return output + escapeHTML(code.slice(cursor));
  }

  function codeBox(text, language = "typescript") {
    return `<div class="codebox">
      <button type="button" data-copy>Copy</button>
      <pre><code>${language === "typescript"
        ? highlight(text)
        : escapeHTML(text)}</code></pre>
    </div>`;
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      notify("Copied.");
    } catch {
      notify("Clipboard access is unavailable. Select the text and copy it manually.");
    }
  }

  function downloadText(text, filename) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-copy]");

    if (button) {
      const code = button.closest(".codebox").querySelector("code");
      copyText(code.textContent);
    }
  });

  const navigation = [
    ["dashboard", "dashboard", "Dashboard"],
    ["roadmap", "route", "Learning roadmap"],
    ["practice", "code", "Practice application"],
    ["projects", "trophy", "Project roadmap"],
    ["glossary", "book", "Glossary"],
    ["prompts", "sparkles", "AI prompt library"]
  ];

  function updateNavigation() {
    $("#main-nav").innerHTML = navigation.map(([route, name, title]) =>
      `<a href="#${route}">${icon(name)}<span>${title}</span></a>`
    ).join("");

    const query = $("#lesson-search").value.toLowerCase().trim();

    const results = DATA.lessons.filter((lesson) =>
      `${lesson.title} ${lesson.objective}`.toLowerCase().includes(query)
    );

    $("#lesson-nav").innerHTML = results.length
      ? results.map((lesson) => {
        const number = DATA.lessons.indexOf(lesson) + 1;
        const complete = state.completed.includes(lesson.id);

        return `<a href="#lesson/${lesson.id}">
          <span class="lesson-number" aria-hidden="true">
            ${complete ? "✓" : String(number).padStart(2, "0")}
          </span>
          <span>${escapeHTML(lesson.title)}
            ${complete ? '<span class="small"> — completed</span>' : ""}
          </span>
        </a>`;
      }).join("")
      : '<p class="muted small">No matching lessons.</p>';

    const current = location.hash || "#dashboard";

    document.querySelectorAll("nav a").forEach((link) => {
      if (link.getAttribute("href") === current) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function lessonCards(lessons) {
    return `<div class="course-grid">
      ${lessons.map((lesson) => {
        const complete = state.completed.includes(lesson.id);

        return `<a class="course-card" href="#lesson/${lesson.id}">
          <div class="course-art">${icon(lesson.icon)}</div>
          <span class="badge ${complete ? "complete" : ""}">
            ${complete ? "Marked complete" : escapeHTML(lesson.level)}
          </span>
          <h3>${escapeHTML(lesson.title)}</h3>
          <p>${escapeHTML(lesson.objective)}</p>
          <span class="course-cta">
            ${complete ? "Review lesson" : "Open lesson"}
            ${icon("arrow")}
          </span>
        </a>`;
      }).join("")}
    </div>`;
  }

  const illustration = `
    <svg class="hero-art" viewBox="0 0 360 290"
      aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="browser-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#8564ef"/>
          <stop offset="100%" stop-color="#5032ba"/>
        </linearGradient>
      </defs>

      <circle cx="186" cy="142" r="122" fill="#b9a5ff" opacity=".15"/>
      <circle cx="280" cy="46" r="16" fill="#ffc66d"/>
      <circle cx="54" cy="230" r="10" fill="#5cceb5"/>

      <rect x="42" y="59" width="273" height="186" rx="20"
        fill="#392773" opacity=".1"/>
      <rect x="34" y="47" width="273" height="186" rx="20"
        fill="url(#browser-gradient)"/>

      <path d="M34 88h273" stroke="#cbbdff" opacity=".35"/>
      <circle cx="55" cy="68" r="4" fill="#ffbfce"/>
      <circle cx="70" cy="68" r="4" fill="#ffe198"/>
      <circle cx="85" cy="68" r="4" fill="#a5efda"/>

      <rect x="111" y="61" width="133" height="14" rx="7"
        fill="#ffffff" opacity=".15"/>

      <path d="m95 124-23 22 23 22m142-44 23 22-23 22m-60-57-20 75"
        fill="none" stroke="#ffffff" stroke-width="8"
        stroke-linecap="round" stroke-linejoin="round"/>

      <rect x="109" y="199" width="122" height="7" rx="3.5"
        fill="#d7caff" opacity=".55"/>

      <rect x="239" y="168" width="80" height="80" rx="22" fill="#c8f4e8"/>
      <circle cx="279" cy="208" r="23" fill="#2a947b"/>
      <path d="m268 208 8 8 15-17" fill="none"
        stroke="#ffffff" stroke-width="5"
        stroke-linecap="round" stroke-linejoin="round"/>

      <rect x="11" y="111" width="48" height="48" rx="15" fill="#ffe8bb"/>
      <path d="m36 120-10 15h8l-3 13 13-17h-9l1-11Z" fill="#a2620c"/>

      <path d="M319 103v16m-8-8h16M111 21v12m-6-6h12"
        stroke="#9a80ef" stroke-width="3" stroke-linecap="round"/>
    </svg>`;

  function dashboard() {
    const completed = state.completed.length;
    const total = DATA.lessons.length;

    const resume = DATA.lessons.find((lesson) =>
      lesson.id === state.lastLesson
    ) || DATA.lessons[0];

    const next = DATA.lessons.find((lesson) =>
      !state.completed.includes(lesson.id)
    );

    const bookmarks = DATA.lessons.filter((lesson) =>
      state.bookmarks.includes(lesson.id)
    );

    main.innerHTML = `
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">YOUR NEXT SKILL STARTS HERE</p>
          <h1>Small steps.<br><em>Big testing energy.</em></h1>
          <p>Go from “Where do I start?” to writing your first browser test.
          Learn one idea, try it out, and build confidence as you go.</p>

          <div class="actions">
            <a class="button primary" href="#lesson/${resume.id}">
              Resume learning ${icon("arrow")}
            </a>
            <a class="button" href="#practice">Open practice app</a>
          </div>

          <div class="hero-pills">
            <span>${icon("book")} Beginner friendly</span>
            <span>${icon("code")} Hands-on practice</span>
            <span>${icon("shield")} Learn at your pace</span>
          </div>
        </div>

        ${illustration}
      </section>

      <section class="metrics" aria-label="Learning overview">
        <div class="metric">
          <span class="metric-icon">${icon("book")}</span>
          <div><strong>${total}</strong><small>Available lessons</small></div>
        </div>
        <div class="metric">
          <span class="metric-icon">${icon("check")}</span>
          <div><strong>${completed} / ${total}</strong><small>Marked complete</small></div>
        </div>
        <div class="metric">
          <span class="metric-icon">${icon("route")}</span>
          <div><strong>${DATA.modules.length}</strong><small>Planned course levels</small></div>
        </div>
      </section>

      <div class="grid">
        <section class="card">
          ${heading("Your progress", "trophy")}
          <progress value="${completed}" max="${total}"
            aria-label="Available lesson completion"></progress>
          <p>${completed} of ${total} available lessons marked complete.</p>
          <p class="small muted">
            This is self-reported learning progress, not verified test execution
            or completion of the full planned course.
          </p>
          ${completed === total
            ? '<p class="success">Starter track completion badge earned!</p>'
            : ""}
        </section>

        <section class="card">
          ${heading("Your next small step", "route")}
          ${next ? `
            <p>${escapeHTML(next.objective)}</p>
            <a class="button" href="#lesson/${next.id}">
              ${escapeHTML(next.title)} ${icon("arrow")}
            </a>` : `
            <p>Revisit a challenge and execute your tests locally.</p>
            <a class="button" href="#lesson/debugging">Review the debugging challenge</a>`}
        </section>
      </div>

      <section class="card">
        <p class="eyebrow">YOUR STARTER TRACK</p>
        ${heading("What will you learn today?", "sparkles")}
        <p class="muted">Follow these lessons in order, or revisit an exercise.</p>
        ${lessonCards(DATA.lessons)}
      </section>

      <section class="card">
        ${heading("Saved for later", "note")}
        ${bookmarks.length
          ? lessonCards(bookmarks)
          : '<p class="muted">Bookmark a lesson to find it here.</p>'}
      </section>

      <section class="card">
        ${heading("Real features. Honest boundaries.", "shield")}
        <p>Lessons, quizzes, drafts, notes, and practice interactions work in this site.
        There are no user accounts or cross-device synchronization.</p>
        <p>The tutor gives predefined demo hints. The practice login is fictional.
        This website never executes your submitted code or claims your tests passed.</p>
      </section>`;
  }

  function renderLesson(id) {
    const lesson = DATA.lessons.find((item) => item.id === id);

    if (!lesson) {
      notFound();
      return;
    }

    state.lastLesson = id;
    saveState();

    const index = DATA.lessons.indexOf(lesson);
    const previous = DATA.lessons[index - 1];
    const next = DATA.lessons[index + 1];

    main.innerHTML = `
      <p class="breadcrumb">
        <a href="#dashboard">Academy</a> / Lessons / ${escapeHTML(lesson.title)}
      </p>

      <span class="badge">${escapeHTML(lesson.level)}</span>
      <h1>${escapeHTML(lesson.title)}</h1>

      <section class="card">
        ${heading("What you will be able to do", "target")}
        <p>${escapeHTML(lesson.objective)}</p>
        <p><strong>Prerequisites:</strong> ${escapeHTML(lesson.prerequisites)}</p>

        <div class="actions">
          <button id="bookmark" type="button"
            aria-pressed="${state.bookmarks.includes(id)}">
            ${state.bookmarks.includes(id) ? "Remove bookmark" : "Bookmark lesson"}
          </button>

          <a href="${escapeHTML(lesson.docs)}" target="_blank" rel="noopener noreferrer">
            Official documentation
          </a>
        </div>
      </section>

      <section class="card">
        ${heading("The idea, in plain English", lesson.icon)}
        <p>${escapeHTML(lesson.explanation)}</p>
        <h3>Annotated example</h3>
        ${codeBox(lesson.code, lesson.language)}
      </section>

      <section class="card">
        ${heading("Try it step by step", "route")}
        ${list(lesson.steps, true)}

        ${id === "installation" ? `
          <p>
            Official downloads:
            <a href="https://nodejs.org/en/download"
              target="_blank" rel="noopener noreferrer">Node.js</a>
            ·
            <a href="https://code.visualstudio.com/download"
              target="_blank" rel="noopener noreferrer">VS Code</a>
          </p>` : ""}
      </section>

      <section class="card">
        ${heading("Your exercise workspace", "code")}
        <p>${escapeHTML(lesson.exercise)}</p>

        <label for="editor">Your draft — saved in this browser</label>
        <textarea id="editor" class="editor" spellcheck="false"></textarea>

        <div class="actions">
          <button id="copy-draft" type="button">Copy draft</button>
          <button id="download-draft" type="button">Download draft</button>
          <button id="compare" type="button">Compare with solution</button>
        </div>

        <p id="comparison" role="status"></p>
        <p class="small muted">
          Comparison checks text only. It does not compile TypeScript or run Playwright.
          Different code can still be correct.
        </p>

        <h3>Need a little help?</h3>

        ${lesson.hints.map((hint, number) => `
          <details>
            <summary>Hint ${number + 1}</summary>
            <p>${escapeHTML(hint)}</p>
          </details>
        `).join("")}

        <details id="solution">
          <summary>Reveal sample solution</summary>
          ${codeBox(lesson.solution, lesson.language)}
        </details>
      </section>

      <section class="card">
        ${heading("Expected behavior", "check")}
        <p>${escapeHTML(lesson.expected)}</p>
        <h3>Common mistakes and troubleshooting</h3>
        ${list(lesson.mistakes)}
      </section>

      <section class="card">
        ${heading("Quick knowledge check", "target")}
        <form id="quiz">
          <fieldset>
            <legend>${escapeHTML(lesson.quiz.question)}</legend>
            ${lesson.quiz.choices.map((choice, number) => `
              <label class="choice">
                <input type="radio" name="answer" value="${number}" required>
                <span>${escapeHTML(choice)}</span>
              </label>
            `).join("")}
          </fieldset>

          <button class="primary" type="submit">Check answer</button>
          <p id="quiz-result" role="status"></p>
        </form>
      </section>

      <section class="card">
        <span class="badge">DEMO MODE — NOT LIVE AI</span>
        ${heading("Your learning companion", "sparkles")}
        <p>This helper provides predefined lesson hints. It does not inspect your
        draft, call an AI provider, or send your code anywhere.</p>

        <div class="actions">
          <button id="explain" type="button">Explain the idea again</button>
          <button id="tutor-hint" type="button">Give me the next hint</button>
        </div>

        <p id="tutor-answer" role="status"></p>
      </section>

      <section class="card">
        ${heading("Make it stick", "note")}
        <label for="notes">Your notes — use non-sensitive information only</label>
        <textarea id="notes" rows="5"></textarea>

        <h3>Optional advanced challenge</h3>
        <p>${escapeHTML(lesson.challenge)}</p>
      </section>

      <div class="actions">
        ${previous
          ? `<a class="button" href="#lesson/${previous.id}">Previous lesson</a>`
          : ""}

        <button id="complete" class="primary" type="button">
          ${state.completed.includes(id) ? "Mark incomplete" : "Mark lesson complete"}
        </button>

        ${next
          ? `<a class="button" href="#lesson/${next.id}">Next lesson ${icon("arrow")}</a>`
          : '<a class="button" href="#dashboard">Back to dashboard</a>'}
      </div>`;

    $("#editor").value = state.drafts[id] ?? lesson.starter;
    $("#notes").value = state.notes[id] ?? "";

    $("#editor").addEventListener("input", (event) => {
      state.drafts[id] = event.target.value;
      saveState();
    });

    $("#notes").addEventListener("input", (event) => {
      state.notes[id] = event.target.value;
      saveState();
    });

    $("#copy-draft").onclick = () => copyText($("#editor").value);

    $("#download-draft").onclick = () => {
      downloadText($("#editor").value, lesson.file);
    };

    $("#compare").onclick = () => {
      const same = $("#editor").value.trim() === lesson.solution.trim();

      $("#comparison").textContent = same
        ? "Your text matches the sample. It has NOT been executed."
        : "Your draft differs from the sample. Compare the code below; different code may still be correct.";

      $("#solution").open = true;
    };

    $("#bookmark").onclick = () => {
      const exists = state.bookmarks.includes(id);

      state.bookmarks = exists
        ? state.bookmarks.filter((item) => item !== id)
        : [...state.bookmarks, id];

      saveState();

      $("#bookmark").textContent = exists ? "Bookmark lesson" : "Remove bookmark";
      $("#bookmark").setAttribute("aria-pressed", String(!exists));

      notify(exists ? "Bookmark removed." : "Lesson bookmarked.");
    };

    $("#complete").onclick = () => {
      const exists = state.completed.includes(id);

      state.completed = exists
        ? state.completed.filter((item) => item !== id)
        : [...state.completed, id];

      saveState();
      updateNavigation();

      $("#complete").textContent = exists ? "Mark lesson complete" : "Mark incomplete";

      notify(exists
        ? "Lesson marked incomplete."
        : "Progress saved. Nice work taking another step!");
    };

    function showQuizResult(answer) {
      const correct = answer === lesson.quiz.correct;

      $("#quiz-result").textContent =
        (correct ? "Correct! " : "Not quite. ") + lesson.quiz.explanation;
    }

    const savedAnswer = state.quizzes[id];

    if (Number.isInteger(savedAnswer)) {
      $(`#quiz input[value="${savedAnswer}"]`).checked = true;
      showQuizResult(savedAnswer);
    }

    $("#quiz").onsubmit = (event) => {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);
      const answer = Number(formData.get("answer"));

      state.quizzes[id] = answer;
      saveState();
      showQuizResult(answer);
    };

    let hintIndex = 0;

    $("#explain").onclick = () => {
      $("#tutor-answer").textContent = `Demo explanation: ${lesson.explanation}`;
    };

    $("#tutor-hint").onclick = () => {
      $("#tutor-answer").textContent = hintIndex < lesson.hints.length
        ? `Demo hint: ${lesson.hints[hintIndex++]}`
        : "You have seen all the hints. Reveal the sample solution when you are ready.";
    };
  }

  function roadmap() {
    main.innerHTML = `
      <p class="eyebrow">BEGINNER → ADVANCED</p>
      <h1>Your learning roadmap</h1>
      <p class="muted">
        Follow the levels in order. Five starter lessons are fully written;
        the remaining topics are explicitly marked as planned.
      </p>

      ${DATA.modules.map((module, index) => `
        <section class="card roadmap-step" data-step="${index + 1}">
          <span class="badge">${escapeHTML(module.level)}</span>
          <h2>${escapeHTML(module.title)}</h2>

          <p><strong>After this level:</strong> ${escapeHTML(module.outcome)}</p>
          <p class="small muted">
            Prerequisite: ${index === 0 ? "none" : `level ${index}`}
            · ${escapeHTML(module.status)}
          </p>

          ${list(module.topics)}
        </section>
      `).join("")}`;
  }

  function projects() {
    main.innerHTML = `
      <p class="eyebrow">BUILD SOMETHING REAL</p>
      <h1>Your project roadmap</h1>
      <p class="muted">
        These are planned project briefs. Complete starter packs, detailed
        requirements, and completion assessments are not included yet.
      </p>

      ${DATA.projects.map((project, index) => `
        <section class="card">
          <span class="badge">PROJECT ${index + 1} · PLANNED</span>
          ${heading(project.title, "trophy")}
          <p>${escapeHTML(project.outcome)}</p>
          <h3>Proposed milestones</h3>
          ${list(project.milestones, true)}
        </section>
      `).join("")}`;
  }

  function practice() {
    main.innerHTML = `
      <p class="eyebrow">A SAFE PLACE TO EXPERIMENT</p>
      <h1>Practice application</h1>
      <p class="muted">
        Use fictional data only. This is a front-end demonstration:
        no real accounts are created and selected files are not uploaded.
        Practice form state resets when you leave this page.
      </p>

      <div class="grid">
        <section class="card">
          ${heading("Demo login", "shield")}
          <p class="small">
            Email: <code>learner@example.com</code><br>
            Password: <code>practice123</code>
          </p>

          <form id="login-form">
            <label for="email">Email</label>
            <input id="email" type="email" autocomplete="off" required>

            <label for="password">Password</label>
            <input id="password" type="password" autocomplete="off" required>

            <button class="primary" type="submit">Sign in</button>
            <p id="login-result" data-testid="login-result" role="status"></p>
          </form>
        </section>

        <section class="card">
          ${heading("Profile form", "note")}
          <form id="profile-form">
            <label for="display-name">Display name</label>
            <input id="display-name" minlength="2" maxlength="30" required>

            <label for="experience">Experience</label>
            <select id="experience">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>

            <label class="choice">
              <input id="updates" type="checkbox">
              <span>Receive practice updates</span>
            </label>

            <button type="submit">Save profile</button>
            <p id="profile-result" role="status"></p>
          </form>
        </section>
      </div>

      <section class="card">
        ${heading("Product explorer", "target")}
        <label for="product-search">Filter products</label>
        <input id="product-search" type="search" placeholder="Try keyboard">

        <div class="table-wrap">
          <table>
            <caption>Fictional practice products</caption>
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Price</th>
              </tr>
            </thead>
            <tbody id="products"></tbody>
          </table>
        </div>

        <p id="product-count" role="status"></p>
      </section>

      <section class="card">
        ${heading("File selection playground", "code")}
        <label for="practice-file">Choose a practice file</label>
        <input id="practice-file" type="file">

        <p id="file-result" role="status">No file selected.</p>
        <p class="small muted">
          Only the filename is displayed. File contents are not read or sent.
        </p>
      </section>`;

    $("#login-form").onsubmit = (event) => {
      event.preventDefault();

      const valid =
        $("#email").value === "learner@example.com" &&
        $("#password").value === "practice123";

      $("#login-result").textContent = valid
        ? "Welcome, learner!"
        : "Invalid practice credentials.";
    };

    $("#profile-form").onsubmit = (event) => {
      event.preventDefault();

      $("#profile-result").textContent =
        `Profile saved for ${$("#display-name").value} — ${$("#experience").value}. ` +
        `Practice updates: ${$("#updates").checked ? "yes" : "no"}.`;
    };

    const products = [
      { name: "Keyboard", price: "$45" },
      { name: "Mouse", price: "$20" },
      { name: "Monitor", price: "$180" }
    ];

    function filterProducts() {
      const query = $("#product-search").value.toLowerCase().trim();

      const results = products.filter((product) =>
        product.name.toLowerCase().includes(query)
      );

      $("#products").innerHTML = results.map((product) => `
        <tr>
          <td>${escapeHTML(product.name)}</td>
          <td>${escapeHTML(product.price)}</td>
        </tr>
      `).join("");

      $("#product-count").textContent = `${results.length} products shown`;
    }

    $("#product-search").oninput = filterProducts;
    filterProducts();

    $("#practice-file").onchange = (event) => {
      const file = event.target.files[0];

      $("#file-result").textContent = file
        ? `Selected: ${file.name}`
        : "No file selected.";
    };
  }

  function glossary() {
    main.innerHTML = `
      <p class="eyebrow">LESS JARGON. MORE CLARITY.</p>
      <h1>Your automation glossary</h1>

      <label for="glossary-search">Search terms</label>
      <input id="glossary-search" type="search" placeholder="Try assertion">

      <div id="terms"></div>`;

    function filterTerms() {
      const query = $("#glossary-search").value.toLowerCase().trim();

      const results = DATA.glossary.filter(([term, meaning]) =>
        `${term} ${meaning}`.toLowerCase().includes(query)
      );

      $("#terms").innerHTML = results.length
        ? results.map(([term, meaning]) => `
          <section class="card">
            ${heading(term)}
            <p>${escapeHTML(meaning)}</p>
          </section>
        `).join("")
        : '<p class="muted">No matching terms.</p>';
    }

    $("#glossary-search").oninput = filterTerms;
    filterTerms();
  }

  function prompts() {
    main.innerHTML = `
      <p class="eyebrow">THINK CLEARLY. PROMPT CAREFULLY.</p>
      <h1>Your AI prompt library</h1>

      <section class="card">
        ${heading("AI is an assistant, not proof", "shield")}
        <p>
          Remove credentials, tokens, personal information, and proprietary data
          before sharing material with an AI service. Follow your organization's rules.
        </p>
        <p>
          Check suggested APIs against official documentation, review the assertions,
          and execute the tests yourself. No live AI provider is connected here.
        </p>
      </section>

      ${DATA.prompts.map((prompt) => `
        <section class="card">
          ${heading(prompt.title, "sparkles")}
          ${codeBox(prompt.text, "text")}
        </section>
      `).join("")}`;
  }

  function notFound() {
    main.innerHTML = `
      <section class="card">
        <h1>That page is not here yet.</h1>
        <p>Let's get you back to your learning journey.</p>
        <a class="button primary" href="#dashboard">Open dashboard</a>
      </section>`;
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.theme;
    $("#theme-toggle").textContent =
      state.theme === "dark" ? "Light mode" : "Dark mode";
  }

  function closeMobileMenu() {
    if (!window.matchMedia("(max-width: 760px)").matches) return;

    $("#layout").classList.add("menu-hidden");
    $("#menu-toggle").setAttribute("aria-expanded", "false");
  }

  function render() {
    const route = location.hash.slice(1) || "dashboard";

    // Preserve the skip link without replacing the current page.
    if (route === "main") {
      main.focus();
      return;
    }

    if (route.startsWith("lesson/")) {
      renderLesson(route.slice("lesson/".length));
    } else {
      const routes = {
        dashboard,
        roadmap,
        practice,
        projects,
        glossary,
        prompts
      };

      if (Object.prototype.hasOwnProperty.call(routes, route)) {
        routes[route]();
      } else {
        notFound();
      }
    }

    updateNavigation();

    const title = main.querySelector("h1")?.textContent || "Learn";
    document.title = `${title} | Playwright Academy`;

    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  $("#theme-toggle").onclick = () => {
    state.theme = state.theme === "dark" ? "light" : "dark";
    saveState();
    applyTheme();
  };

  $("#menu-toggle").onclick = () => {
    const hidden = $("#layout").classList.toggle("menu-hidden");
    $("#menu-toggle").setAttribute("aria-expanded", String(!hidden));
  };

  $("#lesson-search").oninput = updateNavigation;

  $("#sidebar").addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMobileMenu();
  });

  $(".skip-link").addEventListener("click", (event) => {
    event.preventDefault();
    main.focus();
    main.scrollIntoView();
  });

  window.addEventListener("hashchange", render);

  loadState();
  applyTheme();
  closeMobileMenu();
  render();

  if (storageFailed) {
    notify("Saved progress could not be loaded. Browser storage may be unavailable.");
  }
})();