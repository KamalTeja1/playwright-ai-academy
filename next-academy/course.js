import {
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
