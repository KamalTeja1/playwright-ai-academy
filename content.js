(() => {
  "use strict";

  const DOCS = {
    vscode: "https://code.visualstudio.com/docs/python/python-tutorial",
    windows: "https://www.python.org/downloads/windows/",
    mac: "https://www.python.org/downloads/macos/",
    linux: "https://docs.python.org/3/using/unix.html",
    venv: "https://docs.python.org/3/library/venv.html",
    playwright: "https://playwright.dev/python/docs/intro",
    writing: "https://playwright.dev/python/docs/writing-tests"
  };

  // Commands deliberately use the environment's interpreter directly.
  // Activation is not required.
  const systems = {
    windows: {
      label: "Windows",
      boot: "py -3.13",
      run: String.raw`.\.venv\Scripts\python.exe`,
      list: "dir",
      location: "cd",
      shell: "Command Prompt"
    },
    mac: {
      label: "macOS",
      boot: "python3.13",
      run: "./.venv/bin/python",
      list: "ls",
      location: "pwd",
      shell: "zsh or bash"
    },
    linux: {
      label: "Ubuntu 24.04",
      boot: "python3",
      run: "./.venv/bin/python",
      list: "ls",
      location: "pwd",
      shell: "bash"
    }
  };

  const lessons = [
    {
      id: "computer-map",
      title: "Meet your computer's learning tools",
      icon: "map",
      objective: "Distinguish your browser, files, editor, terminal, and Python.",
      prerequisite: "None. Begin here.",
      explanation:
        "A browser displays websites. An editor changes files. A terminal accepts " +
        "text instructions. Python is the program that executes Python code. " +
        "These are different jobs: opening this academy does not install Python, " +
        "and typing code into a webpage does not automatically run it.",
      vocabulary: [
        "Application: a program you open, such as a browser.",
        "File: a named piece of saved information.",
        "Folder: a place used to organize files.",
        "Command: a text instruction submitted to a terminal."
      ],
      steps: [
        "Find the browser window displaying this lesson. Its address bar contains the website address.",
        "Open the computer's file manager: File Explorer on Windows, Finder on macOS, or Files on Ubuntu.",
        "Find your home or Documents folder. Do not open or change system folders.",
        "Switch back to the browser. Notice that switching applications does not delete a saved file.",
        "Read the tool map below aloud. Explain the job of each tool in your own words."
      ],
      diagram: ["Browser: learn", "VS Code: edit", "Terminal: command", "Python: execute"],
      example: "Website instructions → editor file → terminal command → program output",
      exercise: "Write four sentences explaining where you would read a lesson, save code, type a command, and see command output.",
      starter: "Read lessons in:\nSave code in:\nType commands in:\nRead command output in:\n",
      expected: "You can identify each tool without assuming that one tool does every job.",
      mistakes: [
        "Do not paste terminal commands into the browser address bar.",
        "Do not assume an editor's Python extension includes the Python interpreter.",
        "Never install software from an advertisement that imitates a download button."
      ],
      hints: [
        "The browser is where you are reading this lesson.",
        "A terminal command and the contents of a Python file belong in different places."
      ],
      solution: "Read lessons in: browser\nSave code in: a file using an editor\nType commands in: terminal\nRead command output in: terminal",
      quiz: {
        question: "Which tool executes a Python program?",
        options: ["A folder", "The Python interpreter", "The website address bar"],
        answer: 1,
        why: "The interpreter executes Python code. An editor helps you write it."
      },
      checks: ["I can identify my browser.", "I can open my file manager.", "I can explain editor versus interpreter."],
      challenge: "Explain why installing a code editor alone is not enough to run Python.",
      docs: [DOCS.vscode]
    },
    {
      id: "files",
      title: "Create your first project folder",
      icon: "folder",
      objective: "Create and locate a project folder without changing system files.",
      prerequisite: "Complete the tool-map lesson.",
      explanation:
        "A project is a collection of related files in one folder. A path describes " +
        "a location. A filename extension, such as .py or .txt, helps identify a file's " +
        "purpose. Keep this practice project separate from your website repository: " +
        "one contains the learning website, while the other will contain your Python work.",
      vocabulary: [
        "Path: the location of a file or folder.",
        "Extension: the suffix after the last dot in a filename.",
        "Project root: the top folder of your project."
      ],
      steps: [
        "Open your file manager and go to Documents, or another writable personal folder.",
        "Create a new folder named playwright-learning. Use the file manager's New Folder action.",
        "Open the folder. It should be empty.",
        "Go back to its parent folder, then open playwright-learning again.",
        "Write down where you created it. Do not put personal full paths into public screenshots.",
        "Keep this folder for the remaining setup lessons."
      ],
      osSteps: {
        windows: [
          "In File Explorer, use View → Show → File name extensions on Windows 11. Older Windows layouts may expose File name extensions in the View tab."
        ],
        mac: [
          "In Finder settings, open Advanced and enable Show all filename extensions."
        ],
        linux: [
          "Files normally displays extensions. Keep the full filename when renaming a file."
        ]
      },
      diagram: ["Personal folder", "playwright-learning", "Your future .py files"],
      example: "playwright-learning/\n  hello.py          ← Python file added later\n  tests/            ← test folder added later\n  .venv/            ← environment added later",
      exercise: "Locate the folder again after closing the file manager. Record its name and explain what .py means.",
      starter: "Project folder name:\nWhere I can find it:\nThe .py extension means:\n",
      expected: "One empty folder named playwright-learning, in a location you can find again.",
      mistakes: [
        "Do not create the project inside an installed application's folder.",
        "Do not accidentally create two nested playwright-learning folders.",
        "Later, hello.py.txt is not the filename hello.py."
      ],
      hints: ["Start from Documents or your home folder.", "A folder is not a Python file; it contains files."],
      solution: "Project folder: playwright-learning\nLocation: my chosen personal folder\n.py: a Python source file",
      quiz: {
        question: "What is the project root?",
        options: ["The top folder of this project", "The browser homepage", "A password"],
        answer: 0,
        why: "The root is the folder that contains the project's files and subfolders."
      },
      checks: ["I created the folder.", "I closed and found it again.", "I understand .py versus .txt."],
      challenge: "Explain the difference between a filename and a full path.",
      docs: [DOCS.vscode]
    },
    {
      id: "editor",
      title: "Install VS Code and save a file",
      icon: "code",
      objective: "Install the editor, open your folder, and save a plain-text file.",
      prerequisite: "Create playwright-learning first.",
      explanation:
        "Visual Studio Code, or VS Code, is the editor used by this course. " +
        "It is not the larger product named Visual Studio. The Explorer panel shows " +
        "your project's files. Saving writes the current editor contents to disk. " +
        "Opening a folder is different from opening one individual file.",
      vocabulary: [
        "Editor: an application for changing text files.",
        "Explorer panel: VS Code's list of project files.",
        "Extension: an add-on that gives the editor extra capabilities."
      ],
      steps: [
        "Open the official VS Code download link below. Choose your operating system.",
        "Install VS Code using the matching instructions shown below.",
        "Open VS Code. Use File → Open Folder and select playwright-learning.",
        "Trust this folder only because it is your own new folder. Do not automatically trust downloaded projects.",
        "In Explorer, choose New File and name it learning-notes.txt.",
        "Type the example sentence and save with Ctrl+S on Windows/Linux or Command+S on macOS.",
        "Close the file tab and reopen learning-notes.txt from Explorer.",
        "Open Extensions, search for Python, and install the Python extension published by Microsoft. AI extensions are not required."
      ],
      osSteps: {
        windows: [
          "Download the installer matching your computer architecture. If unsure, check Settings → System → About.",
          "Run the user installer, follow its prompts, and launch VS Code. Do not bypass your organization's software policies."
        ],
        mac: [
          "Download the Mac build matching your machine, or the Universal build.",
          "Open the download and move Visual Studio Code into Applications. Launch it from Applications."
        ],
        linux: [
          "This guided path uses Ubuntu 24.04. Download VS Code's .deb package matching your architecture.",
          "Open the .deb file using Ubuntu's package installer, install it, then launch VS Code from Applications.",
          "Other distributions use different packages; follow the official Linux setup link instead of using Ubuntu commands blindly."
        ]
      },
      example: "I am learning Python and browser automation, one step at a time.",
      exercise: "Save a second line describing your goal. Close and reopen the file to verify that it was saved.",
      starter: "I am learning Python and browser automation.\nMy goal is: ",
      expected: "learning-notes.txt appears in Explorer and retains both lines after reopening.",
      mistakes: [
        "A dot on an editor tab can indicate unsaved changes; save before closing.",
        "Creating a file in the wrong folder makes it difficult to find later.",
        "Installing Microsoft's Python extension does not install Python itself."
      ],
      hints: ["Use File → Open Folder, not only Open File.", "The filename should appear in Explorer on the left."],
      solution: "I am learning Python and browser automation.\nMy goal is: to write and explain my first reliable test.",
      quiz: {
        question: "Does the Python extension install the Python interpreter?",
        options: ["Yes, always", "No; the interpreter is installed separately", "Only when a file is saved"],
        answer: 1,
        why: "The editor, extension, and interpreter are separate pieces."
      },
      checks: ["VS Code is installed.", "My project folder is open.", "My saved file survives reopening.", "Microsoft's Python extension is installed."],
      challenge: "Create another text file and explain how you know both files belong to the same project.",
      docs: [
        "https://code.visualstudio.com/download",
        DOCS.vscode,
        "https://code.visualstudio.com/docs/setup/linux",
        "https://code.visualstudio.com/docs/setup/mac"
      ]
    },
    {
      id: "terminal",
      title: "Use the terminal without fear",
      icon: "terminal",
      objective: "Open a terminal, inspect its location, and list files safely.",
      prerequisite: "Open your project folder in VS Code.",
      explanation:
        "A terminal is a text-based way to ask your computer to do something. " +
        "The shell interprets your commands. A prompt means the shell is ready. " +
        "The current directory is the folder a command works from. We will start " +
        "with commands that show information rather than change or delete files.",
      vocabulary: [
        "Shell: the program interpreting terminal commands.",
        "Current directory: the folder a command currently uses.",
        "Output: information printed after a command."
      ],
      steps: [
        "In VS Code, select Terminal → New Terminal. A panel opens below the editor.",
        "Check the terminal profile using the OS instructions below.",
        "Click inside the terminal. Type the first command from the example and press Enter once.",
        "Read the printed project location. It should end in playwright-learning.",
        "Run the second command. Look for learning-notes.txt.",
        "If the folder is wrong, close the terminal, reopen the correct project folder, and create a new terminal.",
        "Do not type the output back into the terminal."
      ],
      osSteps: {
        windows: [
          "Use Command Prompt for this course: open the arrow beside the terminal's plus button and choose Command Prompt.",
          "If necessary, choose Select Default Profile → Command Prompt, then create a new terminal."
        ],
        mac: ["The default zsh shell works for these commands."],
        linux: ["The default bash shell works for these commands."]
      },
      example: "{LOCATION}\n{LIST}",
      exercise: "Record the two command names and explain what each showed. Do not publish your personal home-directory path.",
      starter: "Location command:\nList-files command:\nFile I recognized:\n",
      expected: "The location identifies your project; the file list includes learning-notes.txt.",
      mistakes: [
        "Do not copy the terminal prompt itself.",
        "Do not type commands into learning-notes.txt and expect them to run.",
        "Avoid destructive commands you cannot explain. This lesson requires none."
      ],
      hints: ["Click in the terminal panel, not the editor.", "Press Enter after one command, then wait for its output."],
      solution: "Location command: {LOCATION}\nList-files command: {LIST}\nRecognized file: learning-notes.txt",
      quiz: {
        question: "Where does a terminal command usually operate?",
        options: ["Always in Downloads", "In its current directory", "Inside every open file"],
        answer: 1,
        why: "Many commands use the terminal's current directory."
      },
      checks: ["I opened the correct terminal.", "I checked the project location.", "I listed and recognized my file."],
      challenge: "Explain why a correct command might fail when run from the wrong folder.",
      docs: ["https://code.visualstudio.com/docs/terminal/basics"]
    },
    {
      id: "python",
      title: "Install and verify Python",
      icon: "tools",
      objective: "Install a supported Python interpreter and verify the selected version.",
      prerequisite: "Know where to type terminal commands.",
      explanation:
        "Python runs the programs you will write. Different computers may have " +
        "multiple Python versions. A version command checks the interpreter you " +
        "actually invoked. This course uses Python 3.13 on Windows/macOS and the " +
        "Python 3 supplied by Ubuntu 24.04. Do not replace the operating system's Python.",
      vocabulary: [
        "Interpreter: the program executing Python source.",
        "Version: a numbered release of software.",
        "PATH: a list of locations the shell searches for commands."
      ],
      steps: [
        "Read the current Playwright system requirements using the official link below before installing.",
        "Follow your operating-system steps below.",
        "Close old terminal windows after installation, then open a new terminal in VS Code.",
        "Run the example version command.",
        "Record the version actually printed. Do not invent a successful result.",
        "If the command fails, use the troubleshooting tips before continuing."
      ],
      osSteps: {
        windows: [
          "Open Python's official Windows downloads page. Choose the latest stable 3.13.x Windows installer for your architecture, not a source archive or prerelease.",
          "Run that installer. Enable its Python launcher and PATH options when offered, then choose Install Now.",
          "If a newer Python install manager is already managing your machine, use its official documentation rather than stacking conflicting installers.",
          "Run py -3.13 --version. Stop here if that command cannot select Python 3.13."
        ],
        mac: [
          "Open Python's official macOS downloads page. Choose the latest stable 3.13.x macOS installer package.",
          "Open the .pkg and follow the installer. Do not remove Apple's system tools.",
          "Run python3.13 --version from a new terminal."
        ],
        linux: [
          "Guided distribution: Ubuntu 24.04. Open a terminal and run sudo apt update.",
          "Then run sudo apt install python3 python3-venv python3-pip.",
          "sudo requests administrator authorization. Follow your organization's rules; password characters may not appear as you type.",
          "Run python3 --version. Do not replace /usr/bin/python3 or install packages into the system environment."
        ]
      },
      example: "{BOOT} --version",
      exercise: "Write the exact command used and the version your machine printed.",
      starter: "Command:\nActual version:\nAny installation problem:\n",
      expected: "Windows/macOS: Python 3.13.x. Ubuntu 24.04: its supported Python 3 release, normally 3.12.x.",
      mistakes: [
        "An old terminal may not pick up installation changes; open a new one.",
        "If py -3.13 cannot find an interpreter, check that Python 3.13 and the launcher were installed.",
        "A source-code archive is not a beginner-friendly desktop installer.",
        "On Linux, do not fix package issues with sudo pip install."
      ],
      hints: ["The version command does not create or execute a project file.", "Use the exact command displayed for your selected OS."],
      solution: "Command: {BOOT} --version\nActual version: copy your real output here.\nIf it failed, do not mark installation verified.",
      quiz: {
        question: "Why check the version instead of assuming installation worked?",
        options: ["It changes the password", "It verifies which interpreter the command selects", "It creates a test"],
        answer: 1,
        why: "The version output is evidence that the command can invoke an interpreter."
      },
      checks: ["I used an official installation source.", "The version command works.", "I recorded the actual version."],
      challenge: "Explain why installing a second Python version can change which command you need.",
      docs: [DOCS.windows, DOCS.mac, DOCS.linux, DOCS.playwright]
    },
    {
      id: "hello",
      title: "Write, save, and run your first Python file",
      icon: "code",
      objective: "Run a saved Python file and diagnose a small syntax mistake.",
      prerequisite: "The Python version command must work.",
      explanation:
        "Source code is text containing instructions. print displays a value. " +
        "Quotation marks surround text, called a string. A comment starts with # " +
        "and explains the code without being executed. Saving and running are different actions.",
      vocabulary: ["String: a text value.", "Comment: an explanation ignored by Python.", "Syntax error: code Python cannot parse."],
      steps: [
        "Create hello.py in the project root using VS Code Explorer.",
        "Copy the Python example into the editor, not into the terminal.",
        "Save the file.",
        "In the terminal, verify you are inside playwright-learning.",
        "Run {BOOT} hello.py.",
        "Read the output. Change the sentence, save, and run again.",
        "Temporarily remove a closing quotation mark, save, and run. Read the error, then restore the quote and rerun."
      ],
      example: '# A comment explains why a line exists.\nprint("I can run Python!")',
      exercise: "Make the program print two lines: your learning goal and today's next small step.",
      starter: '# Print two short messages.\nprint("My goal is ...")\n',
      expected: "The example prints I can run Python! Your exercise should print two separate lines.",
      mistakes: [
        "hello.py.txt is the wrong filename.",
        "A changed editor file must be saved before the terminal runs the new contents.",
        "Use normal quotes, not decorative quotation marks copied from a word processor.",
        "If Python cannot open the file, check the filename and current directory."
      ],
      hints: ["One print call can display one message.", "Use two print calls, each on its own line."],
      solution: 'print("My goal is to understand browser tests.")\nprint("Today I will verify my Python environment.")',
      quiz: {
        question: "You edited the sentence but see the old output. What should you check first?",
        options: ["Whether the file was saved", "Whether the browser is open", "Whether the mouse is charged"],
        answer: 0,
        why: "The interpreter reads the saved file, not unsaved editor changes."
      },
      checks: ["I saved hello.py.", "I ran it from the terminal.", "I repaired the deliberately missing quote.", "My exercise prints two lines."],
      challenge: "Add a comment explaining the purpose of your second message.",
      docs: ["https://docs.python.org/3/tutorial/introduction.html"]
    },
    {
      id: "environment",
      title: "Give your project its own Python environment",
      icon: "shield",
      objective: "Create .venv and select its interpreter without changing system Python.",
      prerequisite: "Run hello.py successfully.",
      explanation:
        "A virtual environment is a separate package area for this project. " +
        "It prevents this project's dependencies from being installed into the system " +
        "Python environment. .venv is a conventional folder name, not a file you edit. " +
        "This course calls its interpreter by path, so shell activation is not required.",
      vocabulary: ["Dependency: software your project needs.", "Virtual environment: an isolated interpreter/package setup.", "pip: Python's package-installation tool."],
      steps: [
        "Open a terminal in playwright-learning. Close any running Python program first.",
        "Run the first example command once to create .venv.",
        "Run the remaining two commands to inspect that environment.",
        "In VS Code, open View → Command Palette. Search for Python: Select Interpreter.",
        "Select the interpreter inside this project's .venv. If missing, use Enter interpreter path and select its Python executable.",
        "Run {RUN} hello.py from the terminal.",
        "Do not copy .venv to another computer. It should be recreated there."
      ],
      example: "{BOOT} -m venv .venv\n{RUN} --version\n{RUN} -m pip --version",
      exercise: "Record the environment interpreter path and explain why the commands start with that path.",
      starter: "Environment interpreter:\nWhy not install into system Python:\n",
      expected: "The pip output identifies a location inside your project's .venv. hello.py still runs.",
      mistakes: [
        "Run creation from the project root, or .venv will appear in the wrong place.",
        "On Ubuntu, missing venv/ensurepip support usually means python3-venv is not installed.",
        "Do not edit the executable or package files inside .venv.",
        "No PowerShell execution-policy change is needed for these explicit-path commands."
      ],
      hints: ["The command beginning with {BOOT} creates the environment.", "The commands beginning with {RUN} use the environment."],
      solution: "Environment interpreter: {RUN}\nReason: use this project's package environment rather than installing into system Python.",
      quiz: {
        question: "What belongs in .venv?",
        options: ["Your personal passwords", "Environment files managed by Python and package tools", "Every project's source code"],
        answer: 1,
        why: ".venv is managed environment data. Your own source stays outside it."
      },
      checks: ["I created .venv in the project.", "pip points inside .venv.", "VS Code selects the .venv interpreter.", "hello.py runs with the environment interpreter."],
      challenge: "Explain how you would recreate the environment after moving the source files to a new computer.",
      docs: [DOCS.venv, "https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/"]
    },
    {
      id: "playwright",
      title: "Install the browser-testing tools",
      icon: "tools",
      objective: "Install Playwright, pytest support, and Chromium in separate steps.",
      prerequisite: "Create and verify .venv.",
      explanation:
        "pytest runs test functions. The pytest-playwright plugin supplies browser " +
        "fixtures such as page. Playwright controls browsers. Installing a Python " +
        "package does not automatically complete the separate browser download. " +
        "We pin Playwright to 1.63.0; the plugin and other packages resolve during " +
        "installation and are recorded in a snapshot, not claimed to be a universal lockfile.",
      vocabulary: ["Package: installable Python software.", "Plugin: an extension to a tool.", "Fixture: a resource supplied to a test."],
      steps: [
        "Use the terminal in your project root. Verify that .venv exists.",
        "Run the first example command and wait for it to finish.",
        "Run the browser-install command and wait for the download to complete.",
        "Run the version and package-check commands.",
        "Record the actual output. Do not continue after an unexplained installation error.",
        "Save an environment snapshot with the final command. It records your installed versions; review it before sharing."
      ],
      osSteps: {
        windows: ["Use the Command Prompt profile selected earlier."],
        mac: ["If certificate verification fails, follow the Python installer's certificate setup instructions. Do not disable TLS verification."],
        linux: ["If Chromium reports missing system libraries on supported Ubuntu, run {RUN} -m playwright install --with-deps chromium. This may request administrator authorization."]
      },
      example:
        '{RUN} -m pip install "playwright==1.63.0" pytest-playwright\n' +
        "{RUN} -m playwright install chromium\n" +
        "{RUN} -m playwright --version\n" +
        "{RUN} -m pytest --version\n" +
        "{RUN} -m pip check\n" +
        "{RUN} -m pip freeze > requirements-installed.txt",
      exercise: "Record Playwright's version, pytest's version, and whether pip check reported a dependency conflict.",
      starter: "Playwright version:\npytest version:\npip check result:\nBrowser download result:\n",
      expected: "Playwright reports 1.63.0. pytest reports its installed version. pip check should report no broken requirements if dependency installation succeeded.",
      mistakes: [
        "A package installation success does not prove the browser executable was downloaded.",
        "Do not mix system pip with the project's interpreter.",
        "If a proxy blocks downloads, use approved network configuration rather than disabling security checks.",
        "requirements-installed.txt records this environment; it is not a tested cross-platform dependency lock."
      ],
      hints: ["Use {RUN} -m pip, not an unrelated pip executable.", "Browser installation is the command containing playwright install chromium."],
      solution: "Record the actual command output from your machine.\nExpected Playwright version: 1.63.0\nDo not invent pytest's resolved version or browser-download success.",
      quiz: {
        question: "What downloads Chromium for these tests?",
        options: ["Saving hello.py", "The playwright install chromium command", "Changing the website theme"],
        answer: 1,
        why: "Installing the browser binaries is a separate setup step."
      },
      checks: ["Package installation finished.", "Chromium installation finished.", "Playwright reports 1.63.0.", "I checked dependency consistency.", "I saved the version snapshot."],
      challenge: "Explain why recreating this project requires both package installation and browser installation.",
      docs: [DOCS.playwright, "https://playwright.dev/python/docs/browsers", "https://pip.pypa.io/en/stable/cli/pip_check/"]
    },
    {
      id: "first-test",
      title: "Run your first real browser check",
      icon: "target",
      objective: "Run a small pytest browser test and deliberately observe a failure.",
      prerequisite: "Finish the package and Chromium installation lesson.",
      explanation:
        "A test checks a claim. pytest discovers functions whose names begin with test_. " +
        "The page fixture provides a browser page. set_content supplies a tiny practice " +
        "document without needing another website. get_by_role describes the heading " +
        "as a user-facing element. expect checks it. This synchronous Python API does " +
        "not use await. We will learn deeper Python concepts before writing larger suites.",
      vocabulary: ["Assertion: a check of expected behavior.", "Headless: browser execution without a visible window.", "Test discovery: finding test files and functions."],
      steps: [
        "Create a folder named tests in VS Code Explorer.",
        "Inside tests, create test_first.py. Copy the example into it and save.",
        "From the project root run {RUN} -m pytest tests/test_first.py --browser chromium -q.",
        "To see the browser, run {RUN} -m pytest tests/test_first.py --browser chromium --headed.",
        "Change the expected heading name to Wrong heading, save, and run again.",
        "Read the failure. Restore Welcome, learner!, save, and rerun.",
        "Record both actual results. This website does not inspect or execute your local test."
      ],
      example:
        "from playwright.sync_api import Page, expect\n\n" +
        "# pytest supplies a fresh page through the page fixture.\n" +
        "def test_heading(page: Page):\n" +
        '    page.set_content("<h1>Welcome, learner!</h1>")\n' +
        '    heading = page.get_by_role("heading", name="Welcome, learner!", exact=True)\n' +
        "    expect(heading).to_be_visible()\n",
      exercise: "Complete the missing expected heading name, save the file locally, and run it.",
      starter:
        "from playwright.sync_api import Page, expect\n\n" +
        "def test_heading(page: Page):\n" +
        '    page.set_content("<h1>Welcome, learner!</h1>")\n' +
        '    heading = page.get_by_role("heading", name="TODO", exact=True)\n' +
        "    expect(heading).to_be_visible()\n",
      expected: "A correctly configured local run should report one passed test. The deliberately wrong heading should fail. These are expectations, not results produced by this website.",
      mistakes: [
        "Keep the filename test_first.py and function name test_heading for discovery.",
        "Indent the function body consistently with four spaces.",
        "Do not remove the assertion simply to avoid a failure.",
        "A very short headed test may open and close the browser quickly."
      ],
      hints: ["Match the expected name to the text inside h1.", "Replace TODO with Welcome, learner!, including punctuation."],
      solution:
        "from playwright.sync_api import Page, expect\n\n" +
        "def test_heading(page: Page):\n" +
        '    page.set_content("<h1>Welcome, learner!</h1>")\n' +
        '    heading = page.get_by_role("heading", name="Welcome, learner!", exact=True)\n' +
        "    expect(heading).to_be_visible()\n",
      quiz: {
        question: "What proves this browser test actually passed?",
        options: ["Matching the sample text in this website", "The actual local pytest result", "An AI saying it looks correct"],
        answer: 1,
        why: "Only real execution provides the run result. Reviewing text is a different activity."
      },
      checks: ["I saved the test in tests/test_first.py.", "I ran it locally.", "I observed the intentional failure.", "I restored the test and recorded the final result."],
      challenge: "Change both the page heading and assertion to a new message, then explain why changing only one causes a failure.",
      docs: [DOCS.writing, "https://docs.pytest.org/en/stable/getting-started.html"]
    }
  ];

  const roadmap = [
    ["Computer basics and setup", "Available: this foundation package"],
    ["Manual testing and requirements", "Planned"],
    ["Python values, conditions, loops, and functions", "Planned"],
    ["Lists, dictionaries, modules, exceptions, and types", "Planned"],
    ["HTML, accessibility names, and developer tools", "Planned"],
    ["Playwright locators, assertions, forms, and browser events", "Planned"],
    ["pytest fixtures, parameterization, authentication, and isolation", "Planned"],
    ["API testing, network mocking, and combined workflows", "Planned"],
    ["Debugging, cross-browser coverage, visual and accessibility checks", "Planned"],
    ["Git, CI/CD, reporting, and framework maintenance", "Planned"],
    ["AI assistance and secure Python-backed tutor integration", "Planned; introduction available"],
    ["Five progressive projects and capstone", "Planned"]
  ];

  window.COURSE = { version: "foundation-1", systems, lessons, roadmap };
})();