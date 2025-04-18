/**
 * processor-worker.js - Dedicated worker thread for CPU-intensive tasks
 * 
 * This worker handles computationally expensive operations off the main thread:
 * - Video frame analysis and processing
 * - Advanced search indexing
 * - Transcript synchronization algorithms
 * - Data transformation and computation
 */

// Import required modules (using importScripts for older browsers)
// importScripts('/path/to/library.js');

// Optimization: Pre-allocate memory for frequently used operations
const BUFFER_SIZE = 1024 * 1024; // 1MB
const sharedBuffer = new ArrayBuffer(BUFFER_SIZE);
const float32View = new Float32Array(sharedBuffer);
const uint8View = new Uint8Array(sharedBuffer);

// Task registry with optimized implementations
const taskRegistry = {
    /**
     * Process video frames for content analysis
     * @param {Object} data - Task data
     * @returns {Object} - Analysis results
     */
    processVideoFrames: (data) => {
        const { frames, options } = data;
        
        // Track performance
        const startTime = performance.now();
        
        // Process each frame
        const results = frames.map(frame => {
            // Convert frame data to typed array for processing
            const frameData = new Uint8ClampedArray(frame.data);
            
            // Calculate frame luminance histogram
            const histogram = calculateHistogram(frameData);
            
            // Detect scene changes
            const sceneChangeScore = detectSceneChange(frameData, histogram);
            
            // Detect motion
            const motionScore = detectMotion(frameData);
            
            return {
                timestamp: frame.timestamp,
                histogram,
                sceneChangeScore,
                motionScore,
                isKeyFrame: sceneChangeScore > options.sceneChangeThreshold
            };
        });
        
        // Calculate aggregate metrics
        const keyFrames = results.filter(r => r.isKeyFrame).map(r => r.timestamp);
        
        return {
            frameResults: results,
            keyFrames,
            processingTime: performance.now() - startTime
        };
    },
    
    /**
     * Build optimized search index
     * @param {Object} data - Task data
     * @returns {Object} - Search index
     */
    buildSearchIndex: (data) => {
        const { documents, options } = data;
        const startTime = performance.now();
        
        // Create inverted index
        const invertedIndex = {};
        const documentMap = {};
        
        // Process each document
        documents.forEach((doc, docIndex) => {
            // Store document in map
            documentMap[docIndex] = {
                id: doc.id,
                title: doc.title,
                timestamp: doc.timestamp
            };
            
            // Tokenize content
            const tokens = tokenizeContent(doc.content, options);
            
            // Add tokens to inverted index
            tokens.forEach(token => {
                if (!invertedIndex[token.term]) {
                    invertedIndex[token.term] = [];
                }
                
                invertedIndex[token.term].push({
                    docId: docIndex,
                    frequency: token.frequency,
                    positions: token.positions
                });
            });
        });
        
        // Sort and optimize index
        for (const term in invertedIndex) {
            // Sort by term frequency for faster retrieval
            invertedIndex[term].sort((a, b) => b.frequency - a.frequency);
        }
        
        return {
            invertedIndex,
            documentMap,
            termCount: Object.keys(invertedIndex).length,
            documentCount: documents.length,
            processingTime: performance.now() - startTime
        };
    },
    
    /**
     * Synchronize transcript with audio
     * @param {Object} data - Task data
     * @returns {Object} - Synchronized transcript
     */
    synchronizeTranscript: (data) => {
        const { transcript, audioFeatures, options } = data;
        const startTime = performance.now();
        
        // Split transcript into words
        const words = transcript.trim().split(/\s+/);
        
        // Calculate word timing probabilities using dynamic time warping
        const wordTimings = dynamicTimeWarping(words, audioFeatures);
        
        // Enhance timing accuracy with confidence scores
        const enhancedTimings = enhanceTimingAccuracy(wordTimings, audioFeatures, options);
        
        // Format results
        const syncedTranscript = words.map((word, index) => ({
            word,
            startTime: enhancedTimings[index].start,
            endTime: enhancedTimings[index].end,
            confidence: enhancedTimings[index].confidence
        }));
        
        return {
            syncedTranscript,
            averageConfidence: enhancedTimings.reduce((sum, t) => sum + t.confidence, 0) / enhancedTimings.length,
            processingTime: performance.now() - startTime
        };
    },
    
    /**
     * Calculate video segment similarity
     * @param {Object} data - Task data
     * @returns {Object} - Similarity analysis
     */
    calculateVideoSimilarity: (data) => {
        const { segmentFeatures, referenceFeatures, options } = data;
        const startTime = performance.now();
        
        // Extract features
        const segmentHistograms = segmentFeatures.histograms;
        const segmentMotion = segmentFeatures.motion;
        const referenceHistograms = referenceFeatures.histograms;
        const referenceMotion = referenceFeatures.motion;
        
        // Calculate histogram similarity using Earth Mover's Distance
        const histogramSimilarity = calculateHistogramSimilarity(
            segmentHistograms, 
            referenceHistograms
        );
        
        // Calculate motion similarity
        const motionSimilarity = calculateMotionSimilarity(
            segmentMotion,
            referenceMotion
        );
        
        // Combine similarities with weighted average
        const overallSimilarity = (
            options.histogramWeight * histogramSimilarity +
            options.motionWeight * motionSimilarity
        ) / (options.histogramWeight + options.motionWeight);
        
        return {
            overallSimilarity,
            histogramSimilarity,
            motionSimilarity,
            isSimilar: overallSimilarity > options.similarityThreshold,
            processingTime: performance.now() - startTime
        };
    },
    
    /**
     * Process statistical data analysis
     * @param {Object} data - Task data
     * @returns {Object} - Analysis results
     */
    analyzeStatistics: (data) => {
        const { dataset, metrics, options } = data;
        const startTime = performance.now();
        
        // Results container
        const results = {};
        
        // Calculate requested metrics
        if (metrics.includes('basicStats')) {
            results.basicStats = calculateBasicStats(dataset);
        }
        
        if (metrics.includes('correlation')) {
            results.correlation = calculateCorrelation(dataset);
        }
        
        if (metrics.includes('clustering')) {
            results.clustering = performClustering(dataset, options.clusterOptions);
        }
        
        if (metrics.includes('timeSeries')) {
            results.timeSeries = analyzeTimeSeries(dataset, options.timeSeriesOptions);
        }
        
        return {
            results,
            processingTime: performance.now() - startTime
        };
    }
};

