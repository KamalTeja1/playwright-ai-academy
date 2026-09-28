(() => {
  "use strict";

  const stages = [
    { id: "learn", title: "Read and understand" },
    { id: "guided", title: "Follow the walkthrough" },
    { id: "practice", title: "Independent exercise" },
    { id: "check", title: "Quiz and evidence checkpoint" }
  ];

  function date(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error("Use a date in YYYY-MM-DD format.");
    }
    const result = new Date(value + "T12:00:00Z");
    if (!Number.isFinite(result.getTime()) ||
        result.toISOString().slice(0, 10) !== value) {
      throw new Error("Invalid calendar date.");
    }
    return result;
  }

  function iso(value) {
    return value.toISOString().slice(0, 10);
  }

  function today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function add(value, count) {
    const d = date(value);
    d.setUTCDate(d.getUTCDate() + count);
    return iso(d);
  }

  function monday(value) {
    const d = date(value);
    return add(value, -((d.getUTCDay() + 6) % 7));
  }

  function pretty(value) {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short", month: "short", day: "numeric", timeZone: "UTC"
    }).format(date(value));
  }

  function tasks(lessons) {
    return lessons.flatMap(lesson => stages.map(stage => ({
      id: `${lesson.id}:${stage.id}`,
      lesson: lesson.id,
      stage: stage.id,
      title: `${lesson.title} — ${stage.title}`,
      minutes: 15
    })));
  }

  function profile(raw) {
    if (!raw || typeof raw !== "object") throw new Error("Missing learning profile.");
    const start = iso(date(raw.start));

    if (start < "2000-01-01" || start > "2100-12-31") {
      throw new Error("Choose a start date between 2000 and 2100.");
    }

    if (!["windows", "mac", "linux"].includes(raw.os)) throw new Error("Choose an operating system.");
    if (!["new", "some", "experienced"].includes(raw.experience)) throw new Error("Choose an experience level.");
    if (!["personal", "team", "portfolio"].includes(raw.goal)) throw new Error("Choose a goal.");
    if (![30, 60, 90].includes(raw.minutes)) throw new Error("Choose a 30, 60, or 90 minute session.");
    if (!Array.isArray(raw.days) || !raw.days.length ||
        raw.days.some(day => !Number.isInteger(day) || day < 0 || day > 6)) {
      throw new Error("Select at least one study day.");
    }

    return {
      start,
      os: raw.os,
      experience: raw.experience,
      goal: raw.goal,
      minutes: raw.minutes,
      days: [...new Set(raw.days)].sort()
    };
  }

  function empty() {
    return {
      schema: 1,
      profile: null,
      theme: "light",
      plan: {},
      done: {},
      work: {},
      last: "computer-map"
    };
  }

  function schedule(allTasks, settings, completed, from) {
    const p = profile(settings);
    let cursor = iso(date(from));
    const plan = {};
    const used = {};
    const capacity = p.minutes / 15;

    for (const task of allTasks) {
      if (completed[task.id]) {
        const completedDate = iso(date(completed[task.id]));
        plan[task.id] = completedDate;
        used[completedDate] = (used[completedDate] || 0) + 1;
      }
    }

    for (const task of allTasks) {
      if (completed[task.id]) continue;
      let guard = 0;

      while (!p.days.includes(date(cursor).getUTCDay()) ||
             (used[cursor] || 0) >= capacity) {
        cursor = add(cursor, 1);
        if (++guard > 10000) throw new Error("Schedule exceeds the supported range.");
      }

      plan[task.id] = cursor;
      used[cursor] = (used[cursor] || 0) + 1;
    }
    return plan;
  }

  // Only recognized fields are imported; HTML is never trusted.
  function validateBackup(raw, lessons) {
    if (!raw || raw.schema !== 1) throw new Error("This is not a supported Launchpad backup.");
    const clean = empty();
    clean.profile = raw.profile === null ? null : profile(raw.profile);
    clean.theme = raw.theme === "dark" ? "dark" : "light";

    const all = tasks(lessons);
    for (const task of all) {
      for (const key of ["done", "plan"]) {
        const value = raw[key]?.[task.id];
        if (value !== undefined) {
          const valid = iso(date(value));
          if (valid < "2000-01-01" || valid > "2100-12-31") throw new Error("Backup date is outside the supported range.");
          clean[key][task.id] = valid;
        }
      }
      if (clean.done[task.id]) clean.plan[task.id] = clean.done[task.id];
      if (clean.profile && !clean.plan[task.id]) throw new Error("Backup has an incomplete schedule.");
    }

    for (const lesson of lessons) {
      const source = raw.work?.[lesson.id];
      if (!source) continue;
      const entry = { notes: "", draft: "", evidence: "", checks: [], answer: null };

      for (const key of ["notes", "draft", "evidence"]) {
        if (source[key] !== undefined) {
          if (typeof source[key] !== "string" || source[key].length > 20000) {
            throw new Error("Backup contains invalid or oversized lesson text.");
          }
          entry[key] = source[key];
        }
      }

      entry.checks = lesson.checks.map((_, index) => source.checks?.[index] === true);
      if (Number.isInteger(source.answer) && source.answer >= 0 &&
          source.answer < lesson.quiz.options.length) {
        entry.answer = source.answer;
      }
      clean.work[lesson.id] = entry;
    }

    if (lessons.some(lesson => lesson.id === raw.last)) clean.last = raw.last;
    return clean;
  }

  function icsEscape(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/\n/g, "\\n")
      .replace(/,/g, "\\,").replace(/;/g, "\\;");
  }

  function fold(line) {
    const encoder = new TextEncoder();
    let result = "";
    let part = "";
    for (const character of line) {
      if (encoder.encode(part + character).length > 70) {
        result += part + "\r\n";
        part = " ";
      }
      part += character;
    }
    return result + part;
  }

  function calendar(allTasks, plan, done) {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0",
      "PRODID:-//Launchpad//Foundation Planner//EN", "CALSCALE:GREGORIAN"
    ];

    for (const task of allTasks) {
      if (!plan[task.id] || done[task.id]) continue;
      const day = plan[task.id];
      lines.push(
        "BEGIN:VEVENT",
        `UID:launchpad-${task.id.replace(/:/g, "-")}@local.invalid`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${day.replace(/-/g, "")}`,
        `DTEND;VALUE=DATE:${add(day, 1).replace(/-/g, "")}`,
        `SUMMARY:${icsEscape(task.title)}`,
        `DESCRIPTION:${icsEscape("15-minute activity. Open Launchpad to study. Completion is recorded in the website, not this calendar.")}`,
        "END:VEVENT"
      );
    }
    lines.push("END:VCALENDAR");
    return lines.map(fold).join("\r\n") + "\r\n";
  }

  window.Planner = {
    stages, date, today, add, monday, pretty, tasks,
    profile, empty, schedule, validateBackup, calendar
  };
})();