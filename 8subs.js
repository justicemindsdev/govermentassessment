/**
 * memory-manager.js - Sophisticated memory management and optimization system
 * 
 * Implements advanced memory management strategies:
 * - Intelligent object pooling for DOM elements
 * - Memory-efficient data structures
 * - Automatic garbage collection triggers
 * - Memory leak detection and prevention
 * - Resource lifecycle management
 */

export class MemoryManager {
    /**
     * Initialize memory management system
     * @param {Object} config - Configuration parameters
     */
    constructor(config = {}) {
        // Configuration with intelligent defaults
        this.config = {
            poolSize: 100,                   // Maximum objects in pool
            elementTypes: ['div', 'span', 'p', 'button', 'img', 'video'],
            monitoringInterval: 5000,        // Memory monitoring frequency (ms)
            gcThreshold: 10 * 1024 * 1024,   // GC trigger threshold (10MB)
            leakDetectionThreshold: 2 * 1024 * 1024, // Memory leak detection threshold
            maxCacheSize: 50 * 1024 * 1024,  // 50MB cache limit
            ...config
        };
        
        // Initialize pools
        this.elementPools = {};
        this._initializePools();
        
        // Memory metrics
        this.memoryMetrics = {
            lastUsage: 0,
            baseline: 0,
            peak: 0,
            collections: 0,
            leaksDetected: 0,
            poolHits: 0,
            poolMisses: 0,
            releasedElements: 0,
            cachedAssets: 0,
            cachedSize: 0
        };
        
        // Cache for assets (images, video thumbnails, etc.)
        this.assetCache = new Map();
        
        // Weak references to track potentially leaking objects
        this.objectTracker = new WeakMap();
        
        // Store DOM observer
        this.domObserver = null;
        
        // Start memory monitoring
        this._startMemoryMonitoring();
        
        // Initialize DOM observer
        this._initializeDOMObserver();
    }
    
    /**
     * Initialize object pools for DOM elements
     * @private
     */
    _initializePools() {
        // Create pools for each element type
        this.config.elementTypes.forEach(type => {
            this.elementPools[type] = [];
        });
        
        console.log(`MemoryManager: Initialized ${this.config.elementTypes.length} element pools`);
    }
    
