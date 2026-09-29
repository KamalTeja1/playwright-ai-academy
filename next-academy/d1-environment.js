const section = (heading, body) => ({ heading, body });

const question = (text, choices, correctIndex, answer) => ({
  question: text,
  choices,
  correctIndex,
  answer
});

const example = (language, filename, source) => ({
  language,
  filename,
  source
});

const command = (title, value, note) => ({
  title,
  command: value,
  note
});

const PYTHON_DOCS = "https://docs.python.org/3/";
const PLAYWRIGHT_VERSION = "1.62.0";

function topic(number, details) {
  return {
    id: `p0-environment-${number}`,
    lessonId: `p0-environment-lesson-${number}`,
    order: number - 1,
    status: "published",
    difficulty: "beginner",
    isReviewFixture: false,
    contentRelease: "D1",
    ...details
  };
}

export const environmentModule = {
  id: "p0-environment",
  phaseId: "phase-0",
  title: "0.1 · Environment Setup",
  description:
    "Prepare the tools, understand their responsibilities, and verify two separate automation workspaces.",
  order: 0,
  icon: "tools",
  estimatedHours: 6.5
};

export const environmentTopics = [
  topic(1, {
    title: "Install Python (3.10+), VS Code, Git",
    estimatedMinutes: 60,
    tags: ["installation", "python", "git", "vscode", "node"],
    summary:
      "Install the editor, interpreter, and version-control tool as separate applications. " +
      "Verify each tool before adding automation dependencies.",
    whyItMatters:
      "A known environment makes later failures easier to diagnose. " +
      "A missing interpreter should not be mistaken for a broken browser test.",

    content: [
      section("Know what each tool does",
        "A browser displays websites. VS Code edits files. Python executes Python programs. " +
        "Git records changes to files so you can inspect earlier versions. These are different jobs, " +
        "and installing one does not reliably install the others. Start in a personal, writable folder " +
        "named academy-work. Keep this learning folder separate from the repository containing this " +
        "website. You are creating an automation workspace, not replacing your website files. " +
        "An editor tab is not automatically a saved file; save and reopen a note to verify the location."),

      section("Choose the correct installation path",
        "The syllabus says Python 3.10+, but that is a minimum idea, not permission to choose an " +
        "unsupported operating system. This guided path uses Windows 11, macOS 14 or newer, or " +
        "Ubuntu 24.04. For another system, check the official Playwright support list before proceeding. " +
        "Use Python 3.14 on the Windows and macOS paths; Ubuntu uses its supported distribution Python. " +
        "Choose a current maintenance release within the selected series. Do not uninstall or replace " +
        "the operating system's Python to follow this course."),

      section("Install from identifiable sources",
        "Open the official Python, VS Code, and Git download references below. On Windows, the " +
        "Python install manager can install and select a Python runtime; its commands differ from " +
        "an older standalone-installer workflow. On macOS, use the official installer package. " +
        "On Ubuntu, install the named packages using the system package manager. Follow your " +
        "organization's software policy. Do not bypass administrative restrictions or download a " +
        "similarly named executable from an advertisement. Git for Windows also provides Git Bash, " +
        "which the terminal practice topic uses explicitly."),

      section("Verify one dependency at a time",
        "After installation, open a new terminal so updated command locations are visible. " +
        "Run the command for the selected Python runtime and then git --version. Record actual " +
        "output privately, without publishing your personal home-directory path. Open VS Code, " +
        "choose File → Open Folder, and select academy-work. Create tools.txt, save it, close the " +
        "tab, and reopen the file from Explorer. If a version command fails, stop there: adding " +
        "browser packages will not repair a missing runtime."),

      section("Prepare for two languages without mixing them",
        "Python and TypeScript use different runtime and package ecosystems. TypeScript examples " +
        "will require Node.js and npm in Topic 5, so install the supported Node.js 24 series now " +
        "if you intend to run both language tracks. This does not replace Python or pip. " +
        "We will create sibling python-work and ts-work folders later. Browser examples shown " +
        "on this page are deliberately deferred until those environments exist. Your immediate " +
        "success criterion is installed tools and verified commands, not an unexplained green test.")
    ],

    handsOn: {
      steps: [
        "Create academy-work in Documents or another writable personal location.",
        "Windows 11: install the Python install manager from the official Python Windows page. Open a NEW Command Prompt, then run py install 3.14. If an older launcher handles py and rejects install, stop and follow the official manager conflict guidance rather than stacking installations.",
        "macOS 14+: download the current Python 3.14 macOS installer package from python.org, open it, and follow its installer. Open a NEW Terminal afterward.",
        "Ubuntu 24.04: run sudo apt update, then sudo apt install python3 python3-venv python3-pip git. Administrator permission may be required. Do not run these apt commands on macOS or Windows.",
        "Install VS Code using the official package for your operating system and architecture. Windows: user installer; macOS: move the application to Applications; Ubuntu: install the official .deb using the package installer.",
        "Install Git from its official platform instructions if the Ubuntu step did not already install it. On macOS, follow the official Git page's available platform installation path.",
        "For the TypeScript track, install a current Node.js 24 release using the official Node download instructions. Verify both node and npm in a new terminal.",
        "Open academy-work in VS Code, create tools.txt, and explain the purpose of Python, VS Code, Git, and Node in one sentence each.",
        "Run only the verification block matching your operating system. Record actual versions. Do not run the browser examples until Topic 5 is complete."
      ],
      deliverable:
        "A saved tools.txt, a working editor, and actual Python/Git version output. Node/npm are also verified if preparing both tracks.",
      expected:
        "The commands report installed versions. No command on this page proves that a browser test has passed."
    },

    challenge: {
      task:
        "Explain why installing the Python extension in VS Code does not prove that Python is installed or that a browser test can run.",
      solution:
        "The extension adds editor integration. A separate interpreter executes Python, project packages provide pytest/Playwright, and browser binaries are installed separately."
    },

    checkpoint: [
      question("Which tool executes a Python program?",
        ["Git", "The Python interpreter", "A saved text file", "The browser address bar"], 1,
        "The interpreter executes Python. Git tracks changes and VS Code edits files."),
      question("What does git --version verify?",
        ["Git can be invoked", "Your tests passed", "Your repository is public", "Your browser is installed"], 0,
        "It verifies the command is available, not a deployment or test result."),
      question("Where should your practice project go?",
        ["Inside an operating-system directory", "Inside the Python executable folder", "A writable personal folder", "Inside browser cache"], 2,
        "A separate writable folder keeps your project identifiable and avoids modifying installed software.")
    ],

    proTips: [
      "Record the runtime series and the actual installed maintenance version.",
      "Open a fresh terminal after an installation changes command lookup.",
      "Keep the website repository separate from the learner's automation projects."
    ],

    commonMistakes: [
      "Using a package intended for the wrong architecture: check the computer's system information.",
      "Assuming the editor installs Python: verify the interpreter independently.",
      "Continuing after a failed version check: diagnose the failed dependency first."
    ],

    codeExamples: [
      example("python", "test_d1_tools.py",
`import sys
from playwright.sync_api import Page, expect


def test_python_workspace(page: Page):
    assert sys.version_info >= (3, 10)
    page.set_content("<h1>Python workspace</h1>")
    expect(page.get_by_role("heading")).to_have_text("Python workspace")
`),
      example("typescript", "d1-tools.spec.ts",
`import { test, expect } from '@playwright/test';

test('TypeScript workspace', async ({ page, browser }) => {
  expect(browser.version()).not.toBe('');
  await page.setContent('<h1>TypeScript workspace</h1>');
  await expect(page.getByRole('heading')).toHaveText('TypeScript workspace');
});
`)
    ],

    runInstructions: [
      command("Windows — Command Prompt", "py -3.14 --version\ngit --version\nnode --version\nnpm --version",
        "Run one line at a time. Node/npm are needed for the later TypeScript workspace."),
      command("macOS — Terminal", "python3.14 --version\ngit --version\nnode --version\nnpm --version",
        "Use the runtime installed by the official Python installer."),
      command("Ubuntu 24.04 — Terminal", "python3 --version\ngit --version\nnode --version\nnpm --version",
        "The distribution Python version may differ from the Windows/macOS path."),
      command("Deferred examples — after Topic 5", "python -m pytest tests/test_d1_tools.py --browser chromium -q\nnpx playwright test d1-tools.spec.ts --project=chromium",
        "The first command belongs in activated python-work; the second belongs in ts-work. Do not run both from the same project.")
    ],

    furtherReading: [
      "https://www.python.org/downloads/",
      "https://docs.python.org/3/using/windows.html",
      "https://code.visualstudio.com/docs/setup/setup-overview",
      "https://git-scm.com/book/en/v2/Getting-Started-Installing-Git",
      "https://nodejs.org/en/download",
      "https://playwright.dev/python/docs/intro"
    ]
  }),

  topic(2, {
    title: "VS Code extensions: Python, Pylance, Playwright Test, GitLens",
    estimatedMinutes: 45,
    tags: ["extensions", "editor", "pylance", "gitlens"],
    summary:
      "Give VS Code the capabilities needed by each language. " +
      "Distinguish Python test discovery from the TypeScript Playwright Test extension.",
    whyItMatters:
      "The wrong editor integration or interpreter can make correct project code appear broken. " +
      "You need to know which tool is actually running a test.",

    content: [
      section("Extensions add capabilities",
        "An extension changes what the editor can understand or display. It is not a universal " +
        "runtime installer. Open Extensions from VS Code's activity bar and inspect the publisher " +
        "before installing a similarly named result. Microsoft's Python extension integrates interpreter " +
        "selection, execution, debugging, and Python testing workflows. Pylance supplies language " +
        "analysis such as completion suggestions and type information. Depending on your setup, " +
        "related components may be installed together, but you should still understand their " +
        "separate responsibilities and verify that the intended extensions are enabled."),

      section("Python tests have a Python runner",
        "The Python course runs pytest with the pytest-playwright plugin. VS Code's Python " +
        "testing integration discovers and launches those tests. When the environment exists, use " +
        "Python: Select Interpreter and choose the project's venv interpreter, then Python: Configure " +
        "Tests and choose pytest. An empty test explorer can mean discovery is configured for the " +
        "wrong directory, pytest is missing from the chosen interpreter, or no matching test file " +
        "has been saved yet. It does not automatically mean the browser locator is wrong."),

      section("TypeScript uses a separate integration",
        "Microsoft's Playwright Test extension integrates with the Node-based Playwright Test " +
        "runner. Use it in the TypeScript workspace once that workspace contains its package " +
        "dependencies and configuration. Do not promise that this extension's test list runs a " +
        "Python pytest suite. Similar browser APIs do not make the runners interchangeable. " +
        "Keep the Python and TypeScript projects in separate editor windows while learning if " +
        "that helps you identify the active environment, configuration, and test collection."),

      section("Use diagnostics instead of silencing them",
        "Pylance can report an unresolved import because VS Code selected a different interpreter " +
        "from the terminal. Compare the executable path and package location before reinstalling " +
        "everything. Type annotations improve descriptions and suggestions, but writing Page in a " +
        "parameter annotation does not create a browser. The fixture or lifecycle code supplies " +
        "that object at runtime. Treat a suggestion as something to review. Blindly accepting " +
        "every completion can insert an API from the wrong language or an irrelevant import."),

      section("GitLens is useful but optional",
        "GitLens helps explore Git changes and history. A new folder without commits has little " +
        "history to inspect, and a highlighted author does not prove a line is correct. " +
        "You do not need a paid GitLens feature to execute this course's examples. Review " +
        "account and network prompts under your organization's rules. Verify one editor capability " +
        "at a time: saving a file, language analysis, interpreter selection, then test discovery. " +
        "Keep the matching terminal command as a reference when editor and terminal outcomes disagree.")
    ],

    handsOn: {
      steps: [
        "Open VS Code's Extensions view.",
        "Find Python published by Microsoft and install or enable it.",
        "Find Pylance published by Microsoft and confirm it is enabled.",
        "Find Playwright Test published by Microsoft and install it for the TypeScript track.",
        "Find GitLens from GitKraken. Install it only if permitted; it is optional for running the course.",
        "Do not expect browser tests to run yet. After Topic 4, select python-work's venv interpreter. After Topic 5, configure pytest discovery in its tests folder.",
        "After Topic 5, save the paired examples in the matching projects. Run each from its terminal first, then through its corresponding test interface.",
        "If discovery differs, compare the active project, interpreter, saved filename, and runner."
      ],
      deliverable:
        "An editor with verified extensions and an explanation of which integration serves each language.",
      expected:
        "Python tests use Python/pytest discovery; TypeScript tests use the Playwright Test integration."
    },

    challenge: {
      task:
        "The terminal runs a Python test, but VS Code shows an unresolved playwright import. What should you inspect before installing packages again?",
      solution:
        "Compare VS Code's selected interpreter with the terminal interpreter. Check the environment path and installed packages for that interpreter."
    },

    checkpoint: [
      question("Which integration should run the Python pytest suite?",
        ["The Python testing integration", "A CSS extension", "GitLens history", "The TypeScript runner automatically"], 0,
        "The Python extension's testing workflow uses the selected Python environment and pytest."),
      question("Does a Page annotation launch a browser?",
        ["Always", "Only on Windows", "No", "Only with Pylance"], 2,
        "Annotations describe types. Fixtures or explicit lifecycle code provide runtime objects."),
      question("Is a paid GitLens feature required for these examples?",
        ["Yes", "No", "Only for Python", "Only for dark mode"], 1,
        "GitLens is optional history tooling, not the browser-test runner.")
    ],

    proTips: [
      "Verify extension publishers before installing.",
      "Compare editor and terminal environments before changing dependencies.",
      "Use separate VS Code windows for the two language projects initially."
    ],

    commonMistakes: [
      "Using the TypeScript explorer to diagnose Python discovery: switch to Python testing.",
      "Suppressing unresolved imports immediately: inspect interpreter selection first.",
      "Expecting Git history in an uncommitted folder: create meaningful commits when version-control lessons begin."
    ],

    codeExamples: [
      example("python", "test_d1_editor.py",
`from playwright.sync_api import Page, expect


def test_editor_discovery(page: Page):
    page.set_content('<label for="name">Name</label><input id="name">')
    field = page.get_by_label("Name")
    field.fill("Editor ready")
    expect(field).to_have_value("Editor ready")
`),
      example("typescript", "d1-editor.spec.ts",
`import { test, expect } from '@playwright/test';

test('editor discovery', async ({ page }) => {
  await page.setContent('<label for="name">Name</label><input id="name">');
  const field = page.getByLabel('Name');
  await field.fill('Editor ready');
  await expect(field).toHaveValue('Editor ready');
});
`)
    ],

    runInstructions: [
      command("After Topic 5 — activated python-work", "python -m pytest tests/test_d1_editor.py --browser chromium -v",
        "Use Python: Configure Tests → pytest → tests for editor discovery."),
      command("After Topic 5 — ts-work", "npx playwright test d1-editor.spec.ts --project=chromium",
        "The TypeScript configuration is created in Topic 5.")
    ],

    furtherReading: [
      "https://code.visualstudio.com/docs/python/testing",
      "https://code.visualstudio.com/docs/python/environments",
      "https://playwright.dev/docs/getting-started-vscode",
      "https://help.gitkraken.com/gitlens/gitlens/"
    ]
  }),

  topic(3, {
    title: "Terminal basics: cd, ls, mkdir, touch, rm, cp, mv, pwd, cat",
    estimatedMinutes: 60,
    tags: ["terminal", "bash", "paths", "files", "safety"],
    summary:
      "Navigate and manipulate disposable files from a terminal. " +
      "Learn what each command changes before using it in a real project.",
    whyItMatters:
      "Commands operate from a location and can modify real files. " +
      "Understanding paths prevents both confusing test errors and accidental deletion.",

    content: [
      section("A terminal and shell are different",
        "The terminal is the interface that displays input and output. A shell interprets the " +
        "commands you type. This topic uses Bash-style commands: Git Bash on Windows, or the " +
        "usual Bash/zsh terminal on macOS and Ubuntu. Command Prompt and PowerShell are different " +
        "shells; some names overlap, but syntax and behavior can differ. In VS Code, open the " +
        "arrow beside the terminal's plus button to choose a profile. Read the profile name " +
        "before copying a command and never include the displayed prompt as part of your input."),

      section("Inspect before you modify",
        "pwd prints the current working directory. ls lists its visible entries. cd changes " +
        "directories, while cd .. moves to the parent. A relative path is interpreted from " +
        "your current directory; an absolute path identifies a location from the filesystem root. " +
        "Quote a path containing spaces. Start every risky operation by checking pwd and ls. " +
        "A correct test command can still fail from the wrong folder because the same relative " +
        "test filename now refers to a different location."),

      section("Create and inspect a small sandbox",
        "mkdir creates a directory. touch creates an empty file when the path does not exist " +
        "and normally updates timestamps when it does. It does not write the sentence you " +
        "want inside the file. Use VS Code to edit that sentence, save it, and then inspect " +
        "it using cat. Seeing the saved content in another tool is useful evidence that you " +
        "edited the intended file rather than an unsaved tab. Keep this exercise entirely " +
        "inside a new, disposable terminal-sandbox folder."),

      section("Copy, rename, and remove carefully",
        "cp copies a source to a destination while retaining the source. mv moves or renames " +
        "an entry. A destination that already exists may be overwritten, so inspect names " +
        "before proceeding. rm removes a file and may not use the desktop recycle bin. " +
        "This exercise uses rm -i with one exact disposable filename so the shell asks " +
        "for confirmation. Do not use recursive flags, wildcards, elevated privileges, or " +
        "shortcuts pointing at your home directory. If a target is unfamiliar, stop rather than guessing."),

      section("Connect file operations to automation",
        "Your tests also create and inspect files: reports, downloads, snapshots, and temporary " +
        "data. That does not justify giving a test broad access to arbitrary directories. " +
        "Use test-owned locations and inspect paths before deleting artifacts. The paired " +
        "examples below use an isolated temporary or output directory, create an original, " +
        "and verify a copy's contents. They do not need your personal documents. After the " +
        "exercise, explain which operations only displayed information and which changed " +
        "the filesystem; that distinction is more valuable than memorizing a command list.")
    ],

    handsOn: {
      steps: [
        "Open academy-work in VS Code. Choose Terminal → New Terminal.",
        "Windows: select Git Bash for this topic. macOS/Ubuntu: use the normal terminal.",
        "Run pwd and ls. Confirm you are in academy-work.",
        "Run mkdir terminal-sandbox, then cd terminal-sandbox.",
        "Run touch original.txt. Open that file in VS Code, type Sandbox only, and save.",
        "Run cat original.txt. Confirm the saved sentence appears.",
        "Run cp original.txt copy.txt, then mv copy.txt renamed.txt, then ls.",
        "Run rm -i renamed.txt. Read the prompt and confirm only that disposable file.",
        "Run ls to confirm original.txt remains, then cd .. and pwd.",
        "For the following Windows virtual-environment topic, switch back to Command Prompt when its instructions say so."
      ],
      deliverable:
        "A terminal-sandbox folder retaining original.txt while the disposable renamed copy is removed.",
      expected:
        "Only the explicitly named practice files are modified."
    },

    challenge: {
      task:
        "Repeat the copy-and-rename exercise using a filename containing a space, without using wildcards.",
      solution:
        "Quote the complete paths, for example cp 'original note.txt' 'copy note.txt'. Inspect each destination before changing or removing it."
    },

    checkpoint: [
      question("Which command displays your current working directory?",
        ["rm", "pwd", "touch", "mv"], 1,
        "pwd reports location without changing files."),
      question("What does touch do to an existing file?",
        ["Always erases it", "Runs Python inside it", "Normally updates timestamps", "Makes a directory"], 2,
        "touch is not a text editor and does not supply the intended file content."),
      question("Which deletion belongs in this exercise?",
        ["An exact disposable filename with confirmation", "Your home directory", "Every matching file on the machine", "A system folder"], 0,
        "Keep the operation limited to the known sandbox file.")
    ],

    proTips: [
      "Inspect pwd and ls before modifying files.",
      "Quote paths containing spaces.",
      "Use disposable files when learning unfamiliar commands."
    ],

    commonMistakes: [
      "Mixing shell syntaxes: identify the terminal profile first.",
      "Expecting touch to write text: save content with the editor.",
      "Assuming rm uses the recycle bin: treat removal as potentially irreversible."
    ],

    codeExamples: [
      example("python", "test_d1_files.py",
`from pathlib import Path
from shutil import copyfile
from playwright.sync_api import Page, expect


def test_copy_in_sandbox(tmp_path: Path, page: Page):
    original = tmp_path / "original.txt"
    copied = tmp_path / "copy.txt"
    original.write_text("Sandbox only", encoding="utf-8")
    copyfile(original, copied)
    assert copied.read_text(encoding="utf-8") == "Sandbox only"

    page.set_content("<h1>File copied</h1>")
    expect(page.get_by_role("heading")).to_have_text("File copied")
`),
      example("typescript", "d1-files.spec.ts",
`import { test, expect } from '@playwright/test';
import { writeFile, copyFile, readFile } from 'node:fs/promises';

test('copy in a test-owned directory', async ({ page }, testInfo) => {
  const original = testInfo.outputPath('original.txt');
  const copied = testInfo.outputPath('copy.txt');

  await writeFile(original, 'Sandbox only', 'utf8');
  await copyFile(original, copied);
  expect(await readFile(copied, 'utf8')).toBe('Sandbox only');

  await page.setContent('<h1>File copied</h1>');
  await expect(page.getByRole('heading')).toHaveText('File copied');
});
`)
    ],

    runInstructions: [
      command("Bash-style inspection commands", "pwd\nls",
        "Use Git Bash on Windows for this topic. Do not paste the terminal prompt."),
      command("After Topic 5 — activated python-work", "python -m pytest tests/test_d1_files.py --browser chromium -q",
        "pytest supplies an isolated tmp_path for this example."),
      command("After Topic 5 — ts-work", "npx playwright test d1-files.spec.ts --project=chromium",
        "The files are created under the test-owned output path.")
    ],

    furtherReading: [
      "https://code.visualstudio.com/docs/terminal/basics",
      "https://www.gnu.org/software/coreutils/manual/",
      "https://docs.pytest.org/en/stable/how-to/tmp_path.html"
    ]
  }),

  topic(4, {
    title: "Virtual environments: python -m venv venv, activation, deactivation",
    estimatedMinutes: 60,
    tags: ["venv", "interpreter", "isolation", "activation"],
    summary:
      "Create a separate Python package environment for your project. " +
      "Understand activation, explicit interpreter paths, and deactivation.",
    whyItMatters:
      "Separate environments reduce dependency conflicts and make it possible to identify which packages your tests are actually using.",

    content: [
      section("What a virtual environment isolates",
        "A Python virtual environment provides a project-specific interpreter setup and package " +
        "installation area. It does not create a new operating system, container, or security " +
        "sandbox for untrusted code. Its Python version comes from the interpreter used to " +
        "create it. Separate projects can use separate package installations without intentionally " +
        "changing system Python. Keep your own source files outside the environment folder. " +
        "The environment contains generated tools and libraries, not the place where you " +
        "should start writing application code."),

      section("Create the environment deliberately",
        "Inside academy-work, create python-work and open it as the VS Code project. " +
        "Verify the terminal location before running the creation command. This module calls " +
        "the environment folder venv; .venv is another common name, but switching names " +
        "midway breaks copied paths. On Windows, use the selected Python launcher version. " +
        "On macOS, call the installed Python 3.14 executable. Ubuntu uses its distribution " +
        "python3 with python3-venv installed. Creating an environment in the wrong directory " +
        "does not relocate it automatically when you open a different folder."),

      section("Activation is command lookup",
        "Activation adjusts the current shell so short commands usually resolve to the " +
        "environment's executables. Command Prompt uses an activation batch file; Bash-like " +
        "shells source an activation script. PowerShell has a separate script and policy " +
        "considerations. This module does not require weakening those policies: you can " +
        "invoke the environment's Python executable directly. That explicit path is often " +
        "the clearest troubleshooting tool. Activation applies to the shell session, not " +
        "every terminal, editor, or program on the machine."),

      section("Verify the selected interpreter",
        "Inspect sys.executable to see the executable path. Compare sys.prefix with " +
        "sys.base_prefix to check the normal venv distinction. A decorated terminal prompt " +
        "is useful but is not the only evidence. Invoke python -m pip --version from " +
        "the activated environment and inspect the reported package location. Select the " +
        "same interpreter in VS Code. If the editor and terminal disagree, reconcile " +
        "those paths before reinstalling dependencies. Do not publish your full personal " +
        "filesystem path when sharing a screenshot."),

      section("Deactivate and recreate safely",
        "deactivate restores the shell's previous command lookup after activation. It does " +
        "not delete files, uninstall dependencies, or stop another terminal's environment. " +
        "To move the project to another computer, recreate its environment from documented " +
        "requirements rather than copying venv and assuming it is portable. TypeScript " +
        "uses Node packages, package.json, and a lockfile instead of Python's venv command. " +
        "The two ecosystems share the need for reproducible setup, but they do not have " +
        "identical activation steps. Keep their instructions and project folders separate.")
    ],

    handsOn: {
      steps: [
        "Create academy-work/python-work with your file manager and open it in VS Code.",
        "Open a new terminal in python-work. Windows users: choose Command Prompt for the commands below.",
        "Run only your operating system's creation block.",
        "Run the verification command while the environment is activated.",
        "Use Python: Select Interpreter in the Command Palette and select python-work/venv's interpreter.",
        "Run deactivate. Then verify the environment using its explicit interpreter path.",
        "Activate it again before continuing to Topic 5.",
        "Do not copy, edit, or commit the generated environment contents."
      ],
      deliverable:
        "A venv folder inside python-work and a verified matching interpreter in VS Code.",
      expected:
        "The environment check prints True when run using the venv interpreter."
    },

    challenge: {
      task: "Run the environment interpreter without activating the shell.",
      solution:
        "From python-work use venv\\Scripts\\python.exe on Windows Command Prompt, " +
        "or ./venv/bin/python on macOS/Linux. Activation is optional with an explicit executable path."
    },

    checkpoint: [
      question("What does activation primarily change?",
        ["The entire operating system", "Current-shell command lookup", "Your Git history", "Browser passwords"], 1,
        "It adjusts the current shell's environment; it is not an operating-system replacement."),
      question("Which interpreter determines the venv Python version?",
        ["The one used to create it", "A random available version", "VS Code's theme", "The browser version"], 0,
        "Select the intended interpreter before creating the environment."),
      question("What does deactivate delete?",
        ["All packages", "Your tests", "The environment folder", "Nothing; it restores shell lookup"], 3,
        "Deactivation does not remove the project or environment.")
    ],

    proTips: [
      "Use explicit interpreter paths when environment selection is unclear.",
      "Keep your own test files outside venv.",
      "Recreate environments rather than copying them between machines."
    ],

    commonMistakes: [
      "Creating venv in the wrong folder: inspect terminal location first.",
      "Trusting only the prompt prefix: inspect sys.executable and pip location.",
      "Disabling security policies unnecessarily: use the explicit interpreter command."
    ],

    codeExamples: [
      example("python", "test_d1_environment.py",
`import sys
from playwright.sync_api import Page, expect


def test_project_environment(page: Page):
    assert sys.prefix != sys.base_prefix, "Run with the project venv"
    page.set_content("<h1>Python environment ready</h1>")
    expect(page.get_by_role("heading")).to_have_text("Python environment ready")
`),
      example("typescript", "d1-environment.spec.ts",
`import { test, expect } from '@playwright/test';
import { isAbsolute } from 'node:path';

test('Node project execution context', async ({ page }) => {
  expect(isAbsolute(process.cwd())).toBe(true);
  await page.setContent('<h1>Node project ready</h1>');
  await expect(page.getByRole('heading')).toHaveText('Node project ready');
});
`)
    ],

    runInstructions: [
      command("Windows — Command Prompt inside python-work",
        "py -3.14 -m venv venv\nvenv\\Scripts\\activate.bat",
        "These are Command Prompt commands, not PowerShell commands."),
      command("macOS — Terminal inside python-work",
        "python3.14 -m venv venv\nsource venv/bin/activate",
        "Use the installed Python 3.14 interpreter."),
      command("Ubuntu — Terminal inside python-work",
        "python3 -m venv venv\nsource venv/bin/activate",
        "Install python3-venv first if the creation command reports missing support."),
      command("Verify in the activated environment",
        'python -c "import sys; print(sys.executable); print(sys.prefix != sys.base_prefix)"\npython -m pip --version',
        "Expect the environment path and True. Read your actual output."),
      command("Deactivate",
        "deactivate",
        "Use this only after activating in that shell."),
      command("Explicit Windows interpreter",
        'venv\\Scripts\\python.exe -c "import sys; print(sys.prefix != sys.base_prefix)"',
        "Run in Command Prompt from python-work."),
      command("Explicit macOS/Linux interpreter",
        './venv/bin/python -c "import sys; print(sys.prefix != sys.base_prefix)"',
        "Run from python-work; activation is not required.")
    ],

    furtherReading: [
      "https://docs.python.org/3/library/venv.html",
      "https://code.visualstudio.com/docs/python/environments",
      "https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/"
    ]
  }),

  topic(5, {
    title: "pip essentials: pip install, pip freeze, requirements.txt",
    estimatedMinutes: 90,
    tags: ["pip", "dependencies", "requirements", "npm", "workspace"],
    summary:
      "Install the Python test packages into the correct environment and record their versions. " +
      "Prepare a separate TypeScript workspace so the module's paired examples can run.",
    whyItMatters:
      "Package installation, browser installation, and test execution are separate activities. " +
      "Understanding them prevents misleading setup diagnoses.",

    content: [
      section("Tie package installation to the interpreter",
        "pip installs Python distributions into an environment. Prefer python -m pip using " +
        "the selected environment interpreter rather than a bare pip command that might " +
        "resolve elsewhere. First inspect python -m pip --version and confirm its location. " +
        "Package installation downloads executable software, so use approved indexes and " +
        "review exact package names. Do not assume a similar-looking package is maintained " +
        "by the same organization. On a managed network, follow approved proxy and certificate " +
        "configuration instead of disabling verification when a download fails."),

      section("Understand the testing dependencies",
        "Playwright controls browsers. pytest discovers and runs Python test functions. " +
        "pytest-playwright integrates browser fixtures and options with pytest. This module " +
        "pins Playwright to 1.62.0, a documented teaching baseline, while recording the " +
        "plugin and transitive versions resolved during your installation. It does not claim " +
        "that this version is the newest release. The package installation does not finish " +
        "the browser download; run the explicit Chromium installation command afterward. " +
        "Supported Linux machines may also need operating-system libraries."),

      section("Requirements and snapshots are not identical promises",
        "A requirements.txt file is an input understood by pip. It may contain package names, " +
        "constraints, and other supported installation requirements. pip freeze prints installed " +
        "versions in requirement-style lines. Redirecting that output captures the environment " +
        "you currently have, including transitive packages. It does not explain why each " +
        "package exists, guarantee portability across operating systems, or solve a universal " +
        "lockfile. Keep the intentional dependency request in your notes and label the " +
        "snapshot with the environment and command that produced it."),

      section("Recreate without hiding problems",
        "A reproducibility check uses a new environment, installs the requirement file, " +
        "installs browser binaries, and runs the intended test. Do not install into system " +
        "Python merely because the environment failed. pip check checks installed-package " +
        "dependency consistency; it does not launch Chromium or verify your application. " +
        "If installation fails, stop and read the earliest useful error. If a browser " +
        "executable is missing, inspect the separate browser-install step. If pytest cannot " +
        "find the test, inspect the filename, function name, and current directory."),

      section("Prepare TypeScript without pretending it is Python",
        "The sibling ts-work project uses Node.js, npm, @playwright/test, and its own " +
        "configuration. npm's package-lock.json records that ecosystem's resolved dependency " +
        "tree; it is not produced by pip freeze. The configuration below declares Chromium " +
        "and a tests folder, making the example run commands explicit. Do not reuse the " +
        "Python tests directory or assume a global npm package is sufficient. Once both " +
        "workspaces run one example successfully, return to earlier topics if you want to " +
        "execute their deferred comparisons. Record real outcomes rather than copying expected output.")
    ],

    handsOn: {
      steps: [
        "Open python-work and activate venv using Topic 4's command for your shell.",
        "Run the Python installation commands below one at a time. Stop at an error.",
        "Create a tests folder using VS Code Explorer. Save the Python example as tests/test_d1_packages.py.",
        "Run the Python test command. Record its actual result.",
        "Run pip check and save the pip freeze snapshot only after inspecting the environment.",
        "Create academy-work/ts-work as a sibling folder, not inside python-work. Open it in a separate VS Code window.",
        "Verify Node.js 24 and npm. Run npm init -y, install the pinned Playwright Test package, and install Chromium using the TypeScript setup block.",
        "Create playwright.config.ts in ts-work and paste the configuration block below into that FILE, not into the terminal.",
        "Create ts-work/tests and save the TypeScript example as tests/d1-packages.spec.ts.",
        "Run the TypeScript example. You can now execute the earlier topics' examples in their matching projects."
      ],
      deliverable:
        "Two separate working projects, a reviewed Python requirement snapshot, and real output from one test in each language.",
      expected:
        "Each selected example should report one passing test in its own runner when setup succeeds. The website does not observe those runs."
    },

    challenge: {
      task:
        "Without deleting your working environment, describe the exact steps needed to reproduce the Python project on another supported computer.",
      solution:
        "Install a supported Python runtime, copy source and the reviewed requirement file, create a new venv, " +
        "install requirements with that interpreter, install browser binaries and needed OS libraries, then run the intended test. " +
        "Do not copy venv as a portable environment."
    },

    checkpoint: [
      question("Why use python -m pip?",
        ["It identifies which Python installs packages", "It starts a browser", "It fixes any error", "It creates a report"], 0,
        "It explicitly connects pip to the selected Python interpreter."),
      question("What does pip freeze primarily record?",
        ["A successful browser run", "Installed package versions", "An operating-system image", "A test strategy"], 1,
        "It captures installed versions, not application correctness or universal portability."),
      question("What downloads the Chromium binary here?",
        ["Saving requirements.txt", "Opening VS Code", "The Playwright browser-install command", "Running git status"], 2,
        "Browser installation is separate from Python or npm package installation."),
      question("Where does playwright.config.ts belong?",
        ["Inside venv", "In the TypeScript project root", "In the browser address bar", "Inside the Python executable"], 1,
        "It configures the TypeScript Playwright Test project.")
    ],

    proTips: [
      "Keep direct dependency choices distinguishable from the environment snapshot.",
      "Run only one selected test while verifying a new installation.",
      "Use separate folders and terminal windows for Python and TypeScript."
    ],

    commonMistakes: [
      "Installing with one interpreter and running another: compare executable and pip paths.",
      "Treating pip check as browser execution: run the actual test separately.",
      "Pasting configuration into the terminal: create the named file in the editor.",
      "Reusing an unrelated package-lock.json: keep the Node project self-contained."
    ],

    codeExamples: [
      example("python", "test_d1_packages.py",
`from importlib.metadata import version
from playwright.sync_api import Page, expect


def test_installed_packages(page: Page):
    assert version("playwright") == "${PLAYWRIGHT_VERSION}"
    page.set_content("<h1>Dependencies ready</h1>")
    expect(page.get_by_role("heading")).to_have_text("Dependencies ready")
`),
      example("typescript", "d1-packages.spec.ts",
`import { test, expect } from '@playwright/test';

test('installed runner controls the browser', async ({ page }) => {
  await page.setContent('<button>Continue</button>');
  await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
});
`)
    ],

    runInstructions: [
      command("Python setup — activated python-work",
        'python -m pip --version\npython -m pip install "playwright==1.62.0" pytest-playwright\npython -m playwright install chromium\npython -m pip check\npython -m pip freeze > requirements.txt',
        "The redirection overwrites requirements.txt. Use a new project or back up an existing file first."),
      command("Linux dependency recovery — supported Ubuntu only",
        "python -m playwright install --with-deps chromium",
        "Use if required OS libraries are missing. This may request administrator authorization; follow device policy."),
      command("Run Python example",
        "python -m pytest tests/test_d1_packages.py --browser chromium -q",
        "Expected: one passing test if installation and browser setup succeeded."),
      command("TypeScript setup — inside ts-work",
        "node --version\nnpm --version\nnpm init -y\nnpm install --save-dev --save-exact @playwright/test@1.62.0\nnpx playwright install chromium",
        "Run these only inside the new TypeScript project. Use a supported Node.js 24 release."),
      command("FILE: ts-work/playwright.config.ts — not a terminal command",
`import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ],
  reporter: 'list'
});
`,
        "Create this file with VS Code and save it before running the TypeScript test."),
      command("Run TypeScript example",
        "npx playwright test d1-packages.spec.ts --project=chromium",
        "The filename is matched in the configured tests folder."),
      command("Reinstallation reference — a NEW Python environment",
        "python -m pip install -r requirements.txt\npython -m playwright install chromium",
        "Do this only after creating and selecting the replacement environment. The file is a reviewed snapshot, not a cross-platform guarantee.")
    ],

    furtherReading: [
      "https://pip.pypa.io/en/stable/user_guide/",
      "https://pip.pypa.io/en/stable/cli/pip_freeze/",
      "https://pip.pypa.io/en/stable/cli/pip_check/",
      "https://playwright.dev/python/docs/intro",
      "https://playwright.dev/docs/intro",
      "https://playwright.dev/docs/test-configuration"
    ]
  }),

  topic(6, {
    title: "DevTools tour: Elements, Console, Network, Application, Sources, Performance, Lighthouse",
    estimatedMinutes: 75,
    tags: ["devtools", "browser", "debugging", "network", "accessibility"],
    summary:
      "Choose the right browser panel for a debugging question. " +
      "Gather evidence without exposing secrets or mistaking an audit score for a guarantee.",
    whyItMatters:
      "When automation fails, you need to inspect the page and its dependencies before changing locators, timeouts, or expected results.",

    content: [
      section("Inspect the page you actually have",
        "DevTools is a browser inspection interface, not a separate test runner. This topic " +
        "uses Chrome or Edge's Chromium-style panels; other browsers use different names " +
        "and layouts. Elements shows the current document structure and styles. Scripts " +
        "may have changed that structure after the original HTML response arrived. Inspect " +
        "a heading, a label, and its input. Identify their attributes and relationship " +
        "rather than immediately copying a long positional selector. Changing HTML in " +
        "Elements changes the current page session, not the source file on disk."),

      section("Use Console and Network as evidence",
        "Console displays messages and errors and can execute JavaScript. Do not paste " +
        "unknown code into it on an authenticated site; pasted code can access or alter " +
        "sensitive page state. Network records requests while recording is enabled. Reload " +
        "the local practice page and inspect the document request's status, headers, and " +
        "response. A successful status does not prove every user-facing requirement. " +
        "For a failed save workflow later, compare the response with the visible message " +
        "and Console errors instead of increasing a timeout blindly."),

      section("Storage and source inspection",
        "Application exposes resources such as cookies and local storage for the current " +
        "origin. An empty storage list is a legitimate observation on this small practice " +
        "page. Do not invent data merely to fill a checklist. Avoid copying tokens or " +
        "personal values into notes. Sources lets you inspect loaded scripts and set " +
        "breakpoints. Pausing JavaScript changes timing, so a delayed interface while " +
        "paused is not automatically a product defect. Observe where execution stops " +
        "and resume it deliberately before judging the final page state."),

      section("Performance and Lighthouse answer bounded questions",
        "Performance records work over time. Start with a specific question, such as what " +
        "happens after submitting the practice form, instead of recording a long session " +
        "without a hypothesis. Lighthouse audits a page under chosen conditions and " +
        "produces findings and scores. A small local page is useful for learning the " +
        "interface, not a realistic application benchmark. Automated accessibility checks " +
        "do not replace keyboard testing or broader evaluation. Record the tested page, " +
        "mode, and environment before comparing results from different runs."),

      section("Connect diagnostics with a meaningful check",
        "The paired tests below collect a console message and verify a visible heading " +
        "on a controlled page. The diagnostic message and the visible state are different " +
        "signals; neither should be substituted for an unrelated requirement. Browser " +
        "evidence can contain secrets, full URLs, and private content, so review it before " +
        "sharing. Your immediate goal is to choose a panel based on the symptom: Elements " +
        "for structure, Network for exchanges, Console and Sources for script behavior, " +
        "Application for storage, and Performance or Lighthouse for their specific investigations.")
    ],

    handsOn: {
      steps: [
        "Create a new folder academy-work/web-lab and save the practice HTML shown below as index.html inside it.",
        "Open a terminal in web-lab. Start the local server using your platform's command below. Keep that terminal running.",
        "Open http://127.0.0.1:8001 in Chrome or Edge on the same computer. In a remote Codespace, use that environment's forwarded port instead of your laptop's localhost.",
        "Open the browser menu → More tools → Developer tools. If a panel is hidden, use the overflow or More tools menu.",
        "Elements: inspect the Name label and input. Find the matching for and id values.",
        "Console: submit the form, then inspect its practice-only log message. Do not paste unknown code.",
        "Network: reload the page and inspect the HTML document request. A harmless favicon request may also appear; distinguish it from the document.",
        "Application: inspect this local origin's cookies and local/session storage. Empty stores are expected here.",
        "Sources: find the inline script, set a breakpoint inside the submit handler, submit, inspect the paused location, and resume.",
        "Performance: record a brief form interaction and stop recording. Lighthouse: run a local audit if available and inspect one finding, not only the score.",
        "Stop the server with Ctrl+C when finished. Do not terminate the separate academy-preview server by mistake."
      ],
      deliverable:
        "A private panel-to-question map covering all seven panels, based on the local practice page.",
      expected:
        "The form displays a greeting, logs a practice message, and remains on the same local page. Audit values depend on the real run."
    },

    challenge: {
      task:
        "A request reports success but the expected confirmation never appears. Which evidence should you compare before changing the test?",
      solution:
        "Compare response content, current DOM/UI state, and script errors. A successful HTTP status alone does not prove that the client completed the promised update."
    },

    checkpoint: [
      question("Which panel shows the current document structure?",
        ["Elements", "GitLens", "The package installer", "The system clock"], 0,
        "Elements exposes the current DOM and styles."),
      question("Does an HTTP success status prove the UI is correct?",
        ["Always", "Only in Chromium", "No", "Only when headed"], 2,
        "The client can mishandle a successful response or receive unexpected content."),
      question("Does a Lighthouse score certify full accessibility?",
        ["Yes, above 95", "No", "Only in light mode", "Only on localhost"], 1,
        "An automated audit is one form of evidence, not a complete accessibility evaluation."),
      question("Where should you inspect cookies and local storage?",
        ["Application", "A Python traceback", "Git history", "The screenshot filename"], 0,
        "Application exposes storage for the inspected browser origin.")
    ],

    proTips: [
      "Choose a debugging question before opening a recording.",
      "Use fictional local data while learning.",
      "Record audit conditions instead of comparing scores without context."
    ],

    commonMistakes: [
      "Pasting unknown Console scripts: review and trust code before execution.",
      "Sharing authorization headers or cookies: sanitize or avoid collecting them.",
      "Treating paused JavaScript as a product hang: resume the breakpoint first.",
      "Confusing a favicon failure with the main document request: inspect the request URL and type."
    ],

    codeExamples: [
      example("python", "test_d1_console.py",
`from playwright.sync_api import Page, expect


def test_console_and_page_state(page: Page):
    messages = []
    page.on("console", lambda message: messages.append(message.text))
    page.set_content("<h1>Diagnostics ready</h1>")
    page.evaluate("console.log('practice-only message')")
    expect(page.get_by_role("heading")).to_have_text("Diagnostics ready")
    assert "practice-only message" in messages
`),
      example("typescript", "d1-console.spec.ts",
`import { test, expect } from '@playwright/test';

test('console and page state', async ({ page }) => {
  const messages: string[] = [];
  page.on('console', message => messages.push(message.text()));
  await page.setContent('<h1>Diagnostics ready</h1>');
  await page.evaluate(() => console.log('practice-only message'));
  await expect(page.getByRole('heading')).toHaveText('Diagnostics ready');
  expect(messages).toContain('practice-only message');
});
`)
    ],

    runInstructions: [
      command("FILE: web-lab/index.html — paste into the editor",
`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>DevTools practice</title>
</head>
<body>
  <main>
    <h1>DevTools practice</h1>
    <form id="profile">
      <label for="name">Name</label>
      <input id="name" required>
      <button type="submit">Show greeting</button>
    </form>
    <p id="result" role="status"></p>
  </main>
  <script>
    document.getElementById("profile").addEventListener("submit", event => {
      event.preventDefault();
      const name = document.getElementById("name").value;
      document.getElementById("result").textContent = "Hello, " + name;
      console.log("practice form submitted");
    });
  </script>
</body>
</html>`,
        "This is a separate local practice page. It does not replace the academy's index.html."),
      command("Windows — serve web-lab",
        "py -3.14 -m http.server 8001 --bind 127.0.0.1",
        "Run in web-lab. Open the local page in your browser; stop with Ctrl+C."),
      command("macOS — serve web-lab",
        "python3.14 -m http.server 8001 --bind 127.0.0.1",
        "Run in web-lab, not in the academy repository."),
      command("Ubuntu or Linux Codespace — serve web-lab",
        "python3 -m http.server 8001 --bind 127.0.0.1",
        "For remote work, open the forwarded 8001 port."),
      command("Optional paired tests — prepared workspaces",
        "python -m pytest tests/test_d1_console.py --browser chromium -q\nnpx playwright test d1-console.spec.ts --project=chromium",
        "First command: activated python-work. Second command: ts-work. Run separately.")
    ],

    furtherReading: [
      "https://developer.chrome.com/docs/devtools/overview",
      "https://developer.chrome.com/docs/devtools/network/",
      "https://developer.chrome.com/docs/devtools/storage/",
      "https://developer.chrome.com/docs/lighthouse/overview",
      "https://docs.python.org/3/library/http.server.html"
    ]
  })
];

export const environmentLessons = environmentTopics.map(item => ({
  id: item.lessonId,
  moduleId: environmentModule.id,
  title: item.title,
  summary: item.summary,
  difficulty: item.difficulty,
  estimatedMinutes: item.estimatedMinutes,
  order: item.order
}));

export const environmentRelease = {
  id: "D1",
  playwrightVersion: PLAYWRIGHT_VERSION,
  teachingTargets: [
    "Windows 11 with Python 3.14",
    "macOS 14+ with Python 3.14",
    "Ubuntu 24.04 with distribution Python",
    "Node.js 24 for the TypeScript workspace"
  ],
  executionVerifiedInChat: false
};