export const LEARNING_KEY = "launchpad-next-learning-v1";

export function emptyLearning() {
  return {
    schemaVersion: 1,
    bookmarks: [],
    lastTopic: null,
    records: {}
  };
}

const clone = value => JSON.parse(JSON.stringify(value));

function object(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function validateLearning(raw, topicIds) {
  if (!object(raw) || raw.schemaVersion !== 1) {
    throw new Error("Unsupported learning-data backup.");
  }

  const allowed = new Set(topicIds);
  const clean = emptyLearning();

  if (
    !Array.isArray(raw.bookmarks) ||
    raw.bookmarks.some(id => typeof id !== "string" || !allowed.has(id))
  ) {
    throw new Error("Backup contains an unknown bookmark.");
  }

  clean.bookmarks = [...new Set(raw.bookmarks)];

  if (raw.lastTopic !== null && !allowed.has(raw.lastTopic)) {
    throw new Error("Backup refers to an unknown last topic.");
  }

  clean.lastTopic = raw.lastTopic;

  if (!object(raw.records)) {
    throw new Error("Invalid learning records.");
  }

  for (const [id, record] of Object.entries(raw.records)) {
    if (!allowed.has(id)) {
      throw new Error("Backup contains an unknown topic record.");
    }

    if (!object(record)) {
      throw new Error("Invalid topic record.");
    }

    for (const field of ["notes", "draft"]) {
      if (typeof record[field] !== "string" || record[field].length > 30000) {
        throw new Error(`Invalid or oversized ${field}.`);
      }
    }

    clean.records[id] = {
      notes: record.notes,
      draft: record.draft
    };
  }

  return clean;
}

export function createLearningStore(storage, topicIds) {
  let current = emptyLearning();
  let blocked = false;
  let startupError = "";

  try {
    const raw = storage.getItem(LEARNING_KEY);
    if (raw !== null) {
      current = validateLearning(JSON.parse(raw), topicIds);
    }
  } catch (error) {
    blocked = true;
    startupError =
      "Learning data could not be loaded. It has not been overwritten. " +
      String(error.message || error);
  }

  function persist(next, explicit = false) {
    const clean = validateLearning(next, topicIds);

    if (blocked && !explicit) {
      throw new Error(
        "Saving is blocked to protect existing data. Use Settings to export, restore, or reset."
      );
    }

    storage.setItem(LEARNING_KEY, JSON.stringify(clean));
    current = clean;
    blocked = false;
    startupError = "";
    return clone(current);
  }

  function edit(callback) {
    const next = clone(current);
    callback(next);
    return persist(next);
  }

  return {
    get() {
      return clone(current);
    },

    status() {
      return { blocked, startupError };
    },

    record(id) {
      if (!topicIds.includes(id)) throw new Error("Unknown topic.");
      return clone(current.records[id] || { notes: "", draft: "" });
    },

    saveRecord(id, patch) {
      if (!topicIds.includes(id)) throw new Error("Unknown topic.");
      return edit(next => {
        next.records[id] = {
          ...(next.records[id] || { notes: "", draft: "" }),
          ...patch
        };
      });
    },

    toggleBookmark(id) {
      if (!topicIds.includes(id)) throw new Error("Unknown topic.");
      return edit(next => {
        next.bookmarks = next.bookmarks.includes(id)
          ? next.bookmarks.filter(value => value !== id)
          : [...next.bookmarks, id];
      });
    },

    visit(id) {
      if (!topicIds.includes(id)) throw new Error("Unknown topic.");
      if (current.lastTopic === id) return clone(current);
      return edit(next => { next.lastTopic = id; });
    },

    restore(raw) {
      return persist(raw, true);
    },

    raw() {
      return storage.getItem(LEARNING_KEY);
    },

    reset() {
      storage.removeItem(LEARNING_KEY);
      current = emptyLearning();
      blocked = false;
      startupError = "";
      return clone(current);
    }
  };
}