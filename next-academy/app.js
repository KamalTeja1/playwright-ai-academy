const main = document.getElementById("main");
let toastTimer;

function notify(message) {
  clearTimeout(toastTimer);
  document.getElementById("toast").textContent = message;
  toastTimer = setTimeout(() => {
    document.getElementById("toast").textContent = "";
  }, 6500);
}

function download(text, filename, type = "application/json") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    notify("Copied.");
  } catch {
    notify("Clipboard unavailable. Select and copy manually.");
  }
}

function fatal(error) {
  main.replaceChildren();

  const card = document.createElement("section");
  card.className = "card";

  const title = document.createElement("h1");
  title.textContent = "The learning studio could not start.";

  const message = document.createElement("p");
  message.textContent =
    "Check that every Release A dependency and Release B file is saved inside next-academy.";

  const detail = document.createElement("pre");
  detail.textContent = String(error.message || error);

  const reload = document.createElement("button");
  reload.textContent = "Reload";
  reload.onclick = () => location.reload();

  card.append(title, message, detail, reload);
  main.append(card);
}

async function start() {
  const [
    { course, courseErrors },
    { createPreferencesStore, validatePreferences },
    { createLearningStore, validateLearning },
    { escapeHTML: e, searchTopics, topicCards, renderTopic }
  ] = await Promise.all([
    import("./course.js"),
    import("./store.js"),
    import("./learning-store.js"),
    import("./learning-ui.js")
  ]);

  const errors = courseErrors();
  if (errors.length) throw new Error(errors.join("\n"));

  let storage;

  try {
    storage = window.localStorage;
  } catch {
    storage = {
      getItem() { throw new Error("Storage access is blocked."); },
      setItem() { throw new Error("Storage access is blocked."); },
      removeItem() { throw new Error("Storage access is blocked."); }
    };
  }

  const preferences = createPreferencesStore(storage);
  const topicIds = course.topics.map(topic => topic.id);
  const learning = createLearningStore(storage, topicIds);

  const dialog = document.getElementById("search-dialog");
  const quickInput = document.getElementById("quick-search");

  function applyTheme() {
    const value = preferences.get().theme;
    document.documentElement.dataset.theme = value;
    document.getElementById("theme-toggle").textContent =
      value === "dark" ? "Light mode" : "Dark mode";
  }

  function safe(action) {
    try {
      return action();
    } catch (error) {
      notify(String(error.message || error));
      return null;
    }
  }

  function navigation() {
    const route = location.hash.slice(1) || "/";
    const links = [
      ["/", "⌂", "Studio home"],
      ["/phases", "▦", "Course map"],
      ["/search", "⌕", "Search topics"],
      ["/bookmarks", "★", "Bookmarks"],
      ["/settings", "⚙", "Settings & backup"],
      ["/release", "↗", "Build status"]
    ];

    document.getElementById("navigation").innerHTML =
      links.map(([path, symbol, label]) => `
        <a href="#${path}" ${route === path ? 'aria-current="page"' : ""}>
          <span class="nav-symbol" aria-hidden="true">${symbol}</span>
          <span>${label}</span>
        </a>
      `).join("") +
      '<a href="./checks.html">Release A checks</a>' +
      '<a href="./learning-checks.html">Release B checks</a>';

    document.getElementById("course-tree").innerHTML = `
      <div class="course-tree">
        <p class="eyebrow">PHASE → MODULE → LESSON</p>
        ${course.phases.map(phase => {
          const modules = course.modules.filter(m => m.phaseId === phase.id);

          return `<details ${modules.length ? "open" : ""}>
            <summary>Phase ${phase.order}: ${e(phase.title)}</summary>
            <nav aria-label="Phase ${phase.order}">
              <a href="#/phases/${phase.id}">Phase overview</a>
            </nav>
            ${modules.length ? modules.map(module => `
              <details open>
                <summary>${e(module.title)}</summary>
                <nav aria-label="${e(module.title)}">
                  <a href="#/modules/${module.id}">Module overview</a>
                  ${course.lessons.filter(l => l.moduleId === module.id).map(lesson => `
                    <a href="#/lessons/${lesson.id}">${e(lesson.title)}</a>
                  `).join("")}
                </nav>
              </details>
            `).join("") : '<p class="small muted">Content not installed yet.</p>'}
          </details>`;
        }).join("")}
      </div>`;
  }

  function phaseCards() {
    return `<div class="grid">${course.phases.map(phase => {
      const count = course.modules.filter(m => m.phaseId === phase.id).length;

      return `<a class="phase-card" href="#/phases/${phase.id}">
        <span class="phase-number">${phase.order}</span>
        <span class="badge">${count ? "Review module available" : "Content not installed"}</span>
        <h3>${e(phase.title)}</h3>
        <p>${e(phase.description)}</p>
      </a>`;
    }).join("")}</div>`;
  }

  function home() {
    const saved = learning.get();
    const resume = course.topics.find(t => t.id === saved.lastTopic) || course.topics[0];

    main.innerHTML = `
      <section class="hero">
        <div>
          <p class="eyebrow">RELEASE B · LEARNING WORKSPACE</p>
          <h1>Read deeply.<br><em>Practice deliberately.</em></h1>
          <p>
            Welcome, ${e(preferences.get().name)}.
            Review the new lesson interface before the larger course content arrives.
          </p>
          <div class="actions">
            <a class="button primary" href="#/topics/${resume.id}">
              ${saved.lastTopic ? "Resume review topic" : "Open review topic"} →
            </a>
            <a class="button" href="#/phases">Course map</a>
          </div>
        </div>
      </section>

      <div class="grid">
        <section class="card stat"><strong>${course.phases.length}</strong><span>Defined phases</span></section>
        <section class="card stat"><strong>${course.topics.length}</strong><span>Interface-review topic</span></section>
        <section class="card stat"><strong>${saved.bookmarks.length}</strong><span>Saved bookmarks</span></section>
      </div>

      <section class="card">
        <h2>What you can review now</h2>
        <p>
          Open the topic, change tabs, copy an example, answer a checkpoint,
          save a note, bookmark it, and return after refreshing.
        </p>
        <p>
          No lesson-completion score or study-time statistic is invented.
          Those features belong to Release C.
        </p>
        ${topicCards(course.topics, learning)}
      </section>`;
  }

  function phases() {
    main.innerHTML = `<h1>Your course map</h1>
      <p class="muted">Only the interface-review module is installed in this release.</p>
      ${phaseCards()}`;
  }

  function phasePage(id) {
    const phase = course.phases.find(p => p.id === id);
    if (!phase) return missing();

    const modules = course.modules.filter(m => m.phaseId === id);

    main.innerHTML = `
      <p class="breadcrumbs"><a href="#/phases">Course map</a> / Phase ${phase.order}</p>
      <h1>${e(phase.title)}</h1>
      <p>${e(phase.description)}</p>
      ${modules.length ? `<div class="grid">${modules.map(module => `
        <a class="phase-card" href="#/modules/${module.id}">
          <span class="badge">Interface review</span>
          <h2>${e(module.title)}</h2><p>${e(module.description)}</p>
        </a>`).join("")}</div>` : `
        <section class="card"><h2>Content not installed yet</h2>
          <p>This is a phase description, not a completed course module.</p></section>`}`;
  }

  function modulePage(id) {
    const module = course.modules.find(m => m.id === id);
    if (!module) return missing();

    const phase = course.phases.find(p => p.id === module.phaseId);

    main.innerHTML = `
      <p class="breadcrumbs">
        <a href="#/phases">Course map</a> /
        <a href="#/phases/${phase.id}">Phase ${phase.order}</a> /
        Module
      </p>
      <h1>${e(module.title)}</h1>
      <p>${e(module.description)}</p>
      <div class="grid">${course.lessons.filter(l => l.moduleId === id).map(lesson => `
        <a class="phase-card" href="#/lessons/${lesson.id}">
          <h2>${e(lesson.title)}</h2><p>${e(lesson.summary)}</p>
        </a>`).join("")}</div>`;
  }

  function lessonPage(id) {
    const lesson = course.lessons.find(l => l.id === id);
    if (!lesson) return missing();

    const module = course.modules.find(m => m.id === lesson.moduleId);
    main.innerHTML = `
      <p class="breadcrumbs">
        <a href="#/modules/${module.id}">${e(module.title)}</a> / Lesson
      </p>
      <h1>${e(lesson.title)}</h1>
      <p>${e(lesson.summary)}</p>
      ${topicCards(course.topics.filter(t => t.lessonId === id), learning)}`;
  }

  function topicPage(id) {
    const topic = course.topics.find(t => t.id === id);
    if (!topic) return missing();

    const lesson = course.lessons.find(l => l.id === topic.lessonId);
    const module = course.modules.find(m => m.id === lesson.moduleId);
    const phase = course.phases.find(p => p.id === module.phaseId);

    safe(() => learning.visit(id));

    renderTopic({
      root: main,
      topic,
      learning,
      notify,
      copy,
      download,
      breadcrumbs: `
        <p class="breadcrumbs">
          <a href="#/phases/${phase.id}">Phase ${phase.order}</a> /
          <a href="#/modules/${module.id}">Module</a> /
          <a href="#/lessons/${lesson.id}">${e(lesson.title)}</a> /
          Topic
        </p>`
    });
  }

  function searchPage() {
    main.innerHTML = `
      <h1>Search topics</h1>
      <label for="page-search">Search titles, summaries, and tags</label>
      <input id="page-search" type="search" autocomplete="off">
      <p id="page-count" role="status"></p>
      <div id="page-results"></div>`;

    const update = () => {
      const matches = searchTopics(
        course.topics,
        document.getElementById("page-search").value
      );
      document.getElementById("page-count").textContent =
        `${matches.length} matching topic${matches.length === 1 ? "" : "s"}.`;
      document.getElementById("page-results").innerHTML =
        matches.length ? topicCards(matches, learning) :
          '<section class="card"><p>No matches. Try “assertion” or “Python”.</p></section>';
    };

    document.getElementById("page-search").oninput = update;
    update();
  }

  function bookmarks() {
    const ids = learning.get().bookmarks;
    const topics = course.topics.filter(t => ids.includes(t.id));

    main.innerHTML = `<h1>Your bookmarks</h1>
      ${topics.length ? topicCards(topics, learning) :
        '<section class="card"><p>No bookmarks yet. Open the review topic and select Bookmark topic.</p><a class="button" href="#/search">Find a topic</a></section>'}`;
  }

  function settings() {
    const current = preferences.get();

    main.innerHTML = `
      <h1>Settings and backups</h1>

      <section class="card">
        <h2>Preferences — preserved from Release A</h2>
        <form id="preferences-form">
          <label for="name">Display name</label>
          <input id="name" required maxlength="60">

          <label for="goal">Weekly goal in minutes</label>
          <input id="goal" type="number" min="15" max="3000" step="1" required>

          <p class="small muted">This is a saved goal, not recorded study time.</p>
          <button class="primary">Save preferences</button>
          <p id="preferences-status" role="status"></p>
        </form>
      </section>

      ${backupSection("preferences", "Preferences", preferences.status())}
      ${backupSection("learning", "Notes, drafts, and bookmarks", learning.status())}

      <section class="card">
        <h2>Verification</h2>
        <div class="actions">
          <a class="button" href="./checks.html">Release A checks</a>
          <a class="button" href="./learning-checks.html">Release B checks</a>
        </div>
      </section>`;

    document.getElementById("name").value = current.name;
    document.getElementById("goal").value = current.weeklyGoalMinutes;

    document.getElementById("preferences-form").onsubmit = event => {
      event.preventDefault();
      const message = document.getElementById("preferences-status");
      try {
        preferences.save({
          ...preferences.get(),
          name: document.getElementById("name").value,
          weeklyGoalMinutes: Number(document.getElementById("goal").value)
        });
        message.textContent = "Saved.";
      } catch (error) {
        message.textContent = "Not saved: " + error.message;
      }
    };

    bindBackup("preferences", preferences, validatePreferences);
    bindBackup("learning", learning, raw => validateLearning(raw, topicIds));
  }

  function backupSection(id, title, status) {
    return `<section class="card">
      <h2>${title}</h2>
      ${status.blocked ? `<div class="notice danger">${e(status.startupError)}</div>` : ""}
      <p class="small muted">Export before resetting. Restore replaces this data category, not the other one.</p>
      <div class="actions">
        <button id="${id}-export" type="button">Export backup</button>
        <button id="${id}-raw" type="button">Export untouched stored data</button>
        <button id="${id}-reset" type="button">Reset this category</button>
      </div>
      <label for="${id}-import">Restore matching JSON backup</label>
      <input id="${id}-import" type="file" accept=".json,application/json">
      <p id="${id}-status" role="status"></p>
    </section>`;
  }

  function bindBackup(id, store, validator) {
    document.getElementById(id + "-export").onclick = () =>
      download(JSON.stringify(store.get(), null, 2), `launchpad-${id}.json`);

    document.getElementById(id + "-raw").onclick = () => safe(() =>
      download(store.raw() ?? "", `launchpad-${id}-raw.txt`, "text/plain")
    );

    document.getElementById(id + "-reset").onclick = () => {
      if (!confirm(`Reset only ${id}? Export a backup first.`)) return;
      try {
        store.reset();
        applyTheme();
        settings();
        notify("Data category reset.");
      } catch (error) {
        notify(error.message);
      }
    };

    document.getElementById(id + "-import").onchange = async event => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        if (file.size > 2_000_000) throw new Error("Maximum backup size is 2 MB.");
        const clean = validator(JSON.parse(await file.text()));
        if (!confirm(`Replace ${id} with this validated backup?`)) return;

        store.restore(clean);
        applyTheme();
        settings();
        notify("Backup restored.");
      } catch (error) {
        const status = document.getElementById(id + "-status");
        if (status) status.textContent = "Restore rejected: " + error.message;
      }
    };
  }

  function release() {
    main.innerHTML = `
      <h1>Release B status</h1>
      <section class="card"><h2>Implemented</h2>
        <ul>
          <li>Phase, module, lesson, and direct-topic pages.</li>
          <li>Topic tabs, table of contents, code copy, and display highlighting.</li>
          <li>Search page and command palette.</li>
          <li>Bookmarks, notes, drafts, and separate learning-data backup.</li>
          <li>Immediate checkpoint feedback without invented completion scores.</li>
        </ul>
      </section>
      <section class="card"><h2>Not implemented yet</h2>
        <p>Real curriculum batches, weekly scheduling, study-time tracking,
        durable quiz scores, achievements, live AI, and browser-test execution.</p>
        <p>The only content in this release is a labelled interface-review topic.</p>
      </section>`;
  }

  function missing() {
    main.innerHTML = `<section class="card">
      <span class="badge">404 · WRONG TURN, NOT A DEAD END</span>
      <h1>This page is not in the studio.</h1>
      <a class="button primary" href="#/">Return home</a>
    </section>`;
  }

  function render() {
    const route = location.hash.slice(1) || "/";
    const parts = route.split("/").filter(Boolean);

    if (route === "/") home();
    else if (route === "/phases") phases();
    else if (route === "/search") searchPage();
    else if (route === "/bookmarks") bookmarks();
    else if (route === "/settings") settings();
    else if (route === "/release") release();
    else if (parts.length === 2) {
      let id;
      try { id = decodeURIComponent(parts[1]); } catch { return missing(); }

      if (parts[0] === "phases") phasePage(id);
      else if (parts[0] === "modules") modulePage(id);
      else if (parts[0] === "lessons") lessonPage(id);
      else if (parts[0] === "topics") topicPage(id);
      else missing();
    } else missing();

    navigation();
    document.title =
      `${main.querySelector("h1")?.textContent || "Studio"} | Launchpad`;
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  function updateQuickSearch() {
    const matches = searchTopics(course.topics, quickInput.value);
    document.getElementById("quick-count").textContent =
      `${matches.length} matching topic${matches.length === 1 ? "" : "s"}.`;

    document.getElementById("quick-results").innerHTML =
      matches.map(topic => `
        <a href="#/topics/${topic.id}">
          <strong>${e(topic.title)}</strong>
          <small>${e(topic.summary)}</small>
        </a>
      `).join("") || "<p>No matches. Try a shorter search.</p>";
  }

  function openSearch() {
    if (dialog.open) return;
    quickInput.value = "";
    updateQuickSearch();
    dialog.showModal();
    quickInput.focus();
  }

  document.getElementById("search-open").onclick = openSearch;
  document.getElementById("search-close").onclick = () => dialog.close();
  quickInput.oninput = updateQuickSearch;

  document.addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) &&
        !event.altKey && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (dialog.open) dialog.close();
      else openSearch();
    }
  });

  document.getElementById("quick-results").onclick = event => {
    const link = event.target.closest("a");
    if (!link) return;

    event.preventDefault();
    const target = link.getAttribute("href");
    dialog.close();

    if (location.hash === target) render();
    else location.hash = target;

    requestAnimationFrame(() => main.focus({ preventScroll: true }));
  };

  document.getElementById("theme-toggle").onclick = () => {
    const current = preferences.get();
    const saved = safe(() => preferences.save({
      ...current,
      theme: current.theme === "dark" ? "light" : "dark"
    }));
    if (saved) applyTheme();
  };

  document.getElementById("menu-toggle").onclick = () => {
    const hidden = document.getElementById("app-layout")
      .classList.toggle("menu-closed");
    document.getElementById("menu-toggle")
      .setAttribute("aria-expanded", String(!hidden));
  };

  document.getElementById("sidebar").onclick = event => {
    if (event.target.closest("a") && matchMedia("(max-width:760px)").matches) {
      document.getElementById("app-layout").classList.add("menu-closed");
      document.getElementById("menu-toggle").setAttribute("aria-expanded", "false");
    }
  };

  document.querySelector(".skip-link").onclick = event => {
    event.preventDefault();
    main.focus();
    main.scrollIntoView();
  };

  if (matchMedia("(max-width:760px)").matches) {
    document.getElementById("app-layout").classList.add("menu-closed");
    document.getElementById("menu-toggle").setAttribute("aria-expanded", "false");
  }

  window.addEventListener("hashchange", render);

  applyTheme();
  render();

  if (preferences.status().blocked || learning.status().blocked) {
    notify("Some saved data could not be loaded. Open Settings for recovery options.");
  }
}

start().catch(fatal);