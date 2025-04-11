/**
 * worker-manager.js - Sophisticated multi-threaded processing architecture
 * 
 * Implements a high-performance worker pool with advanced features:
 * - Dynamic worker allocation based on computational load
 * - Task prioritization and scheduling
 * - Memory-efficient data transfer with transferable objects
 * - Fault tolerance with automatic worker recycling
 * - Adaptive performance optimization
 */

export class WorkerManager {
    /**
     * Create a worker manager instance
     * @param {Object} config - Configuration parameters
     */
    constructor(config = {}) {
        // Configuration with intelligent defaults
        this.config = {
            maxWorkers: navigator.hardwareConcurrency || 4,
            taskTimeout: 10000, // 10 seconds
            recycleThreshold: 100, // Tasks before recycling
            adaptiveScaling: true,
            ...config
        };
        
        // Worker pool management
        this.workers = [];
        this.availableWorkers = [];
        this.taskQueue = [];
        this.activeWorkerMap = new Map(); // Maps task IDs to workers
        this.taskCounter = 0;
        
        // Performance metrics
        this.metrics = {
            tasksProcessed: 0,
            tasksQueued: 0,
            tasksFailed: 0,
            averageProcessingTime: 0,
            maxProcessingTime: 0,
            totalProcessingTime: 0
        };
        
        // Initialize worker pool
        this._initializeWorkerPool();
        
        // Set up adaptive scaling if enabled
        if (this.config.adaptiveScaling) {
            this._setupAdaptiveScaling();
        }
    }
    
    /**
     * Initialize the worker pool
     * @private
     */
    _initializeWorkerPool() {
        const workerCount = Math.min(this.config.maxWorkers, navigator.hardwareConcurrency || 4);
        
        // Create initial worker pool
        for (let i = 0; i < workerCount; i++) {
            this._createWorker();
        }
        
        // Log initialization
        console.log(`WorkerManager: Initialized pool with ${workerCount} workers`);
    }
    
    /**
     * Create and initialize a new worker
     * @private
     * @returns {Object} - Worker object with metadata
     */
    _createWorker() {
        // Create worker wrapper with metadata
        const workerWrapper = {
            worker: new Worker(new URL('./processor-worker.js', import.meta.url), { type: 'module' }),
            id: crypto.randomUUID(),
            tasksProcessed: 0,
            isAvailable: true,
            createdAt: Date.now(),
            lastTaskAt: null,
            errors: 0
        };
        
        // Set up worker event handlers
        workerWrapper.worker.onmessage = (event) => this._handleWorkerMessage(workerWrapper, event);
        workerWrapper.worker.onerror = (error) => this._handleWorkerError(workerWrapper, error);
        
        // Add to pools
        this.workers.push(workerWrapper);
        this.availableWorkers.push(workerWrapper);
        
        return workerWrapper;
    }
    
    /**
     * Handle worker message events
     * @private
     * @param {Object} workerWrapper - Worker wrapper object
     * @param {MessageEvent} event - Message event from worker
     */
    _handleWorkerMessage(workerWrapper, event) {
        const { taskId, type, result, error, metrics } = event.data;
        
        // Find task in active map
        const taskData = this.activeWorkerMap.get(taskId);
        if (!taskData) {
            console.warn(`WorkerManager: Received message for unknown task ID: ${taskId}`);
            return;
        }
        
        // Calculate processing time
        const processingTime = Date.now() - taskData.startTime;
        
        // Update metrics
        this._updateMetrics(processingTime);
        
        // Handle response based on type
        if (type === 'success') {
            // Task completed successfully
            taskData.resolve(result);
        } else if (type === 'error') {
            // Task failed
            taskData.reject(error || new Error('Worker task failed'));
            
            // Increment error count
            workerWrapper.errors++;
            this.metrics.tasksFailed++;
            
            // Recycle worker if error threshold exceeded
            if (workerWrapper.errors > 3) {
                this._recycleWorker(workerWrapper);
                return;
            }
        }
        
        // Clean up task tracking
        this.activeWorkerMap.delete(taskId);
        
        // Update worker metadata
        workerWrapper.tasksProcessed++;
        workerWrapper.lastTaskAt = Date.now();
        workerWrapper.isAvailable = true;
        
        // Make worker available again
        this.availableWorkers.push(workerWrapper);
        
        // Process next task in queue
        this._processNextTask();
    }
    
