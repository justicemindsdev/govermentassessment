/**
 * Report Script
 * Handles interactive features for the institutional dynamics analysis report
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the report
    initializeReport();
});

/**
 * Initialize the report
 */
function initializeReport() {
    // Set up event listeners
    setupEventListeners();
    
    // Show all patterns by default
    showAllSegments();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Add click event listeners to category elements
    const categories = document.querySelectorAll('.category');
    categories.forEach(category => {
        category.addEventListener('click', function() {
            const categoryId = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            filterByCategory(categoryId);
        });
    });
}

/**
 * Show all patterns
 */
function showAllSegments() {
    const patterns = document.querySelectorAll('.pattern');
    patterns.forEach(pattern => {
        pattern.style.display = 'block';
    });
    
    // Reset active category styling
    const categories = document.querySelectorAll('.category');
    categories.forEach(category => {
        category.classList.remove('active-category');
    });
}

/**
 * Show all categories
 */
function showAllCategories() {
    showAllSegments();
}

/**
 * Filter patterns by category
 * @param {string} category - The category ID to filter by
 */
function filterByCategory(category) {
    // Hide all patterns
    const allPatterns = document.querySelectorAll('.pattern');
    allPatterns.forEach(pattern => {
        pattern.style.display = 'none';
    });
    
    // Show patterns of selected category
    const categoryPatterns = document.querySelectorAll('.' + category);
    categoryPatterns.forEach(pattern => {
        pattern.style.display = 'block';
    });
    
    // Update category styling
    const categories = document.querySelectorAll('.category');
    categories.forEach(cat => {
        cat.classList.remove('active-category');
    });
    
    const selectedCategory = document.querySelector(`.category[onclick="filterByCategory('${category}')"]`);
    if (selectedCategory) {
        selectedCategory.classList.add('active-category');
    }
    
    // Scroll to the patterns section
    document.querySelector('.patterns').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Jump to a specific timestamp in the transcript
 * @param {string} timestamp - The timestamp to jump to
 */
function jumpToTimestamp(timestamp) {
    const segments = document.querySelectorAll('.transcript-segment');
    
    for (let i = 0; i < segments.length; i++) {
        const segmentTimestamp = segments[i].querySelector('.segment-timestamp').textContent;
        
        if (segmentTimestamp === timestamp) {
            segments[i].scrollIntoView({ behavior: 'smooth' });
            
            // Highlight the segment temporarily
            segments[i].classList.add('highlight-segment');
            setTimeout(() => {
                segments[i].classList.remove('highlight-segment');
            }, 2000);
            
            break;
        }
    }
}

/**
 * Toggle visibility of a section
 * @param {string} sectionId - The ID of the section to toggle
 */
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    
    if (section.style.display === 'none' || section.style.display === '') {
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}

/**
 * Toggle visibility of a dropdown
 * @param {string} dropdownId - The ID of the dropdown to toggle
 */
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    
    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
    } else {
        dropdown.style.display = 'block';
    }
}
