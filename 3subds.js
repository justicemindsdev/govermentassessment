/**
 * UIController.js - Advanced UI rendering and interaction management
 * 
 * This module handles all UI-related operations with performance optimization:
 * - Virtualized rendering for large lists and search results
 * - Efficient DOM operations using DocumentFragment
 * - Memory-efficient event delegation
 * - Optimized animations and transitions
 */

export class UIController {
    /**
     * Initialize the UI controller
     * @param {Object} config - Configuration parameters
     */
    constructor(config) {
        // Dependencies
        this.videoProcessor = config.videoProcessor;
        this.dataManager = config.dataManager;
        
        // UI Elements
        this.modal = config.modal;
        this.contentContainer = config.contentContainer;
        this.searchInput = config.searchInput;
        this.searchResults = config.searchResults;
        
        // State management
        this.activeCategory = 'system-navigation';
        this.currentTimestamp = null;
        this.isLightMode = false;
        this.isSidebarOpen = true;
        this.searchQuery = '';
        this.virtualListSize = 20; // Number of items to render in virtual lists
        
        // Template references
        this.claimTemplate = document.getElementById('claim-template');
        this.claimPointTemplate = document.getElementById('claim-point-template');
        
        // Set up video time update callback
        this.videoProcessor.setTimeUpdateCallback(this.updateTranscriptHighlighting.bind(this));
    }
    
    /**
     * Render initial content with optimized loading
     * @public
     */
    renderInitialContent() {
        // Create category placeholders for lazy loading
        const categories = [
            'system-navigation', 'advocacy-techniques', 'power-dynamics',
            'metacognitive', 'coercive-control', 'causal-links'
        ];
        
        const fragment = document.createDocumentFragment();
        
        categories.forEach((categoryId, index) => {
            const category = document.createElement('div');
            category.id = categoryId;
            category.className = 'category lazy-category';
            
            // Add active class to first category
            if (index === 0) {
                category.classList.add('active');
            }
            
            // Create category header
            const header = document.createElement('div');
            header.className = 'category-header';
            header.innerHTML = `
                <h2>${this._formatCategoryName(categoryId)}</h2>
                <span class="toggle-icon">${index === 0 ? '▼' : '▲'}</span>
            `;
            
            // Create category content placeholder
            const content = document.createElement('div');
            content.className = 'category-content';
            content.innerHTML = '<div class="loading-placeholder">Loading content...</div>';
            
            // Only display content for first category
            if (index === 0) {
                content.style.display = 'block';
            }
            
            category.appendChild(header);
            category.appendChild(content);
            fragment.appendChild(category);
        });
        
        // Append all categories at once to minimize reflows
        this.contentContainer.appendChild(fragment);
        
        // Load first category content immediately
        this.loadCategoryContent('system-navigation');
        
        // Preload critical timestamps to improve responsiveness
        this.videoProcessor.preloadClips(['10:09', '10:58', '12:36', '13:42']);
    }
    
