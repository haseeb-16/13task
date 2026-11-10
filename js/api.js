
const COURSES_URL = "./data/courses.json";
const LESSONS_URL = "./data/lessons.json";

/**
 * Fetch JSON data from a URL.
 */
async function fetchJson(url, signal) {

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        signal
    });

    if (!response.ok) {
        throw new Error(
            `Request failed: ${response.status} ${response.statusText}`
        );
    }

    return await response.json();
}

/**
 * Validate course data.
 */
function validateCourses(data) {

    if (!Array.isArray(data)) {
        throw new Error("Courses data must be an array.");
    }

    return data.filter(course => {

        return (
            course !== null &&
            typeof course === "object" &&
            Number.isInteger(course.id) &&
            typeof course.title === "string" &&
            typeof course.category === "string" &&
            typeof course.level === "string" &&
            typeof course.description === "string" &&
            typeof course.duration === "number" &&
            Number.isFinite(course.duration) &&
            course.duration > 0 &&
            typeof course.rating === "number" &&
            Number.isFinite(course.rating) &&
            course.rating >= 0 &&
            course.rating <= 5
        );
    });
}

/**
 * Validate lesson data.
 */
function validateLessons(data) {

    if (!Array.isArray(data)) {
        throw new Error("Lessons data must be an array.");
    }

    return data.filter(lesson => {

        return (
            lesson !== null &&
            typeof lesson === "object" &&
            Number.isInteger(lesson.id) &&
            Number.isInteger(lesson.courseId) &&
            typeof lesson.title === "string" &&
            typeof lesson.duration === "number" &&
            Number.isFinite(lesson.duration) &&
            lesson.duration >= 0
        );
    });
}

/**
 * Get all courses.
 */
export async function getCourses(signal) {

    const data = await fetchJson(COURSES_URL, signal);

    return validateCourses(data);
}

/**
 * Get all lessons.
 */
export async function getLessons(signal) {

    const data = await fetchJson(LESSONS_URL, signal);

    return validateLessons(data);
}
