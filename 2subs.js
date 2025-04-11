/**
 * VideoProcessor.js - Advanced video processing and streaming optimization
 * 
 * This module handles all video-related operations with optimized performance:
 * - Adaptive bitrate selection based on network conditions
 * - Intelligent buffer management
 * - Low-latency stream initialization
 * - Memory-efficient video segment management
 */

export class VideoProcessor {
    /**
     * Initialize the video processor with configuration parameters
     * @param {Object} config - Configuration parameters
     */
    constructor(config) {
        // Core elements
        this.videoElement = config.videoElement;
        this.videoSrc = config.videoSrc;
        this.loadingOverlay = config.loadingOverlay;
        this.progressBar = config.progressBar;
        
        // Playback state
        this.currentClip = null;
        this.clipHistory = [];
        this.clipIndex = -1;
        this.playing = false;
        this.updateInterval = null;
        
        // Advanced HLS configuration
        this.hlsConfig = {
            maxBufferLength: 30,             // Buffer length in seconds
            maxMaxBufferLength: 60,          // Maximum buffer length with ABR rules
            startLevel: -1,                  // Auto level selection (-1)
            debug: false,                    // Disable debug logs for production
            progressive: true,               // Enable progressive loading
            lowLatencyMode: true,            // Enable low latency mode
            backBufferLength: 30,            // Keep 30s of back buffer
            enableWorker: true,              // Use Web Workers for parsing
            maxBufferHole: 0.5,              // Jump forward if hole < 0.5s
            maxStarvationDelay: 4,           // ABR algorithm calibration
            maxLoadingDelay: 4,              // ABR algorithm calibration
            abrEwmaDefaultEstimate: 500000,  // Default bitrate estimate (500kbps)
            abrBandWidthFactor: 0.9,         // Bandwidth safety factor
            abrBandWidthUpFactor: 0.7,       // Upswitch threshold factor
            abrMaxWithRealBitrate: true,     // Use real bitrate for ABR calculations
            fpsDroppedMonitoringPeriod: 5000, // FPS monitoring period
            fpsDroppedMonitoringThreshold: 0.2, // FPS threshold for quality switch
        };
        
        // Performance monitoring
        this.performanceMetrics = {
            loadStartTime: 0,
            firstSegmentLoadTime: 0,
            playbackStartTime: 0,
            bufferingEvents: 0,
            bitrateChanges: 0,
            droppedFrames: 0
        };
        
        // Initialize the HLS.js instance with deferred loading
        this.hls = null;
        this.hlsSupported = typeof Hls !== 'undefined' && Hls.isSupported();
        
        // Initialize video with preload strategy
        this._initializeVideo();
        
        // Set up event listeners
        this._setupEventListeners();
    }
    
    /**
     * Initialize the video element and HLS instance
     * @private
     */
    _initializeVideo() {
        // Show loading overlay
        this._showLoading();
        
        // Wait for HLS.js to be available (with timeout)
        this._waitForHls().then(() => {
            if (this.hlsSupported) {
                this._initializeHls();
            } else if (this.videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support (Safari)
                this._initializeNativeHls();
            } else {
                console.error('HLS is not supported in this browser');
                this._hideLoading();
            }
        });
    }
    
    /**
     * Wait for HLS.js to be available
     * @private
     * @returns {Promise} - Resolves when HLS is available
     */
    _waitForHls() {
        return new Promise((resolve) => {
            if (typeof Hls !== 'undefined') {
                resolve();
                return;
            }
            
            // Check every 100ms for HLS with a timeout
            let attempts = 0;
            const checkInterval = setInterval(() => {
                if (typeof Hls !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                    return;
                }
                
                attempts++;
                if (attempts > 100) { // 10 second timeout
                    clearInterval(checkInterval);
                    console.warn('HLS.js loading timed out, falling back to native playback');
                    resolve();
                }
            }, 100);
        });
    }
    
    /**
     * Initialize HLS.js with optimized configuration
     * @private
     */
    _initializeHls() {
        this.performanceMetrics.loadStartTime = performance.now();
        
        this.hls = new Hls(this.hlsConfig);
        this.hls.loadSource(this.videoSrc);
        this.hls.attachMedia(this.videoElement);
        
        // Add HLS event listeners for performance monitoring
        this.hls.on(Hls.Events.MANIFEST_PARSED, this._onManifestParsed.bind(this));
        this.hls.on(Hls.Events.LEVEL_SWITCHED, this._onLevelSwitched.bind(this));
        this.hls.on(Hls.Events.FRAG_LOADED, this._onFragmentLoaded.bind(this));
        this.hls.on(Hls.Events.ERROR, this._onError.bind(this));
        
        // Monitor for stalls
        this.hls.on(Hls.Events.BUFFER_STALLED_ERROR, () => {
            this.performanceMetrics.bufferingEvents++;
        });
    }
    
