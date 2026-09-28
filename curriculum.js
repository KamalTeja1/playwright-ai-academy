(() => {
  "use strict";

  if (!window.COURSE?.lessons) {
    throw new Error("Load content.js before curriculum.js.");
  }

  const C = window.COURSE;

  // Each question has exactly four choices and one correct answer.
  function q(text, options, answer, explanations) {
    return { text, options, answer, explanations };
  }

  function section(title, text) {
    return { title, text };
  }

  function lesson(spec) {
    return {
      icon: "code",
      level: "Beginner",
      // Minutes: read, walkthrough, independent work, MCQ, review.
      duration: [30, 30, 30, 15, 15],
      ...spec
    };
  }

  // Preserve existing foundation content and IDs.
  // Existing one-question quizzes become four-choice MCQs.
  const foundation = C.lessons.map((old, index) => ({
    ...old,
    module: "01 · Computer basics and setup",
    level: "Beginner",
    requires: index ? [C.lessons[index - 1].id] : [],
    duration: [15, 30, 30, 15, 15],
    sections: [
      section("Understand the idea", old.explanation),
      section("Vocabulary", old.vocabulary.join("\n\n"))
    ],
    files: [{
      name: old.id === "first-test"
        ? "tests/test_first.py"
        : old.id === "hello"
          ? "hello.py"
          : `${old.id}-example.txt`,
      code: old.example
    }],
    commands: [],
    solutionFile: old.id === "first-test"
      ? "tests/test_first.py"
      : old.id === "hello" ? "hello.py" : `${old.id}-response.txt`,
    quiz: [{
      text: old.quiz.question,
      options: [...old.quiz.options, "None of these answers"],
      answer: old.quiz.answer,
      explanations: [
        ...old.quiz.options.map((_, i) =>
          (i === old.quiz.answer ? "Correct. " : "Not correct. ") +
          old.quiz.why
        ),
        "Not correct: one of the listed answers directly answers the question. " +
        old.quiz.why
      ]
    }]
  }));

  const pythonCode = `def display_names(records):
    names = []
    for record in records:
        if record["enabled"]:
            names.append(record["name"])
    return names


people = [
    {"name": "Asha", "enabled": True},
    {"name": "Mina", "enabled": False},
]

print(display_names(people))
`;

  const paramCode = `import pytest


def clean_name(value):
    return value.strip()


@pytest.mark.parametrize(
    "raw, expected",
    [
        (" Asha ", "Asha"),
        ("Mina", "Mina"),
        ("   ", ""),
    ],
    ids=["outer-spaces", "already-clean", "blank"],
)
def test_clean_name(raw, expected):
    assert clean_name(raw) == expected
`;

  const locatorCode = `from playwright.sync_api import Page, expect


def test_shipping_name(page: Page):
    page.set_content("""
      <section aria-label="Shipping">
        <label for="ship-name">Name</label>
        <input id="ship-name">
      </section>
      <section aria-label="Billing">
        <label for="bill-name">Name</label>
        <input id="bill-name">
      </section>
    """)

    shipping = page.get_by_role("region", name="Shipping", exact=True)
    name = shipping.get_by_label("Name", exact=True)

    name.fill("Asha")
    expect(name).to_have_value("Asha")
`;

  const waitCode = `from playwright.sync_api import Page, expect


def test_loading_finishes(page: Page):
    page.set_content("""
      <p role="status" id="message">Loading</p>
      <script>
        setTimeout(() => {
          document.getElementById("message").textContent = "Ready";
        }, 300);
      </script>
    """)

    message = page.get_by_role("status")
    expect(message).to_have_text("Ready")
`;

  const formCode = `from playwright.sync_api import Page, expect


def test_learning_preferences(page: Page):
    page.set_content("""
      <label for="name">Display name</label>
      <input id="name">
      <label for="level">Experience</label>
      <select id="level">
        <option value="new">Beginner</option>
        <option value="some">Some experience</option>
      </select>
      <label>
        <input type="checkbox" id="updates">
        Practice reminders
      </label>
    """)

    name = page.get_by_label("Display name")
    level = page.get_by_label("Experience")
    reminders = page.get_by_label("Practice reminders")

    name.fill("Asha")
    level.select_option("some")
    reminders.check()

    expect(name).to_have_value("Asha")
    expect(level).to_have_value("some")
    expect(reminders).to_be_checked()
`;

  const fixtureCode = `import pytest
from playwright.sync_api import Page, expect


@pytest.fixture
def profile_page(page: Page):
    page.set_content("""
      <label for="nickname">Nickname</label>
      <input id="nickname">
    """)
    return page


def test_first_name(profile_page: Page):
    nickname = profile_page.get_by_label("Nickname")
    nickname.fill("Asha")
    expect(nickname).to_have_value("Asha")


def test_starts_empty(profile_page: Page):
    expect(profile_page.get_by_label("Nickname")).to_have_value("")
`;

  const networkCode = `from playwright.sync_api import Page, Route, expect


def test_empty_catalog(page: Page):
    def catalog_response(route: Route):
        route.fulfill(
            status=200,
            content_type="application/json",
            body='{"items": []}',
        )

    page.route("https://academy.test/api/catalog", catalog_response)

    page.route(
        "https://academy.test/",
        lambda route: route.fulfill(
            content_type="text/html",
            body="""
              <p role="status">Loading</p>
              <script>
                fetch("/api/catalog")
                  .then(response => response.json())
                  .then(data => {
                    document.querySelector('[role="status"]').textContent =
                      data.items.length === 0 ? "No products" : "Products ready";
                  });
              </script>
            """,
        ),
    )

    page.goto("https://academy.test/")
    expect(page.get_by_role("status")).to_have_text("No products")
`;

  // Shared, intentionally mixed-result lab.
  // Do not include this file in a production suite.
  const reportLab = `import pytest
from playwright.sync_api import Page, expect


def test_heading_passes(page: Page):
    page.set_content("<h1>Reporting lab</h1>")
    expect(page.get_by_role("heading")).to_have_text("Reporting lab")


def test_intentional_assertion_failure(page: Page):
    page.set_content("<h1>Reporting lab</h1>")
    expect(page.get_by_role("heading")).to_have_text(
        "Wrong heading",
        timeout=1000,
    )


@pytest.mark.skip(reason="Demonstrating a documented skip")
def test_intentional_skip():
    assert False


@pytest.fixture
def unavailable_service():
    raise RuntimeError("Intentional setup failure: practice service unavailable")


def test_intentional_setup_error(unavailable_service):
    assert unavailable_service is not None
`;

  const allPassLab = `import pytest
from playwright.sync_api import Page, expect


def test_heading_passes(page: Page):
    page.set_content("<h1>Reporting lab</h1>")
    expect(page.get_by_role("heading")).to_have_text("Reporting lab")


def test_heading_is_checked(page: Page):
    page.set_content("<h1>Reporting lab</h1>")
    expect(page.get_by_role("heading")).to_have_text("Reporting lab")


@pytest.mark.skip(reason="Demonstrating a documented skip")
def test_intentional_skip():
    assert False


@pytest.fixture
def available_service():
    return {"ready": True}


def test_service_ready(available_service):
    assert available_service["ready"] is True
`;

  const allureCode = `import allure
from playwright.sync_api import Page, expect


@allure.title("The practice heading is visible")
def test_heading_with_attachment(page: Page):
    with allure.step("Arrange the practice page"):
        page.set_content("<h1>Reporting lab</h1>")

    with allure.step("Verify the heading"):
        expect(page.get_by_role("heading")).to_have_text("Reporting lab")

    allure.attach(
        page.screenshot(),
        name="Verified heading",
        attachment_type=allure.attachment_type.PNG,
    )
`;

  const additions = [
    lesson({
      id: "py-data-flow",
      title: "Read the Python used in browser tests",
      module: "02 · Python and pytest bridge",
      requires: ["first-test"],
      objective: "Follow values through a function, list, dictionary, loop, and condition.",
      sections: [
        section("Start with the data",
          "A list stores several values in order. Here each value is a dictionary: a record with named fields. " +
          "people[0] means the first record; people[0][\"name\"] means that record's name. " +
          "The enabled field contains a Boolean, not the strings \"True\" or \"False\"."),
        section("Follow the function",
          "def introduces a reusable function. records is its input parameter. " +
          "An empty names list is created each time the function runs. The for loop visits one record at a time. " +
          "The if condition admits only enabled records. append adds a name to the result."),
        section("Return is not print",
          "return gives a value back to the caller. print displays a value in the terminal. " +
          "The function does not print anything by itself. The last line calls the function and prints its returned list. " +
          "A browser test often follows the same flow: arrange data, call a helper, check the returned or visible result."),
        section("Trace before changing",
          "Read the example from the bottom call into the function. For Asha, enabled is True, so her name is added. " +
          "For Mina it is False, so nothing is added. You can predict the result before execution. " +
          "This habit makes debugging more effective than editing several lines at once.")
      ],
      files: [{ name: "python_data.py", code: pythonCode }],
      commands: ["{RUN} python_data.py"],
      steps: [
        "Create python_data.py in your Python project root.",
        "Read the records before running the file. Predict the returned list.",
        "Run the command in your project terminal.",
        "Change Mina's enabled value to True, save, predict, and rerun."
      ],
      exercise: "Add an enabled third record named Ravi. Leave Mina disabled. Return Asha and Ravi in order.",
      starter: pythonCode,
      solution: pythonCode.replace(
        '{"name": "Mina", "enabled": False},',
        '{"name": "Mina", "enabled": False},\n    {"name": "Ravi", "enabled": True},'
      ),
      solutionFile: "python_data.py",
      expected: "Original: ['Asha']. Exercise: ['Asha', 'Ravi']. This is ordinary Python, not a browser test.",
      mistakes: [
        "Dictionary keys must match exactly; Name and name are different keys.",
        "False is a Boolean. The nonempty string \"False\" is not equivalent.",
        "Keep the return outside the loop so all records are considered."
      ],
      hints: ["Copy one dictionary and change its values.", "Add the record inside the list, separated by commas."],
      challenge: "Return the number of enabled records instead of their names.",
      quiz: [
        q("What does the original program print?",
          ["['Asha']", "['Mina']", "['Asha', 'Mina']", "Nothing"],
          0, ["Only Asha is enabled.", "Mina is disabled.", "The condition excludes Mina.", "The final print displays the returned value."]),
        q("What does return do?",
          ["Always writes to the terminal", "Sends a value to the caller", "Creates a browser", "Adds a dictionary key"],
          1, ["That is print's role.", "Correct: the caller receives the result.", "No browser is involved.", "Return does not mutate the dictionary."]),
        q("Why keep return after the loop?",
          ["To process all records", "To install pytest", "To sort automatically", "To ignore indentation"],
          0, ["Returning inside the loop can end processing early.", "Installation is unrelated.", "No sorting operation exists here.", "Indentation defines Python's blocks."])
      ],
      docs: ["https://docs.python.org/3/tutorial/controlflow.html"]
    }),

    lesson({
      id: "pytest-cases",
      title: "Turn test data into independent pytest cases",
      module: "02 · Python and pytest bridge",
      requires: ["py-data-flow"],
      objective: "Use parameterization and readable case IDs to test several inputs.",
      sections: [
        section("One rule, several examples",
          "clean_name removes whitespace from the beginning and end of a string. " +
          "It should handle an already-clean name and an all-space value too. " +
          "These are different inputs to the same behavioral rule, not unrelated scenarios."),
        section("Read the decorator",
          "@pytest.mark.parametrize lists the argument names followed by rows of values. " +
          "Each row supplies raw and expected to a separate test invocation. " +
          "The function receives those values; it does not need to loop through the rows itself."),
        section("Why independent cases help",
          "A loop inside one test usually stops at its first failing assertion. " +
          "Separate pytest cases produce separate outcomes and names. " +
          "The IDs outer-spaces, already-clean, and blank help identify a failing example in terminal output and reports."),
        section("Choose cases deliberately",
          "More rows do not automatically mean better coverage. These rows represent three useful classes of input. " +
          "Add cases because they test a requirement or boundary. Avoid putting personal data into parameters because reports can display them.")
      ],
      files: [{ name: "tests/test_names.py", code: paramCode }],
      commands: ["{RUN} -m pytest tests/test_names.py -v"],
      steps: [
        "Save the complete example in tests/test_names.py.",
        "Run only this file and locate the three readable case IDs.",
        "Change the blank case's expectation to one space and rerun.",
        "Restore the expectation after observing which case fails."
      ],
      exercise: "Add a leading-spaces case: input '  Ravi', expected 'Ravi', ID 'leading-spaces'.",
      starter: paramCode,
      solution: paramCode.replace(
        '("   ", ""),', '("   ", ""),\n        ("  Ravi", "Ravi"),'
      ).replace(
        'ids=["outer-spaces", "already-clean", "blank"]',
        'ids=["outer-spaces", "already-clean", "blank", "leading-spaces"]'
      ),
      solutionFile: "tests/test_names.py",
      expected: "Three cases are collected originally; four after the exercise. Verify their actual outcomes locally.",
      mistakes: ["Keep the number of IDs equal to the number of rows.", "Run the intended file, not every intentionally broken reporting lab.", "strip removes outer whitespace; it does not remove all internal spaces."],
      hints: ["Add one tuple to the data list.", "Add one matching readable ID."],
      challenge: "Add an internal-space case and explain why the internal space should remain.",
      quiz: [
        q("How many test cases does the original example create?",
          ["One", "Two", "Three", "Six"], 2,
          ["There is one function but three invocations.", "There are three data rows.", "Each data row becomes a case.", "Each pair is one row, not two tests."]),
        q("What is the purpose of ids?",
          ["Hide failures", "Name cases clearly", "Replace assertions", "Create user accounts"], 1,
          ["Failures remain visible.", "Readable case names improve diagnosis.", "Assertions are still necessary.", "They are test labels."]),
        q("What should clean_name('Asha Rao') return?",
          ["'AshaRao'", "'Asha Rao'", "''", "None"], 1,
          ["strip does not remove internal spaces.", "The internal space remains.", "The input is not only whitespace.", "The function returns a string."])
      ],
      docs: ["https://docs.pytest.org/en/stable/how-to/parametrize.html"]
    }),

    lesson({
      id: "pw-scoped-locators",
      title: "Locate the right field when labels repeat",
      module: "03 · Playwright interactions",
      requires: ["pytest-cases"],
      objective: "Use an accessible region to disambiguate repeated labels.",
      sections: [
        section("The ambiguity",
          "Real pages often contain Shipping and Billing forms with identically named fields. " +
          "A page-wide Name locator describes both fields. Selecting the first match may appear to work, " +
          "but the test then depends on layout order rather than purpose."),
        section("Scope expresses intent",
          "The example gives each section an accessible name. Locate the Shipping region first, " +
          "then find Name inside that region. The locator now describes which form and which field you intend."),
        section("The label connection",
          "The label's for attribute matches its input's id. get_by_label uses this relationship. " +
          "The region's name and the input's label are separate concepts. Changing either can affect the locator."),
        section("A useful negative check",
          "After filling Shipping, verify that Billing is still empty. This checks that the action did not target the wrong field. " +
          "You are checking a local HTML fixture, not a production address-saving workflow.")
      ],
      files: [{ name: "tests/test_shipping.py", code: locatorCode }],
      commands: ["{RUN} -m pytest tests/test_shipping.py --browser chromium -v"],
      steps: [
        "Save the file and identify the two repeated Name labels.",
        "Run the scoped example.",
        "Temporarily replace name with page.get_by_label('Name', exact=True) and observe the ambiguous-match failure.",
        "Restore the scoped locator."
      ],
      exercise: "Add an assertion that the Billing Name input remains empty.",
      starter: locatorCode,
      solution: locatorCode + `
    billing = page.get_by_role("region", name="Billing", exact=True)
    expect(billing.get_by_label("Name", exact=True)).to_have_value("")
`,
      solutionFile: "tests/test_shipping.py",
      expected: "Shipping contains Asha; Billing is unchanged.",
      mistakes: ["exact=True does not resolve two genuinely identical labels.", "A first() shortcut hides the reason one match is correct.", "Do not confuse an element's role with its HTML id."],
      hints: ["Locate the Billing region separately.", "Use the empty string as its expected input value."],
      challenge: "Swap the two sections in the HTML and confirm the scoped test still expresses the same behavior.",
      quiz: [
        q("Why scope the Name locator?",
          ["To pick the last field", "To express which form owns the field", "To disable waiting", "To rename the field"], 1,
          ["The desired field is based on purpose.", "The region removes ambiguity.", "Waiting is unaffected.", "Locators do not rename elements."]),
        q("Does exact=True guarantee one match?",
          ["Always", "Only on Windows", "No, identical names can still repeat", "Only in headed mode"], 2,
          ["Exact text can still occur twice.", "The OS does not fix duplicate names.", "Correct: exact matching is not uniqueness.", "Browser visibility does not change this."]),
        q("What additional assertion catches a wrong-field action?",
          ["Check that Billing remains empty", "Remove all assertions", "Add a fixed sleep", "Rename the test"], 0,
          ["It checks that the other field was not changed.", "That removes evidence.", "Time does not identify the correct field.", "Names do not verify behavior."])
      ],
      docs: ["https://playwright.dev/python/docs/locators"]
    }),

    lesson({
      id: "pw-waiting",
      title: "Wait for the outcome, not an arbitrary delay",
      module: "03 · Playwright interactions",
      requires: ["pw-scoped-locators"],
      objective: "Use a retrying assertion to check an asynchronously updated status.",
      sections: [
        section("Two different questions",
          "An action's waiting behavior asks whether the element can be interacted with. " +
          "An outcome assertion asks whether the expected state has arrived. A successful click does not imply " +
          "that every follow-up update is already complete."),
        section("A controlled asynchronous example",
          "The page initially displays Loading. A small script changes it to Ready after a delay. " +
          "You are not being asked to write JavaScript: it is fixture data that creates a timing scenario."),
        section("Check the promised state",
          "expect(message).to_have_text('Ready') retries the check until it succeeds or its timeout expires. " +
          "It does not change the application's text to make the check pass. A fixed sleep wastes time when " +
          "the update is fast and can still be too short when the update is slow."),
        section("Diagnose before increasing timeouts",
          "If Ready never appears, more time cannot repair the application or a wrong expectation. " +
          "Inspect what actually rendered. A timeout is evidence that the expected condition was not observed in time, " +
          "not a complete explanation of the cause.")
      ],
      files: [{ name: "tests/test_status.py", code: waitCode }],
      commands: ["{RUN} -m pytest tests/test_status.py --browser chromium -v"],
      steps: ["Save and run the example.", "Change the fixture delay from 300 to 800 and rerun.", "Change the expected text to Complete and observe the failure.", "Restore the correct expectation."],
      exercise: "Change both the eventual message and assertion to 'Catalog ready'.",
      starter: waitCode,
      solution: waitCode.replaceAll('"Ready"', '"Catalog ready"'),
      solutionFile: "tests/test_status.py",
      expected: "The original checks Ready. The exercise checks Catalog ready. Neither uses a fixed sleep.",
      mistakes: ["Reading text once is different from a retrying assertion.", "Do not weaken the assertion to accept either Loading or Ready.", "A typo in expected text is not fixed by a longer timeout."],
      hints: ["Change the script's assigned text.", "Change the assertion to the same requirement."],
      challenge: "Remove the update entirely and explain the resulting failure without changing the timeout.",
      quiz: [
        q("What does the assertion do while the page still says Loading?",
          ["Changes the page to Ready", "Retries the expected condition", "Passes immediately", "Deletes the element"], 1,
          ["Assertions inspect rather than repair.", "It waits for the expected state within its timeout.", "Loading does not match Ready.", "It does not delete the element."]),
        q("Why not always sleep for ten seconds?",
          ["It proves every request succeeded", "It eliminates all flakiness", "It can waste time and still miss the outcome", "It creates a trace"], 2,
          ["Sleeping proves nothing about responses.", "Many failure causes are unrelated to timing.", "The correct condition is a better target.", "Trace recording is separate."]),
        q("The application never sets Ready. What should you investigate?",
          ["The missing state change", "The font size only", "The test filename only", "The monitor brightness"], 0,
          ["Inspect why the promised state did not occur.", "Presentation size is not the demonstrated cause.", "The test already ran.", "Brightness is unrelated."])
      ],
      docs: ["https://playwright.dev/python/docs/test-assertions"]
    }),

    lesson({
      id: "pw-form-controls",
      title: "Verify text, dropdown, and checkbox state",
      module: "03 · Playwright interactions",
      requires: ["pw-waiting"],
      objective: "Choose the correct action and assertion for three common controls.",
      sections: [
        section("Different controls expose different state",
          "A text input has a value. A native select has a selected option value. " +
          "A checkbox has a checked state. Treating all three as visible text misses what a user actually selected."),
        section("Use the intended action",
          "fill replaces input text. select_option chooses an option in a native select. " +
          "check expresses that a checkbox should end checked. Repeatedly clicking a checkbox could toggle it back off."),
        section("Labels and option values",
          "The visible option says Some experience but its value is some. The test selects and verifies that value. " +
          "Do not confuse an option's display label with its submitted value. A custom dropdown is not automatically a native select."),
        section("Know the coverage boundary",
          "This example verifies controls in a small local page. There is no submit handler, server, or database. " +
          "Do not report that preferences were saved permanently just because these assertions passed.")
      ],
      files: [{ name: "tests/test_preferences.py", code: formCode }],
      commands: ["{RUN} -m pytest tests/test_preferences.py --browser chromium -v"],
      steps: ["Save and run the example.", "Find each label and its corresponding control.", "Observe how each action is paired with a matching assertion.", "Complete the independent variation below."],
      exercise: "After the original checks, uncheck reminders and verify it is no longer checked.",
      starter: formCode,
      solution: formCode + "\n    reminders.uncheck()\n    expect(reminders).not_to_be_checked()\n",
      solutionFile: "tests/test_preferences.py",
      expected: "The final exercise state has reminders unchecked. The other control values remain unchanged.",
      mistakes: ["Do not use an input-text assertion to check a checkbox.", "select_option targets native select elements.", "A successful action alone is not the final result check."],
      hints: ["Use uncheck rather than a blind toggle.", "Use the negative checked assertion."],
      challenge: "Return the experience selection to Beginner and verify its underlying value.",
      quiz: [
        q("Which value should the example assert for Some experience?",
          ["Some experience", "some", "selected", "True"], 1,
          ["That is its label.", "The option's value is some.", "No such value is defined.", "This select does not store a Boolean."]),
        q("Which action expresses a checked final state?",
          ["check()", "fill('checked')", "click() twice", "clear()"], 0,
          ["It expresses the intended state.", "Checkboxes are not text inputs.", "Two toggles can restore the original state.", "That is not the checkbox-state action."]),
        q("Does this example prove persistence after refresh?",
          ["Yes", "Only in dark mode", "No; no persistence is implemented", "Only on Linux"], 2,
          ["No persistence was exercised.", "Theme is irrelevant.", "The fixture only tests control state.", "The operating system does not add persistence."])
      ],
      docs: ["https://playwright.dev/python/docs/input"]
    }),

    lesson({
      id: "pw-fixtures",
      title: "Reuse setup without sharing dirty test state",
      module: "04 · Suite design",
      requires: ["pw-form-controls"],
      duration: [30, 30, 45, 15, 15],
      objective: "Create a fixture that supplies a prepared page to independent tests.",
      sections: [
        section("Setup is a dependency",
          "Both tests need the same small form. The fixture prepares that form once for each requesting test. " +
          "The test function asks for profile_page by name; pytest supplies its result."),
        section("Follow the dependency chain",
          "profile_page itself requests page. The Playwright pytest plugin supplies that browser page. " +
          "The custom fixture prepares content and returns the page. A type annotation describes the object; it does not create it."),
        section("Independence is the purpose",
          "The first test fills Asha. The second expects an empty input in its own prepared page. " +
          "The second test must not rely on the first test running, nor inherit its form changes. " +
          "Avoid a session-scoped mutable page merely to make setup look faster."),
        section("When teardown is needed",
          "This example relies on the plugin's page lifecycle. A fixture that creates external records or files " +
          "may need explicit cleanup. A yield fixture can separate setup from teardown, but that is not a reason " +
          "to invent cleanup for resources you did not create.")
      ],
      files: [{ name: "tests/test_profile_fixture.py", code: fixtureCode }],
      commands: ["{RUN} -m pytest tests/test_profile_fixture.py --browser chromium -v"],
      steps: ["Save both the fixture and tests in one file.", "Run both tests.", "Run only test_starts_empty using the command below.", "Confirm its intended behavior does not depend on the other test."],
      extraCommands: ["{RUN} -m pytest tests/test_profile_fixture.py::test_starts_empty --browser chromium -v"],
      exercise: "Add a third independent test that fills Ravi and checks the result.",
      starter: fixtureCode,
      solution: fixtureCode + `
def test_another_name(profile_page: Page):
    nickname = profile_page.get_by_label("Nickname")
    nickname.fill("Ravi")
    expect(nickname).to_have_value("Ravi")
`,
      solutionFile: "tests/test_profile_fixture.py",
      expected: "Two independent tests originally; three after the exercise.",
      mistakes: ["Fixture names are how pytest matches requested resources.", "Do not call profile_page() manually inside the test.", "Sharing mutable state can make tests order-dependent."],
      hints: ["Request profile_page as the new test's parameter.", "Use a new test function, not another assertion added to the first test."],
      challenge: "Explain which fixture owns browser-page creation and which owns preparing this particular form.",
      quiz: [
        q("Who supplies profile_page to a requesting test?",
          ["pytest", "The HTML label", "The report viewer", "The CSS file"], 0,
          ["pytest resolves fixture dependencies.", "Labels identify controls.", "Reports display results.", "CSS styles content."]),
        q("Should test_starts_empty depend on the first test?",
          ["Yes, always", "No, it should run independently", "Only when headed", "Only when reporting"], 1,
          ["That would make the suite order-dependent.", "Its own setup should establish its state.", "Headed mode does not justify dependency.", "Reporting should not change test independence."]),
        q("What creates the page resource here?",
          ["The Page annotation", "The return keyword", "The plugin's page fixture", "The function name alone"], 2,
          ["Annotations do not instantiate resources.", "Return passes a value back.", "The custom fixture depends on that resource.", "Names alone do not create browsers."])
      ],
      docs: ["https://docs.pytest.org/en/stable/how-to/fixtures.html"]
    }),

    lesson({
      id: "pw-network",
      title: "Test an empty catalog with a controlled response",
      module: "05 · Network behavior",
      requires: ["pw-fixtures"],
      level: "Intermediate",
      duration: [45, 30, 45, 15, 15],
      objective: "Intercept a request before navigation and assert the UI response.",
      sections: [
        section("Control one dependency",
          "An empty catalog may be hard to reproduce in a shared environment. " +
          "This test controls the API response instead of deleting real products. " +
          "The response body is JSON with an empty items list."),
        section("Register before triggering",
          "Both routes are registered before page.goto. The root document is also fulfilled locally, " +
          "so academy.test is a controlled test origin, not a website you need to deploy. " +
          "Its document requests /api/catalog on that same origin."),
        section("Assert the user-visible consequence",
          "The test does not stop at observing that a request happened. It checks No products in the status element. " +
          "That connects the controlled response with the behavior a user sees."),
        section("Be honest about mocks",
          "This proves how the supplied page handles our selected response. It does not prove that a real catalog API " +
          "returns the expected schema, authenticates correctly, or performs well. " +
          "Keep API contract coverage separate from this UI scenario.")
      ],
      files: [{ name: "tests/test_empty_catalog.py", code: networkCode }],
      commands: ["{RUN} -m pytest tests/test_empty_catalog.py --browser chromium -v"],
      steps: ["Save the complete test.", "Read both route patterns before running.", "Run the empty-catalog case.", "Inspect how the page turns the list length into a status message."],
      exercise: "Return one fictional product and expect Products ready.",
      starter: networkCode,
      solution: networkCode.replace(
        `'{"items": []}'`, `'{"items": [{"name": "Keyboard"}]}'`
      ).replace('to_have_text("No products")', 'to_have_text("Products ready")'),
      solutionFile: "tests/test_empty_catalog.py",
      expected: "The original displays No products; the exercise displays Products ready. Both use controlled responses.",
      mistakes: ["Install routes before triggering the requests.", "A wrong route URL may allow an unintended network request.", "Mocked success is not proof of real backend success."],
      hints: ["Change items from an empty list to a list containing one object.", "Update the expected UI message, not just the API body."],
      challenge: "Describe the additional product requirement needed before deciding what a 500 response should display.",
      quiz: [
        q("When should the route be registered?",
          ["After the assertion", "Before triggering the request", "After closing the browser", "Only after a failure"], 1,
          ["That is too late.", "The handler must exist when the request occurs.", "The page is no longer available.", "The scenario needs controlled behavior from the start."]),
        q("What does this test prove?",
          ["The real API is secure", "All products exist", "The fixture page handles this controlled response", "The database is empty"], 2,
          ["Security is not exercised.", "There is no real product catalog here.", "That is the intended coverage boundary.", "No database is used."]),
        q("Which assertion connects the mock to user behavior?",
          ["The visible status text", "The filename", "The operating system", "The report theme"], 0,
          ["It verifies the UI consequence.", "A name does not check behavior.", "The OS is not the outcome.", "Report styling is unrelated."])
      ],
      docs: ["https://playwright.dev/python/docs/network"]
    }),

    lesson({
      id: "report-outcomes",
      title: "Reporting 1: read pass, fail, skip, and setup error",
      module: "06 · Reporting and evidence",
      requires: ["pw-fixtures"],
      duration: [30, 30, 45, 15, 15],
      objective: "Classify a controlled mixed-result run without hiding its failures.",
      sections: [
        section("A report answers several questions",
          "What ran? Which input or scenario failed? Did the test body run at all? " +
          "Was a test intentionally skipped? What evidence can another person inspect? " +
          "A green percentage alone is not enough to answer these questions."),
        section("Read the lab before running",
          "This file is intentionally not all green. One test passes, one asserts the wrong heading, " +
          "one is explicitly skipped with a reason, and one cannot start because its fixture raises an exception. " +
          "Keep this learning lab separate from a production suite."),
        section("Failure phase matters",
          "An assertion failure in the test body differs from an error preparing a fixture. " +
          "For the setup error, the final assertion is never reached. Investigate the earliest relevant error " +
          "rather than changing a browser locator that was never used."),
        section("Do not repair the report",
          "Reports should reflect execution honestly. Removing the broken tests or forcing a successful exit code " +
          "would hide the exercise. First explain the actual outcomes, then deliberately repair the lab and rerun.")
      ],
      files: [{ name: "tests/test_report_lab.py", code: reportLab }],
      commands: ["{RUN} -m pytest tests/test_report_lab.py --browser chromium -v -ra --tb=short"],
      steps: ["Save only the provided report-lab file.", "Run the exact command targeting it.", "Locate each test name and the skip reason.", "Distinguish the intentional assertion failure from the fixture setup error."],
      exercise: "Correct the heading expectation and replace the failing fixture with a ready dictionary. Keep the documented skip.",
      starter: reportLab,
      solution: allPassLab,
      solutionFile: "tests/test_report_lab.py",
      expected: "With working browser setup: original lab expects 1 passed, 1 failed, 1 skipped, 1 error. Repaired lab expects 3 passed and 1 skipped. Actual output is the evidence.",
      mistakes: ["An installation error can change these expected counts.", "A skipped test is not a passing test.", "The intentionally failing lab must not accidentally enter a production gate."],
      hints: ["Fix the assertion to the text actually specified by the fixture.", "Return a dictionary from setup instead of raising RuntimeError."],
      challenge: "Explain why a setup error does not prove a product defect.",
      quiz: [
        q("Does the setup-error test reach its assertion?",
          ["Yes", "No", "Only with HTML reports", "Only in Firefox"], 1,
          ["The fixture raises first.", "Setup prevents the body from running.", "Report format does not bypass setup.", "Browser choice does not repair this fixture."]),
        q("Is a skipped test a successful verification?",
          ["Always", "No, its check was not executed", "Only when green", "It has no recorded reason"], 1,
          ["Skipping is not verifying.", "Its outcome should be reported separately.", "Color is not evidence.", "This lab supplies a reason."]),
        q("What should you change to hide the failure?",
          ["The result XML", "The process exit code", "Nothing; fix the underlying intentional defect", "The report colors"], 2,
          ["That falsifies results.", "That masks the failed run.", "Keep reporting faithful to execution.", "Color changes do not fix behavior."])
      ],
      docs: ["https://docs.pytest.org/en/stable/how-to/output.html"]
    }),

    lesson({
      id: "report-junit",
      title: "Reporting 2: generate and inspect JUnit XML",
      module: "06 · Reporting and evidence",
      requires: ["report-outcomes"],
      objective: "Create a machine-readable result file and identify its limits.",
      sections: [
        section("Why XML?",
          "A person can read terminal output, but another tool needs structured data. " +
          "JUnit XML is a common interchange format for test results. It is not a screenshot gallery or a polished web dashboard."),
        section("Generate from a known run",
          "Run the intentionally mixed lab into a named report file. pytest's junitxml option writes the result file. " +
          "A failed test run can still produce useful XML. The report file existing does not mean the suite passed."),
        section("Inspect without editing outcomes",
          "Open the XML as text in VS Code. Find testcase entries and the failure, error, or skipped details. " +
          "Compare them with the terminal summary. Use the test names to connect entries with source code. " +
          "Do not edit the XML to make a result appear successful."),
        section("Avoid stale evidence",
          "Use a separate report name for your repaired run. A run that crashes before producing a report can leave an older file nearby. " +
          "Check the path, modification time, command, and execution log before sharing a file as current evidence.")
      ],
      files: [{ name: "tests/test_report_lab.py", code: reportLab }],
      commands: ["{RUN} -m pytest tests/test_report_lab.py --browser chromium --junitxml=report-before.xml -ra"],
      steps: ["Use the original mixed-result lab for this lesson.", "Run the XML command.", "Open report-before.xml from the project root.", "Match one failure entry and one setup error with the terminal output."],
      exercise: "Run the repaired lab with --junitxml=report-after.xml and compare the outcomes without editing either report.",
      starter: reportLab,
      solution: allPassLab,
      solutionFile: "tests/test_report_lab.py",
      expected: "A report-before.xml file from the original run and a distinct report-after.xml from the repaired run. Counts should match each actual run.",
      mistakes: ["An XML report is not automatically published or uploaded.", "A report's existence is not a success signal.", "Keep before/after files separate."],
      hints: ["The report path comes after --junitxml=.", "Use test names to compare entries, not their order alone."],
      challenge: "List the metadata you would record beside an XML report to identify its originating run.",
      quiz: [
        q("What is JUnit XML mainly useful for here?",
          ["Machine-readable test results", "Installing Chromium", "Changing assertions", "Encrypting credentials"], 0,
          ["It exchanges structured outcomes.", "Browser installation is separate.", "Reports describe results.", "It is not a secret-storage format."]),
        q("Can a failing run produce XML?",
          ["No", "Yes", "Only if failures are deleted", "Only without pytest"], 1,
          ["Failure reporting is a core use case.", "The report can document failures.", "Do not delete results.", "pytest provides this output."]),
        q("Which evidence helps detect a stale report?",
          ["Only its color", "Its modification time and matching run log", "A renamed title", "A larger font"], 1,
          ["XML does not rely on color.", "Compare the file with the actual run.", "Renaming is not provenance.", "Presentation does not establish freshness."])
      ],
      docs: ["https://docs.pytest.org/en/stable/how-to/output.html"]
    }),

    lesson({
      id: "report-html",
      title: "Reporting 3: create a browsable pytest HTML report",
      module: "06 · Reporting and evidence",
      requires: ["report-junit"],
      duration: [30, 30, 45, 15, 15],
      objective: "Install pytest-html, generate a report, and inspect its portability and privacy.",
      sections: [
        section("A separate plugin",
          "pytest-html adds HTML output to pytest. Installing it into another Python environment will not help " +
          "the environment running your tests. Use the same explicit interpreter for installation and execution."),
        section("Create a self-contained report",
          "The command requests report.html and self-contained styling/scripts. " +
          "That does not guarantee that every externally linked image or attachment is embedded. " +
          "A file link can still point to a resource that is missing on another computer."),
        section("Inspect the failure",
          "Open the generated file locally. Find the intentionally failed test and its assertion details. " +
          "Compare the report summary with the terminal. This lesson does not claim that Playwright screenshots " +
          "are automatically attached to pytest-html; attachment integration is additional work."),
        section("Review before sharing",
          "Reports can expose parameters, paths, logs, environment information, and attachments. " +
          "Use fictional lab data. For real work, follow your organization's access rules and inspect the exported file before publishing it.")
      ],
      files: [{ name: "tests/test_report_lab.py", code: reportLab }],
      commands: [
        '{RUN} -m pip install "pytest-html>=4,<5"',
        "{RUN} -m pytest tests/test_report_lab.py --browser chromium --html=report.html --self-contained-html -ra",
        "{RUN} -m pip freeze > requirements-reporting.txt"
      ],
      steps: ["Install the plugin in .venv.", "Run the mixed lab with the HTML options.", "Open report.html locally.", "Inspect the failed test and setup error separately.", "Record the resolved package versions in the snapshot file."],
      exercise: "Repair the lab and generate report-after.html. Compare it with the original report.",
      starter: reportLab,
      solution: allPassLab,
      solutionFile: "tests/test_report_lab.py",
      expected: "A browsable report describing the actual run. A nonzero pytest exit status is expected for the intentionally broken lab.",
      mistakes: ["Unrecognized --html often means the plugin is absent from the executing environment.", "Self-contained HTML can still reference external attachments.", "Do not publish real reports to a public repository without reviewing their contents."],
      hints: ["Use {RUN} -m pip for the plugin.", "Change the report filename for the second run."],
      challenge: "Write a personal sharing checklist, then inspect whether your lab report meets it. This is optional practice, not a quiz.",
      quiz: [
        q("Where should pytest-html be installed?",
          ["Any unrelated environment", "The environment running pytest", "Inside the HTML file", "Only in the browser"], 1,
          ["That pytest process may not see it.", "The test runner must load the plugin.", "Reports are output, not environments.", "This is a Python plugin."]),
        q("Does self-contained HTML embed every file-linked image?",
          ["Guaranteed", "No, external resources can remain external", "Only images from failures", "Only on Windows"], 1,
          ["That is too strong a claim.", "Inspect linked attachments before sharing.", "Failure status does not guarantee embedding.", "This is not an OS guarantee."]),
        q("What should happen to the mixed lab's failed outcome?",
          ["Stay visible in the report", "Become passed because HTML was generated", "Be removed", "Be replaced with a screenshot"], 0,
          ["Reporting must remain faithful.", "Report generation does not repair tests.", "Removing it hides evidence.", "Attachments supplement rather than replace outcomes."])
      ],
      docs: ["https://pytest-html.readthedocs.io/en/latest/user_guide.html"]
    }),

    lesson({
      id: "report-traces",
      title: "Reporting 4: collect screenshots, videos, and traces",
      module: "06 · Reporting and evidence",
      requires: ["report-html"],
      level: "Intermediate",
      duration: [30, 45, 45, 15, 15],
      objective: "Collect browser evidence and connect it to the relevant failed test.",
      sections: [
        section("Different artifacts answer different questions",
          "A screenshot shows one moment. A video shows a sequence of visible frames. " +
          "A trace provides structured execution evidence for inspection. None of them should be mistaken for a guarantee that the test assertion was correct."),
        section("Retention is a policy",
          "The command keeps traces and videos for failures and screenshots only on failure. " +
          "The pytest plugin manages these for its fixtures. Manually creating separate contexts can require your own recording and cleanup configuration."),
        section("Find the actual path",
          "Use the artifact path in your output and inspect the created directory. " +
          "Do not guess a trace path from another computer. The setup-error case may never create a page; " +
          "there may be no browser evidence for a failure that happened before browser work."),
        section("Separate output and report",
          "Playwright artifacts are not automatically embedded into the HTML report by this command. " +
          "Keep the report and evidence together when appropriate, label their run, and use a new output directory " +
          "for comparisons. Before sharing, inspect for sensitive page data.")
      ],
      files: [{ name: "tests/test_report_lab.py", code: reportLab }],
      commands: [
        "{RUN} -m pytest tests/test_report_lab.py --browser chromium --tracing retain-on-failure --video retain-on-failure --screenshot only-on-failure --output=artifacts-before -ra",
        '{RUN} -m playwright show-trace "REPLACE_WITH_ACTUAL_TRACE_ZIP_PATH"'
      ],
      steps: ["Run the first command against the mixed lab.", "Find evidence for the intentional browser assertion failure.", "Replace the trace placeholder with the actual trace.zip path, keeping quotes around paths containing spaces.", "Open that trace and locate the incorrect heading assertion.", "Do not expect a browser trace for a fixture error that happened before a page existed."],
      exercise: "Run the repaired lab with --output=artifacts-after. Explain why failure-retained artifacts can disappear on a successful run.",
      starter: reportLab,
      solution: allPassLab,
      solutionFile: "tests/test_report_lab.py",
      expected: "The intentional browser failure should retain diagnostic evidence when recording succeeds. A successful rerun need not retain artifacts under these policies.",
      mistakes: ["No retained artifact is not itself proof of success.", "Do not reuse an old trace to explain a new run.", "The generated HTML report does not automatically contain these files."],
      hints: ["Read the meaning of retain-on-failure.", "Use the printed path rather than a hard-coded example path."],
      challenge: "Compare the wrong expected heading with the actual DOM shown in the trace.",
      quiz: [
        q("Why might a passing test have no retained video?",
          ["The retain-on-failure policy", "Videos prove failure", "The test was never run", "HTML deleted the test"], 0,
          ["Successful recordings may not be retained.", "A video is evidence, not a verdict.", "Absence alone does not establish that.", "HTML is a separate output."]),
        q("Must a setup error have a browser screenshot?",
          ["Always", "Only in light mode", "No, a page may never have existed", "Only if renamed"], 2,
          ["Not every failure reaches browser setup.", "Theme is irrelevant.", "The failure phase matters.", "Renaming does not create a page."]),
        q("Which trace should you inspect?",
          ["Any old trace", "The trace associated with the specific run and test", "The largest ZIP", "A generated screenshot filename"], 1,
          ["Old evidence may describe different behavior.", "Match evidence to its execution.", "Size does not establish relevance.", "A screenshot is not a trace archive."])
      ],
      docs: ["https://playwright.dev/python/docs/test-runners", "https://playwright.dev/python/docs/trace-viewer"]
    }),

    lesson({
      id: "report-allure",
      title: "Reporting 5: Allure results, steps, and attachments",
      module: "06 · Reporting and evidence",
      requires: ["report-traces"],
      level: "Intermediate",
      duration: [45, 45, 45, 15, 15],
      objective: "Generate Allure raw results and understand the separate report-generation step.",
      sections: [
        section("Two components, two jobs",
          "allure-pytest is the Python adapter that records results. The Allure command-line tool turns those results " +
          "into the report interface. Installing the adapter does not install the separate CLI. " +
          "This lesson fully covers adapter output; the optional CLI commands require the official OS-specific installation first."),
        section("Give the report a readable structure",
          "The example supplies a human-readable title and two named steps. " +
          "Steps explain the activity; they do not replace assertions. The screenshot is attached as PNG bytes after the check succeeds."),
        section("Understand attachment timing",
          "If the assertion fails, Python stops executing later lines in the test body. " +
          "Therefore this example's final screenshot attachment is not a general failure-screenshot hook. " +
          "That limitation should be understood before adapting it to a framework."),
        section("Keep runs separate",
          "Use a fresh raw-results directory when comparing independent runs. Accumulated files can mix evidence. " +
          "For a local experiment, generate separate report output and inspect the test title, steps, outcome, and attachment. " +
          "Do not publish unreviewed raw results or screenshots.")
      ],
      files: [{ name: "tests/test_allure_lab.py", code: allureCode }],
      commands: [
        "{RUN} -m pip install allure-pytest",
        "{RUN} -m pytest tests/test_allure_lab.py --browser chromium --alluredir=allure-results-before",
        "{RUN} -m pip freeze > requirements-allure.txt"
      ],
      extraCommands: [
        "allure --version",
        "allure generate allure-results-before --clean -o allure-report-before",
        "allure open allure-report-before"
      ],
      steps: [
        "Install the Python adapter and save the example.",
        "Run the Python command and inspect the raw-results directory.",
        "For the optional rendered report, install the Allure CLI using the official documentation for your OS and chosen Allure major version.",
        "Verify allure --version before attempting the optional CLI commands below. Allure 2 installation also requires its documented Java dependency.",
        "Open the report and inspect the title, steps, and PNG attachment."
      ],
      exercise: "Change the test title and attach a second screenshot after changing the heading to 'Second state' and asserting it.",
      starter: allureCode,
      solution: allureCode + `
    page.set_content("<h1>Second state</h1>")
    expect(page.get_by_role("heading")).to_have_text("Second state")
    allure.attach(
        page.screenshot(),
        name="Second verified state",
        attachment_type=allure.attachment_type.PNG,
    )
`,
      solutionFile: "tests/test_allure_lab.py",
      expected: "The adapter creates raw result files. A rendered report requires the separate CLI. The original example attaches one PNG after its passing assertion.",
      mistakes: ["allure not found indicates a CLI installation/PATH issue, not necessarily an adapter failure.", "Steps are not assertions.", "An attachment after a failed assertion will not execute.", "Do not mix independent runs accidentally."],
      hints: ["Add the second state after the first attachment.", "Check the second heading before attaching its screenshot."],
      challenge: "Describe where failure-attachment logic would need to run if it must also execute after a test-body assertion failure.",
      quiz: [
        q("What does allure-pytest provide?",
          ["The Python result adapter", "Every OS dependency", "The browser executable", "A database"], 0,
          ["It records pytest results for Allure.", "The CLI has separate installation requirements.", "Playwright installs browsers separately.", "No database is installed here."]),
        q("Will the final attachment run if the preceding assertion raises?",
          ["Always", "No, not in this straight-line test body", "Only if the title is short", "Only on Ubuntu"], 1,
          ["Execution stops at the unhandled failure.", "A failure hook is additional logic.", "Titles do not control flow.", "Python control flow is the relevant issue."]),
        q("Why use a fresh raw-results directory for an independent run?",
          ["To hide failures", "To avoid accidentally mixing runs", "To bypass assertions", "To remove pytest"], 1,
          ["Keep failures visible.", "Run provenance remains clear.", "Assertions still execute.", "The adapter integrates with pytest."])
      ],
      docs: ["https://allurereport.org/docs/pytest/", "https://allurereport.org/docs/pytest-reference/"]
    })
  ];

  C.lessons = [...foundation, ...additions];
  C.version = "python-course-2";
  C.catalogVersion = 2;
  C.passPercent = 80;

  // Reference solutions must match the exercise description.
  const allureLesson = C.lessons.find(l => l.id === "report-allure");
  allureLesson.solution = allureLesson.solution.replace(
    '@allure.title("The practice heading is visible")',
    '@allure.title("Two verified heading states")'
  );

  C.roadmap = [
    ["Computer basics and setup", "9 lessons available"],
    ["Python and pytest bridge", "2 lessons available; full Python track still planned"],
    ["Playwright interactions", "3 lessons available; advanced controls still planned"],
    ["Suite design", "1 fixture lesson available; authentication and architecture still planned"],
    ["Network behavior", "1 controlled-response lesson available; API track still planned"],
    ["Reporting and evidence", "5 lessons available; CI publishing and framework attachments still planned"],
    ["AI integration and capstone", "Planned; no live AI provider configured"]
  ];
})();