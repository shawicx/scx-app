/**
 * Audio Processing Job model
 * Represents an audio processing task (recording, trimming, conversion, merging)
 */
export class AudioProcessingJob {
  /**
   * Creates a new AudioProcessingJob instance
   * @param {string} jobId - Unique identifier for the job
   * @param {string} taskType - Type of task (e.g., "record-to-text", "trim", "convert", "merge", "volume-adjust")
   * @param {Array<string>} inputFiles - Paths to input audio files
   * @param {string} outputPath - Path to the output file
   */
  constructor(jobId = '', taskType = '', inputFiles = [], outputPath = '') {
    this.jobId = jobId;
    this.taskType = taskType;
    this.status = 'queued'; // Default status
    this.inputFiles = inputFiles;
    this.outputPath = outputPath;
    this.progress = 0; // Default progress
    this.error = null; // Default no error
    this.options = {}; // Task-specific options
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Updates the job status
   * @param {string} newStatus - New status (queued, processing, completed, failed)
   */
  updateStatus(newStatus) {
    const validStatuses = ['queued', 'processing', 'completed', 'failed'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    this.status = newStatus;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Updates the job progress
   * @param {number} newProgress - New progress percentage (0-100)
   */
  updateProgress(newProgress) {
    if (typeof newProgress !== 'number' || newProgress < 0 || newProgress > 100) {
      throw new Error('Progress must be a number between 0 and 100');
    }
    
    this.progress = newProgress;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Sets an error for the job
   * @param {string|null} error - Error message or null if no error
   */
  setError(error) {
    this.error = error;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Sets task-specific options
   * @param {Object} options - Task-specific options (e.g., trim start/end times, conversion format)
   */
  setOptions(options) {
    this.options = { ...this.options, ...options };
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Checks if the job is complete
   * @returns {boolean} True if the job is completed or failed
   */
  isComplete() {
    return this.status === 'completed' || this.status === 'failed';
  }

  /**
   * Validates the job data
   * @returns {Object} Validation result with status and errors
   */
  validate() {
    const errors = [];
    
    if (!this.jobId || typeof this.jobId !== 'string') {
      errors.push('jobId is required and must be a string');
    }
    
    if (!this.taskType || typeof this.taskType !== 'string') {
      errors.push('taskType is required and must be a string');
    }
    
    const validTaskTypes = ['record-to-text', 'trim', 'convert', 'merge', 'volume-adjust'];
    if (!validTaskTypes.includes(this.taskType)) {
      errors.push(`taskType must be one of: ${validTaskTypes.join(', ')}`);
    }
    
    if (!Array.isArray(this.inputFiles)) {
      errors.push('inputFiles must be an array');
    } else if (this.inputFiles.length === 0) {
      errors.push('inputFiles must contain at least one file path');
    } else {
      for (const [index, filePath] of this.inputFiles.entries()) {
        if (typeof filePath !== 'string' || !filePath) {
          errors.push(`inputFiles[${index}] must be a non-empty string`);
        }
      }
    }
    
    if (!this.outputPath || typeof this.outputPath !== 'string') {
      errors.push('outputPath is required and must be a string');
    }
    
    if (typeof this.progress !== 'number' || this.progress < 0 || this.progress > 100) {
      errors.push('progress must be a number between 0 and 100');
    }
    
    if (this.error !== null && typeof this.error !== 'string') {
      errors.push('error must be a string or null');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Converts the model to a plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      jobId: this.jobId,
      taskType: this.taskType,
      status: this.status,
      inputFiles: this.inputFiles,
      outputPath: this.outputPath,
      progress: this.progress,
      error: this.error,
      options: this.options,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Creates an AudioProcessingJob instance from a plain object
   * @param {Object} obj - Plain object representation
   * @returns {AudioProcessingJob} Instance of AudioProcessingJob
   */
  static fromJSON(obj) {
    const job = new AudioProcessingJob(
      obj.jobId, 
      obj.taskType, 
      obj.inputFiles || [], 
      obj.outputPath
    );
    
    if (obj.status) job.status = obj.status;
    if (obj.progress !== undefined) job.progress = obj.progress;
    if (obj.error !== undefined) job.error = obj.error;
    if (obj.options) job.options = obj.options;
    if (obj.createdAt) job.createdAt = obj.createdAt;
    if (obj.updatedAt) job.updatedAt = obj.updatedAt;
    
    return job;
  }
}