/**
 * Calculate histogram from frame data
 * @param {Uint8ClampedArray} frameData - Frame pixel data
 * @returns {Uint32Array} - Histogram data
 */
function calculateHistogram(frameData) {
    // Create histogram with 256 bins for each color channel
    const histogramR = new Uint32Array(256).fill(0);
    const histogramG = new Uint32Array(256).fill(0);
    const histogramB = new Uint32Array(256).fill(0);
    
    // Process pixels (each pixel is 4 bytes: R, G, B, A)
    for (let i = 0; i < frameData.length; i += 4) {
        histogramR[frameData[i]]++;
        histogramG[frameData[i + 1]]++;
        histogramB[frameData[i + 2]]++;
    }
    
    return { r: histogramR, g: histogramG, b: histogramB };
}

/**
 * Detect scene changes based on histogram difference
 * @param {Uint8ClampedArray} frameData - Current frame data
 * @param {Object} histogram - Current frame histogram
 * @returns {number} - Scene change score (0-1)
 */
function detectSceneChange(frameData, histogram) {
    // Implementation would compare with previous frame
    // For this example, we return a placeholder value
    return Math.random(); // Placeholder
}

/**
 * Detect motion in frame
 * @param {Uint8ClampedArray} frameData - Frame pixel data
 * @returns {number} - Motion score (0-1)
 */
function detectMotion(frameData) {
    // Implementation would calculate optical flow or frame difference
    // For this example, we return a placeholder value
    return Math.random(); // Placeholder
}

