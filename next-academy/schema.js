export const CONTENT_SCHEMA_VERSION = 1;

const isObject = value =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const hasText = value =>
  typeof value === "string" && value.trim().length > 0;

export function validateCatalog(catalog) {
  const errors = [];

  if (!isObject(catalog)) {
    return ["Catalog must be an object."];
  }

  if (catalog.schemaVersion !== CONTENT_SCHEMA_VERSION) {
    errors.push("Unsupported content schema version.");
  }

  const collections = ["phases", "modules", "lessons", "topics"];

  for (const name of collections) {
    if (!Array.isArray(catalog[name])) {
      errors.push(`${name} must be an array.`);
    }
  }

  if (collections.some(name => !Array.isArray(catalog[name]))) {
    return errors;
  }

  const indexes = {};

  for (const name of collections) {
    indexes[name] = new Map();

    for (const item of catalog[name]) {
      if (!isObject(item) || !hasText(item.id)) {
        errors.push(`${name}: every record needs a nonempty id.`);
        continue;
      }

      if (indexes[name].has(item.id)) {
        errors.push(`${name}: duplicate id ${item.id}.`);
      }

      indexes[name].set(item.id, item);

      if (!hasText(item.title)) {
        errors.push(`${item.id}: missing title.`);
      }

      if (!Number.isInteger(item.order) || item.order < 0) {
        errors.push(`${item.id}: order must be a nonnegative integer.`);
      }
    }
  }

  for (const module of catalog.modules.filter(isObject)) {
    if (!indexes.phases.has(module.phaseId)) {
      errors.push(`${module.id}: unknown phaseId.`);
    }
  }

  for (const lesson of catalog.lessons.filter(isObject)) {
    if (!indexes.modules.has(lesson.moduleId)) {
      errors.push(`${lesson.id}: unknown moduleId.`);
    }
  }

  for (const topic of catalog.topics.filter(isObject)) {
    if (!indexes.lessons.has(topic.lessonId)) {
      errors.push(`${topic.id}: unknown lessonId.`);
    }

    if (!["unpublished", "published"].includes(topic.status)) {
      errors.push(`${topic.id}: invalid publication status.`);
      continue;
    }

    if (topic.status !== "published") continue;

    for (const field of ["summary", "whyItMatters", "difficulty"]) {
      if (!hasText(topic[field])) {
        errors.push(`${topic.id}: missing ${field}.`);
      }
    }

    const sections = Array.isArray(topic.content) ? topic.content : [];

    if (
      sections.length === 0 ||
      sections.some(section =>
        !isObject(section) ||
        !hasText(section.heading) ||
        !hasText(section.body)
      )
    ) {
      errors.push(`${topic.id}: invalid detailed-note sections.`);
    }

    const words = sections
      .map(section => typeof section?.body === "string" ? section.body : "")
      .join(" ")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .length;

    if (words < 300 || words > 800) {
      errors.push(`${topic.id}: detailed notes contain ${words} words; expected 300–800.`);
    }

    if (
      !isObject(topic.handsOn) ||
      !Array.isArray(topic.handsOn.steps) ||
      topic.handsOn.steps.length === 0 ||
      topic.handsOn.steps.some(step => !hasText(step)) ||
      !hasText(topic.handsOn.deliverable)
    ) {
      errors.push(`${topic.id}: incomplete hands-on exercise.`);
    }

    if (
      !isObject(topic.challenge) ||
      !hasText(topic.challenge.task) ||
      !hasText(topic.challenge.solution)
    ) {
      errors.push(`${topic.id}: incomplete challenge.`);
    }

    for (const field of ["proTips", "commonMistakes"]) {
      if (
        !Array.isArray(topic[field]) ||
        topic[field].length < 3 ||
        topic[field].length > 5 ||
        topic[field].some(value => !hasText(value))
      ) {
        errors.push(`${topic.id}: ${field} must contain 3–5 written items.`);
      }
    }

    if (
      !Array.isArray(topic.checkpoint) ||
      topic.checkpoint.length < 3 ||
      topic.checkpoint.length > 5 ||
      topic.checkpoint.some(question =>
        !isObject(question) ||
        !hasText(question.question) ||
        !hasText(question.answer)
      )
    ) {
      errors.push(`${topic.id}: checkpoint needs 3–5 questions with answers.`);
    }

    const examples = Array.isArray(topic.codeExamples)
      ? topic.codeExamples
      : [];

    if (
      examples.length < 2 ||
      examples.some(example =>
        !isObject(example) ||
        !hasText(example.filename) ||
        !hasText(example.source)
      ) ||
      !examples.some(example => example.language === "python") ||
      !examples.some(example => example.language === "typescript")
    ) {
      errors.push(`${topic.id}: Python and TypeScript examples are required.`);
    }

    if (!Array.isArray(topic.furtherReading) || topic.furtherReading.length === 0) {
      errors.push(`${topic.id}: official reading references are missing.`);
    } else {
      for (const reference of topic.furtherReading) {
        try {
          const url = new URL(reference);
          if (url.protocol !== "https:") throw new Error("HTTPS required");
        } catch {
          errors.push(`${topic.id}: invalid HTTPS reference.`);
        }
      }
    }
  }

  return errors;
}