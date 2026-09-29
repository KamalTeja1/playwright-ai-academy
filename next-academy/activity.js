export const ACTIVITY_KEY = "launchpad-next-activity-v1";

const clone = value => JSON.parse(JSON.stringify(value));
const isObject = value =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export function today() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

export function parseDay(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value < "2000-01-01" ||
    value > "2100-12-31"
  ) {
    throw new Error("Use a date between 2000 and 2100.");
  }

  const d = new Date(value + "T12:00:00Z");

  if (!Number.isFinite(d.getTime()) ||
      d.toISOString().slice(0, 10) !== value) {
    throw new Error("Invalid calendar date.");
  }

  return d;
}

export function addDays(value, amount) {
  if (!Number.isInteger(amount)) throw new Error("Day offset must be an integer.");
  const d = parseDay(value);
  d.setUTCDate(d.getUTCDate() + amount);
  const result = d.toISOString().slice(0, 10);
  parseDay(result);
  return result;
}

export function monday(value) {
  return addDays(value, -((parseDay(value).getUTCDay() + 6) % 7));
}

export function formatDay(value) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(parseDay(value));
}

function historicalDay(value, now) {
  parseDay(value);
  if (value > now) throw new Error("Activity cannot be recorded in the future.");
  return value;
}

export function publishedTopics(course) {
  return course.topics.filter(topic => topic.status === "published");
}

export function emptyActivity() {
  return {
    schemaVersion: 1,
    completed: {},
    challenges: {},
    days: {},
    plan: null
  };
}

export function blankDay() {
  return {
    minutes: 0,
    notes: "",
    mood: "",
    checkedIn: false
  };
}

export function validatePlanSettings(raw) {
  if (!isObject(raw)) throw new Error("Missing planner settings.");

  parseDay(raw.start);

  if (![30, 60, 90].includes(raw.minutes)) {
    throw new Error("Choose 30, 60, or 90 minutes per study day.");
  }

  if (
    !Array.isArray(raw.days) ||
    raw.days.length === 0 ||
    raw.days.some(day => !Number.isInteger(day) || day < 0 || day > 6)
  ) {
    throw new Error("Select at least one valid study day.");
  }

  return {
    start: raw.start,
    minutes: raw.minutes,
    days: [...new Set(raw.days)].sort((a, b) => a - b)
  };
}

export function orderedTopics(course) {
  const phases = new Map(course.phases.map(p => [p.id, p]));
  const modules = new Map(course.modules.map(m => [m.id, m]));
  const lessons = new Map(course.lessons.map(l => [l.id, l]));

  function key(topic) {
    const lesson = lessons.get(topic.lessonId);
    const module = lesson && modules.get(lesson.moduleId);
    const phase = module && phases.get(module.phaseId);
    if (!lesson || !module || !phase) throw new Error("Broken course hierarchy.");
    return [phase.order, module.order, lesson.order, topic.order];
  }

  return publishedTopics(course).slice().sort((a, b) => {
    const aa = key(a);
    const bb = key(b);
    for (let i = 0; i < aa.length; i++) {
      if (aa[i] !== bb[i]) return aa[i] - bb[i];
    }
    return a.id.localeCompare(b.id);
  });
}

// Planner allocations are estimates, never recorded study time.
export function buildPlan(course, rawSettings, completed) {
  const settings = validatePlanSettings(rawSettings);
  let cursor = settings.start;
  const used = {};
  const entries = [];

  for (const topic of orderedTopics(course)) {
    if (completed[topic.id]) continue;

    if (!Number.isInteger(topic.estimatedMinutes) ||
        topic.estimatedMinutes <= 0 ||
        topic.estimatedMinutes > 10000) {
      throw new Error(`Invalid duration for ${topic.id}.`);
    }

    let remaining = topic.estimatedMinutes;
    let part = 1;

    while (remaining > 0) {
      while (
        !settings.days.includes(parseDay(cursor).getUTCDay()) ||
        (used[cursor] || 0) >= settings.minutes
      ) {
        cursor = addDays(cursor, 1);
      }

      const amount = Math.min(
        15,
        remaining,
        settings.minutes - (used[cursor] || 0)
      );

      entries.push({
        topicId: topic.id,
        part,
        date: cursor,
        minutes: amount
      });

      used[cursor] = (used[cursor] || 0) + amount;
      remaining -= amount;
      part++;
    }
  }

  return { ...settings, entries };
}

