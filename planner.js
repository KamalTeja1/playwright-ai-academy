(() => {
  "use strict";

  const stages = [
    { id: "learn", title: "Learn the concepts" },
    { id: "guided", title: "Run the walkthrough" },
    { id: "practice", title: "Independent practice" },
    { id: "quiz", title: "MCQ assessment" },
    { id: "review", title: "Review and revisit" }
  ];

  function date(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error("Expected a YYYY-MM-DD date.");
    }
    const result = new Date(value + "T12:00:00Z");
    if (!Number.isFinite(result.getTime()) ||
        result.toISOString().slice(0, 10) !== value ||
        value < "2000-01-01" || value > "2100-12-31") {
      throw new Error("Invalid or unsupported date.");
    }
    return result;
  }

  function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function add(value, days) {
    const d = date(value);
    d.setUTCDate(d.getUTCDate() + days);
    const result = d.toISOString().slice(0, 10);
    date(result);
    return result;
  }

  function monday(value) {
    return add(value, -((date(value).getUTCDay() + 6) % 7));
  }

  function pretty(value) {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
      timeZone: "UTC"
    }).format(date(value));
  }

  function profile(raw) {
    if (!raw || !["windows", "mac", "linux"].includes(raw.os)) {
      throw new Error("Select your operating system.");
    }
    date(raw.start);
    if (![30, 60, 90].includes(raw.minutes)) throw new Error("Choose 30, 60, or 90 minutes.");
    if (!Array.isArray(raw.days) || !raw.days.length ||
        raw.days.some(n => !Number.isInteger(n) || n < 0 || n > 6)) {
      throw new Error("Choose at least one valid study day.");
    }
    return {
      os: raw.os,
      start: raw.start,
      minutes: raw.minutes,
      days: [...new Set(raw.days)].sort(),
      experience: ["new", "some", "experienced"].includes(raw.experience) ? raw.experience : "new",
      goal: ["personal", "team", "portfolio"].includes(raw.goal) ? raw.goal : "personal"
    };
  }

  function tasks(lessons) {
    return lessons.flatMap(lesson =>
      stages.flatMap((stage, index) => {
        const minutes = lesson.duration[index];
        if (!Number.isInteger(minutes) || minutes <= 0 || minutes % 15) {
          throw new Error(`Invalid estimate for ${lesson.id}.`);
        }
        return Array.from({ length: minutes / 15 }, (_, part) => ({
          id: `${lesson.id}:${stage.id}:${part + 1}`,
          lesson: lesson.id,
          stage: stage.id,
          part: part + 1,
          minutes: 15,
          title: `${lesson.title} — ${stage.title} (${part + 1}/${minutes / 15})`
        }));
      })
    );
  }

  function schedule(all, settings, done, from) {
    const p = profile(settings);
    date(from);
    let cursor = from;
    const plan = {};
    const used = {};

    for (const task of all) {
      if (done[task.id]) {
        date(done[task.id]);
        plan[task.id] = done[task.id];
        used[done[task.id]] = (used[done[task.id]] || 0) + task.minutes;
      }
    }

    for (const task of all) {
      if (done[task.id]) continue;
      while (!p.days.includes(date(cursor).getUTCDay()) ||
             (used[cursor] || 0) + task.minutes > p.minutes) {
        cursor = add(cursor, 1);
      }
      plan[task.id] = cursor;
      used[cursor] = (used[cursor] || 0) + task.minutes;
    }
    return plan;
  }

  function empty() {
    return {
      schema: 2,
      catalog: 2,
      profile: null,
      theme: "light",
      last: "computer-map",
      done: {},
      plan: {},
      work: {}
    };
  }

  function text(value) {
    if (value === undefined || value === null) return "";
    if (typeof value !== "string" || value.length > 30000) {
      throw new Error("Invalid or oversized saved text.");
    }
    return value;
  }

  function score(lesson, answers) {
    return Math.round(100 * lesson.quiz.filter((q, i) => answers[i] === q.answer).length / lesson.quiz.length);
  }

  function validate(raw, lessons) {
    if (!raw || raw.schema !== 2 || raw.catalog !== 2) {
      throw new Error("Unsupported course backup. Use a foundation or course-v2 backup.");
    }
    const clean = empty();
    clean.profile = raw.profile === null ? null : profile(raw.profile);
    clean.theme = raw.theme === "dark" ? "dark" : "light";
    if (lessons.some(l => l.id === raw.last)) clean.last = raw.last;

    const all = tasks(lessons);
    for (const task of all) {
      for (const key of ["done", "plan"]) {
        const value = raw[key]?.[task.id];
        if (value !== undefined) {
          date(value);
          clean[key][task.id] = value;
        }
      }
      if (clean.profile && !clean.plan[task.id]) throw new Error("Backup schedule is incomplete.");
    }

    for (const lesson of lessons) {
      const saved = raw.work?.[lesson.id] || {};
      const attempts = [];
      if (saved.attempts !== undefined && !Array.isArray(saved.attempts)) {
        throw new Error("Invalid quiz history.");
      }
      if ((saved.attempts?.length || 0) > 1000) throw new Error("Quiz history is too large.");

      for (const attempt of saved.attempts || []) {
        date(attempt.date);
        if (!Array.isArray(attempt.answers) ||
            attempt.answers.length !== lesson.quiz.length ||
            attempt.answers.some((n, i) => !Number.isInteger(n) || n < 0 || n >= lesson.quiz[i].options.length)) {
          throw new Error("Invalid saved quiz answers.");
        }
        attempts.push({ date: attempt.date, answers: [...attempt.answers] });
      }

      clean.work[lesson.id] = {
        notes: text(saved.notes),
        draft: text(saved.draft),
        legacyEvidence: text(saved.legacyEvidence),
        legacyAnswer: Number.isInteger(saved.legacyAnswer) ? saved.legacyAnswer : null,
        attempts
      };

      const passed = attempts.some(a => score(lesson, a.answers) >= 80);
      if (!passed) {
        for (const task of all.filter(t => t.lesson === lesson.id && t.stage === "quiz")) {
          if (clean.done[task.id]) throw new Error("Quiz completion has no passing attempt.");
        }
      }
    }

    if (!clean.profile && Object.keys(clean.done).length) {
      throw new Error("Completion data requires a learning profile.");
    }
    return clean;
  }

  function migrate(raw, lessons, anchor = today()) {
    if (!raw || raw.schema !== 1) throw new Error("Not a foundation-v1 backup.");
    const clean = empty();
    clean.profile = raw.profile === null ? null : profile(raw.profile);
    clean.theme = raw.theme === "dark" ? "dark" : "light";
    if (lessons.some(l => l.id === raw.last)) clean.last = raw.last;

    const all = tasks(lessons);
    for (const lesson of lessons) {
      const saved = raw.work?.[lesson.id] || {};
      clean.work[lesson.id] = {
        notes: text(saved.notes),
        draft: text(saved.draft),
        legacyEvidence: text(saved.evidence),
        legacyAnswer: Number.isInteger(saved.answer) ? saved.answer : null,
        attempts: []
      };

      if (!clean.profile) continue;
      for (const stage of ["learn", "guided", "practice"]) {
        const completed = raw.done?.[`${lesson.id}:${stage}`];
        if (!completed) continue;
        date(completed);
        all.filter(t => t.lesson === lesson.id && t.stage === stage)
          .forEach(t => { clean.done[t.id] = completed; });
      }
    }

    if (clean.profile) {
      const from = clean.profile.start > anchor ? clean.profile.start : anchor;
      clean.plan = schedule(all, clean.profile, clean.done, from);
    }
    return clean;
  }

  function restore(raw, lessons) {
    return raw?.schema === 1 ? migrate(raw, lessons) : validate(raw, lessons);
  }

  function icsEscape(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/\n/g, "\\n")
      .replace(/,/g, "\\,").replace(/;/g, "\\;");
  }

  function fold(line) {
    const encoder = new TextEncoder();
    let output = "", current = "";
    for (const character of line) {
      if (encoder.encode(current + character).length > 70) {
        output += current + "\r\n";
        current = " ";
      }
      current += character;
    }
    return output + current;
  }

  function calendar(all, plan, done) {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Launchpad//Course V2//EN"];
    for (const task of all) {
      if (!plan[task.id] || done[task.id]) continue;
      const day = plan[task.id];
      lines.push(
        "BEGIN:VEVENT",
        `UID:${task.id.replace(/:/g, "-")}@launchpad.invalid`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${day.replace(/-/g, "")}`,
        `DTEND;VALUE=DATE:${add(day, 1).replace(/-/g, "")}`,
        `SUMMARY:${icsEscape(task.title)}`,
        "DESCRIPTION:15-minute study block. Completion is recorded in Launchpad.",
        "END:VEVENT"
      );
    }
    lines.push("END:VCALENDAR");
    return lines.map(fold).join("\r\n") + "\r\n";
  }

  window.Planner = {
    stages, date, today, add, monday, pretty, profile, tasks,
    schedule, empty, score, validate, migrate, restore, calendar
  };
})();