import { CONTENT_SCHEMA_VERSION } from "./schema.js";

const definitions = [
  [
    "Automation & Web Foundations",
    "Learn the tools, browser concepts, and testing vocabulary before writing automation."
  ],
  [
    "Python for Automation",
    "Build the language skills needed to read, write, and maintain Python tests."
  ],
  [
    "pytest",
    "Understand test discovery, assertions, fixtures, parameterization, and plugins."
  ],
  [
    "Playwright with Python",
    "Learn browser automation, locators, actions, assertions, network control, and debugging."
  ],
  [
    "Playwright + pytest Framework",
    "Build reusable fixtures, page objects, configuration, authentication, and reporting."
  ],
  [
    "TypeScript Basics",
    "Understand types, modules, promises, and asynchronous programming."
  ],
  [
    "Playwright with TypeScript",
    "Use the Playwright Test runner, fixtures, projects, reports, and advanced workflows."
  ],
  [
    "CI/CD and Advanced Testing",
    "Run reliable automation in delivery pipelines and investigate real-world scenarios."
  ],
  [
    "Hero Project",
    "Plan, implement, harden, document, and present a maintainable automation framework."
  ]
];

const colors = [
  "#7C5CFF",
  "#22D3EE",
  "#F472B6",
  "#34D399",
  "#FBBF24",
  "#7C5CFF",
  "#22D3EE",
  "#F472B6",
  "#34D399"
];

export const catalog = {
  schemaVersion: CONTENT_SCHEMA_VERSION,
  release: "A",
  phases: definitions.map(([title, description], order) => ({
    id: `phase-${order}`,
    title,
    description,
    order,
    icon: "phase",
    color: colors[order],
    estimatedWeeks: null
  })),
  modules: [],
  lessons: [],
  topics: []
};