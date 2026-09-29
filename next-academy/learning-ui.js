export function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[character]));
}

export function searchTopics(topics, query) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  return topics.filter(topic => {
    const text = [
      topic.title,
      topic.summary,
      ...(topic.tags || [])
    ].join(" ").toLowerCase();

    return words.every(word => text.includes(word));
  });
}

// Lightweight display highlighting, not a parser or code validator.
export function highlight(source) {
  const pattern =
    /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:import|from|def|return|assert|async|await|const|let|if|else|for|with|True|False|None)\b/g;

  let output = "";
  let cursor = 0;

  for (const match of source.matchAll(pattern)) {
    output += escapeHTML(source.slice(cursor, match.index));

    const type = /^["']/.test(match[0]) ? "string" : "keyword";
    output += `<span class="token-${type}">${escapeHTML(match[0])}</span>`;

    cursor = match.index + match[0].length;
  }

  return output + escapeHTML(source.slice(cursor));
}

function codeBlock(example) {
  return `<div class="code-block">
    <div class="code-header">
      <span>${escapeHTML(example.filename)}</span>
      <button type="button" data-copy-code>Copy code</button>
    </div>
    <pre><code>${highlight(example.source)}</code></pre>
  </div>`;
}

export function topicCards(topics, learning) {
  const bookmarks = learning.get().bookmarks;

  return `<div class="grid">
    ${topics.map(topic => `
      <a class="phase-card" href="#/topics/${encodeURIComponent(topic.id)}">
        <span class="badge">${topic.isReviewFixture ? "Interface-review topic" : "Learning topic"}</span>
        <h3>${escapeHTML(topic.title)}</h3>
        <p>${escapeHTML(topic.summary)}</p>
        <strong>${bookmarks.includes(topic.id) ? "★ Bookmarked · " : ""}Open topic →</strong>
      </a>
    `).join("")}
  </div>`;
}