export function validateActivity(raw, course, now = today()) {
  parseDay(now);

  if (!isObject(raw) || raw.schemaVersion !== 1) {
    throw new Error("Unsupported activity backup.");
  }

  const clean = emptyActivity();
  const topics = new Map(publishedTopics(course).map(t => [t.id, t]));

  for (const category of ["completed", "challenges"]) {
    if (!isObject(raw[category])) throw new Error(`Invalid ${category} records.`);

    for (const [id, day] of Object.entries(raw[category])) {
      if (!topics.has(id)) throw new Error("Backup contains an unknown published topic.");
      clean[category][id] = historicalDay(day, now);
    }
  }

  if (!isObject(raw.days)) throw new Error("Invalid daily records.");

  for (const [day, record] of Object.entries(raw.days)) {
    historicalDay(day, now);

    if (
      !isObject(record) ||
      !Number.isInteger(record.minutes) ||
      record.minutes < 0 ||
      record.minutes > 1440 ||
      typeof record.notes !== "string" ||
      record.notes.length > 5000 ||
      !["", "🙂", "😐", "😓"].includes(record.mood) ||
      typeof record.checkedIn !== "boolean"
    ) {
      throw new Error("Invalid daily study record.");
    }

    clean.days[day] = {
      minutes: record.minutes,
      notes: record.notes,
      mood: record.mood,
      checkedIn: record.checkedIn
    };
  }

  if (raw.plan !== null) {
    const settings = validatePlanSettings(raw.plan);
    if (!Array.isArray(raw.plan.entries) || raw.plan.entries.length > 50000) {
      throw new Error("Invalid planner entries.");
    }

    const used = {};
    const totals = {};
    const parts = {};
    let previousDate = settings.start;

    const entries = raw.plan.entries.map(entry => {
      if (
        !isObject(entry) ||
        !topics.has(entry.topicId) ||
        !Number.isInteger(entry.part) ||
        entry.part < 1 ||
        !Number.isInteger(entry.minutes) ||
        entry.minutes < 1 ||
        entry.minutes > 15
      ) {
        throw new Error("Invalid planner allocation.");
      }

      parseDay(entry.date);

      if (
        entry.date < settings.start ||
        entry.date < previousDate ||
        !settings.days.includes(parseDay(entry.date).getUTCDay())
      ) {
        throw new Error("Planner dates violate the selected schedule.");
      }

      previousDate = entry.date;
      const expectedPart = (parts[entry.topicId] || 0) + 1;
      if (entry.part !== expectedPart) throw new Error("Invalid planner part numbering.");
      parts[entry.topicId] = entry.part;

      used[entry.date] = (used[entry.date] || 0) + entry.minutes;
      if (used[entry.date] > settings.minutes) throw new Error("Daily capacity exceeded.");

      totals[entry.topicId] = (totals[entry.topicId] || 0) + entry.minutes;
      if (totals[entry.topicId] > topics.get(entry.topicId).estimatedMinutes) {
        throw new Error("Topic estimate exceeded.");
      }

      return {
        topicId: entry.topicId,
        part: entry.part,
        date: entry.date,
        minutes: entry.minutes
      };
    });

    // Every topic included in a plan must have its full estimate.
    for (const [id, total] of Object.entries(totals)) {
      if (total !== topics.get(id).estimatedMinutes) {
        throw new Error("Incomplete topic allocation.");
      }
    }

    clean.plan = { ...settings, entries };
  }

  return clean;
}

export function dailyMetrics(state, course, day) {
  parseDay(day);
  const published = publishedTopics(course);
  const eligible = new Set(published.map(t => t.id));

  let lessonsCompleted = 0;

  for (const lesson of course.lessons) {
    const allTopics = course.topics.filter(t => t.lessonId === lesson.id);

    if (
      allTopics.length &&
      allTopics.every(t => t.status === "published" && state.completed[t.id])
    ) {
      const finished = allTopics.map(t => state.completed[t.id]).sort().at(-1);
      if (finished === day) lessonsCompleted++;
    }
  }

  return {
    date: day,
    topicsCompleted: Object.entries(state.completed)
      .filter(([id, date]) => eligible.has(id) && date === day).length,
    lessonsCompleted,
    challengesPassed: Object.entries(state.challenges)
      .filter(([id, date]) => eligible.has(id) && date === day).length,
    minutesSpent: state.days[day]?.minutes || 0,
    checkedIn: state.days[day]?.checkedIn || false,
    notes: state.days[day]?.notes || "",
    mood: state.days[day]?.mood || ""
  };
}

export function activityDates(state) {
  const dates = new Set([
    ...Object.values(state.completed),
    ...Object.values(state.challenges)
  ]);

  for (const [day, record] of Object.entries(state.days)) {
    if (record.checkedIn || record.minutes > 0) dates.add(day);
  }

  return [...dates].sort();
}

export function streaks(state, now = today()) {
  const dates = activityDates(state).filter(day => day <= now);
  const set = new Set(dates);

  let cursor = set.has(now) ? now : addDays(now, -1);
  let current = 0;

  while (set.has(cursor)) {
    current++;
    cursor = addDays(cursor, -1);
  }

  let longest = 0;
  let run = 0;
  let previous = null;

  for (const day of dates) {
    run = previous && addDays(previous, 1) === day ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = day;
  }

  return { current, longest };
}

