"""Install Release D1 into the existing Release C folder.

Default: preview and validate intended edits.
Apply:   python3 install-d1.py --apply

No network requests.
No browser storage access.
Existing files are backed up before replacement.
"""

from pathlib import Path
import argparse
import hashlib
import json
import shutil
import sys


ROOT = Path(__file__).resolve().parent
BACKUP = ROOT / ".d1-file-backup"


COURSE_SOURCE = r'''import {
  course as reviewCourse,
  courseErrors as reviewCourseErrors
} from "./review-course.js";

import {
  environmentModule,
  environmentLessons,
  environmentTopics
} from "./d1-environment.js";

export const course = {
  ...reviewCourse,
  release: "D1",
  modules: [
    environmentModule,
    ...reviewCourse.modules.map(module => ({
      ...module,
      order: 99
    }))
  ],
  lessons: [
    ...reviewCourse.lessons,
    ...environmentLessons
  ],
  // Keep the original review topic first in this array for compatibility
  // with prior developer checks. Curriculum ordering uses module/order.
  topics: [
    ...reviewCourse.topics,
    ...environmentTopics
  ]
};

export function courseErrors(value = course) {
  const errors = reviewCourseErrors(value);

  if (environmentTopics.length !== 6) {
    errors.push("D1 must contain six Environment Setup topics.");
  }

  for (const topic of environmentTopics) {
    if (!topic.contentRelease || topic.contentRelease !== "D1") {
      errors.push(`${topic.id}: missing D1 release metadata.`);
    }
    if (!Array.isArray(topic.runInstructions) || !topic.runInstructions.length) {
      errors.push(`${topic.id}: missing execution guidance.`);
    }
  }

  return errors;
}
'''


def read(name):
    path = ROOT / name
    if path.is_symlink():
        raise RuntimeError(f"Refusing to modify a symlink: {name}")
    if not path.is_file():
        raise RuntimeError(f"Missing required file: {name}")
    return path.read_text(encoding="utf-8")


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(
            f"{label}: expected one matching Release C passage, found {count}. "
            "No files were changed. Check that the supplied Release C files are installed."
        )
    return text.replace(old, new, 1)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def prepare():
    for name in [
        "d1-environment.js", "d1-checks.html",
        "schema.js", "catalog.js", "store.js",
        "learning-store.js", "activity.js",
        "index.html", "activity.css"
    ]:
        read(name)

    old_course = read("course.js")

    if "./d1-environment.js" in old_course:
        raise RuntimeError("Release D1 appears to be installed already. Do not apply twice.")

    if (ROOT / "review-course.js").exists():
        raise RuntimeError(
            "review-course.js already exists. Stop and inspect it rather than overwriting."
        )

    if BACKUP.exists():
        raise RuntimeError(
            ".d1-file-backup already exists. Keep that backup and inspect the previous "
            "installation attempt before trying again."
        )

    if 'id: "review-actions-and-assertions"' not in old_course:
        raise RuntimeError("course.js is not the expected Release B/C review course.")

    if "export function courseErrors" not in old_course:
        raise RuntimeError("course.js is missing the expected validator export.")

    ui = read("learning-ui.js")

    ui = replace_once(
        ui,
        '<span class="badge">INTERFACE REVIEW · NOT THE FULL CURRICULUM</span>',
        '<span class="badge">${topic.isReviewFixture ? "INTERFACE REVIEW" : "PHASE 0 · ENVIRONMENT SETUP"} · ${topic.estimatedMinutes} minute estimate</span>',
        "learning-ui.js topic label"
    )

    ui = replace_once(
        ui,
        "For already configured local workspaces.\n              This page does not run the code.",
        "Setup topics 1–4 include deferred examples: run them after Topic 5 prepares\n"
        "              the matching workspace. Read the Hands-On tab first. This page does not run code.",
        "learning-ui.js example prerequisites"
    )

    ui = replace_once(
        ui,
        "Challenge execution and completion tracking are not implemented\n"
        "              in this interface-review release.",
        "This page does not execute the challenge. Use the learning-record controls\n"
        "              above to record your own completion; it remains self-reported.",
        "learning-ui.js challenge notice"
    )

    ui = replace_once(
        ui,
        "Answers are not saved as course progress in Release B.",
        "Checkpoint answers are not saved as verified proficiency. Topic completion is recorded separately.",
        "learning-ui.js checkpoint notice"
    )

    activity_ui = read("activity-ui.js")

    activity_ui = replace_once(
        activity_ui,
        "This installation currently contains ${publishedTopics(course).length} published\n"
        "      interface-review topic(s), not the full curriculum. Completion and challenge\n"
        "      outcomes are learner-recorded; study minutes are entered manually.",
        "This installation contains ${publishedTopics(course).filter(t => !t.isReviewFixture).length} authored course topics\n"
        "      and ${publishedTopics(course).filter(t => t.isReviewFixture).length} retained review topic(s).\n"
        "      Progress totals include both. Completion is learner-recorded and study minutes are entered manually.\n"
        "      After adding content, open Weekly planner and save your schedule to include new topics.",
        "activity-ui.js delivery notice"
    )

    app = read("app.js")

    replacements = [
        (
            "Only the interface-review module is installed.",
            "Environment Setup is installed. The earlier review module is retained to preserve your records."
        ),
        (
            '<span class="badge">Interface review</span>',
            '<span class="badge">${module.id === "review-workspace" ? "Retained interface review" : "Published course module"}</span>'
        ),
        (
            "<h1>Release C status</h1>",
            "<h1>Release D1 status</h1>"
        ),
        (
            "One interface-review topic is installed. Full course content arrives later.",
            "Six complete Environment Setup topics are installed. The original review topic remains available. "
            "Other modules have not been authored in this release."
        )
    ]

    for index, (old, new) in enumerate(replacements, 1):
        app = replace_once(app, old, new, f"app.js update {index}")

    app = replace_once(
        app,
        "'<a href=\"./activity-checks.html\">Release C checks</a>';",
        "'<a href=\"./activity-checks.html\">Release C checks</a>' +\n"
        "      '<a href=\"./d1-checks.html\">Release D1 checks</a>';",
        "app.js D1 checks link"
    )

    index = read("index.html")
    index = replace_once(
        index,
        "Release C · Plan & track",
        "Release D1 · Environment Setup",
        "index.html release label"
    )
    index = replace_once(
        index,
        "Release C · Review content only · Activity is learner-recorded",
        "Release D1 · Environment Setup · Activity is learner-recorded",
        "index.html footer"
    )

    return {
        "review-course.js": old_course,
        "course.js": COURSE_SOURCE,
        "learning-ui.js": ui,
        "activity-ui.js": activity_ui,
        "app.js": app,
        "index.html": index
    }


