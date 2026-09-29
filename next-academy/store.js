export const STORAGE_KEY = "launchpad-next-foundation-v1";

export function defaultPreferences() {
  return {
    schemaVersion: 1,
    name: "Learner",
    theme: "dark",
    weeklyGoalMinutes: 180
  };
}

export function validatePreferences(raw) {
  if (
    !raw ||
    typeof raw !== "object" ||
    Array.isArray(raw) ||
    raw.schemaVersion !== 1
  ) {
    throw new Error("Unsupported preferences backup.");
  }

  if (
    typeof raw.name !== "string" ||
    raw.name.trim().length === 0 ||
    raw.name.length > 60
  ) {
    throw new Error("Name must contain 1–60 characters.");
  }

  if (!["dark", "light"].includes(raw.theme)) {
    throw new Error("Theme must be dark or light.");
  }

  if (
    !Number.isInteger(raw.weeklyGoalMinutes) ||
    raw.weeklyGoalMinutes < 15 ||
    raw.weeklyGoalMinutes > 3000
  ) {
    throw new Error("Weekly goal must be 15–3000 whole minutes.");
  }

  return {
    schemaVersion: 1,
    name: raw.name.trim(),
    theme: raw.theme,
    weeklyGoalMinutes: raw.weeklyGoalMinutes
  };
}

export function createPreferencesStore(storage) {
  let current = defaultPreferences();
  let blocked = false;
  let startupError = "";

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw !== null) {
      current = validatePreferences(JSON.parse(raw));
    }
  } catch (error) {
    blocked = true;
    startupError =
      "Existing settings could not be read. They have not been overwritten. " +
      String(error.message || error);
  }

  return {
    get() {
      return { ...current };
    },

    status() {
      return {
        blocked,
        startupError
      };
    },

    save(next) {
      const clean = validatePreferences(next);

      if (blocked) {
        throw new Error(
          "Automatic saving is blocked. Export the stored data, then explicitly restore or reset in Settings."
        );
      }

      // Change the in-memory value only after persistence succeeds.
      storage.setItem(STORAGE_KEY, JSON.stringify(clean));
      current = clean;
      return { ...current };
    },

    restore(raw) {
      const clean = validatePreferences(raw);
      storage.setItem(STORAGE_KEY, JSON.stringify(clean));
      current = clean;
      blocked = false;
      startupError = "";
      return { ...current };
    },

    raw() {
      return storage.getItem(STORAGE_KEY);
    },

    reset() {
      // Remove only this app's key, never all origin storage.
      storage.removeItem(STORAGE_KEY);
      current = defaultPreferences();
      blocked = false;
      startupError = "";
      return { ...current };
    }
  };
}