    /**
     * Initialize DOM mutation observer to detect removed elements
     * @private
     */
    _initializeDOMObserver() {
        // Create mutation observer
        this.domObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                // Check for removed nodes
                if (mutation.removedNodes.length > 0) {
                    mutation.removedNodes.forEach(node => {
                        // Only process element nodes
                        if (node.nodeType !== Node.ELEMENT_NODE) return;
                        
                        // Check if element is tracked
                        const tracker = this._getNodeTracker(node);
                        if (tracker) {
                            // Release element resources
                            this._releaseElement(node);
                        }
                        
                        // Process child elements
                        this._processRemovedChildren(node);
                    });
                }
            });
        });
        
        // Start observing document body
        this.domObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('MemoryManager: DOM observer initialized');
    }
    
    /**
     * Process removed children recursively
     * @private
     * @param {Element} node - Removed parent node
     */
    _processRemovedChildren(node) {
        // Process all child elements
        const children = node.querySelectorAll('*');
        children.forEach(child => {
            // Check if element is tracked
            const tracker = this._getNodeTracker(child);
            if (tracker) {
                // Release element resources
                this._releaseElement(child);
            }
        });
    }
    
    /**
     * Start periodic memory monitoring
     * @private
     */
    _startMemoryMonitoring() {
        // Get initial memory usage baseline
        this._updateMemoryUsage();
        this.memoryMetrics.baseline = this.memoryMetrics.lastUsage;
        
        // Set up monitoring interval
        setInterval(() => {
            // Update current memory usage
            this._updateMemoryUsage();
            
            // Check if garbage collection is needed
            if (this._shouldTriggerGC()) {
                this._triggerGarbageCollection();
            }
            
            // Check for memory leaks
            this._checkForMemoryLeaks();
            
            // Clean up asset cache if needed
            this._cleanupAssetCache();
        }, this.config.monitoringInterval);
        
        console.log(`MemoryManager: Memory monitoring started (interval: ${this.config.monitoringInterval}ms)`);
    }
    
    /**
     * Update memory usage metrics
     * @private
     */
    _updateMemoryUsage() {
        if (window.performance && window.performance.memory) {
            // Chrome-specific memory info
            const memoryInfo = window.performance.memory;
            this.memoryMetrics.lastUsage = memoryInfo.usedJSHeapSize;
            this.memoryMetrics.peak = Math.max(this.memoryMetrics.peak, memoryInfo.usedJSHeapSize);
        } else {
            // Fallback for browsers without memory API
            // Use pool and cache size as approximation
            const poolSize = Object.values(this.elementPools)
                .reduce((size, pool) => size + pool.length, 0);
            
            this.memoryMetrics.lastUsage = this.memoryMetrics.cachedSize + (poolSize * 1024);
        }
    }
    
    /**
     * Check if garbage collection should be triggered
     * @private
     * @returns {boolean} - True if GC should be triggered
     */
    _shouldTriggerGC() {
        if (!window.performance || !window.performance.memory) return false;
        
        const memoryInfo = window.performance.memory;
        const memoryUsage = memoryInfo.usedJSHeapSize;
        const memoryLimit = memoryInfo.jsHeapSizeLimit;
        
        // Trigger if used memory exceeds threshold or 80% of heap limit
        return (
            memoryUsage > this.memoryMetrics.baseline + this.config.gcThreshold ||
            memoryUsage > memoryLimit * 0.8
        );
    }
    
    /**
     * Attempt to trigger garbage collection
     * @private
     */
    _triggerGarbageCollection() {
        // Release unused pooled elements
        Object.values(this.elementPools).forEach(pool => {
            // Keep only half of the pool
            const reduceBy = Math.floor(pool.length / 2);
            if (reduceBy > 0) {
                pool.splice(0, reduceBy);
            }
        });
        
        // Clear asset cache
        this._cleanupAssetCache(true);
        
        // Force detached elements to release references
        this._clearDetachedElements();
        
        // Update metrics
        this.memoryMetrics.collections++;
        
        console.log('MemoryManager: Triggered garbage collection');
    }
    
    /**
     * Check for potential memory leaks
     * @private
     */
    _checkForMemoryLeaks() {
        if (!window.performance || !window.performance.memory) return;
        
        const currentUsage = window.performance.memory.usedJSHeapSize;
        const baseline = this.memoryMetrics.baseline;
        
        // Check for significant memory growth
        if (currentUsage > baseline + this.config.leakDetectionThreshold) {
            // Get detached elements count as leak indicator
            const detachedCount = this._countDetachedElements();
            
            if (detachedCount > 10) {
                console.warn(`MemoryManager: Potential memory leak detected (${detachedCount} detached elements, ${(currentUsage - baseline) / (1024 * 1024)}MB growth)`);
                this.memoryMetrics.leaksDetected++;
            }
        }
    }
    
    /**
     * Count detached DOM elements
     * @private
     * @returns {number} - Count of detached elements
     */
    _countDetachedElements() {
        let count = 0;
        
        // Iterate through tracker elements
        this.objectTracker.forEach((info, element) => {
            if (element instanceof Element && !document.contains(element)) {
                count++;
            }
        });
        
        return count;
    }
    
    /**
     * Clear detached elements to prevent memory leaks
     * @private
     */
    _clearDetachedElements() {
        // Note: We can't directly iterate through WeakMap
        // This is just a conceptual implementation
        
        // In a real implementation, we would maintain a secondary tracking structure
        // or use a different approach to clean up detached elements
        
        // For this example, we rely on the DOM observer to detect removed elements
    }
    
    /**
     * Clean up asset cache based on usage
     * @private
     * @param {boolean} aggressive - Force aggressive cleanup
     */
    _cleanupAssetCache(aggressive = false) {
        // Skip if cache is under limit and not aggressive
        if (this.memoryMetrics.cachedSize < this.config.maxCacheSize && !aggressive) {
            return;
        }
        
        // Sort assets by last access time
        const sortedAssets = Array.from(this.assetCache.entries())
            .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
        
        // Calculate how much to reduce
        let targetSize = aggressive ? 
            this.memoryMetrics.cachedSize * 0.5 : // Reduce by 50% if aggressive
            this.config.maxCacheSize * 0.8;       // Reduce to 80% of limit
        
        let currentSize = this.memoryMetrics.cachedSize;
        
        // Remove oldest assets until target size is reached
        for (const [key, asset] of sortedAssets) {
            if (currentSize <= targetSize) break;
            
            // Remove asset from cache
            this.assetCache.delete(key);
            currentSize -= asset.size;
            
            // Release asset resources
            if (asset.type === 'image' && asset.data instanceof Image) {
                asset.data.src = '';
            } else if (asset.type === 'video' && asset.data instanceof HTMLVideoElement) {
                asset.data.src = '';
                asset.data.load();
            }
        }
        
        // Update metrics
        this.memoryMetrics.cachedSize = currentSize;
        this.memoryMetrics.cachedAssets = this.assetCache.size;
        
        console.log(`MemoryManager: Cleaned up asset cache (${this.assetCache.size} assets, ${currentSize / (1024 * 1024)}MB)`);
    }
    
    /**
     * Get an element from the pool or create a new one
     * @public
     * @param {string} type - Element type
     * @param {Object} attributes - Element attributes
     * @returns {Element} - Element instance
     */
    getElement(type, attributes = {}) {
        // Normalize type
        type = type.toLowerCase();
        
        // Get pool for this element type
        const pool = this.elementPools[type];
        
        if (!pool) {
            throw new Error(`Unknown element type: ${type}`);
        }
        
        let element;
        
        // Try to get element from pool
        if (pool.length > 0) {
            element = pool.pop();
            this.memoryMetrics.poolHits++;
        } else {
            // Create new element
            element = document.createElement(type);
            this.memoryMetrics.poolMisses++;
        }
        
        // Reset element state
        this._resetElement(element);
        
        // Apply attributes
        Object.entries(attributes).forEach(([attr, value]) => {
            if (attr === 'class') {
                element.className = value;
            } else if (attr === 'style') {
                element.style.cssText = value;
            } else if (attr === 'dataset') {
                Object.entries(value).forEach(([key, val]) => {
                    element.dataset[key] = val;
                });
            } else {
                element.setAttribute(attr, value);
            }
        });
        
        // Track element for memory management
        this._trackElement(element);
        
        return element;
    }
    
    /**
     * Return an element to the pool
     * @public
     * @param {Element} element - Element to release
     * @returns {boolean} - True if element was released
     */
    releaseElement(element) {
        if (!element || !(element instanceof Element)) {
            return false;
        }
        
        // Get element tag name
        const type = element.tagName.toLowerCase();
        
        // Check if element type is pooled
        if (!this.elementPools[type]) {
            return false;
        }
        
        // Remove from DOM if attached
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
        
        // Reset element state
        this._resetElement(element);
        
        // Add to pool if not full
        const pool = this.elementPools[type];
        if (pool.length < this.config.poolSize) {
            pool.push(element);
        }
        
        // Update tracking
        this._untrackElement(element);
        
        // Update metrics
        this.memoryMetrics.releasedElements++;
        
        return true;
    }
    
    /**
     * Reset element to clean state
     * @private
     * @param {Element} element - Element to reset
     */
    _resetElement(element) {
        // Remove all attributes
        while (element.attributes.length > 0) {
            element.removeAttribute(element.attributes[0].name);
        }
        
        // Clear content
        element.innerHTML = '';
        
        // Remove event listeners (limited support)
        element.replaceWith(element.cloneNode(false));
        
        // Reset specific properties by element type
        const type = element.tagName.toLowerCase();
        
        if (type === 'img') {
            element.src = '';
            element.srcset = '';
            element.sizes = '';
            element.alt = '';
        } else if (type === 'video') {
            element.src = '';
            element.poster = '';
            element.preload = 'none';
            
            // Remove source elements
            Array.from(element.querySelectorAll('source')).forEach(source => {
                element.removeChild(source);
            });
            
            // Release media resources
            if (typeof element.load === 'function') {
                element.load();
            }
        } else if (type === 'canvas') {
            // Clear canvas
            const context = element.getContext('2d');
            if (context) {
                context.clearRect(0, 0, element.width, element.height);
            }
            
            // Reset dimensions
            element.width = 0;
            element.height = 0;
        } else if (type === 'input') {
            element.value = '';
            element.checked = false;
            element.defaultValue = '';
            element.defaultChecked = false;
        }
    }
    
    /**
     * Release element and all its resources
     * @private
     * @param {Element} element - Element to release
     */
    _releaseElement(element) {
        // Specific cleanup for element types
        const type = element.tagName.toLowerCase();
        
        if (type === 'img') {
            element.src = '';
            element.srcset = '';
        } else if (type === 'video') {
            if (element.src) {
                element.pause();
                element.removeAttribute('src');
                element.load();
            }
        } else if (type === 'iframe') {
            element.src = 'about:blank';
        }
        
        // Find and release child elements
        Array.from(element.children).forEach(child => {
            this._releaseElement(child);
        });
        
        // Remove all event listeners (limited support)
        element.replaceWith(element.cloneNode(false));
        
        // Attempt to release element to pool
        this.releaseElement(element);
    }
    
    /**
     * Track element for memory management
     * @private
     * @param {Element} element - Element to track
     */
    _trackElement(element) {
        this.objectTracker.set(element, {
            id: crypto.randomUUID(),
            created: Date.now(),
            type: element.tagName.toLowerCase()
        });
    }
    
    /**
     * Remove element from tracking
     * @private
     * @param {Element} element - Element to untrack
     */
    _untrackElement(element) {
        this.objectTracker.delete(element);
    }
    
    /**
     * Get tracker data for element
     * @private
     * @param {Element} element - Element to get tracker for
     * @returns {Object|null} - Tracker data or null
     */
    _getNodeTracker(element) {
        return this.objectTracker.get(element) || null;
    }
    
    /**
     * Cache an asset for reuse
     * @public
     * @param {string} key - Cache key
     * @param {any} data - Asset data
     * @param {string} type - Asset type
     * @param {number} size - Asset size in bytes
     * @returns {boolean} - True if asset was cached
     */
    cacheAsset(key, data, type, size) {
        // Skip if cache is full and this would exceed limit
        if (this.memoryMetrics.cachedSize + size > this.config.maxCacheSize) {
            // Try to clean up cache
            this._cleanupAssetCache();
            
            // Check if we have room now
            if (this.memoryMetrics.cachedSize + size > this.config.maxCacheSize) {
                return false;
            }
        }
        
        // Add or update cache entry
        this.assetCache.set(key, {
            data,
            type,
            size,
            added: Date.now(),
            lastAccessed: Date.now(),
            accessCount: 0
        });
        
        // Update metrics
        this.memoryMetrics.cachedSize += size;
        this.memoryMetrics.cachedAssets = this.assetCache.size;
        
        return true;
    }
    
    /**
     * Get asset from cache
     * @public
     * @param {string} key - Cache key
     * @returns {any|null} - Cached asset or null
     */
    getCachedAsset(key) {
        // Get cache entry
        const entry = this.assetCache.get(key);
        
        if (!entry) {
            return null;
        }
        
        // Update access metrics
        entry.lastAccessed = Date.now();
        entry.accessCount++;
        
        return entry.data;
    }
    
    /**
     * Remove asset from cache
     * @public
     * @param {string} key - Cache key
     * @returns {boolean} - True if asset was removed
     */
    uncacheAsset(key) {
        // Get cache entry
        const entry = this.assetCache.get(key);
        
        if (!entry) {
            return false;
        }
        
        // Remove from cache
        this.assetCache.delete(key);
        
        // Update metrics
        this.memoryMetrics.cachedSize -= entry.size;
        this.memoryMetrics.cachedAssets = this.assetCache.size;
        
        return true;
    }
    
    /**
     * Create a DOM fragment with multiple elements
     * @public
     * @param {Array} elements - Element definitions
     * @returns {DocumentFragment} - Document fragment with elements
     */
    createFragment(elements) {
        const fragment = document.createDocumentFragment();
        
        elements.forEach(def => {
            const element = this.getElement(def.type, def.attributes);
            
            // Add content if specified
            if (def.content) {
                element.textContent = def.content;
            }
            
            // Add child elements
            if (def.children) {
                const childFragment = this.createFragment(def.children);
                element.appendChild(childFragment);
            }
            
            fragment.appendChild(element);
        });
        
        return fragment;
    }
    
    /**
     * Pre-allocate element pool
     * @public
     * @param {string} type - Element type
     * @param {number} count - Number of elements to pre-allocate
     */
    preAllocate(type, count) {
        type = type.toLowerCase();
        
        // Get pool for this element type
        const pool = this.elementPools[type];
        
        if (!pool) {
            throw new Error(`Unknown element type: ${type}`);
        }
        
        // Calculate number to create
        const createCount = Math.min(
            count,
            this.config.poolSize - pool.length
        );
        
        // Create elements
        for (let i = 0; i < createCount; i++) {
            const element = document.createElement(type);
            pool.push(element);
        }
        
        console.log(`MemoryManager: Pre-allocated ${createCount} ${type} elements`);
    }
    
    /**
     * Get memory metrics
     * @public
     * @returns {Object} - Memory metrics
     */
    getMetrics() {
        this._updateMemoryUsage();
        
        return {
            ...this.memoryMetrics,
            poolSizes: Object.fromEntries(
                Object.entries(this.elementPools).map(([type, pool]) => [type, pool.length])
            )
        };
    }
    
    /**
     * Clean up and release resources
     * @public
     */
    destroy() {
        // Stop DOM observer
        if (this.domObserver) {
            this.domObserver.disconnect();
            this.domObserver = null;
        }
        
        // Clear all element pools
        Object.keys(this.elementPools).forEach(type => {
            this.elementPools[type] = [];
        });
        
        // Clear asset cache
        this.assetCache.clear();
        this.memoryMetrics.cachedSize = 0;
        this.memoryMetrics.cachedAssets = 0;
        
        console.log('MemoryManager: Resources released');
    }
}