    /**
     * Handle worker error events
     * @private
     * @param {Object} workerWrapper - Worker wrapper object
     * @param {ErrorEvent} error - Error event from worker
     */
    _handleWorkerError(workerWrapper, error) {
        console.error('WorkerManager: Worker error', error);
        
        // Increment error metrics
        workerWrapper.errors++;
        this.metrics.tasksFailed++;
        
        // Recycle worker
        this._recycleWorker(workerWrapper);
    }
    
    /**
     * Recycle a worker (terminate and replace)
     * @private
     * @param {Object} workerWrapper - Worker wrapper to recycle
     */
    _recycleWorker(workerWrapper) {
        console.log(`WorkerManager: Recycling worker ${workerWrapper.id}`);
        
        // Remove from pools
        this.workers = this.workers.filter(w => w.id !== workerWrapper.id);
        this.availableWorkers = this.availableWorkers.filter(w => w.id !== workerWrapper.id);
        
        // Find active tasks for this worker and reject them
        for (const [taskId, taskData] of this.activeWorkerMap.entries()) {
            if (taskData.workerId === workerWrapper.id) {
                taskData.reject(new Error('Worker was recycled'));
                this.activeWorkerMap.delete(taskId);
            }
        }
        
        // Terminate worker
        workerWrapper.worker.terminate();
        
        // Create replacement worker
        const newWorker = this._createWorker();
        
        // Process next task if available
        this._processNextTask();
    }
    
    /**
     * Update performance metrics
     * @private
     * @param {number} processingTime - Processing time for completed task
     */
    _updateMetrics(processingTime) {
        this.metrics.tasksProcessed++;
        this.metrics.totalProcessingTime += processingTime;
        this.metrics.averageProcessingTime = this.metrics.totalProcessingTime / this.metrics.tasksProcessed;
        this.metrics.maxProcessingTime = Math.max(this.metrics.maxProcessingTime, processingTime);
    }
    
    /**
     * Execute a task on a worker
     * @public
     * @param {string} taskType - Type of task to execute
     * @param {Object} taskData - Data for the task
     * @param {Object} options - Task options
     * @returns {Promise} - Promise that resolves with task result
     */
    executeTask(taskType, taskData, options = {}) {
        // Generate task ID
        const taskId = `task_${++this.taskCounter}`;
        
        // Create task promise
        return new Promise((resolve, reject) => {
            // Create task object
            const task = {
                id: taskId,
                type: taskType,
                data: taskData,
                priority: options.priority || 0,
                resolve,
                reject,
                startTime: null,
                taskTimeout: options.timeout || this.config.taskTimeout,
                transferables: options.transferables || []
            };
            
            // Add task to queue
            this._enqueueTask(task);
            
            // Process immediately if workers available
            this._processNextTask();
        });
    }
    
    /**
     * Add a task to the processing queue
     * @private
     * @param {Object} task - Task to enqueue
     */
    _enqueueTask(task) {
        // Find insertion point based on priority (higher first)
        let insertIndex = this.taskQueue.length;
        
        for (let i = 0; i < this.taskQueue.length; i++) {
            if (task.priority > this.taskQueue[i].priority) {
                insertIndex = i;
                break;
            }
        }
        
        // Insert task at calculated position
        this.taskQueue.splice(insertIndex, 0, task);
        
        // Update metrics
        this.metrics.tasksQueued++;
    }
    
