(() => {
  "use strict";

  const main = document.getElementById("main");
  const dialog = document.getElementById("quick-dialog");
  const openButton = document.getElementById("quick-open");
  const closeButton = document.getElementById("quick-close");
  const searchInput = document.getElementById("quick-input");
  const results = document.getElementById("quick-results");
  const resultCount = document.getElementById("quick-count");
  const readingTrack = document.getElementById("reading-track");
  const readingFill = document.getElementById("reading-fill");
  const backTop = document.getElementById("back-top");

  if (
    !main ||
    !dialog ||
    !openButton ||
    !closeButton ||
    !searchInput ||
    !results ||
    !resultCount ||
    !readingTrack ||
    !readingFill ||
    !backTop
  ) {
    console.warn("Launchpad visual enhancements could not find their page elements.");
    return;
  }

  const course = window.COURSE;

  if (!course || !Array.isArray(course.lessons)) {
    console.warn("Launchpad visual enhancements could not load course data.");
    return;
  }

  const pageEntries = [
    {
      title: "My dashboard",
      description: "Your next activity and real learning progress.",
      href: "#dashboard",
      type: "Page"
    },
    {
      title: "My learning profile",
      description: "Operating system, study days, goals, and session length.",
      href: "#onboarding",
      type: "Page"
    },
    {
      title: "Weekly planner",
      description: "Review dates, reschedule unfinished work, and export your calendar.",
      href: "#planner",
      type: "Page"
    },
    {
      title: "Full learning roadmap",
      description: "See available foundations and the planned advanced tracks.",
      href: "#roadmap",
      type: "Page"
    },
    {
      title: "AI Integration Academy",
      description: "Safe AI assistance introduction and the planned integration track.",
      href: "#ai",
      type: "Page"
    },
    {
      title: "Backup and restore",
      description: "Export or restore your browser-local learning record.",
      href: "#backup",
      type: "Page"
    }
  ];

  const lessonEntries = course.lessons.map((lesson, index) => ({
    title: lesson.title,
    description: lesson.objective,
    href: "#lesson/" + lesson.id,
    type: "Lesson " + String(index + 1).padStart(2, "0")
  }));

  const searchEntries = [...pageEntries, ...lessonEntries];

  /*
   * Decorative illustration only.
   * It contains no run results, completion counts, or fabricated activity.
   */
  const heroIllustration = `
    <div class="hero-visual" aria-hidden="true">
      <svg viewBox="0 0 420 330" focusable="false">
        <ellipse cx="220" cy="289" rx="142" ry="20"
                 fill="#061420" opacity=".18"/>

        <circle cx="222" cy="161" r="123"
                fill="#ffffff" opacity=".06"/>

        <circle cx="222" cy="161" r="98"
                fill="none" stroke="#ffffff" stroke-opacity=".13"/>

        <g class="float-one">
          <path d="M70 91 281 62 334 91 123 121Z"
                fill="#a6d1ea"/>

          <path d="m70 91 53 30v141l-53-29Z"
                fill="#005c95"/>

          <path d="m123 121 211-30v142l-211 29Z"
                fill="#f2f9fe"/>

          <path d="m123 121 211-30v29l-211 30Z"
                fill="#0c2536"/>

          <circle cx="141" cy="133" r="3" fill="#e8a317"/>
          <circle cx="152" cy="131" r="3" fill="#85bc20"/>
          <circle cx="163" cy="130" r="3" fill="#409bd2"/>

          <path d="m148 174 54-8m-54 24 103-15m-103 31 76-11"
                fill="none" stroke="#a6d1ea" stroke-width="7"
                stroke-linecap="round"/>

          <path d="m276 146-16 19 16 13m21-37 15 13-15 18"
                fill="none" stroke="#007ac3" stroke-width="5"
                stroke-linecap="round" stroke-linejoin="round"/>

          <path d="m280 214 29-4"
                stroke="#85bc20" stroke-width="7"
                stroke-linecap="round"/>
        </g>

        <g class="float-two">
          <rect x="31" y="150" width="73" height="73" rx="20"
                fill="#eef6dc"/>

          <path d="M49 172h36v28H49Zm0 7h36m-28-12v10m19-10v10"
                fill="none" stroke="#355b0b" stroke-width="2.8"
                stroke-linejoin="round"/>

          <path d="M58 187h5m8 0h5m-18 6h5"
                stroke="#355b0b" stroke-width="2.8"
                stroke-linecap="round"/>
        </g>

        <g class="float-two">
          <rect x="298" y="37" width="78" height="78" rx="23"
                fill="#fdf3dd"/>

          <path d="m324 73 13-17 13 17-13 21-13-21Z"
                fill="#e8a317"/>

          <path d="M337 64v17m-5-8h10"
                stroke="#765000" stroke-width="2.5"
                stroke-linecap="round"/>
        </g>

        <circle cx="58" cy="61" r="7" fill="#85bc20"/>
        <circle cx="369" cy="226" r="6" fill="#a6d1ea"/>

        <path d="M79 275v13m-6-6h13M371 150v13m-6-6h13"
              stroke="#ffffff" stroke-opacity=".7"
              stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </div>`;

  function renderSearch() {
    const query = searchInput.value.trim().toLowerCase();
    const words = query.split(/\s+/).filter(Boolean);

    const matches = searchEntries.filter(entry => {
      const text = (
        entry.title + " " + entry.description + " " + entry.type
      ).toLowerCase();

      return words.every(word => text.includes(word));
    });

    results.replaceChildren();

    for (const entry of matches) {
      const link = document.createElement("a");
      link.href = entry.href;

      const copy = document.createElement("span");
      copy.className = "quick-result-copy";

      const title = document.createElement("strong");
      title.textContent = entry.title;

      const description = document.createElement("small");
      description.textContent = entry.description;

      const type = document.createElement("span");
      type.className = "quick-result-type";
      type.textContent = entry.type;

      copy.append(title, description);
      link.append(copy, type);
      results.append(link);
    }

    resultCount.textContent = matches.length
      ? `${matches.length} matching destination${matches.length === 1 ? "" : "s"}.`
      : "No matches. Try a simpler term such as Python, setup, or planner.";
  }

  function openSearch() {
    if (dialog.open) return;

    searchInput.value = "";
    renderSearch();

    dialog.showModal();
    searchInput.focus();
  }

  function closeSearch() {
    if (dialog.open) dialog.close();
  }

  openButton.addEventListener("click", openSearch);
  closeButton.addEventListener("click", closeSearch);
  searchInput.addEventListener("input", renderSearch);

  document.addEventListener("keydown", event => {
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "k" &&
      !event.altKey
    ) {
      event.preventDefault();

      if (dialog.open) {
        closeSearch();
      } else {
        openSearch();
      }
    }
  });

  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;

    const bounds = dialog.getBoundingClientRect();
    const outside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (outside) closeSearch();
  });

  results.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (!link) return;

    closeSearch();

    /*
     * Close first, allow the normal hash navigation, then put focus
     * on the destination content rather than retaining it in search.
     */
    requestAnimationFrame(() => {
      main.focus({ preventScroll: true });
    });
  });

  function updateReadingProgress() {
    const isLesson = location.hash.startsWith("#lesson/");

    readingTrack.hidden = !isLesson;
    backTop.hidden = window.scrollY < 550;

    if (!isLesson) {
      readingFill.style.transform = "scaleX(0)";
      return;
    }

    const mainTop = main.getBoundingClientRect().top + window.scrollY;
    const availableScroll = main.scrollHeight - window.innerHeight;
    const position = window.scrollY - mainTop;

    const ratio = availableScroll <= 0
      ? 1
      : Math.max(0, Math.min(1, position / availableScroll));

    readingFill.style.transform = `scaleX(${ratio})`;
  }

  let scrollPending = false;

  function queueReadingUpdate() {
    if (scrollPending) return;

    scrollPending = true;

    requestAnimationFrame(() => {
      scrollPending = false;
      updateReadingProgress();
    });
  }

  window.addEventListener("scroll", queueReadingUpdate, { passive: true });
  window.addEventListener("resize", queueReadingUpdate);

  // Expanding hints and solutions changes the lesson's height.
  main.addEventListener("toggle", queueReadingUpdate, true);

  backTop.addEventListener("click", () => {
    // Instant scrolling avoids moving keyboard focus while an animation runs.
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  });

  function enhancePage() {
    const route = location.hash.slice(1) || "dashboard";
    document.body.dataset.view = route.startsWith("lesson/")
      ? "lesson"
      : route;

    const hero = main.querySelector(".hero");

    if (hero && !hero.dataset.experienceReady) {
      hero.dataset.experienceReady = "true";

      const oldArt = hero.querySelector(".hero-art");

      if (oldArt) {
        oldArt.outerHTML = heroIllustration;
      } else {
        hero.insertAdjacentHTML("beforeend", heroIllustration);
      }
    }

    main.querySelectorAll(".lesson-card").forEach(card => {
      if (card.dataset.experienceReady) return;

      const href = card.getAttribute("href") || "";
      const id = href.startsWith("#lesson/")
        ? href.slice("#lesson/".length)
        : "";

      const index = course.lessons.findIndex(lesson => lesson.id === id);
      const art = card.querySelector(".lesson-art");

      if (index >= 0 && art) {
        const number = document.createElement("span");
        number.className = "lesson-index";
        number.setAttribute("aria-hidden", "true");
        number.textContent = "LESSON " + String(index + 1).padStart(2, "0");
        art.append(number);
      }

      const callToAction = card.querySelector(":scope > strong");
      if (callToAction) callToAction.textContent = "Explore lesson";

      card.dataset.experienceReady = "true";
    });

    const courseSection = main.querySelector(".card:has(.lesson-grid)");

    if (courseSection && !courseSection.querySelector(".section-kicker")) {
      const kicker = document.createElement("p");
      kicker.className = "section-kicker";
      kicker.textContent = "Your foundation journey";
      courseSection.prepend(kicker);
    }

    updateReadingProgress();
  }

  let enhancementPending = false;

  function queueEnhancement() {
    if (enhancementPending) return;

    enhancementPending = true;

    requestAnimationFrame(() => {
      enhancementPending = false;
      enhancePage();
    });
  }

  /*
   * Observe direct page replacements only.
   * The application can redraw the planner without changing the URL.
   * Enhancements inside cards do not create an observer loop.
   */
  const pageObserver = new MutationObserver(queueEnhancement);
  pageObserver.observe(main, { childList: true });

  window.addEventListener("hashchange", () => {
    main.classList.remove("experience-enter");

    requestAnimationFrame(() => {
      main.classList.add("experience-enter");
      queueEnhancement();
    });
  });

  main.addEventListener("animationend", event => {
    if (event.target === main) {
      main.classList.remove("experience-enter");
    }
  });

  enhancePage();
})();