/**
 * Tokenize content for search indexing
 * @param {string} content - Document content
 * @param {Object} options - Tokenization options
 * @returns {Array} - Tokens with frequency and positions
 */
function tokenizeContent(content, options) {
    // Normalize and tokenize text
    const text = content.toLowerCase();
    const words = text.split(/\W+/).filter(word => word.length > 2);
    
    // Track term frequency and positions
    const termMap = new Map();
    
    words.forEach((word, position) => {
        // Apply stemming if enabled
        let term = word;
        if (options.useStemming) {
            term = stemWord(term);
        }
        
        // Skip stopwords if enabled
        if (options.removeStopwords && isStopword(term)) {
            return;
        }
        
        // Add to term map
        if (!termMap.has(term)) {
            termMap.set(term, {
                term,
                frequency: 0,
                positions: []
            });
        }
        
        const termData = termMap.get(term);
        termData.frequency++;
        termData.positions.push(position);
    });
    
    return Array.from(termMap.values());
}

/**
 * Apply stemming to a word (simple implementation)
 * @param {string} word - Word to stem
 * @returns {string} - Stemmed word
 */
function stemWord(word) {
    // Simple stemming: remove common suffixes
    // In production, use a proper stemming algorithm
    return word
        .replace(/ing$/, '')
        .replace(/ed$/, '')
        .replace(/s$/, '');
}

/**
 * Check if word is a stopword
 * @param {string} word - Word to check
 * @returns {boolean} - True if stopword
 */
function isStopword(word) {
    // Common English stopwords
    const stopwords = new Set([
        'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at',
        'to', 'for', 'with', 'by', 'about', 'as', 'into', 'like',
        'through', 'after', 'over', 'between', 'out', 'of', 'from',
        'up', 'down', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
        'shall', 'should', 'can', 'could', 'may', 'might', 'must',
        'this', 'that', 'these', 'those', 'it', 'its'
    ]);
    
    return stopwords.has(word);
}

/**
 * Implement dynamic time warping for transcript synchronization
 * @param {Array} words - Transcript words
 * @param {Array} audioFeatures - Audio features
 * @returns {Array} - Word timings
 */
function dynamicTimeWarping(words, audioFeatures) {
    // Simplified implementation
    // In production, implement full DTW algorithm
    
    const wordCount = words.length;
    const featureCount = audioFeatures.length;
    
    // Calculate average word duration
    const totalDuration = audioFeatures[featureCount - 1].time - audioFeatures[0].time;
    const avgWordDuration = totalDuration / wordCount;
    
    // Generate evenly spaced initial timings
    const timings = words.map((word, index) => {
        const startTime = audioFeatures[0].time + (index * avgWordDuration);
        const endTime = startTime + avgWordDuration;
        
        return {
            start: startTime,
            end: endTime,
            confidence: 0.5 // Initial placeholder confidence
        };
    });
    
    return timings;
}

/**
 * Enhance timing accuracy with confidence scores
 * @param {Array} wordTimings - Initial word timings
 * @param {Array} audioFeatures - Audio features
 * @param {Object} options - Enhancement options
 * @returns {Array} - Enhanced word timings
 */
function enhanceTimingAccuracy(wordTimings, audioFeatures, options) {
    // This would implement alignment refinement based on audio features
    // Just return the input timings with random confidence for this example
    return wordTimings.map(timing => ({
        ...timing,
        confidence: 0.5 + (Math.random() * 0.5) // Random confidence between 0.5-1.0
    }));
}

/**
 * Calculate histogram similarity
 * @param {Array} hist1 - First histogram
 * @param {Array} hist2 - Second histogram
 * @returns {number} - Similarity score (0-1)
 */
function calculateHistogramSimilarity(hist1, hist2) {
    // Implementation would calculate Earth Mover's Distance or similar
    // Just return random similarity for this example
    return 0.5 + (Math.random() * 0.5);
}

/**
 * Calculate motion similarity
 * @param {Array} motion1 - First motion data
 * @param {Array} motion2 - Second motion data
 * @returns {number} - Similarity score (0-1)
 */