    /**
     * Initialize native HLS support (Safari)
     * @private
     */
    _initializeNativeHls() {
        this.performanceMetrics.loadStartTime = performance.now();
        this.videoElement.src = this.videoSrc;
        
        // Add event listener for when metadata is loaded
        this.videoElement.addEventListener('loadedmetadata', () => {
            this.performanceMetrics.firstSegmentLoadTime = performance.now() - this.performanceMetrics.loadStartTime;
            this._hideLoading();
        });
    }
    
    /**
     * Handle HLS manifest parsed event
     * @private
     */
    _onManifestParsed(event, data) {
        console.log(`HLS Manifest parsed with ${data.levels.length} quality levels`);
        
        // Set initial level to highest quality that can be played without initial buffering
        const bandwidth = this._estimateAvailableBandwidth();
        const levels = data.levels;
        
        // Find appropriate starting level based on bandwidth
        let startLevel = 0;
        for (let i = 0; i < levels.length; i++) {
            if (levels[i].bitrate < bandwidth * 0.8) { // 80% of available bandwidth
                startLevel = i;
            } else {
                break;
            }
        }
        
        // Set start level for faster initial playback
        this.hls.currentLevel = startLevel;
    }
    
    /**
     * Handle level switched event
     * @private
     */
    _onLevelSwitched(event, data) {
        this.performanceMetrics.bitrateChanges++;
        const currentLevel = this.hls.levels[data.level];
        console.log(`Quality changed to: ${currentLevel.height}p (${Math.round(currentLevel.bitrate/1000)} kbps)`);
    }
    
    /**
     * Handle fragment loaded event
     * @private
     */
    _onFragmentLoaded(event, data) {
        if (this.performanceMetrics.firstSegmentLoadTime === 0) {
            this.performanceMetrics.firstSegmentLoadTime = performance.now() - this.performanceMetrics.loadStartTime;
            this._hideLoading();
        }
    }
    
    /**
     * Handle HLS error events
     * @private
     */
    _onError(event, data) {
        if (data.fatal) {
            switch(data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error('Fatal network error', data);
                    // Try to recover with exponential backoff
                    this._recoverWithBackoff(0);
                    break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                    console.error('Fatal media error', data);
                    this.hls.recoverMediaError();
                    break;
                default:
                    console.error('Fatal HLS error', data);
                    this.hls.destroy();
                    this._initializeHls(); // Reinitialize
                    break;
            }
        }
    }
    
    /**
     * Recover from network errors with exponential backoff
     * @private
     * @param {number} retryCount - Number of retry attempts
     */
    _recoverWithBackoff(retryCount) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30s delay
        