    /**
     * Format category ID into a readable name
     * @private
     * @param {string} categoryId - Category ID
     * @returns {string} - Formatted category name
     */
    _formatCategoryName(categoryId) {
        return categoryId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    /**
     * Load content for a specific category
     * @public
     * @param {string} categoryId - Category ID to load
     */
    loadCategoryContent(categoryId) {
        // Get category data from data manager
        const categoryData = this.dataManager.getCategoryData(categoryId);
        if (!categoryData || !categoryData.claims) return;
        
        // Get category content element
        const category = document.getElementById(categoryId);
        if (!category) return;
        
        const contentContainer = category.querySelector('.category-content');
        if (!contentContainer) return;
        
        // Create document fragment for batch DOM update
        const fragment = document.createDocumentFragment();
        
        // Render all claims for the category
        categoryData.claims.forEach(claim => {
            const claimElement = this._createClaimElement(claim);
            fragment.appendChild(claimElement);
        });
        
        // Replace loading placeholder with actual content
        contentContainer.innerHTML = '';
        contentContainer.appendChild(fragment);
    }
    
    /**
     * Create a claim element using template cloning for performance
     * @private
     * @param {Object} claim - Claim data
     * @returns {HTMLElement} - Claim element
     */
    _createClaimElement(claim) {
        // Clone the template
        const claimElement = this.claimTemplate.content.cloneNode(true);
        
        // Set claim title
        claimElement.querySelector('.claim-title').textContent = claim.title;
        
        // Set timestamp
        const timestampEl = claimElement.querySelector('.timestamp');
        timestampEl.textContent = claim.timestamp;
        timestampEl.dataset.time = claim.timestamp;
        if (claim.endTime) {
            timestampEl.dataset.endTime = claim.endTime;
        }
        
        // Set evidence strength
        const strengthEl = claimElement.querySelector('.evidence-strength');
        strengthEl.textContent = claim.strength || 'Strong Evidence';
        strengthEl.classList.add(claim.strengthClass || 'strong');
        
        // Set quote
        claimElement.querySelector('.quote-text').textContent = claim.quote;
        
        // Set quote timestamp
        const quoteTimestamp = claimElement.querySelector('.claim-quote-timestamp');
        quoteTimestamp.textContent = claim.quoteTimestamp || claim.timestamp;
        quoteTimestamp.dataset.time = claim.quoteTimestamp || claim.timestamp;
        
        // Set analysis
        claimElement.querySelector('.analysis-text').textContent = claim.analysis;
        
        // Add claim points
        const pointsContainer = claimElement.querySelector('.claim-points-container');
        if (claim.points && claim.points.length > 0) {
            claim.points.forEach(point => {
                const pointElement = this._createClaimPointElement(point);
                pointsContainer.appendChild(pointElement);
            });
        }
        
        return claimElement.firstElementChild;
    }
    
    /**
     * Create a claim point element using template cloning
     * @private
     * @param {Object} point - Point data
     * @returns {HTMLElement} - Point element
     */
    _createClaimPointElement(point) {
        // Clone the template
        const pointElement = this.claimPointTemplate.content.cloneNode(true);
        
        // Set timestamp
        const timestampLink = pointElement.querySelector('.timestamp-link');
        timestampLink.textContent = point.timestamp;
        timestampLink.dataset.time = point.timestamp;
        
        // Set point text
        pointElement.querySelector('.point-text').textContent = point.text;
        
        return pointElement.firstElementChild;
    }
    
    /**
     * Toggle a category's expanded/collapsed state
     * @public
     * @param {HTMLElement} category - Category element
     */
    toggleCategory(category) {
        const isActive = category.classList.contains('active');
        const toggleIcon = category.querySelector('.toggle-icon');
        const content = category.querySelector('.category-content');
        
        // Toggle active class
        category.classList.toggle('active');
        
        // Update toggle icon
        if (toggleIcon) {
            toggleIcon.textContent = isActive ? '▲' : '▼';
        }
        
        // Toggle content display with optimized animation
        if (content) {
            if (isActive) {
                // Animate collapse
                content.style.height = `${content.scrollHeight}px`;
                // Force reflow
                content.offsetHeight;
                content.style.height = '0';
                content.style.overflow = 'hidden';
                
                // Remove display after animation
                setTimeout(() => {
                    content.style.display = 'none';
                    content.style.height = '';
                    content.style.overflow = '';
                }, 200);
            } else {
                // Prepare for animation
                content.style.height = '0';
                content.style.overflow = 'hidden';
                content.style.display = 'block';
                
                // Force reflow
                content.offsetHeight;
                
                // Animate expand
                content.style.height = `${content.scrollHeight}px`;
                
                // Clean up after animation
                setTimeout(() => {
                    content.style.height = '';
                    content.style.overflow = '';
                }, 200);
                
                // Lazy load content if needed
                const categoryId = category.id;
                this.loadCategoryContent(categoryId);
            }
        }
    }
    
    /**
     * Switch to a specific category
     * @public
     * @param {string} categoryId - Category ID to switch to
     */
    switchToCategory(categoryId) {
        // Update active nav link
        const navLinks = document.querySelectorAll('.nav-list a');
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${categoryId}`);
        });
        
        // Update active category
        this.activeCategory = categoryId;
        
        // Collapse all categories first
        document.querySelectorAll('.category').forEach(cat => {
            cat.classList.remove('active');
            const content = cat.querySelector('.category-content');
            const toggleIcon = cat.querySelector('.toggle-icon');
            
            if (content) {
                content.style.display = 'none';
            }
            
            if (toggleIcon) {
                toggleIcon.textContent = '▲';
            }
        });
        
        // Expand target category
        const targetCategory = document.getElementById(categoryId);
        if (targetCategory) {
            targetCategory.classList.add('active');
            const content = targetCategory.querySelector('.category-content');
            const toggleIcon = targetCategory.querySelector('.toggle-icon');
            
            if (content) {
                content.style.display = 'block';
            }
            
            if (toggleIcon) {
                toggleIcon.textContent = '▼';
            }
            
            // Lazy load content if needed
            this.loadCategoryContent(categoryId);
            
            // Scroll into view with smooth animation
            targetCategory.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    /**
     * Open the video modal with evidence for a specific timestamp
     * @public
     * @param {string} timestamp - Timestamp to show evidence for
     */
    openModal(timestamp) {
        // Store current timestamp
        this.currentTimestamp = timestamp;
        
        // Get evidence data for timestamp
        const evidenceData = this.dataManager.getEvidenceData(timestamp);
        if (!evidenceData) return;
        
        // Update modal title
        const modalTitle = document.getElementById('modal-title');
        if (modalTitle) {
            modalTitle.textContent = evidenceData.title || 'Video Evidence';
        }
        
        // Update news banner
        const newsBanner = document.getElementById('news-banner');
        if (newsBanner) {
            newsBanner.textContent = evidenceData.banner || 'EVIDENCE REVIEW';
        }
        
        // Render transcript efficiently
        this._renderTranscript(evidenceData.transcript);
        
        // Render evidence summary
        this._renderEvidenceSummary(evidenceData);
        
        // Show modal with optimized animation
        this.modal.style.display = 'block';
        // Force reflow
        this.modal.offsetHeight;
        this.modal.style.opacity = '1';
        
        // Set focus on close button for accessibility
        const closeBtn = this.modal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.focus();
        }
        
        // Prevent body scrolling while modal is open
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * Close the video modal
     * @public
     */
    closeModal() {
        // Animate modal closing
        this.modal.style.opacity = '0';
        
        // Hide modal after animation
        setTimeout(() => {
            this.modal.style.display = 'none';
            
            // Reset video state
            const video = document.getElementById('evidence-video');
            if (video) {
                video.pause();
            }
            
            // Restore body scrolling
            document.body.style.overflow = '';
        }, 300);
    }
    
    /**
     * Render transcript with optimized DOM operations
     * @private
     * @param {string} transcript - Transcript text
     */
    _renderTranscript(transcript) {
        const transcriptDisplay = document.getElementById('transcript-display');
        if (!transcriptDisplay || !transcript) return;
        
        // Clear previous content
        transcriptDisplay.innerHTML = '';
        
        // Create document fragment for batch update
        const fragment = document.createDocumentFragment();
        
        // Split transcript into words
        const words = transcript.split(/\s+/);
        
        words.forEach((word, index) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'transcript-word';
            wordSpan.textContent = word;
            wordSpan.dataset.index = index;
            
            // Add space after word
            if (index < words.length - 1) {
                wordSpan.textContent += ' ';
            }
            
            fragment.appendChild(wordSpan);
        });
        
        // Batch update DOM
        transcriptDisplay.appendChild(fragment);
    }
    
    /**
     * Render evidence summary with efficient DOM operations
     * @private
     * @param {Object} evidenceData - Evidence data
     */
    _renderEvidenceSummary(evidenceData) {
        const evidenceSummary = document.getElementById('evidence-summary');
        if (!evidenceSummary) return;
        
        // Create summary content with optimized structure
        const summaryContent = document.createElement('div');
        
        // Add title
        const title = document.createElement('h4');
        title.textContent = 'Evidence Analysis';
        summaryContent.appendChild(title);
        
        // Add framework info
        if (evidenceData.framework) {
            const framework = document.createElement('p');
            framework.textContent = `Framework: ${evidenceData.framework}`;
            summaryContent.appendChild(framework);
        }
        
        // Add evidence level
        if (evidenceData.level) {
            const level = document.createElement('p');
            level.textContent = `Evidence Level: ${evidenceData.level}`;
            summaryContent.appendChild(level);
        }
        
        // Add evidence points
        if (evidenceData.points && evidenceData.points.length > 0) {
            const pointsTitle = document.createElement('p');
            pointsTitle.textContent = 'Key Points:';
            pointsTitle.style.marginTop = '10px';
            pointsTitle.style.fontWeight = 'bold';
            summaryContent.appendChild(pointsTitle);
            
            const pointsList = document.createElement('ul');
            
            // Use document fragment for batch update
            const pointsFragment = document.createDocumentFragment();
            
            evidenceData.points.forEach(point => {
                const listItem = document.createElement('li');
                
                // Create time link
                const timeLink = document.createElement('span');
                timeLink.className = 'time-link';
                timeLink.textContent = point.time;
                timeLink.dataset.time = point.time;
                
                listItem.appendChild(timeLink);
                listItem.appendChild(document.createTextNode(' ' + point.text));
                
                pointsFragment.appendChild(listItem);
            });
            
            pointsList.appendChild(pointsFragment);
            summaryContent.appendChild(pointsList);
        }
        
        // Add evidence tags
        if (evidenceData.tags && evidenceData.tags.length > 0) {
            const tagsContainer = document.createElement('div');
            tagsContainer.style.marginTop = '15px';
            
            // Use document fragment for batch update
            const tagsFragment = document.createDocumentFragment();
            
            evidenceData.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'evidence-tag';
                tagElement.textContent = tag;
                tagsFragment.appendChild(tagElement);
            });
            
            tagsContainer.appendChild(tagsFragment);
            summaryContent.appendChild(tagsContainer);
        }
        
        // Batch update DOM
        evidenceSummary.innerHTML = '';
        evidenceSummary.appendChild(summaryContent);
    }
    
    /**
     * Update transcript highlighting based on current video time
     * @public
     * @param {number} currentTime - Current video time in seconds
     */
    updateTranscriptHighlighting(currentTime) {
        if (!this.currentTimestamp) return;
        
        // Get evidence data for current timestamp
        const evidenceData = this.dataManager.getEvidenceData(this.currentTimestamp);
        if (!evidenceData) return;
        
        // Convert timestamp to seconds
        const timestampSeconds = this._timeToSeconds(this.currentTimestamp);
        
        // Calculate relative position in transcript
        const transcriptDuration = 30; // Assume 30 seconds of transcript
        const relativePosition = (currentTime - timestampSeconds) / transcriptDuration;
        
        // Get transcript words
        const transcriptWords = document.querySelectorAll('.transcript-word');
        if (transcriptWords.length === 0) return;
        
        // Calculate which words should be highlighted
        const totalWords = transcriptWords.length;
        const currentWordIndex = Math.floor(relativePosition * totalWords);
        
        // Update highlighting with minimized DOM operations
        const activeWordIndex = parseInt(document.querySelector('.transcript-word.active')?.dataset.index || '-1');
        
        if (activeWordIndex !== currentWordIndex) {
            // Remove current highlight
            document.querySelectorAll('.transcript-word.active').forEach(word => {
                word.classList.remove('active');
            });
            
            // Add new highlight
            if (currentWordIndex >= 0 && currentWordIndex < totalWords) {
                transcriptWords[currentWordIndex].classList.add('active');
                
                // Scroll transcript to keep active word visible
                this._scrollTranscriptToActiveWord(transcriptWords[currentWordIndex]);
            }
        }
    }
    
    /**
     * Scroll transcript to keep active word visible
     * @private
     * @param {HTMLElement} activeWord - Currently active word element
     */
    _scrollTranscriptToActiveWord(activeWord) {
        const transcriptDisplay = document.getElementById('transcript-display');
        if (!transcriptDisplay || !activeWord) return;
        
        // Calculate if word is in view
        const containerRect = transcriptDisplay.getBoundingClientRect();
        const wordRect = activeWord.getBoundingClientRect();
        
        // Check if word is outside visible area
        if (wordRect.top < containerRect.top || wordRect.bottom > containerRect.bottom) {
            // Calculate scroll position (center word)
            const scrollTop = activeWord.offsetTop - (transcriptDisplay.clientHeight / 2);
            
            // Scroll with smooth animation
            transcriptDisplay.scrollTo({
                top: scrollTop,
                behavior: 'smooth'
            });
        }
    }
    
    /**
     * Perform search with virtualized results rendering
     * @public
     * @param {string} query - Search query
     */
    performSearch(query) {
        if (!query || query.length < 2) {
            this.searchResults.classList.remove('active');
            return;
        }
        
        this.searchQuery = query.toLowerCase();
        
        // Get search results from data manager
        const results = this.dataManager.searchContent(this.searchQuery);
        
        // Show results container
        this.searchResults.classList.add('active');
        
        // Clear previous results
        this.searchResults.innerHTML = '';
        
        if (results.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'search-no-results';
            noResults.textContent = 'No results found';
            this.searchResults.appendChild(noResults);
            return;
        }
        
        // Create virtual list container
        const virtualListContainer = document.createElement('div');
        virtualListContainer.className = 'virtual-list-container';
        
        // Render only a limited number of results
        const visibleResults = results.slice(0, this.virtualListSize);
        
        // Create document fragment for batch update
        const fragment = document.createDocumentFragment();
        
        visibleResults.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.dataset.timestamp = result.timestamp;
            
            // Create title with highlighted match
            const title = document.createElement('div');
            title.className = 'search-result-title';
            title.innerHTML = this._highlightMatch(result.title, this.searchQuery);
            
            // Create context with highlighted match
            const context = document.createElement('div');
            context.className = 'search-result-context';
            context.innerHTML = this._highlightMatch(result.context, this.searchQuery);
            
            resultItem.appendChild(title);
            resultItem.appendChild(context);
            
            // Add click event to result item
            resultItem.addEventListener('click', () => {
                // Play clip and open modal
                this.videoProcessor.playClip(result.timestamp);
                this.openModal(result.timestamp);
                
                // Clear search
                this.searchInput.value = '';
                this.searchResults.classList.remove('active');
            });
            
            fragment.appendChild(resultItem);
        });
        
        virtualListContainer.appendChild(fragment);
        this.searchResults.appendChild(virtualListContainer);
        
        // Add "View more results" button if needed
        if (results.length > this.virtualListSize) {
            const viewMoreButton = document.createElement('button');
            viewMoreButton.className = 'view-more-button';
            viewMoreButton.textContent = `View ${results.length - this.virtualListSize} more results`;
            
            viewMoreButton.addEventListener('click', () => {
                this._loadMoreSearchResults(results, this.virtualListSize);
            });
            
            this.searchResults.appendChild(viewMoreButton);
        }
    }
    
    /**
     * Load more search results with virtualized rendering
     * @private
     * @param {Array} results - All search results
     * @param {number} startIndex - Index to start loading from
     */
    _loadMoreSearchResults(results, startIndex) {
        // Remove view more button
        const viewMoreButton = this.searchResults.querySelector('.view-more-button');
        if (viewMoreButton) {
            viewMoreButton.remove();
        }
        
        // Get container
        const virtualListContainer = this.searchResults.querySelector('.virtual-list-container');
        if (!virtualListContainer) return;
        
        // Calculate end index
        const endIndex = Math.min(startIndex + this.virtualListSize, results.length);
        
        // Get next batch of results
        const nextResults = results.slice(startIndex, endIndex);
        
        // Create document fragment for batch update
        const fragment = document.createDocumentFragment();
        
        nextResults.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.dataset.timestamp = result.timestamp;
            
            // Create title with highlighted match
            const title = document.createElement('div');
            title.className = 'search-result-title';
            title.innerHTML = this._highlightMatch(result.title, this.searchQuery);
            
            // Create context with highlighted match
            const context = document.createElement('div');
            context.className = 'search-result-context';
            context.innerHTML = this._highlightMatch(result.context, this.searchQuery);
            
            resultItem.appendChild(title);
            resultItem.appendChild(context);
            
            // Add click event to result item
            resultItem.addEventListener('click', () => {
                // Play clip and open modal
                this.videoProcessor.playClip(result.timestamp);
                this.openModal(result.timestamp);
                
                // Clear search
                this.searchInput.value = '';
                this.searchResults.classList.remove('active');
            });
            
            fragment.appendChild(resultItem);
        });
        
        // Add new results to container
        virtualListContainer.appendChild(fragment);
        
        // Add view more button if needed
        if (endIndex < results.length) {
            const newViewMoreButton = document.createElement('button');
            newViewMoreButton.className = 'view-more-button';
            newViewMoreButton.textContent = `View ${results.length - endIndex} more results`;
            
            newViewMoreButton.addEventListener('click', () => {
                this._loadMoreSearchResults(results, endIndex);
            });
            
            this.searchResults.appendChild(newViewMoreButton);
        }
    }
    
    /**
     * Highlight search match in text
     * @private
     * @param {string} text - Text to highlight
     * @param {string} query - Search query
     * @returns {string} - HTML with highlighted matches
     */
    _highlightMatch(text, query) {
        if (!text) return '';
        
        // Escape special characters in query
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Create regex for matching
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        
        // Replace with highlighted span
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }
    
    /**
     * Update visible categories based on scroll position
     * @public
     */
    updateVisibleCategories() {
        // Use IntersectionObserver if available
        if ('IntersectionObserver' in window) return;
        
        // Fallback for browsers without IntersectionObserver
        const categories = document.querySelectorAll('.category');
        const contentRect = document.querySelector('.content').getBoundingClientRect();
        
        let visibleCategory = null;
        let maxVisibleArea = 0;
        
        categories.forEach(category => {
            const rect = category.getBoundingClientRect();
            
            // Calculate visible area
            const visibleTop = Math.max(rect.top, contentRect.top);
            const visibleBottom = Math.min(rect.bottom, contentRect.bottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            const visibleArea = visibleHeight * rect.width;
            
            if (visibleArea > maxVisibleArea) {
                maxVisibleArea = visibleArea;
                visibleCategory = category.id;
            }
        });
        
        if (visibleCategory && visibleCategory !== this.activeCategory) {
            // Update active nav link without scrolling
            const navLinks = document.querySelectorAll('.nav-list a');
            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${visibleCategory}`);
            });
            
            this.activeCategory = visibleCategory;
        }
    }
    
    /**
     * Toggle between light and dark mode
     * @public
     */
    toggleTheme() {
        this.isLightMode = !this.isLightMode;
        
        // Toggle theme class on body
        document.body.classList.toggle('light-mode', this.isLightMode);
        
        // Update theme toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = this.isLightMode ? '🌙' : '☀';
            themeToggle.setAttribute('title', this.isLightMode ? 'Switch to dark mode' : 'Switch to light mode');
        }
        
        // Store preference in localStorage for persistence
        localStorage.setItem('theme', this.isLightMode ? 'light' : 'dark');
    }
    
    /**
     * Toggle sidebar visibility (mobile only)
     * @public
     */
    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        
        // Toggle sidebar class
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open', this.isSidebarOpen);
        }
        
        // Update toggle button
        const toggleButton = document.getElementById('toggle-sidebar');
        if (toggleButton) {
            toggleButton.innerHTML = this.isSidebarOpen ? '✕' : '☰';
            toggleButton.setAttribute('title', this.isSidebarOpen ? 'Close sidebar' : 'Open sidebar');
        }
    }
    
    /**
     * Convert MM:SS time format to seconds
     * @private
     * @param {string} timeString - Time string in MM:SS format
     * @returns {number} - Time in seconds
     */
    _timeToSeconds(timeString) {
        if (!timeString) return 0;
        
        const parts = timeString.split(':');
        if (parts.length === 2) {
            return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
        } else if (parts.length === 3) {
            return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
        }
        return parseFloat(timeString);
    }
}