export function renderTopic({
  root,
  topic,
  breadcrumbs,
  learning,
  notify,
  copy,
  download
}) {
  const e = escapeHTML;
  const savedRecord = learning.record(topic.id);
  const tabs = [
    ["notes", "Notes"],
    ["hands", "Hands-On"],
    ["challenge", "Challenge"],
    ["checkpoint", "Checkpoint"]
  ];

  root.innerHTML = `
    ${breadcrumbs}

    <span class="badge">INTERFACE REVIEW · NOT THE FULL CURRICULUM</span>
    <h1>${e(topic.title)}</h1>
    <p>${e(topic.summary)}</p>

    <div class="actions topic-actions">
      <button id="topic-bookmark" type="button"></button>
      <a class="button" href="#/bookmarks">My bookmarks</a>
    </div>

    <div class="learning-layout">
      <section class="learning-content">
        <div class="lesson-tabs" role="tablist" aria-label="Topic sections">
          ${tabs.map(([id, title], index) => `
            <button id="tab-${id}" type="button" role="tab"
              data-tab="${id}" aria-controls="panel-${id}"
              aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">
              ${title}
            </button>
          `).join("")}
        </div>

        <section id="panel-notes" role="tabpanel"
                 aria-labelledby="tab-notes" tabindex="0">
          <section class="card">
            <h2 data-toc tabindex="-1">Why it matters</h2>
            <p>${e(topic.whyItMatters)}</p>
          </section>

          ${topic.content.map(section => `
            <section class="card">
              <h2 data-toc tabindex="-1">${e(section.heading)}</h2>
              <p>${e(section.body)}</p>
            </section>
          `).join("")}

          <section class="card">
            <h2 data-toc tabindex="-1">Python and TypeScript examples</h2>
            <p class="small muted">
              For already configured local workspaces.
              This page does not run the code.
            </p>
            ${topic.codeExamples.map(codeBlock).join("")}
          </section>

          <section class="card">
            <h2 data-toc tabindex="-1">Pro tips</h2>
            <ul>${topic.proTips.map(tip => `<li>${e(tip)}</li>`).join("")}</ul>
            <h3>Common mistakes and fixes</h3>
            <ul>${topic.commonMistakes.map(item => `<li>${e(item)}</li>`).join("")}</ul>
          </section>

          <section class="card">
            <h2 data-toc tabindex="-1">Official references</h2>
            ${topic.furtherReading.map(url => `
              <p><a href="${e(url)}" target="_blank" rel="noopener noreferrer">${e(url)}</a></p>
            `).join("")}
          </section>

          <section class="card">
            <h2 data-toc tabindex="-1">Personal notes</h2>
            <label for="personal-notes">Notes — optional, stored in this browser</label>
            <textarea id="personal-notes" rows="6" maxlength="30000"></textarea>
            <p class="small muted" id="notes-status" role="status"></p>
            <p class="small muted">Do not enter credentials or personal information.</p>
          </section>
        </section>

        <section id="panel-hands" role="tabpanel"
                 aria-labelledby="tab-hands" tabindex="0" hidden>
          <section class="card">
            <h2 data-toc tabindex="-1">Follow the exercise</h2>
            <ol>${topic.handsOn.steps.map(step => `<li>${e(step)}</li>`).join("")}</ol>

            <h3>Deliverable</h3>
            <p>${e(topic.handsOn.deliverable)}</p>

            <h3>Expected behavior</h3>
            <p>${e(topic.handsOn.expected)}</p>
          </section>

          <section class="card">
            <h2 data-toc tabindex="-1">Local commands</h2>
            ${topic.runInstructions.map(item => `
              <h3>${e(item.title)}</h3>
              ${codeBlock({ filename: "Terminal command", source: item.command })}
              <p class="small muted">${e(item.note)}</p>
            `).join("")}
          </section>

          <section class="card">
            <h2 data-toc tabindex="-1">Exercise draft</h2>
            <label for="exercise-draft">Optional draft — not executed here</label>
            <textarea id="exercise-draft" class="editor" rows="12"
              maxlength="30000" spellcheck="false"></textarea>
            <div class="actions">
              <button id="copy-draft" type="button">Copy draft</button>
              <button id="download-draft" type="button">Download draft as text</button>
            </div>
            <p id="draft-status" class="small muted" role="status"></p>
          </section>
        </section>

        <section id="panel-challenge" role="tabpanel"
                 aria-labelledby="tab-challenge" tabindex="0" hidden>
          <section class="card">
            <h2 data-toc tabindex="-1">Independent challenge</h2>
            <p>${e(topic.challenge.task)}</p>
            <details>
              <summary>Reveal the reference approach</summary>
              <p>${e(topic.challenge.solution)}</p>
            </details>
            <p class="small muted">
              Challenge execution and completion tracking are not implemented
              in this interface-review release.
            </p>
          </section>
        </section>

        <section id="panel-checkpoint" role="tabpanel"
                 aria-labelledby="tab-checkpoint" tabindex="0" hidden>
          <section class="card">
            <h2 data-toc tabindex="-1">Check your understanding</h2>
            <p>
              Choose one answer per question. Feedback appears immediately.
              Answers are not saved as course progress in Release B.
            </p>

            ${topic.checkpoint.map((question, index) => `
              <fieldset>
                <legend>${index + 1}. ${e(question.question)}</legend>
                ${question.choices.map((choice, choiceIndex) => `
                  <label class="answer-choice">
                    <input type="radio" name="question-${index}"
                      value="${choiceIndex}" data-question="${index}">
                    <span>${e(choice)}</span>
                  </label>
                `).join("")}
                <p id="feedback-${index}" class="question-feedback" role="status"></p>
              </fieldset>
            `).join("")}
          </section>
        </section>
      </section>

      <nav class="topic-toc" aria-label="On this page">
        <p class="eyebrow">ON THIS PAGE</p>
        <div id="toc-links"></div>
      </nav>
    </div>
  `;

  const bookmarkButton = root.querySelector("#topic-bookmark");

  function updateBookmark() {
    const saved = learning.get().bookmarks.includes(topic.id);
    bookmarkButton.textContent = saved ? "Remove bookmark" : "Bookmark topic";
    bookmarkButton.setAttribute("aria-pressed", String(saved));
  }

  updateBookmark();

  bookmarkButton.onclick = () => {
    try {
      learning.toggleBookmark(topic.id);
      updateBookmark();
      notify("Bookmark updated.");
    } catch (error) {
      notify(error.message);
    }
  };

  root.querySelector("#personal-notes").value = savedRecord.notes;
  root.querySelector("#exercise-draft").value = savedRecord.draft;

  function bindSavedField(selector, field, statusSelector) {
    const input = root.querySelector(selector);
    const status = root.querySelector(statusSelector);

    input.addEventListener("input", () => {
      try {
        learning.saveRecord(topic.id, { [field]: input.value });
        status.textContent = "Saved in this browser.";
      } catch (error) {
        status.textContent =
          "Not saved. Copy this text before leaving. " + error.message;
      }
    });
  }

  bindSavedField("#personal-notes", "notes", "#notes-status");
  bindSavedField("#exercise-draft", "draft", "#draft-status");

  root.querySelector("#copy-draft").onclick = () =>
    copy(root.querySelector("#exercise-draft").value);

  root.querySelector("#download-draft").onclick = () =>
    download(
      root.querySelector("#exercise-draft").value,
      "review-exercise-draft.txt",
      "text/plain;charset=utf-8"
    );

  root.querySelectorAll("[data-copy-code]").forEach(button => {
    button.onclick = () =>
      copy(button.closest(".code-block").querySelector("code").textContent);
  });

  root.querySelectorAll("[data-question]").forEach(input => {
    input.addEventListener("change", () => {
      const index = Number(input.dataset.question);
      const question = topic.checkpoint[index];
      const correct = Number(input.value) === question.correctIndex;
      const feedback = root.querySelector("#feedback-" + index);

      feedback.textContent =
        (correct ? "Correct. " : "Not quite. ") +
        question.answer +
        " Correct choice: " + question.choices[question.correctIndex];

      feedback.className =
        "question-feedback " + (correct ? "status-pass" : "status-fail");
    });
  });

  function updateToc(panel) {
    const container = root.querySelector("#toc-links");
    container.replaceChildren();

    panel.querySelectorAll("[data-toc]").forEach(heading => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = heading.textContent;
      button.onclick = () => {
        heading.scrollIntoView({ block: "start" });
        heading.focus({ preventScroll: true });
      };
      container.append(button);
    });
  }

  const buttons = [...root.querySelectorAll("[data-tab]")];

  function selectTab(id, moveFocus = false) {
    buttons.forEach(button => {
      const selected = button.dataset.tab === id;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;

      root.querySelector("#panel-" + button.dataset.tab).hidden = !selected;

      if (selected && moveFocus) button.focus();
    });

    updateToc(root.querySelector("#panel-" + id));
  }

  buttons.forEach((button, index) => {
    button.onclick = () => selectTab(button.dataset.tab);

    button.onkeydown = event => {
      let target = null;

      if (event.key === "ArrowRight") target = (index + 1) % buttons.length;
      if (event.key === "ArrowLeft") target = (index + buttons.length - 1) % buttons.length;
      if (event.key === "Home") target = 0;
      if (event.key === "End") target = buttons.length - 1;

      if (target !== null) {
        event.preventDefault();
        selectTab(buttons[target].dataset.tab, true);
      }
    };
  });

  selectTab("notes");
}