def apply(changes):
    BACKUP.mkdir()

    manifest = {}
    written = []

    try:
        # Back up every existing target before changing any target.
        for name, content in changes.items():
            path = ROOT / name
            existed = path.exists()
            if existed:
                shutil.copy2(path, BACKUP / name)

            manifest[name] = {
                "existed": existed,
                "installedSha256": digest(content.encode("utf-8"))
            }

        (BACKUP / "manifest.json").write_text(
            json.dumps(manifest, indent=2),
            encoding="utf-8"
        )

        for name, content in changes.items():
            path = ROOT / name
            temporary = ROOT / (name + ".d1-tmp")
            temporary.write_text(content, encoding="utf-8")
            temporary.replace(path)
            written.append(name)

    except Exception:
        # Best-effort rollback for a failed installation write.
        for name in reversed(written):
            entry = manifest[name]
            path = ROOT / name
            if entry["existed"]:
                shutil.copy2(BACKUP / name, path)
            else:
                path.unlink(missing_ok=True)

        for name in changes:
            (ROOT / (name + ".d1-tmp")).unlink(missing_ok=True)

        raise

    print("\nD1 integration applied.")
    print("Existing file backups:", BACKUP)
    print("Browser storage was not read or changed.")
    print("Next: refresh the preview, run all checks, then rebuild your planner.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--apply", action="store_true",
        help="Apply the validated edits after making file backups."
    )
    args = parser.parse_args()

    try:
        changes = prepare()

        print("Target folder:", ROOT)
        print("\nValidated planned changes:")
        for name in changes:
            action = "REPLACE" if (ROOT / name).exists() else "CREATE"
            print(f"  {action:7} {name}")

        if not args.apply:
            print("\nPreview only. No files changed.")
            print("To apply: python3 install-d1.py --apply")
            return

        apply(changes)

    except Exception as error:
        print("\nSTOP:", error, file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()