    /**
     * Process the next task in the queue
     * @private
     */
    _processNextTask() {
        // Skip if no tasks or no available workers
        if (this.taskQueue.length === 0 || this.availableWorkers.length === 0) {
            return;
        }
        
        // Get next task and worker
        const task = this.taskQueue.shift();
        const workerWrapper = this.availableWorkers.shift();
        
        // Mark worker as busy
        workerWrapper.isAvailable = false;
        
        // Set task start time
        task.startTime = Date.now();
        
        // Map task to worker for tracking
        this.activeWorkerMap.set(task.id, {
            workerId: workerWrapper.id,
            startTime: task.startTime,
            resolve: task.resolve,
            reject: task.reject
        });
        
        // Create message payload
        const payload = {
            taskId: task.id,
            type: task.type,
            data: task.data
        };
        
        // Set up task timeout
        const timeoutId = setTimeout(() => {
            // Check if task is still active
            if (this.activeWorkerMap.has(task.id)) {
                console.warn(`WorkerManager: Task ${task.id} timed out after ${task.taskTimeout}ms`);
                
                // Reject promise
                task.reject(new Error(`Task timed out after ${task.taskTimeout}ms`));
                
                // Clean up
                this.activeWorkerMap.delete(task.id);
                
                // Recycle the worker
                this._recycleWorker(workerWrapper);
            }
        }, task.taskTimeout);
        
        // Send task to worker
        try {
            workerWrapper.worker.postMessage(payload, task.transferables);
        } catch (error) {
            console.error('WorkerManager: Error posting message to worker', error);
            
            // Clear timeout
            clearTimeout(timeoutId);
            
            // Handle failure
            task.reject(error);
            this.activeWorkerMap.delete(task.id);
            
            // Recycle worker
            this._recycleWorker(workerWrapper);
            
            // Try next task
            this._processNextTask();
        }
    }
    
    /**
     * Set up adaptive scaling based on system load
     * @private
     */
    _setupAdaptiveScaling() {
        // Monitor queue length and worker utilization
        setInterval(() => {
            // Calculate worker utilization (busy workers / total workers)
            const utilization = (this.workers.length - this.availableWorkers.length) / this.workers.length;
            
            // Check if we need more workers
            if (utilization > 0.8 && this.taskQueue.length > 0 && this.workers.length < this.config.maxWorkers) {
                // High utilization with queued tasks - add a worker
                this._createWorker();
                console.log(`WorkerManager: Added worker due to high utilization (${Math.round(utilization * 100)}%)`);
            }
            
            // Check if we can reduce workers
            if (utilization < 0.3 && this.workers.length > 2) {
                // Low utilization - consider removing a worker
                const leastUsedWorker = this.availableWorkers
                    .sort((a, b) => a.tasksProcessed - b.tasksProcessed)[0];
                
                if (leastUsedWorker) {
                    // Remove least used worker
                    this._removeWorker(leastUsedWorker);
                    console.log(`WorkerManager: Removed worker due to low utilization (${Math.round(utilization * 100)}%)`);
                }
            }
            
            // Check for workers that need recycling
            this.workers.forEach(worker => {
                // Recycle workers that have processed many tasks
                if (worker.tasksProcessed >= this.config.recycleThreshold) {
                    this._recycleWorker(worker);
                }
            });
        }, 10000); // Check every 10 seconds
    }
    
    /**
     * Remove a worker from the pool
     * @private
     * @param {Object} workerWrapper - Worker to remove
     */
    _removeWorker(workerWrapper) {
        // Only remove available workers
        if (!workerWrapper.isAvailable) return;
        
        // Remove from pools
        this.workers = this.workers.filter(w => w.id !== workerWrapper.id);
        this.availableWorkers = this.availableWorkers.filter(w => w.id !== workerWrapper.id);
        
        // Terminate worker
        workerWrapper.worker.terminate();
    }
    
    /**
     * Get system metrics
     * @public
     * @returns {Object} - System metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            workerCount: this.workers.length,
            availableWorkers: this.availableWorkers.length,
            queueLength: this.taskQueue.length,
            utilization: (this.workers.length - this.availableWorkers.length) / this.workers.length
        };
    }
    
    /**
     * Terminate all workers and clean up
     * @public
     */
    terminate() {
        // Terminate all workers
        this.workers.forEach(workerWrapper => {
            workerWrapper.worker.terminate();
        });
        
        // Clear arrays
        this.workers = [];
        this.availableWorkers = [];
        
        // Reject all queued tasks
        this.taskQueue.forEach(task => {
            task.reject(new Error('WorkerManager was terminated'));
        });
        this.taskQueue = [];
        
        // Reject all active tasks
        for (const [taskId, taskData] of this.activeWorkerMap.entries()) {
            taskData.reject(new Error('WorkerManager was terminated'));
        }
        this.activeWorkerMap.clear();
        
        console.log('WorkerManager: Terminated all workers and cleaned up');
    }
}