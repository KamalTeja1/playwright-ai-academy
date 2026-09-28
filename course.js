(() => {
  "use strict";

  // This automatically uses your published website's address.
  const address = new URL("./index.html", window.location.href);
  address.hash = "practice";
  const practiceURL = JSON.stringify(address.href);

  const firstTest = `import { test, expect } from '@playwright/test';

test('practice page has a heading', async ({ page }) => {
  // Open your academy's practice application.
  await page.goto(${practiceURL});

  // Check an outcome a person can see.
  await expect(
    page.getByRole('heading', {
      name: 'Practice application',
      exact: true
    })
  ).toBeVisible();
});`;

  const loginTest = `import { test, expect } from '@playwright/test';

test('learner can use the demo login', async ({ page }) => {
  await page.goto(${practiceURL});

  // Public, fictional credentials. Never use a real password here.
  await page.getByLabel('Email', { exact: true })
    .fill('learner@example.com');

  await page.getByLabel('Password', { exact: true })
    .fill('practice123');

  await page.getByRole('button', {
    name: 'Sign in',
    exact: true
  }).click();

  // Check the result instead of adding an arbitrary delay.
  await expect(page.getByTestId('login-result'))
    .toHaveText('Welcome, learner!');
});`;

  const negativeLogin = loginTest
    .replace("learner can use the demo login", "incorrect password is rejected")
    .replace(".fill('practice123')", ".fill('wrong-password')")
    .replace("Welcome, learner!", "Invalid practice credentials.");

  const brokenLogin = loginTest
    .replace("name: 'Sign in'", "name: 'Log in'")
    .replace(".toHaveText('Welcome, learner!')", ".toHaveText('Success!')");

  const modules = [
    {
      title: "Getting started",
      level: "Beginner",
      outcome: "Install the tools, understand a test, and run your first scenario.",
      status: "Starter lessons available",
      topics: [
        "Browser automation and when to use it",
        "Test cases, assertions, expected results, and regression testing",
        "Windows, macOS, and Linux installation",
        "Project structure and the first TypeScript test",
        "Headed and headless execution"
      ]
    },
    {
      title: "JavaScript and TypeScript essentials",
      level: "Beginner",
      outcome: "Read and write the language features used in automation.",
      status: "Outline only",
      topics: [
        "Variables, functions, arrays, and objects",
        "Promises and async/await",
        "Imports, exports, and basic types",
        "Practical test-data transformations"
      ]
    },
    {
      title: "Playwright fundamentals",
      level: "Beginner",
      outcome: "Automate common interactions with resilient locators and assertions.",
      status: "Login exercise available; other lessons planned",
      topics: [
        "Test structure, configuration, and assertions",
        "Locators, auto-waiting, and web-first assertions",
        "Forms, buttons, dropdowns, checkboxes, and tables",
        "Dialogs, frames, tabs, and popups",
        "File uploads and downloads",
        "Hooks, grouping tests, and tags"
      ]
    },
    {
      title: "Building realistic test suites",
      level: "Intermediate",
      outcome: "Build reusable, isolated suites that cover realistic workflows.",
      status: "Outline only",
      topics: [
        "Positive, negative, boundary, and data-driven scenarios",
        "Authentication and reusable login state",
        "Fixtures and reusable test data",
        "Page Object Model: benefits and trade-offs",
        "Isolation and cleanup",
        "API testing combined with UI tests",
        "Network interception and mocking"
      ]
    },
    {
      title: "Advanced automation",
      level: "Advanced",
      outcome: "Design and maintain a scalable cross-browser framework.",
      status: "Outline only",
      topics: [
        "Browser contexts and multiple-user scenarios",
        "Cross-browser testing and device emulation",
        "Parallel execution, workers, and sharding",
        "Retries, timeouts, and flaky-test investigation",
        "Visual comparisons and accessibility testing",
        "Environment configuration and secrets handling",
        "Scalable framework design and maintenance"
      ]
    },
    {
      title: "Debugging, CI/CD, and reporting",
      level: "Intermediate",
      outcome: "Investigate failures and publish useful evidence from CI runs.",
      status: "Debugging challenge available; other lessons planned",
      topics: [
        "Inspector, UI mode, screenshots, videos, and traces",
        "Interpreting failures",
        "GitHub Actions",
        "Built-in reports and third-party reporting integrations",
        "Publishing reports and retaining test artifacts",
        "Flaky tests versus genuine product defects"
      ]
    },
    {
      title: "Playwright with AI assistance",
      level: "Intermediate",
      outcome: "Use AI to assist testing without trusting unverified generated code.",
      status: "Prompt library available; full lessons planned",
      topics: [
        "Turn requirements into scenarios",
        "Generate test drafts and review them critically",
        "Improve locators, assertions, and structure",
        "Explain errors and investigate failures",
        "Refactor duplicated code",
        "Recognize hallucinated APIs and weak tests",
        "Protect credentials, personal information, and proprietary data",
        "Review and execute generated tests before trusting them"
      ]
    }
  ];

  const lessons = [
    {
      id: "basics",
      title: "Meet browser automation",
      icon: "sparkles",
      level: "Beginner",
      file: "scenario-notes.txt",
      language: "typescript",
      objective: "Explain a test's purpose and distinguish actions from assertions.",
      prerequisites: "None. You can start here.",
      explanation:
        "Browser automation asks software to perform browser actions for you. " +
        "A useful test also checks what happened. Clicking Sign in is an action. " +
        "Checking that a welcome message appears is an assertion. " +
        "Automate repeatable, important workflows; keep human exploration for " +
        "unexpected behavior and usability questions.",
      code: `// A TypeScript string stores the message we expect.
const expectedMessage: string = 'Welcome, learner!';

// Inside a Playwright test, this checks a visible outcome.
await expect(page.getByTestId('login-result'))
  .toHaveText(expectedMessage);`,
      steps: [
        "Open Practice application from the navigation.",
        "Find the public, fictional credentials beside the demo login.",
        "Sign in and observe the welcome message.",
        "Try an incorrect password and observe the error.",
        "Return here and describe both scenarios in the exercise."
      ],
      exercise:
        "Write a positive scenario and a negative scenario. For each, state " +
        "the starting condition, action, and expected result.",
      starter:
        "// Positive scenario\n// Starting condition:\n// Action:\n// Expected result:\n\n" +
        "// Negative scenario\n// Starting condition:\n// Action:\n// Expected result:\n",
      expected:
        "Correct demo credentials produce Welcome, learner! " +
        "Incorrect credentials produce Invalid practice credentials.",
      mistakes: [
        "Clicks alone do not prove the application behaved correctly.",
        "Use fictional data only in this public practice application.",
        "A negative test should assert the expected rejection, not simply accept any failure."
      ],
      hints: [
        "Start both scenarios with the practice page open.",
        "Keep the email the same and change the password for the negative case."
      ],
      solution:
        "// Positive: open the practice page and submit the displayed credentials.\n" +
        "// Assert that the message is 'Welcome, learner!'.\n\n" +
        "// Negative: open the practice page and submit the displayed email\n" +
        "// with an incorrect password.\n" +
        "// Assert that the message is 'Invalid practice credentials.'.",
      quiz: {
        question: "Which statement describes an assertion?",
        choices: [
          "Click the Sign in button.",
          "The welcome message is visible.",
          "Enter an email address."
        ],
        correct: 1,
        explanation:
          "An assertion checks an expected outcome. Clicking and typing are actions."
      },
      challenge:
        "Describe a boundary test for a display name that allows 2 to 30 characters.",
      docs: "https://playwright.dev/docs/writing-tests"
    },
    {
      id: "installation",
      title: "Install your testing toolkit",
      icon: "terminal",
      level: "Beginner",
      file: "installation-notes.txt",
      language: "text",
      objective: "Create a local project that can run TypeScript Playwright tests.",
      prerequisites: "Complete the introduction. You need a computer.",
      explanation:
        "Node.js runs development tools. npm installs packages. VS Code is an editor. " +
        "Playwright Test runs your test files and controls the browser. " +
        "You do not need these tools to browse this academy; you need them to run " +
        "the automation exercises on your computer.",
      code: `node --version
npm --version

mkdir playwright-practice
cd playwright-practice
npm init -y
npm install --save-dev @playwright/test@1.63.0
npx playwright install chromium
mkdir tests
npx playwright --version`,
      steps: [
        "Check supported operating systems and Node.js versions in the official Playwright installation documentation linked below.",
        "Windows: download a supported Node.js LTS installer, run it, install VS Code, then open a new Command Prompt.",
        "macOS: install a supported Node.js LTS release and VS Code, then open a new Terminal window.",
        "Linux: install a supported Node.js LTS release using the official instructions for your distribution, then install VS Code.",
        "Run the first two commands to check that node and npm are available.",
        "Run the remaining commands one line at a time. Stop if a command reports an error.",
        "On supported Linux distributions, use npx playwright install --with-deps chromium if browser system dependencies are missing. Administrator permission may be required.",
        "In VS Code, use File → Open Folder and select playwright-practice.",
        "Inspect package.json, package-lock.json, node_modules, and tests. Do not edit node_modules."
      ],
      exercise: "Record the actual versions printed by your computer.",
      starter: "// Node.js version:\n// npm version:\n// Playwright version:\n",
      expected:
        "The version commands print installed versions. Playwright reports 1.63.0. " +
        "Your folder contains package.json, package-lock.json, node_modules, and tests. " +
        "The empty tests folder is expected at this stage.",
      mistakes: [
        "If node is not found, restart the terminal and check installation completed.",
        "Run the project commands inside playwright-practice.",
        "If Windows PowerShell blocks npm.ps1, use Command Prompt rather than weakening your system policy.",
        "Follow your administrator's rules on a managed computer."
      ],
      hints: [
        "Run each version command separately.",
        "Run npx playwright --version inside the project folder."
      ],
      solution:
        "// Record your real output, not invented results.\n" +
        "// Node.js: the installed supported version\n" +
        "// npm: the version printed on your computer\n" +
        "// Playwright: 1.63.0",
      quiz: {
        question: "Where should you write your own test files?",
        choices: ["node_modules", "tests", "The browser installation folder"],
        correct: 1,
        explanation:
          "Keep your tests in tests. node_modules contains installed dependencies."
      },
      challenge:
        "Explain why package.json and package-lock.json should be kept with the project.",
      docs: "https://playwright.dev/docs/intro"
    },
    {
      id: "first-test",
      title: "Write your first real test",
      icon: "code",
      level: "Beginner",
      file: "first.spec.ts",
      language: "typescript",
      objective: "Run a TypeScript test against the academy's practice application.",
      prerequisites: "Finish installation and open this academy at its published address.",
      explanation:
        "test names your scenario. The page fixture provides a browser tab. " +
        "async allows the function to use await. await waits for asynchronous work. " +
        "expect checks the outcome. Here, the test opens the practice page and " +
        "checks that its heading is visible.",
      code: firstTest,
      steps: [
        "Create first.spec.ts inside the tests folder on your computer.",
        "Copy the annotated example into that file and save it.",
        "The example URL automatically uses this academy's current published address.",
        "Run: npx playwright test tests/first.spec.ts --browser=chromium",
        "Run with a visible browser: npx playwright test tests/first.spec.ts --browser=chromium --headed",
        "Generate an HTML report: npx playwright test tests/first.spec.ts --browser=chromium --reporter=html",
        "Inspect the report with: npx playwright show-report"
      ],
      exercise:
        "Complete the missing assertion. Copy or download your draft, put it in " +
        "your local tests folder, and execute it there.",
      starter: `import { test, expect } from '@playwright/test';

test('practice page has a heading', async ({ page }) => {
  await page.goto(${practiceURL});

  // TODO: assert that the Practice application heading is visible.
});`,
      expected:
        "If the published site is reachable and the assertion is correct, the local " +
        "run should report one passed test. Only the real local run confirms this. " +
        "Headless mode does not display a browser window.",
      mistakes: [
        "Use a discoverable filename such as first.spec.ts.",
        "Keep await before browser actions and asynchronous assertions.",
        "If the browser executable is missing, revisit the browser installation step.",
        "If navigation returns 404, check that the academy has been published."
      ],
      hints: [
        "Use page.getByRole to find the heading by its accessible name.",
        "Use await expect(locator).toBeVisible() to check the result."
      ],
      solution: firstTest,
      quiz: {
        question: "What does the --headed option do?",
        choices: [
          "Removes assertions",
          "Displays the browser window",
          "Automatically fixes failing tests"
        ],
        correct: 1,
        explanation:
          "Headed mode displays the browser. It does not remove checks or repair failures."
      },
      challenge:
        "Temporarily use an incorrect heading name, run the test, and read the failure. " +
        "Then restore the correct name.",
      docs: "https://playwright.dev/docs/running-tests"
    },
    {
      id: "locators",
      title: "Automate the demo login",
      icon: "target",
      level: "Beginner",
      file: "login.spec.ts",
      language: "typescript",
      objective: "Use labels, roles, and exact expected messages in a login test.",
      prerequisites: "Run your first test successfully.",
      explanation:
        "A locator describes an element. A label connects an input to its visible " +
        "name. A role identifies a control such as a button. These describe user " +
        "intent more clearly than fragile position-based selectors. This practice " +
        "login is a front-end demonstration, not real authentication.",
      code: loginTest,
      steps: [
        "Try the practice login manually using the displayed credentials.",
        "Create tests/login.spec.ts on your computer.",
        "Copy the example into the file and save it.",
        "Run: npx playwright test tests/login.spec.ts --browser=chromium",
        "Complete the exercise by checking an incorrect-password scenario."
      ],
      exercise:
        "Complete a negative test that submits an incorrect password and checks " +
        "the exact rejection message.",
      starter: negativeLogin.replace(
        ".toHaveText('Invalid practice credentials.')",
        ".toHaveText('TODO')"
      ),
      expected:
        "The incorrect password produces Invalid practice credentials. " +
        "The test should explicitly assert that message.",
      mistakes: [
        "Checking only that a message exists could accept the wrong message.",
        "Do not use a fixed sleep instead of an awaited assertion.",
        "Never enter real credentials into this demo."
      ],
      hints: [
        "Keep the valid demo email and change the password.",
        "Read the rejection message in the application and use it in toHaveText."
      ],
      solution: negativeLogin,
      quiz: {
        question: "Which locator best describes the Email input?",
        choices: [
          "page.locator('input').first()",
          "page.getByLabel('Email', { exact: true })",
          "page.locator('div:nth-child(2) input')"
        ],
        correct: 1,
        explanation:
          "The visible label describes the input's purpose without relying on its position."
      },
      challenge:
        "Test the empty-email case and investigate how native form validation " +
        "prevents submission before the submit handler runs.",
      docs: "https://playwright.dev/docs/locators"
    },
    {
      id: "debugging",
      title: "Fix a broken test",
      icon: "bug",
      level: "Intermediate",
      file: "debug.spec.ts",
      language: "typescript",
      objective: "Diagnose a wrong locator and an incorrect expected result.",
      prerequisites: "Complete the login lesson.",
      explanation:
        "Investigate the first failing step before changing retries or timeouts. " +
        "Compare the locator with the actual page, then compare the assertion with " +
        "the requirement. Do not change correct application behavior just to satisfy " +
        "an incorrect test.",
      code: brokenLogin,
      steps: [
        "Save the broken example as tests/debug.spec.ts.",
        "Run: npx playwright test tests/debug.spec.ts --browser=chromium --debug",
        "Inspect the actual button name and fix the first mismatch.",
        "Run again, then inspect the incorrect expected message.",
        "Capture a trace with: npx playwright test tests/debug.spec.ts --browser=chromium --trace=on",
        "Use npx playwright show-trace followed by the trace.zip path printed in your output."
      ],
      exercise:
        "Fix both defects in the draft. Inspect the practice page before opening the solution.",
      starter: brokenLogin,
      expected:
        "The original test cannot find Log in. After that is corrected, the " +
        "Success! assertion is exposed as another defect. Verify the repaired test locally.",
      mistakes: [
        "A longer timeout cannot create a button with the wrong name.",
        "Fixing the locator leaves the incorrect message assertion.",
        "Matching the sample solution in this editor is not evidence of a passed test."
      ],
      hints: [
        "Compare Log in with the actual submit button's text.",
        "Sign in manually and compare the actual success message with the assertion."
      ],
      solution: loginTest,
      quiz: {
        question: "What should you do first when a locator cannot find a button?",
        choices: [
          "Increase retries",
          "Inspect the actual element and locator",
          "Delete the assertion"
        ],
        correct: 1,
        explanation:
          "Use evidence to diagnose the mismatch before changing timing or removing checks."
      },
      challenge:
        "Write a short failure report describing the locator defect and the assertion defect separately.",
      docs: "https://playwright.dev/docs/debug"
    }
  ];

  const glossary = [
    ["Assertion", "A check that an actual result matches an expected result."],
    ["Locator", "A description Playwright uses to find an element."],
    ["Fixture", "Reusable setup that supplies resources, such as a page, to a test."],
    ["Headless", "Running a browser without displaying its window."],
    ["Regression test", "A check that previously working behavior still works."],
    ["Test isolation", "Keeping tests independent of each other's state."],
    ["Promise", "An object representing an asynchronous operation's eventual result."],
    ["await", "Syntax used to wait for a promise in an async function."],
    ["Trace", "Recorded execution evidence for investigating a test run."],
    ["Flaky test", "A test that inconsistently passes and fails without a relevant change."],
    ["CI", "Continuous integration: automatically checking changes as they are integrated."],
    ["Mock", "A controlled substitute for a dependency or response in a test."]
  ];

  const prompts = [
    {
      title: "Turn requirements into scenarios",
      text:
        "Act as a careful test designer. Given this sanitized requirement, " +
        "propose positive, negative, and boundary scenarios. List assumptions. " +
        "Ask about missing acceptance criteria. Do not invent product behavior.\n\n" +
        "Requirement: "
    },
    {
      title: "Review a TypeScript test",
      text:
        "Review this Playwright 1.63.0 TypeScript test. Check its assertions, " +
        "locators, awaited promises, and isolation. Explain what it proves and " +
        "what it does not prove. Flag uncertain APIs and cite official documentation. " +
        "Do not claim to have executed it.\n\nRequirement:\n\nTest: "
    },
    {
      title: "Investigate a failure",
      text:
        "Help investigate this sanitized Playwright failure. Separate evidence " +
        "from hypotheses. Suggest the smallest next diagnostic step. Give hints " +
        "before the full solution. Do not assume longer timeouts fix the cause.\n\n" +
        "Failure:\n\nTest: "
    },
    {
      title: "Refactor without weakening coverage",
      text:
        "Suggest a small refactor for this sanitized Playwright test suite. " +
        "Preserve the behavior and meaningful assertions. Explain whether a helper, " +
        "fixture, or page object is justified. Avoid adding abstractions without " +
        "a clear benefit. Provide a verification plan.\n\nTests: "
    }
  ];

  const projects = [
    {
      title: "Your first automated suite",
      outcome: "Combine heading, navigation, and basic interaction checks.",
      milestones: [
        "Run the first heading test",
        "Add a navigation scenario",
        "Run both tests independently"
      ]
    },
    {
      title: "Login and form validation",
      outcome: "Cover positive, negative, and boundary cases.",
      milestones: [
        "Add valid and invalid demo login tests",
        "Check required profile fields",
        "Test display-name length boundaries"
      ]
    },
    {
      title: "E-commerce workflow",
      outcome: "Test catalog, cart, checkout, and rejection paths.",
      milestones: [
        "Define acceptance criteria",
        "Implement a fictional checkout practice app",
        "Cover successful and unsuccessful purchases"
      ]
    },
    {
      title: "Combined API and UI testing",
      outcome: "Prepare data through an API and verify it in the UI.",
      milestones: [
        "Create an isolated practice API",
        "Prepare and clean up test data",
        "Verify results through browser interactions"
      ]
    },
    {
      title: "Capstone framework",
      outcome: "Build a maintainable framework with CI and useful reports.",
      milestones: [
        "Design fixtures and reusable components",
        "Configure CI and artifact retention",
        "Document maintenance and failure triage"
      ]
    }
  ];

  window.ACADEMY = {
    version: "1.63.0",
    modules,
    lessons,
    glossary,
    prompts,
    projects
  };
})();