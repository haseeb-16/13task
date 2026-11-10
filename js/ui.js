
const coursesContainer = document.getElementById("courses-container");
const courseCount = document.getElementById("course-count");
const statusMessage = document.getElementById("status-message");
const lessonSummary = document.getElementById("lesson-summary");
const categoryFilter = document.getElementById("category-filter");

/**
 * Display status messages.
 */
export function showStatus(message, type = "info") {

    statusMessage.textContent = message;

    statusMessage.className = "status-message";

    if (type === "success") {
        statusMessage.classList.add("success");
    }

    if (type === "error") {
        statusMessage.classList.add("error");
    }
}

/**
 * Render category options.
 */
export function renderCategories(courses) {

    const categories = [
        ...new Set(courses.map(course => course.category))
    ].sort((a, b) => a.localeCompare(b));

    categoryFilter.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All Categories";

    categoryFilter.append(allOption);

    categories.forEach(category => {

        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.append(option);
    });
}

/**
 * Render course cards.
 */
export function renderCourses(courses, lessons) {

    coursesContainer.replaceChildren();

    courseCount.textContent =
        `${courses.length} ${courses.length === 1 ? "course" : "courses"} found`;

    if (courses.length === 0) {

        const emptyMessage = document.createElement("div");

        emptyMessage.className = "empty-state";
        emptyMessage.textContent = "No courses found. Try changing your search or filters.";

        coursesContainer.append(emptyMessage);

        return;
    }

    // Count lessons and calculate their total duration.
    const lessonStats = lessons.reduce((stats, lesson) => {

        if (!stats[lesson.courseId]) {
            stats[lesson.courseId] = {
                count: 0,
                totalDuration: 0
            };
        }

        stats[lesson.courseId].count++;
        stats[lesson.courseId].totalDuration += lesson.duration;

        return stats;

    }, {});

    courses.forEach(course => {

        const stats = lessonStats[course.id] ?? {
            count: 0,
            totalDuration: 0
        };

        const card = document.createElement("article");
        card.className = "course-card";

        const category = document.createElement("span");
        category.className = "course-category";
        category.textContent = course.category;

        const title = document.createElement("h3");
        title.textContent = course.title;

        const description = document.createElement("p");
        description.className = "course-description";
        description.textContent = course.description;

        const level = document.createElement("p");
        level.textContent = `Level: ${course.level}`;

        const duration = document.createElement("p");
        duration.textContent = `Duration: ${course.duration} hours`;

        const rating = document.createElement("p");
        rating.textContent = `Rating: ${course.rating.toFixed(1)} / 5`;

        const lessonCount = document.createElement("p");
        lessonCount.textContent = `Lessons: ${stats.count}`;

        const lessonDuration = document.createElement("p");
        lessonDuration.textContent =
            `Total lesson time: ${stats.totalDuration} minutes`;

        card.append(
            category,
            title,
            description,
            level,
            duration,
            rating,
            lessonCount,
            lessonDuration
        );

        coursesContainer.append(card);
    });
}

/**
 * Display lesson summary.
 */
export function showLessonSummary(lessons) {

    const totalLessons = lessons.length;

    const totalMinutes = lessons.reduce((total, lesson) => {
        return total + lesson.duration;
    }, 0);

    lessonSummary.textContent =
        `There are ${totalLessons} lessons with a total duration of ${totalMinutes} minutes.`;
}
