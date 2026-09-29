import { catalog as foundation } from "./catalog.js";
import { validateCatalog } from "./schema.js";

const topic = {
  id: "review-actions-and-assertions",
  lessonId: "review-first-check",
  title: "Interface review: actions and assertions",
  order: 0,
  status: "published",
  difficulty: "beginner",
  estimatedMinutes: 30,
  isReviewFixture: true,
  tags: ["review", "assertions", "python", "typescript", "first test"],

  summary:
    "Explore the learning workspace using a small browser-test example. " +
    "This demonstration verifies the interface; it is not the complete beginner curriculum.",

  whyItMatters:
    "An action without a relevant assertion can miss a defect. " +
    "Distinguishing the two helps you review your own tests and AI-generated drafts.",

  content: [
    {
      heading: "Doing something is not checking it",
      body:
        "Imagine entering a display name into a profile form. Typing is an action: " +
        "it asks the browser to change a control. Checking that the field contains " +
        "the intended name is an assertion: it evaluates a claim about the result. " +
        "A successful typing operation is useful, but it does not prove that a server " +
        "saved the profile, that a refresh preserves it, or that another user cannot " +
        "access it. Keep the test's claim as specific as the behavior it actually checks."
    },
    {
      heading: "Arrange a small, controlled page",
      body:
        "The examples provide a tiny HTML page directly to the browser. It contains " +
        "a label and an input, so it needs no external application or network service. " +
        "The label's for attribute matches the input's id. This relationship lets " +
        "the test locate the input by the readable label Display name. You are not " +
        "expected to understand every HTML detail before reviewing this interface. " +
        "The full curriculum will teach those foundations before larger browser workflows."
    },
    {
      heading: "Follow the action and assertion",
      body:
        "Both examples fill the field with Asha and then check its value. The Python " +
        "example uses the synchronous API and receives a page from the pytest plugin. " +
        "The TypeScript example uses Playwright Test and awaits its asynchronous " +
        "operations. These are different runners with related browser APIs. Do not " +
        "paste TypeScript commands into a Python project or assume that changing " +
        "capitalization translates every feature between the languages. Read the " +
        "file extension, imports, and runner before executing an example."
    },
    {
      heading: "Use failure as evidence",
      body:
        "If you change only the expected value to Mina, the field still contains " +
        "Asha, so the assertion should fail. That failure is valuable: the test " +
        "detected a disagreement between the actual and expected state. Do not " +
        "remove the assertion merely to produce a green result. Compare the " +
        "requirement, the action, and the observation. A longer timeout does not " +
        "repair a permanently wrong expectation. After investigating, restore " +
        "the intended value and run the test again."
    },
    {
      heading: "Keep the learning record honest",
      body:
        "This website displays and copies code; it does not execute Python, " +
        "TypeScript, or a browser test. The checkpoint evaluates a knowledge " +
        "question, not the installed environment. Notes and bookmarks help you " +
        "resume learning, but they are not professional certification. During this " +
        "release, use the tabs, keyboard navigation, code-copy buttons, and saving " +
        "features to review the interface. Run the examples only after your local " +
        "language workspace and browser dependencies are prepared."
    }
  ],

  handsOn: {
    steps: [
      "Choose the Python or TypeScript example. Keep their projects separate.",
      "Use an already prepared workspace with that language's test runner and Chromium installed.",
      "Save the example using its displayed filename.",
      "Run the matching command listed below.",
      "Compare the actual runner output with the expected behavior.",
      "Change both the filled and expected value to Automation learner, save, and rerun."
    ],
    deliverable:
      "A locally saved test whose action and assertion agree on Automation learner.",
    expected:
      "The correctly configured test should pass. Only the actual local run establishes its result."
  },

  challenge: {
    task:
      "Add a second fill operation that replaces the name with Future engineer, " +
      "then assert that value. Explain what this still does not prove about persistence.",
    solution:
      "After the first assertion, fill the same locator with Future engineer and " +
      "assert that exact value. This checks the input's new state, not server-side " +
      "saving or persistence after refreshing."
  },

  checkpoint: [
    {
      question: "Which operation checks the input's result?",
      choices: [
        "Creating the HTML page",
        "Filling the input",
        "Asserting the input value",
        "Changing the filename"
      ],
      correctIndex: 2,
      answer:
        "The value assertion checks the result. Creating the page arranges state; filling performs an action."
    },
    {
      question: "Does this example prove that a backend saved the profile?",
      choices: [
        "Yes, because typing succeeded",
        "No, it only checks the input value",
        "Yes, when the browser is visible",
        "Only when the theme is dark"
      ],
      correctIndex: 1,
      answer:
        "No backend is involved. The assertion only checks the input state exercised by this example."
    },
    {
      question: "What should you do after deliberately expecting the wrong name?",
      choices: [
        "Delete the assertion",
        "Change the report to passed",
        "Ignore the output",
        "Inspect the mismatch and restore the intended expectation"
      ],
      correctIndex: 3,
      answer:
        "Use the failure as evidence. Fix the mismatch without weakening the behavior being verified."
    }
  ],

  proTips: [
    "Name tests after the behavior they verify.",
    "Pair interactions with checks of relevant outcomes.",
    "Identify the language and runner before copying commands."
  ],

  commonMistakes: [
    "Treating a successful action as full verification: add an outcome assertion.",
    "Using the wrong expected value: compare it with the requirement.",
    "Claiming backend persistence: add a separate persistence scenario before making that claim."
  ],

  codeExamples: [
    {
      language: "python",
      filename: "test_display_name.py",
      source: `from playwright.sync_api import Page, expect


def test_display_name(page: Page):
    page.set_content("""
        <label for="display-name">Display name</label>
        <input id="display-name">
    """)

    field = page.get_by_label("Display name")
    field.fill("Asha")
    expect(field).to_have_value("Asha")
`
    },
    {
      language: "typescript",
      filename: "display-name.spec.ts",
      source: `import { test, expect } from '@playwright/test';

test('display name contains the entered value', async ({ page }) => {
  await page.setContent(\`
    <label for="display-name">Display name</label>
    <input id="display-name">
  \`);

  const field = page.getByLabel('Display name');
  await field.fill('Asha');
  await expect(field).toHaveValue('Asha');
});
`
    }
  ],

  runInstructions: [
    {
      title: "Python — prepared environment",
      command: "python -m pytest test_display_name.py --browser chromium",
      note:
        "Use the Python executable belonging to your prepared environment. " +
        "The command does not install pytest, Playwright, or browsers."
    },
    {
      title: "TypeScript — prepared Playwright Test project",
      command: "npx playwright test display-name.spec.ts --project=chromium",
      note:
        "Put the file in your configured test directory. This command assumes " +
        "your project defines a Chromium project with that name."
    }
  ],

  furtherReading: [
    "https://playwright.dev/python/docs/writing-tests",
    "https://playwright.dev/docs/writing-tests",
    "https://playwright.dev/python/docs/locators"
  ]
};

export const course = {
  ...foundation,
  release: "B",

  modules: [
    {
      id: "review-workspace",
      phaseId: "phase-0",
      title: "Interface review — not final curriculum",
      description: "A small fixture for reviewing Release B.",
      order: 0,
      icon: "book",
      estimatedHours: 0.5
    }
  ],

  lessons: [
    {
      id: "review-first-check",
      moduleId: "review-workspace",
      title: "Review the learning experience",
      summary: topic.summary,
      difficulty: "beginner",
      estimatedMinutes: 30,
      order: 0
    }
  ],

  topics: [topic]
};

export function courseErrors(value = course) {
  const errors = validateCatalog(value);

  for (const item of value.topics || []) {
    if (item.status !== "published") continue;

    for (const question of item.checkpoint || []) {
      if (
        !Array.isArray(question.choices) ||
        question.choices.length < 2 ||
        question.choices.some(choice => typeof choice !== "string" || !choice.trim()) ||
        !Number.isInteger(question.correctIndex) ||
        question.correctIndex < 0 ||
        question.correctIndex >= question.choices.length
      ) {
        errors.push(`${item.id}: invalid multiple-choice question.`);
      }
    }
  }

  return errors;
}