function calculateMotionSimilarity(motion1, motion2) {
    // Implementation would calculate motion vector similarity
    // Just return random similarity for this example
    return 0.5 + (Math.random() * 0.5);
}

/**
 * Calculate basic statistics
 * @param {Array} dataset - Dataset to analyze
 * @returns {Object} - Statistical results
 */
function calculateBasicStats(dataset) {
    // Extract numeric data
    const numericData = dataset.map(d => d.value).filter(v => !isNaN(v));
    
    // Calculate mean
    const sum = numericData.reduce((acc, val) => acc + val, 0);
    const mean = sum / numericData.length;
    
    // Calculate variance
    const squaredDiffs = numericData.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / numericData.length;
    
    // Calculate standard deviation
    const stdDev = Math.sqrt(variance);
    
    // Calculate min, max, median
    const sorted = [...numericData].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    
    let median;
    if (sorted.length % 2 === 0) {
        // Even length - average of middle two
        const mid = sorted.length / 2;
        median = (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
        // Odd length - middle value
        median = sorted[Math.floor(sorted.length / 2)];
    }
    
    return {
        count: numericData.length,
        mean,
        median,
        min,
        max,
        stdDev,
        variance
    };
}

/**
 * Calculate correlation matrix
 * @param {Array} dataset - Dataset with multiple variables
 * @returns {Object} - Correlation matrix
 */
function calculateCorrelation(dataset) {
    // Extract variable names
    const variables = Object.keys(dataset[0]).filter(key => 
        typeof dataset[0][key] === 'number'
    );
    
    // Initialize correlation matrix
    const correlationMatrix = {};
    variables.forEach(var1 => {
        correlationMatrix[var1] = {};
        variables.forEach(var2 => {
            // Calculate Pearson correlation
            const values1 = dataset.map(d => d[var1]);
            const values2 = dataset.map(d => d[var2]);
            
            correlationMatrix[var1][var2] = pearsonCorrelation(values1, values2);
        });
    });
    
    return correlationMatrix;
}

/**
 * Calculate Pearson correlation coefficient
 * @param {Array} x - First variable values
 * @param {Array} y - Second variable values
 * @returns {number} - Correlation coefficient (-1 to 1)
 */
function pearsonCorrelation(x, y) {
    // Calculate means
    const xMean = x.reduce((acc, val) => acc + val, 0) / x.length;
    const yMean = y.reduce((acc, val) => acc + val, 0) / y.length;
    
    // Calculate numerator
    let numerator = 0;
    for (let i = 0; i < x.length; i++) {
        numerator += (x[i] - xMean) * (y[i] - yMean);
    }
    
    // Calculate denominators
    let xDenom = 0;
    let yDenom = 0;
    
    for (let i = 0; i < x.length; i++) {
        xDenom += Math.pow(x[i] - xMean, 2);
        yDenom += Math.pow(y[i] - yMean, 2);
    }
    
    // Calculate correlation coefficient
    const denominator = Math.sqrt(xDenom * yDenom);
    
    if (denominator === 0) return 0;
    
    return numerator / denominator;
}

/**
 * Perform k-means clustering
 * @param {Array} dataset - Dataset to cluster
 * @param {Object} options - Clustering options
 * @returns {Object} - Clustering results
 */
function performClustering(dataset, options) {
    // Simplified k-means implementation
    // Extract features for clustering
    const features = dataset.map(d => [d.x, d.y]);
    
    // Initialize centroids randomly
    const k = options.k || 3;
    let centroids = [];
    
    for (let i = 0; i < k; i++) {
        centroids.push([
            features[Math.floor(Math.random() * features.length)][0],
            features[Math.floor(Math.random() * features.length)][1]
        ]);
    }
    
    // Assign data points to clusters
    const maxIterations = options.maxIterations || 100;
    let iterations = 0;
    let assignments = [];
    let oldAssignments = [];
    
    do {
        oldAssignments = [...assignments];
        
        // Assign points to clusters
        assignments = features.map(feature => {
            const distances = centroids.map(centroid => 
                Math.sqrt(Math.pow(feature[0] - centroid[0], 2) + Math.pow(feature[1] - centroid[1], 2))
            );
            
            // Return index of nearest centroid
            return distances.indexOf(Math.min(...distances));
        });
        
        // Recalculate centroids
        centroids = centroids.map((centroid, k) => {
            const clusterPoints = features.filter((_, i) => assignments[i] === k);
            
            if (clusterPoints.length === 0) return centroid;
            
            // Calculate new centroid
            const sumX = clusterPoints.reduce((sum, point) => sum + point[0], 0);
            const sumY = clusterPoints.reduce((sum, point) => sum + point[1], 0);
            
            return [
                sumX / clusterPoints.length,
                sumY / clusterPoints.length
            ];
        });
        
        // Check if assignments changed
        const changed = !assignments.every((assignment, i) => assignment === oldAssignments[i]);
        
        iterations++;
        
        if (!changed || iterations >= maxIterations) break;
    } while (true);
    
    // Calculate cluster metrics
    const clusters = Array(k).fill().map(() => []);
    
    assignments.forEach((assignment, i) => {
        clusters[assignment].push(dataset[i]);
    });
    
    // Calculate within-cluster sum of squares
    const wcss = clusters.reduce((sum, cluster, k) => {
        const centroid = centroids[k];
        
        const clusterWcss = cluster.reduce((clusterSum, point) => {
            const distance = Math.pow(point.x - centroid[0], 2) + Math.pow(point.y - centroid[1], 2);
            return clusterSum + distance;
        }, 0);
        
        return sum + clusterWcss;
    }, 0);
    
    return {
        assignments,
        centroids,
        clusters,
        iterations,
        wcss
    };
}

/**
 * Analyze time series data
 * @param {Array} dataset - Time series data
 * @param {Object} options - Analysis options
 * @returns {Object} - Analysis results
 */
function analyzeTimeSeries(dataset, options) {
    // Sort by timestamp
    const sortedData = [...dataset].sort((a, b) => a.timestamp - b.timestamp);
    
    // Extract values
    const times = sortedData.map(d => d.timestamp);
    const values = sortedData.map(d => d.value);
    
    // Calculate moving average
    const windowSize = options.windowSize || 5;
    const movingAverage = [];
    
    for (let i = 0; i < values.length; i++) {
        if (i < windowSize - 1) {
            movingAverage.push(null);
        } else {
            let sum = 0;
            for (let j = 0; j < windowSize; j++) {
                sum += values[i - j];
            }
            movingAverage.push(sum / windowSize);
        }
    }
    
    // Detect outliers (simple z-score method)
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );
    
    const zScoreThreshold = options.zScoreThreshold || 3;
    const outliers = [];
    
    values.forEach((value, i) => {
        const zScore = Math.abs((value - mean) / stdDev);
        if (zScore > zScoreThreshold) {
            outliers.push({
                index: i,
                timestamp: times[i],
                value,
                zScore
            });
        }
    });
    
    // Detect trends (simple linear regression)
    const n = values.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += values[i];
        sumXY += i * values[i];
        sumXX += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate regression line
    const regression = times.map((_, i) => intercept + slope * i);
    
    return {
        movingAverage,
        outliers,
        trend: {
            slope,
            intercept
        },
        regression
    };
}

// Message handler
self.onmessage = function(event) {
    try {
        const { taskId, type, data } = event.data;
        
        // Check if task type exists
        if (!taskRegistry[type]) {
            throw new Error(`Unknown task type: ${type}`);
        }
        
        // Execute task
        const result = taskRegistry[type](data);
        
        // Return result
        self.postMessage({
            taskId,
            type: 'success',
            result
        });
    } catch (error) {
        // Return error
        self.postMessage({
            taskId: event.data.taskId,
            type: 'error',
            error: {
                message: error.message,
                stack: error.stack
            }
        });
    }
};