export function achievementStatus(state) {
  const dates = activityDates(state);
  let run = 0;
  let previous = null;
  let threeDayDate = null;

  for (const day of dates) {
    run = previous && addDays(previous, 1) === day ? run + 1 : 1;
    if (run >= 3 && !threeDayDate) threeDayDate = day;
    previous = day;
  }

  let minutes = 0;
  let hourDate = null;

  for (const day of Object.keys(state.days).sort()) {
    minutes += state.days[day].minutes;
    if (minutes >= 60 && !hourDate) hourDate = day;
  }

  const firstDate = Object.values(state.completed).sort()[0] || null;

  return [
    {
      id: "first-topic",
      title: "First step",
      description: "Record one published topic as complete.",
      unlockedAt: firstDate
    },
    {
      id: "three-days",
      title: "Three-day rhythm",
      description: "Record qualifying activity on three consecutive days.",
      unlockedAt: threeDayDate
    },
    {
      id: "first-hour",
      title: "An hour invested",
      description: "Record at least 60 minutes of actual study time.",
      unlockedAt: hourDate
    }
  ];
}

export function createActivityStore(storage, course, clock = today) {
  let current = emptyActivity();
  let rawAtLoad = null;
  let blocked = false;
  let startupError = "";

  try {
    rawAtLoad = storage.getItem(ACTIVITY_KEY);
    if (rawAtLoad !== null) {
      current = validateActivity(JSON.parse(rawAtLoad), course, clock());
    }
  } catch (error) {
    blocked = true;
    startupError = String(error.message || error);
  }

  function persist(next, explicit = false) {
    const clean = validateActivity(next, course, clock());

    if (!explicit) {
      if (blocked) throw new Error("Activity saving is blocked. Export, restore, or reset in Activity data.");
      if (storage.getItem(ACTIVITY_KEY) !== rawAtLoad) {
        throw new Error("Another tab changed activity data. Reload before saving to avoid overwriting it.");
      }
    }

    const serialized = JSON.stringify(clean);
    storage.setItem(ACTIVITY_KEY, serialized);
    rawAtLoad = serialized;
    current = clean;
    blocked = false;
    startupError = "";
    return clone(current);
  }

  function change(callback) {
    const next = clone(current);
    callback(next);
    return persist(next);
  }

  const known = id => {
    if (!publishedTopics(course).some(t => t.id === id)) throw new Error("Unknown published topic.");
  };

  return {
    get: () => clone(current),
    status: () => ({ blocked, startupError }),
    raw: () => storage.getItem(ACTIVITY_KEY),

    mark(id, kind, value) {
      known(id);
      if (!["completed", "challenges"].includes(kind)) throw new Error("Invalid completion category.");
      return change(next => {
        if (value) next[kind][id] ||= clock();
        else delete next[kind][id];
      });
    },

    checkIn() {
      return change(next => {
        const day = clock();
        next.days[day] = { ...(next.days[day] || blankDay()), checkedIn: true };
      });
    },

    setDay(day, record) {
      historicalDay(day, clock());
      return change(next => {
        next.days[day] = { ...record };
      });
    },

    setPlan(settings) {
      return change(next => {
        next.plan = buildPlan(course, settings, next.completed);
      });
    },

    restore(raw) {
      return persist(raw, true);
    },

    reset() {
      storage.removeItem(ACTIVITY_KEY);
      current = emptyActivity();
      rawAtLoad = null;
      blocked = false;
      startupError = "";
      return clone(current);
    }
  };
}

function calendarEscape(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/\n/g, "\\n")
    .replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function fold(line) {
  const encoder = new TextEncoder();
  let output = "", part = "";

  for (const character of line) {
    if (encoder.encode(part + character).length > 70) {
      output += part + "\r\n";
      part = " ";
    }
    part += character;
  }

  return output + part;
}

export function calendarExport(state, course) {
  const topics = new Map(course.topics.map(t => [t.id, t]));
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Launchpad//Release C Planner//EN",
    "CALSCALE:GREGORIAN"
  ];

  for (const entry of state.plan?.entries || []) {
    if (state.completed[entry.topicId]) continue;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${entry.topicId}-${entry.part}@launchpad.invalid`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${entry.date.replace(/-/g, "")}`,
      `DTEND;VALUE=DATE:${addDays(entry.date, 1).replace(/-/g, "")}`,
      `SUMMARY:${calendarEscape(topics.get(entry.topicId).title + " · part " + entry.part)}`,
      `DESCRIPTION:${entry.minutes} estimated study minutes. This is a reminder, not an execution result.`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}