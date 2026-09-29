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
  const detail = document.createElement("pre");
  detail.textContent = String(error.message || error);
  const note = document.createElement("p");
  note.textContent = "Verify that all Release A/B dependencies and Release C files are saved inside next-academy.";
  card.append(title, note, detail);
  main.append(card);
}

async function start() {
  const [
    { course, courseErrors },
    { createPreferencesStore, validatePreferences },
    { createLearningStore, validateLearning },
    { escapeHTML: e, searchTopics, topicCards, renderTopic },
    { createActivityStore, ACTIVITY_KEY },
    { createActivityViews }
  ] = await Promise.all([
    import("./course.js"),
    import("./store.js"),
    import("./learning-store.js"),
    import("./learning-ui.js"),
    import("./activity.js"),
    import("./activity-ui.js")
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
  const topicIds = course.topics.map(t => t.id);
  const learning = createLearningStore(storage, topicIds);
  const activity = createActivityStore(storage, course);

  const views = createActivityViews({
    root: main, course, preferences, learning, activity, notify, download
  });

  const dialog = document.getElementById("search-dialog");
  const quickInput = document.getElementById("quick-search");

  function applyTheme() {
    const value = preferences.get().theme;
    document.documentElement.dataset.theme = value;
    document.getElementById("theme-toggle").textContent =
      value === "dark" ? "Light mode" : "Dark mode";
  }

  function safe(action) {
    try { return action(); }
    catch (error) { notify(String(error.message || error)); return null; }
  }

  function navigation() {
    const route = location.hash.slice(1) || "/";
    const links = [
      ["/", "⌂", "Dashboard"],
      ["/planner", "▦", "Weekly planner"],
      ["/tracker", "◷", "Activity tracker"],
      ["/achievements", "✦", "Achievements"],
      ["/phases", "▤", "Course map"],
      ["/search", "⌕", "Search topics"],
      ["/bookmarks", "★", "Bookmarks"],
      ["/settings", "⚙", "Settings & backups"],
      ["/release", "↗", "Build status"]
    ];

    document.getElementById("navigation").innerHTML =
      links.map(([path, symbol, title]) => `
        <a href="#${path}" ${route === path || (path === "/" && route === "/dashboard") ? 'aria-current="page"' : ""}>
          <span class="nav-symbol" aria-hidden="true">${symbol}</span>
          <span>${title}</span>
        </a>`).join("") +
      '<a href="./checks.html">Release A checks</a>' +
      '<a href="./learning-checks.html">Release B checks</a>' +
      '<a href="./activity-checks.html">Release C checks</a>';

    document.getElementById("course-tree").innerHTML = `
      <div class="course-tree"><p class="eyebrow">PHASE → MODULE → LESSON</p>
        ${course.phases.map(phase => {
          const modules = course.modules.filter(m => m.phaseId === phase.id);
          return `<details ${modules.length ? "open" : ""}>
            <summary>Phase ${phase.order}: ${e(phase.title)}</summary>
            <nav aria-label="Phase ${phase.order}">
              <a href="#/phases/${phase.id}">Phase overview</a>
            </nav>
            ${modules.length ? modules.map(module => `
              <details open><summary>${e(module.title)}</summary>
                <nav aria-label="${e(module.title)}">
                  <a href="#/modules/${module.id}">Module overview</a>
                  ${course.lessons.filter(l => l.moduleId === module.id).map(lesson => `
                    <a href="#/lessons/${lesson.id}">${e(lesson.title)}</a>`).join("")}
                </nav>
              </details>`).join("") : '<p class="small muted">Content not installed yet.</p>'}
          </details>`;
        }).join("")}
      </div>`;
  }

  function phases() {
    main.innerHTML = `<h1>Your course map</h1>
      <p class="muted">Only the interface-review module is installed.</p>
      <div class="grid">${course.phases.map(phase => `
        <a class="phase-card" href="#/phases/${phase.id}">
          <span class="phase-number">${phase.order}</span>
          <h3>${e(phase.title)}</h3>
          <p>${e(phase.description)}</p>
        </a>`).join("")}</div>`;
  }

  function phasePage(id) {
    const phase = course.phases.find(p => p.id === id);
    if (!phase) return missing();
    const modules = course.modules.filter(m => m.phaseId === id);

    main.innerHTML = `
      <p class="breadcrumbs"><a href="#/phases">Course map</a> / Phase ${phase.order}</p>
      <h1>${e(phase.title)}</h1><p>${e(phase.description)}</p>
      ${modules.length ? `<div class="grid">${modules.map(module => `
        <a class="phase-card" href="#/modules/${module.id}">
          <span class="badge">Interface review</span>
          <h2>${e(module.title)}</h2><p>${e(module.description)}</p>
        </a>`).join("")}</div>` :
        '<section class="card"><h2>Content not installed</h2><p>This phase is not a completed course module.</p></section>'}`;
  }

  function modulePage(id) {
    const module = course.modules.find(m => m.id === id);
    if (!module) return missing();
    const phase = course.phases.find(p => p.id === module.phaseId);

    main.innerHTML = `
      <p class="breadcrumbs"><a href="#/phases/${phase.id}">Phase ${phase.order}</a> / Module</p>
      <h1>${e(module.title)}</h1><p>${e(module.description)}</p>
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
      <p class="breadcrumbs"><a href="#/modules/${module.id}">${e(module.title)}</a> / Lesson</p>
      <h1>${e(lesson.title)}</h1><p>${e(lesson.summary)}</p>
      ${topicCards(course.topics.filter(t => t.lessonId === id), learning)}`;
  }

  function topicPage(id) {
    const topic = course.topics.find(t => t.id === id && t.status === "published");
    if (!topic) return missing();
    const lesson = course.lessons.find(l => l.id === topic.lessonId);
    const module = course.modules.find(m => m.id === lesson.moduleId);
    const phase = course.phases.find(p => p.id === module.phaseId);

    safe(() => learning.visit(id));

    renderTopic({
      root: main, topic, learning, notify, copy, download,
      breadcrumbs: `<p class="breadcrumbs">
        <a href="#/phases/${phase.id}">Phase ${phase.order}</a> /
        <a href="#/modules/${module.id}">Module</a> /
        <a href="#/lessons/${lesson.id}">${e(lesson.title)}</a> / Topic
      </p>`
    });

    views.addTopicControls(topic);
  }

  function searchPage() {
    main.innerHTML = `<h1>Search topics</h1>
      <label for="page-search">Search titles, summaries, and tags</label>
      <input id="page-search" type="search" autocomplete="off">
      <p id="page-count" role="status"></p><div id="page-results"></div>`;

    function update() {
      const matches = searchTopics(course.topics, document.getElementById("page-search").value);
      document.getElementById("page-count").textContent = `${matches.length} matching topic(s).`;
      document.getElementById("page-results").innerHTML =
        matches.length ? topicCards(matches, learning) :
        '<section class="card"><p>No matches. Try assertion or Python.</p></section>';
    }

    document.getElementById("page-search").oninput = update;
    update();
  }

  function bookmarks() {
    const ids = learning.get().bookmarks;
    const topics = course.topics.filter(t => ids.includes(t.id));
    main.innerHTML = `<h1>Your bookmarks</h1>${topics.length ? topicCards(topics, learning) :
      '<section class="card"><p>No bookmarks yet.</p><a class="button" href="#/search">Find a topic</a></section>'}`;
  }

  function backupSection(id, title, status) {
    return `<section class="card">
      <h2>${title}</h2>
      ${status.blocked ? `<div class="notice danger">${e(status.startupError)}</div>` : ""}
      <p class="small muted">This section replaces or resets only its own data category.</p>
      <div class="actions">
        <button id="${id}-export">Export backup</button>
        <button id="${id}-raw">Export untouched stored data</button>
        <button id="${id}-reset">Reset category</button>
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
      download(store.raw() ?? "", `launchpad-${id}-raw.txt`, "text/plain"));

    document.getElementById(id + "-reset").onclick = () => {
      if (!confirm(`Reset only ${id}? Export first.`)) return;
      safe(() => {
        store.reset();
        applyTheme();
        settings();
        notify("Data category reset.");
      });
    };

    document.getElementById(id + "-import").onchange = async event => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        if (file.size > 2_000_000) throw new Error("Maximum size is 2 MB.");
        const clean = validator(JSON.parse(await file.text()));
        if (!confirm(`Replace ${id} with this validated backup?`)) return;
        store.restore(clean);
        applyTheme();
        settings();
        notify("Backup restored.");
      } catch (error) {
        const result = document.getElementById(id + "-status");
        if (result) result.textContent = "Restore rejected: " + error.message;
      }
    };
  }

  function settings() {
    const current = preferences.get();
    main.innerHTML = `<h1>Settings and backups</h1>
      <section class="card"><h2>Preferences</h2>
        <form id="preferences-form">
          <label for="name">Display name</label><input id="name" required maxlength="60">
          <label for="goal">Weekly study goal in minutes</label>
          <input id="goal" type="number" min="15" max="3000" step="1" required>
          <p class="small muted">The goal is separate from planner capacity.
          Your daily logs determine actual time.</p>
          <button class="primary">Save preferences</button>
          <p id="preferences-status" role="status"></p>
        </form>
      </section>
      ${backupSection("preferences", "Release A preferences", preferences.status())}
      ${backupSection("learning", "Release B notes, drafts, and bookmarks", learning.status())}
      <section class="card"><h2>Release C activity records</h2>
        <p>Schedules, completion dates, study logs, and challenges have a separate backup.</p>
        <a class="button" href="#/activity-data">Activity backup & recovery</a>
      </section>`;

    document.getElementById("name").value = current.name;
    document.getElementById("goal").value = current.weeklyGoalMinutes;

    document.getElementById("preferences-form").onsubmit = event => {
      event.preventDefault();
      try {
        preferences.save({
          ...preferences.get(),
          name: document.getElementById("name").value,
          weeklyGoalMinutes: Number(document.getElementById("goal").value)
        });
        document.getElementById("preferences-status").textContent = "Saved.";
      } catch (error) {
        document.getElementById("preferences-status").textContent = "Not saved: " + error.message;
      }
    };

    bindBackup("preferences", preferences, validatePreferences);
    bindBackup("learning", learning, raw => validateLearning(raw, topicIds));
  }

  function release() {
    main.innerHTML = `<h1>Release C status</h1>
      <section class="card"><h2>Implemented</h2><ul>
        <li>Dashboard with actual learner-recorded activity.</li>
        <li>Weekly planning using installed topic estimates.</li>
        <li>Catch-up scheduling and a seven-day break option.</li>
        <li>Daily logs, current/longest streak, heatmap, charts, and text equivalents.</li>
        <li>Derived achievements and reversible completion records.</li>
        <li>Calendar, Markdown, print, and activity JSON export.</li>
      </ul></section>
      <section class="card"><h2>Important limits</h2>
        <p>One interface-review topic is installed. Full course content arrives later.</p>
        <p>Study time is entered manually. Challenge success is self-reported.
        Quizzes do not certify completion. No live AI or test runner exists in this browser app.</p>
        <p>The activity store detects conflicting writes from another tab.
        Existing preference and learning stores retain their Release B behavior.
        Use one editing tab for notes and preferences.</p>
        <p>Plan allocations are reminders. Partial reminder completion is not tracked.</p>
      </section>`;
  }

  function missing() {
    main.innerHTML = `<section class="card"><span class="badge">404</span>
      <h1>This page is not in the studio.</h1><a class="button primary" href="#/">Dashboard</a></section>`;
  }

  function render() {
    const route = location.hash.slice(1) || "/";
    const pages = {
      "/": views.dashboard,
      "/dashboard": views.dashboard,
      "/planner": views.planner,
      "/tracker": views.tracker,
      "/achievements": views.achievements,
      "/activity-data": views.dataPage,
      "/phases": phases,
      "/search": searchPage,
      "/bookmarks": bookmarks,
      "/settings": settings,
      "/release": release
    };

    if (Object.prototype.hasOwnProperty.call(pages, route)) {
      pages[route]();
    } else {
      const parts = route.split("/").filter(Boolean);
      const handlers = { phases: phasePage, modules: modulePage, lessons: lessonPage, topics: topicPage };
      if (parts.length === 2 && Object.prototype.hasOwnProperty.call(handlers, parts[0])) {
        try { handlers[parts[0]](decodeURIComponent(parts[1])); }
        catch (error) { fatal(error); }
      } else missing();
    }

    navigation();
    document.title = `${main.querySelector("h1")?.textContent || "Studio"} | Launchpad`;
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  function updateQuickSearch() {
    const matches = searchTopics(course.topics, quickInput.value);
    document.getElementById("quick-count").textContent = `${matches.length} matching topic(s).`;
    document.getElementById("quick-results").innerHTML = matches.map(t => `
      <a href="#/topics/${t.id}"><strong>${e(t.title)}</strong><small>${e(t.summary)}</small></a>`
    ).join("") || "<p>No matches.</p>";
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
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === "k") {
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
    if (safe(() => preferences.save({
      ...current, theme: current.theme === "dark" ? "light" : "dark"
    }))) applyTheme();
  };

  document.getElementById("menu-toggle").onclick = () => {
    const hidden = document.getElementById("app-layout").classList.toggle("menu-closed");
    document.getElementById("menu-toggle").setAttribute("aria-expanded", String(!hidden));
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

  window.addEventListener("storage", event => {
    if (event.key === ACTIVITY_KEY || event.key === null) {
      notify("Activity storage changed in another tab. Reload before editing activity.");
    }
  });

  window.addEventListener("hashchange", render);
  applyTheme();
  render();

  if (preferences.status().blocked || learning.status().blocked || activity.status().blocked) {
    notify("Some stored data could not be read. Use Settings or Activity data for recovery.");
  }
}

start().catch(fatal);