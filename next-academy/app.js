const main = document.getElementById("main");
const toastElement = document.getElementById("toast");

let toastTimer;

function toast(message) {
  clearTimeout(toastTimer);
  toastElement.textContent = message;
  toastTimer = setTimeout(() => {
    toastElement.textContent = "";
  }, 6500);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
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

function showStartupError(error) {
  main.replaceChildren();

  const section = document.createElement("section");
  section.className = "card";

  const heading = document.createElement("h1");
  heading.textContent = "The studio could not start.";

  const explanation = document.createElement("p");
  explanation.textContent =
    "Check that index.html, styles.css, schema.js, catalog.js, store.js, and app.js are together inside next-academy.";

  const detail = document.createElement("pre");
  detail.textContent = String(error.message || error);

  const reload = document.createElement("button");
  reload.type = "button";
  reload.textContent = "Reload page";
  reload.onclick = () => location.reload();

  section.append(heading, explanation, detail, reload);
  main.append(section);
}

async function start() {
  const [
    { catalog },
    { validateCatalog },
    { createPreferencesStore, validatePreferences }
  ] = await Promise.all([
    import("./catalog.js"),
    import("./schema.js"),
    import("./store.js")
  ]);

  const contentErrors = validateCatalog(catalog);

  if (contentErrors.length) {
    throw new Error(contentErrors.join("\n"));
  }

  let storage;

  try {
    storage = window.localStorage;
  } catch {
    storage = {
      getItem() {
        throw new Error("Browser storage access is blocked.");
      },
      setItem() {
        throw new Error("Browser storage access is blocked.");
      },
      removeItem() {
        throw new Error("Browser storage access is blocked.");
      }
    };
  }

  const store = createPreferencesStore(storage);

  const navigation = [
    ["/", "⌂", "Studio home"],
    ["/phases", "▦", "Course map"],
    ["/settings", "⚙", "Settings & backup"],
    ["/release", "↗", "Build status"]
  ];

  function applyTheme() {
    const preferences = store.get();
    document.documentElement.dataset.theme = preferences.theme;
    document.getElementById("theme-toggle").textContent =
      preferences.theme === "dark" ? "Light mode" : "Dark mode";
  }

  function renderNavigation() {
    const route = location.hash.slice(1) || "/";

    document.getElementById("navigation").innerHTML =
      navigation.map(([path, symbol, label]) => `
        <a href="#${path}" ${route === path ? 'aria-current="page"' : ""}>
          <span class="nav-symbol" aria-hidden="true">${symbol}</span>
          <span>${label}</span>
        </a>
      `).join("") +
      '<a href="./checks.html"><span class="nav-symbol" aria-hidden="true">✓</span><span>System checks</span></a>';
  }

  const heroArt = `
    <svg class="hero-graphic" viewBox="0 0 340 270"
      aria-hidden="true" focusable="false">
      <ellipse cx="180" cy="235" rx="125" ry="18"
        fill="#050913" opacity=".3"/>

      <circle cx="181" cy="129" r="106"
        fill="#ffffff" opacity=".04"/>

      <rect x="35" y="48" width="265" height="172" rx="20"
        fill="#17223b" stroke="#8392ba"/>

      <path d="M35 84h265" stroke="#586788"/>

      <circle cx="55" cy="66" r="4" fill="#F472B6"/>
      <circle cx="70" cy="66" r="4" fill="#FBBF24"/>
      <circle cx="85" cy="66" r="4" fill="#34D399"/>

      <rect x="113" y="59" width="120" height="14" rx="7"
        fill="#334360"/>

      <path d="m100 112-25 26 25 26m131-52 25 26-25 26m-56-61-17 72"
        fill="none" stroke="#b6a5ff" stroke-width="7"
        stroke-linecap="round" stroke-linejoin="round"/>

      <rect x="250" y="175" width="58" height="58" rx="17"
        fill="#145667"/>

      <path d="M266 204h26m-13-13v26"
        stroke="#91ecf7" stroke-width="4" stroke-linecap="round"/>

      <circle cx="297" cy="30" r="10" fill="#F472B6"/>
      <circle cx="30" cy="191" r="7" fill="#22D3EE"/>
    </svg>`;

  function phaseCards() {
    return `<div class="grid">
      ${catalog.phases.map(phase => `
        <a class="phase-card" href="#/phases/${phase.id}">
          <span class="phase-number">${phase.order}</span>
          <span class="badge">Content not installed yet</span>
          <h3>${escapeHTML(phase.title)}</h3>
          <p>${escapeHTML(phase.description)}</p>
          <strong>View phase →</strong>
        </a>
      `).join("")}
    </div>`;
  }

  function home() {
    const preferences = store.get();

    main.innerHTML = `
      <section class="hero">
        <div>
          <p class="eyebrow">YOUR NEW LEARNING STUDIO</p>
          <h1>Start curious.<br><em>Build with confidence.</em></h1>
          <p>
            Welcome, ${escapeHTML(preferences.name)}.
            This is the foundation for your Python and TypeScript
            automation academy.
          </p>
          <div class="actions">
            <a class="button primary" href="#/phases">Explore the course map →</a>
            <a class="button" href="#/settings">Personalize your studio</a>
          </div>
        </div>
        ${heroArt}
      </section>

      <div class="grid">
        <section class="card stat">
          <strong>${catalog.phases.length}</strong>
          <span>Course phases defined</span>
        </section>
        <section class="card stat">
          <strong>${catalog.topics.length}</strong>
          <span>Topics installed in Release A</span>
        </section>
        <section class="card stat">
          <strong>${preferences.weeklyGoalMinutes} min</strong>
          <span>Your saved weekly goal—not recorded study time</span>
        </section>
      </div>

      <section class="card">
        <span class="badge">FOUNDATION RELEASE</span>
        <h2>A working base, without pretend content</h2>
        <p>
          Navigation, appearance, settings, backup/restore, and schema checks
          are implemented here.
        </p>
        <p>
          Lessons, exercises, tracking, and assessments are not yet installed.
          They will arrive as separate, verified releases.
        </p>
        <a class="button" href="./checks.html">Run the system checks</a>
      </section>

      <section class="card">
        <h2>Your learning path</h2>
        ${phaseCards()}
      </section>
    `;
  }

  function phases() {
    main.innerHTML = `
      <p class="eyebrow">THE COMPLETE JOURNEY</p>
      <h1>Nine phases. One structured path.</h1>
      <p class="muted">
        These are phase descriptions, not a claim that their lessons have
        already been written or installed.
      </p>
      ${phaseCards()}
    `;
  }

  function phasePage(id) {
    const phase = catalog.phases.find(item => item.id === id);

    if (!phase) {
      notFound();
      return;
    }

    main.innerHTML = `
      <p class="small"><a href="#/phases">← All phases</a></p>
      <span class="badge">PHASE ${phase.order}</span>
      <h1>${escapeHTML(phase.title)}</h1>

      <section class="card">
        <p>${escapeHTML(phase.description)}</p>
        <h2>Learning material is not installed yet</h2>
        <p>
          This foundation release establishes the page and data structure.
          Upcoming content releases will add separate modules, lessons,
          and topics without disguising empty entries as completed material.
        </p>
        <a class="button" href="#/release">See the delivery sequence</a>
      </section>
    `;
  }

  function releasePage() {
    main.innerHTML = `
      <h1>What is available in this build?</h1>

      <section class="card">
        <h2>Release A — implemented</h2>
        <ul>
          <li>Application startup and understandable startup errors.</li>
          <li>Dark/light theme and collapsible navigation.</li>
          <li>Nine-phase course map.</li>
          <li>Versioned preferences and a persistence adapter.</li>
          <li>Settings backup, validated restore, and scoped reset.</li>
          <li>Content-schema validation and browser-run checks.</li>
        </ul>
      </section>

      <section class="card">
        <h2>Next releases — not implemented yet</h2>
        <ol>
          <li>Learning workspace, topic navigation, search, and checkpoints.</li>
          <li>Dashboard, weekly planner, tracker, and progress records.</li>
          <li>Fully authored Phase 0 modules.</li>
          <li>Fully authored Phase 1 modules.</li>
          <li>Exact Phase 2–8 topic inventory and subsequent content releases.</li>
          <li>Verification, refinement, and public-site replacement.</li>
        </ol>
      </section>

      <section class="card">
        <h2>Honest limits</h2>
        <p>
          This static application does not run Python, TypeScript,
          Playwright, or an AI provider. No performance score or
          accessibility certification has been measured here.
        </p>
      </section>
    `;
  }

  function settings() {
    const preferences = store.get();
    const status = store.status();

    main.innerHTML = `
      <h1>Make the studio yours</h1>

      ${status.blocked ? `
        <div class="notice danger">
          <strong>Automatic saving is blocked.</strong>
          <p>${escapeHTML(status.startupError)}</p>
          <p>Export the stored data before an explicit restore or reset.</p>
          <button id="export-raw" type="button">Export untouched stored data</button>
        </div>
      ` : ""}

      <section class="card">
        <h2>Your preferences</h2>

        <form id="preferences-form">
          <label for="learner-name">Display name</label>
          <input id="learner-name" maxlength="60" required>

          <label for="weekly-goal">Weekly goal in minutes</label>
          <input id="weekly-goal" type="number"
            min="15" max="3000" step="1" required>

          <p class="small muted">
            This saves a goal only. Time tracking is not part of Release A.
            No email address or account is required.
          </p>

          <button class="primary" type="submit">Save preferences</button>
          <p id="preferences-message" role="status"></p>
        </form>
      </section>

      <section class="card">
        <h2>Backup and restore</h2>

        <p>
          This release backs up your display name, theme, and weekly goal.
          It does not import previous academy progress.
        </p>

        <button id="export-backup" type="button">Download preferences backup</button>

        <label for="import-backup">Restore a Release A backup</label>
        <input id="import-backup" type="file" accept=".json,application/json">

        <p id="import-message" role="status"></p>
      </section>

      <section class="card">
        <h2>Reset this build's preferences</h2>
        <p>
          This removes only the new foundation settings.
          It does not clear the old academy's browser data.
        </p>
        <button id="reset-preferences" type="button">Reset foundation preferences</button>
      </section>
    `;

    document.getElementById("learner-name").value = preferences.name;
    document.getElementById("weekly-goal").value = preferences.weeklyGoalMinutes;

    document.getElementById("preferences-form").onsubmit = event => {
      event.preventDefault();

      try {
        store.save({
          ...store.get(),
          name: document.getElementById("learner-name").value,
          weeklyGoalMinutes: Number(document.getElementById("weekly-goal").value)
        });

        document.getElementById("preferences-message").textContent =
          "Preferences saved.";
        toast("Your studio preferences are saved.");
      } catch (error) {
        document.getElementById("preferences-message").textContent =
          String(error.message || error);
      }
    };

    document.getElementById("export-backup").onclick = () => {
      download(
        JSON.stringify(store.get(), null, 2),
        "launchpad-foundation-preferences.json"
      );
    };

    const rawButton = document.getElementById("export-raw");
    if (rawButton) {
      rawButton.onclick = () => {
        try {
          download(
            store.raw() ?? "",
            "launchpad-untouched-storage.txt",
            "text/plain"
          );
        } catch (error) {
          toast(String(error.message || error));
        }
      };
    }

    document.getElementById("import-backup").onchange = async event => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        if (file.size > 100000) {
          throw new Error("This preferences backup exceeds the 100 KB limit.");
        }

        const candidate = validatePreferences(JSON.parse(await file.text()));

        if (!window.confirm("Replace this build's preferences with this backup?")) {
          return;
        }

        store.restore(candidate);
        applyTheme();
        settings();
        toast("Preferences restored.");
      } catch (error) {
        const message = document.getElementById("import-message");
        if (message) {
          message.textContent = "Restore rejected: " + String(error.message || error);
        }
      }
    };

    document.getElementById("reset-preferences").onclick = () => {
      if (!window.confirm("Reset only this foundation build's preferences?")) return;

      try {
        store.reset();
        applyTheme();
        settings();
        toast("Foundation preferences reset.");
      } catch (error) {
        toast("Reset failed: " + String(error.message || error));
      }
    };
  }

  function notFound() {
    main.innerHTML = `
      <section class="card">
        <span class="badge">404 · WRONG TURN, NOT A DEAD END</span>
        <h1>This page is not in the studio.</h1>
        <p>Your learning journey is still here.</p>
        <a class="button primary" href="#/">Return to the studio</a>
      </section>
    `;
  }

  function render() {
    const route = location.hash.slice(1) || "/";

    if (route === "/") home();
    else if (route === "/phases") phases();
    else if (/^\/phases\/phase-\d+$/.test(route)) {
      phasePage(route.split("/").at(-1));
    } else if (route === "/settings") settings();
    else if (route === "/release") releasePage();
    else notFound();

    renderNavigation();

    document.title =
      `${main.querySelector("h1")?.textContent || "Studio"} | Launchpad`;

    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  document.getElementById("theme-toggle").onclick = () => {
    try {
      const current = store.get();
      store.save({
        ...current,
        theme: current.theme === "dark" ? "light" : "dark"
      });
      applyTheme();
    } catch (error) {
      toast(String(error.message || error));
    }
  };

  document.getElementById("menu-toggle").onclick = () => {
    const hidden = document.getElementById("app-layout")
      .classList.toggle("menu-closed");

    document.getElementById("menu-toggle")
      .setAttribute("aria-expanded", String(!hidden));
  };

  document.getElementById("navigation").addEventListener("click", event => {
    if (
      event.target.closest("a") &&
      window.matchMedia("(max-width: 760px)").matches
    ) {
      document.getElementById("app-layout").classList.add("menu-closed");
      document.getElementById("menu-toggle").setAttribute("aria-expanded", "false");
    }
  });

  document.querySelector(".skip-link").onclick = event => {
    event.preventDefault();
    main.focus();
    main.scrollIntoView();
  };

  if (window.matchMedia("(max-width: 760px)").matches) {
    document.getElementById("app-layout").classList.add("menu-closed");
    document.getElementById("menu-toggle").setAttribute("aria-expanded", "false");
  }

  window.addEventListener("hashchange", render);

  applyTheme();
  render();

  if (store.status().blocked) {
    toast("Stored preferences could not be loaded. Open Settings for recovery options.");
  }
}

start().catch(showStartupError);