        setTimeout(() => {
            this.hls.startLoad();
            
            // Listen for recovery or continued failure
            const errorHandler = (event, data) => {
                if (data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    this.hls.off(Hls.Events.ERROR, errorHandler);
                    this._recoverWithBackoff(retryCount + 1);
                } else if (!data.fatal) {
                    // Recovered successfully
                    this.hls.off(Hls.Events.ERROR, errorHandler);
                }
            };
            
            this.hls.on(Hls.Events.ERROR, errorHandler);
        }, delay);
    }
    
    /**
     * Estimate available bandwidth
     * @private
     * @returns {number} - Estimated bandwidth in bits per second
     */
    _estimateAvailableBandwidth() {
        // Use navigator.connection if available
        if (navigator.connection) {
            const connection = navigator.connection;
            if (connection.downlink) {
                return connection.downlink * 1000000; // Convert Mbps to bps
            }
            
            // Use effectiveType as fallback
            if (connection.effectiveType) {
                switch (connection.effectiveType) {
                    case 'slow-2g':
                        return 100000; // 100 kbps
                    case '2g':
                        return 300000; // 300 kbps
                    case '3g':
                        return 1500000; // 1.5 Mbps
                    case '4g':
                        return 5000000; // 5 Mbps
                    default:
                        return 2000000; // 2 Mbps default
                }
            }
        }
        
        // Default fallback
        return 2000000; // 2 Mbps default
    }
    
    /**
     * Set up video element event listeners
     * @private
     */
    _setupEventListeners() {
        // Video element event listeners
        this.videoElement.addEventListener('play', this._onPlay.bind(this));
        this.videoElement.addEventListener('pause', this._onPause.bind(this));
        this.videoElement.addEventListener('timeupdate', this._onTimeUpdate.bind(this));
        this.videoElement.addEventListener('canplay', this._onCanPlay.bind(this));
        this.videoElement.addEventListener('stalled', this._onStalled.bind(this));
        this.videoElement.addEventListener('error', this._onVideoError.bind(this));
        
        // Monitor dropped frames if supported
        if (this.videoElement.getVideoPlaybackQuality) {
            setInterval(() => {
                const quality = this.videoElement.getVideoPlaybackQuality();
                if (quality && quality.droppedVideoFrames) {
                    const newDropped = quality.droppedVideoFrames - this.performanceMetrics.droppedFrames;
                    this.performanceMetrics.droppedFrames = quality.droppedVideoFrames;
                    
                    // If dropping too many frames, reduce quality
                    if (this.hls && newDropped > 30 && this.hls.currentLevel > 0) {
                        this.hls.nextLevel = this.hls.currentLevel - 1;
                    }
                }
            }, 5000);
        }
    }
    
    /**
     * Handle video play event
     * @private
     */
    _onPlay() {
        this.playing = true;
        
        // Start progress bar update
        if (!this.updateInterval) {
            this.updateInterval = setInterval(() => {
                this._updateProgressBar();
            }, 50); // Update at 20fps for smooth animation
        }
        
        // Record playback start time for metrics
        if (this.performanceMetrics.playbackStartTime === 0) {
            this.performanceMetrics.playbackStartTime = performance.now();
        }
    }
    
    /**
     * Handle video pause event
     * @private
     */
    _onPause() {
        this.playing = false;
        
        // Clear update interval
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    /**
     * Handle video timeupdate event
     * @private
     */
    _onTimeUpdate() {
        // Used for tracking current position and updating transcript
        if (this.currentClip && this.onTimeUpdate) {
            this.onTimeUpdate(this.videoElement.currentTime);
        }
    }
    
    /**
     * Handle video canplay event
     * @private
     */
    _onCanPlay() {
        this._hideLoading();
    }
    
    /**
     * Handle video stalled event
     * @private
     */
    _onStalled() {
        this._showLoading();
        this.performanceMetrics.bufferingEvents++;
    }
    
    /**
     * Handle video error event
     * @private
     */
    _onVideoError() {
        console.error('Video playback error', this.videoElement.error);
        this._hideLoading();
        
        // Try to recover
        if (this.videoElement.error.code === MediaError.MEDIA_ERR_NETWORK) {
            // Retry loading the video
            const currentTime = this.videoElement.currentTime;
            this.videoElement.load();
            this.videoElement.currentTime = currentTime;
        }
    }
    
    /**
     * Update progress bar for current clip
     * @private
     */
    _updateProgressBar() {
        if (!this.playing || !this.currentClip) return;
        
        const currentTime = this.videoElement.currentTime;
        const startTime = this._timeToSeconds(this.currentClip.startTime);
        const endTime = this._timeToSeconds(this.currentClip.endTime);
        
        const clipDuration = endTime - startTime;
        const currentPosition = currentTime - startTime;
        
        // Calculate progress percentage
        const progressPercent = Math.min(100, Math.max(0, (currentPosition / clipDuration) * 100));
        
        // Update progress bar with hardware acceleration
        this.progressBar.style.transform = `translateX(${progressPercent - 100}%)`;
        this.progressBar.style.width = '100%';
        
        // Check if clip has ended
        if (currentTime >= endTime) {
            // Pause at end of clip
            this.videoElement.pause();
        }
    }
    
    /**
     * Show loading overlay
     * @private
     */
    _showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';
        }
    }
    
    /**
     * Hide loading overlay
     * @private
     */
    _hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
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
    
    /**
     * Format seconds to MM:SS time format
     * @private
     * @param {number} seconds - Time in seconds
     * @returns {string} - Formatted time string
     */
    _formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    /**
     * Play a video clip at the specified timestamp
     * @public
     * @param {string} startTime - Start time in MM:SS format
     * @param {string} endTime - End time in MM:SS format (optional)
     */
    playClip(startTime, endTime) {
        this._showLoading();
        
        // Convert times to seconds
        const startSeconds = this._timeToSeconds(startTime);
        let endSeconds = endTime ? this._timeToSeconds(endTime) : startSeconds + 30; // Default 30 second clip
        
        // Store current clip information
        this.currentClip = {
            startTime: startTime,
            endTime: this._formatTime(endSeconds),
            startSeconds: startSeconds,
            endSeconds: endSeconds
        };
        
        // Add to clip history for navigation
        this.clipHistory.push(this.currentClip);
        this.clipIndex = this.clipHistory.length - 1;
        
        // Optimize buffering by setting quality level based on clip length
        if (this.hls && this.hls.levels) {
            const clipDuration = endSeconds - startSeconds;
            if (clipDuration < 10) {
                // For very short clips, use highest quality
                this.hls.currentLevel = this.hls.levels.length - 1;
            } else if (clipDuration < 30) {
                // For medium clips, use auto level selection
                this.hls.currentLevel = -1;
            }
        }
        
        // Ensure video is loaded before seeking
        const seekAndPlay = () => {
            // Set current time
            this.videoElement.currentTime = startSeconds;
            
            // Reset progress bar
            this.progressBar.style.width = '0%';
            
            // Play video
            const playPromise = this.videoElement.play();
            
            // Handle play promise for browsers that return one
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this._hideLoading();
                }).catch(error => {
                    console.error('Play promise error:', error);
                    this._hideLoading();
                    
                    // Auto-play was prevented, show play button or message
                    if (error.name === 'NotAllowedError') {
                        // Handle autoplay restriction
                        alert('Please click to enable video playback');
                    }
                });
            } else {
                this._hideLoading();
            }
        };
        
        // Check if video is ready for seeking
        if (this.videoElement.readyState >= 2) {
            seekAndPlay();
        } else {
            // Wait for canplay event
            const canPlayHandler = () => {
                seekAndPlay();
                this.videoElement.removeEventListener('canplay', canPlayHandler);
            };
            this.videoElement.addEventListener('canplay', canPlayHandler);
        }
        
        // Update clip duration display
        const clipTimeDisplay = document.getElementById('clip-time');
        if (clipTimeDisplay) {
            const duration = this._formatTime(endSeconds - startSeconds);
            clipTimeDisplay.textContent = duration;
        }
        
        return this.currentClip;
    }
    
    /**
     * Replay the current clip
     * @public
     */
    replayCurrentClip() {
        if (this.currentClip) {
            this.playClip(this.currentClip.startTime, this.currentClip.endTime);
        }
    }
    
    /**
     * Play full context around the current clip
     * @public
     */
    playFullContext() {
        if (this.currentClip) {
            // Calculate context window (60 seconds before and after)
            const contextStartSeconds = Math.max(0, this.currentClip.startSeconds - 60);
            const contextEndSeconds = this.currentClip.endSeconds + 60;
            
            // Format times
            const contextStartTime = this._formatTime(contextStartSeconds);
            const contextEndTime = this._formatTime(contextEndSeconds);
            
            // Play extended clip
            this.playClip(contextStartTime, contextEndTime);
        }
    }
    
    /**
     * Play the previous clip in history
     * @public
     */
    playPreviousClip() {
        if (this.clipIndex > 0) {
            this.clipIndex--;
            const prevClip = this.clipHistory[this.clipIndex];
            this.playClip(prevClip.startTime, prevClip.endTime);
        }
    }
    
    /**
     * Play the next clip in history
     * @public
     */
    playNextClip() {
        if (this.clipIndex < this.clipHistory.length - 1) {
            this.clipIndex++;
            const nextClip = this.clipHistory[this.clipIndex];
            this.playClip(nextClip.startTime, nextClip.endTime);
        }
    }
    
    /**
     * Set callback for time update events
     * @public
     * @param {Function} callback - Function to call on time update
     */
    setTimeUpdateCallback(callback) {
        this.onTimeUpdate = callback;
    }
    
    /**
     * Preload a set of clips for faster playback
     * @public
     * @param {Array} timestamps - Array of timestamps to preload
     */
    preloadClips(timestamps) {
        if (!this.hls) return;
        
        // Convert timestamps to seconds
        const timePositions = timestamps.map(time => this._timeToSeconds(time));
        
        // Use programmatic buffering to preload segments
        timePositions.forEach(timePos => {
            const bufferInfo = this.hls.bufferInfo(timePos, 0.1);
            if (bufferInfo.len === 0) {
                // No buffer at this position, trigger load
                this.hls.trigger(Hls.Events.BUFFER_APPENDING, {
                    type: 'video',
                    data: new Uint8Array(0), // Empty data triggers segment load
                    parent: 'main',
                    content: ''
                });
            }
        });
    }
    
    /**
     * Clean up resources
     * @public
     */
    destroy() {
        // Clear intervals
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        // Remove event listeners
        if (this.videoElement) {
            this.videoElement.removeEventListener('play', this._onPlay);
            this.videoElement.removeEventListener('pause', this._onPause);
            this.videoElement.removeEventListener('timeupdate', this._onTimeUpdate);
            this.videoElement.removeEventListener('canplay', this._onCanPlay);
            this.videoElement.removeEventListener('stalled', this._onStalled);
            this.videoElement.removeEventListener('error', this._onVideoError);
        }
        
        // Destroy HLS.js instance
        if (this.hls) {
            this.hls.destroy();
            this.hls = null;
        }
    }
    
    /**
     * Get performance metrics
     * @public
     * @returns {Object} - Performance metrics
     */
    getPerformanceMetrics() {
        // Calculate derived metrics
        const metrics = { ...this.performanceMetrics };
        
        // Add time to first frame
        if (metrics.playbackStartTime && metrics.loadStartTime) {
            metrics.timeToFirstFrame = metrics.playbackStartTime - metrics.loadStartTime;
        }
        
        return metrics;
    }
}