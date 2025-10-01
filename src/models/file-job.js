/**
 * File Processing Job model
 * Represents a file processing task (PDF/image conversion, markdown/PDF conversion)
 */
export class FileProcessingJob {
  /**
   * Creates a new FileProcessingJob instance
   * @param {string} jobId - Unique identifier for the job
   * @param {string} taskType - Type of task (e.g., "pdf-to-image", "markdown-to-pdf")
   * @param {string} inputPath - Path to the input file
   * @param {string} outputPath - Path to the output file/directory
   */
  constructor(jobId = '', taskType = '', inputPath = '', outputPath = '') {
    this.jobId = jobId;
    this.taskType = taskType;
    this.status = 'queued'; // Default status
    this.inputPath = inputPath;
    this.outputPath = outputPath;
    this.progress = 0; // Default progress
    this.error = null; // Default no error
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
    
    const validTaskTypes = ['pdf-to-image', 'markdown-to-pdf'];
    if (!validTaskTypes.includes(this.taskType)) {
      errors.push(`taskType must be one of: ${validTaskTypes.join(', ')}`);
    }
    
    if (!this.inputPath || typeof this.inputPath !== 'string') {
      errors.push('inputPath is required and must be a string');
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
      inputPath: this.inputPath,
      outputPath: this.outputPath,
      progress: this.progress,
      error: this.error,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Creates a FileProcessingJob instance from a plain object
   * @param {Object} obj - Plain object representation
   * @returns {FileProcessingJob} Instance of FileProcessingJob
   */
  static fromJSON(obj) {
    const job = new FileProcessingJob(obj.jobId, obj.taskType, obj.inputPath, obj.outputPath);
    
    if (obj.status) job.status = obj.status;
    if (obj.progress !== undefined) job.progress = obj.progress;
    if (obj.error !== undefined) job.error = obj.error;
    if (obj.createdAt) job.createdAt = obj.createdAt;
    if (obj.updatedAt) job.updatedAt = obj.updatedAt;
    
    return job;
  }
}