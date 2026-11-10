
import { getCourses, getLessons } from "./api.js";

import {
    showStatus,
    renderCategories,
    renderCourses,
    showLessonSummary
} from "./ui.js";

// Select HTML elements.
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort-select");
const reloadButton = document.getElementById("reload-button");
const cancelButton = document.getElementById("cancel-button");

// Application state.
let allCourses = [];
let allLessons = [];
let controller = null;

/**
 * Update browser URL parameters.
 */
function updateURL() {

    const params = new URLSearchParams();

    const search = searchInput.value.trim();
    const category = categoryFilter.value;
    const sort = sortSelect.value;

    if (search) {
        params.set("search", search);
    }

    if (category !== "all") {
        params.set("category", category);
    }

    if (sort !== "title") {
        params.set("sort", sort);
    }

    const queryString = params.toString();

    const newURL = queryString
        ? `${window.location.pathname}?${queryString}`
        : window.location.pathname;

    window.history.replaceState({}, "", newURL);
}

/**
 * Apply search, category filters and sorting.
 */
function applyFilters() {

    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedSort = sortSelect.value;

    let filteredCourses = allCourses.filter(course => {

        const matchesSearch =
            course.title.toLowerCase().includes(searchTerm) ||
            course.description.toLowerCase().includes(searchTerm) ||
            course.category.toLowerCase().includes(searchTerm);

        const matchesCategory =
            selectedCategory === "all" ||
            course.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    // Sort courses.
    filteredCourses.sort((a, b) => {

        if (selectedSort === "duration") {
            return a.duration - b.duration;
        }

        if (selectedSort === "rating") {
            return b.rating - a.rating;
        }

        return a.title.localeCompare(b.title);
    });

    renderCourses(filteredCourses, allLessons);

    updateURL();

    if (allCourses.length > 0 && filteredCourses.length === 0) {
        showStatus("No matching courses found.", "info");
    } else if (allCourses.length > 0) {
        showStatus("Courses loaded successfully.", "success");
    }
}

/**
 * Restore filters from URL parameters.
 */
function loadURLParameters() {

    const params = new URLSearchParams(window.location.search);

    const search = params.get("search") ?? "";
    const category = params.get("category") ?? "all";
    const sort = params.get("sort") ?? "title";

    const validSortOptions = ["title", "duration", "rating"];

    searchInput.value = search;

    const validCategory = [
        ...categoryFilter.options
    ].some(option => option.value === category);

    categoryFilter.value = validCategory ? category : "all";

    sortSelect.value = validSortOptions.includes(sort)
        ? sort
        : "title";
}

/**
 * Load course and lesson data.
 */
async function loadData() {

    // Cancel an older request if one is still running.
    if (controller) {
        controller.abort();
    }

    const currentController = new AbortController();

    controller = currentController;

    reloadButton.disabled = true;
    cancelButton.disabled = false;

    showStatus("Loading courses and lessons...");

    try {

        // Fetch both datasets at the same time.
        const [courses, lessons] = await Promise.all([
            getCourses(currentController.signal),
            getLessons(currentController.signal)
        ]);

        // Ignore an outdated request.
        if (controller !== currentController) {
            return;
        }

        allCourses = courses;
        allLessons = lessons;

        renderCategories(allCourses);

        loadURLParameters();

        renderCourses(allCourses, allLessons);

        showLessonSummary(allLessons);

        applyFilters();

        if (allCourses.length === 0) {
            showStatus("No valid courses are available.", "info");
        } else {
            showStatus(
                `Successfully loaded ${allCourses.length} courses and ${allLessons.length} lessons.`,
                "success"
            );
        }

    } catch (error) {

        // Ignore outdated requests.
        if (controller !== currentController) {
            return;
        }

        if (error.name === "AbortError") {

            showStatus("Loading was cancelled.", "info");

        } else {

            console.error("Data loading error:", error);

            showStatus(
                `Unable to load data: ${error.message}`,
                "error"
            );
        }

    } finally {

        // Only the latest request can update the controls.
        if (controller === currentController) {

            controller = null;

            reloadButton.disabled = false;
            cancelButton.disabled = true;
        }
    }
}

/**
 * Debounce search input.
 */
function debounce(callback, delay = 300) {

    let timeoutId;

    return (...args) => {

        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            callback(...args);
        }, delay);
    };
}

// Debounced search handler.
const handleSearch = debounce(() => {
    applyFilters();
}, 300);

// Event listeners.
searchInput.addEventListener("input", handleSearch);

categoryFilter.addEventListener("change", applyFilters);

sortSelect.addEventListener("change", applyFilters);

reloadButton.addEventListener("click", loadData);

cancelButton.addEventListener("click", () => {

    if (controller) {
        controller.abort();
    }
});

// Start application.
loadData();
