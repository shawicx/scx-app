/**
 * File Processing Service
 * Handles file processing tasks such as PDF/image conversion and markdown/PDF conversion
 */
import { FileProcessingJob } from '../models/file-job.js';
import { invoke } from '@tauri-apps/api/core';

export class FileProcessingService {
  constructor() {
    this.activeJobs = new Map();
    this.completedJobs = new Map();
    this.failedJobs = new Map();
  }

  /**
   * Process PDF to image conversion
   * @param {string} inputPath - Path to the input PDF file
   * @param {string} outputDir - Directory to output the images
   * @param {Object} options - Conversion options
   * @returns {Promise<FileProcessingJob>} The processing job
   */
  async processPdfToImage(inputPath, outputDir, options = {}) {
    // Validate inputs
    if (!inputPath || !outputDir) {
      throw new Error('Input path and output directory are required');
    }

    try {
      // Call the Tauri backend to process the PDF
      const response = await invoke('process_pdf_to_image', {
        request: {
          inputPath: inputPath,
          outputDir: outputDir,
          options: options
        }
      });

      // Create a job from the response
      const job = new FileProcessingJob(
        response.jobId,
        'pdf-to-image',
        inputPath,
        outputDir
      );
      
      job.updateStatus(response.status);
      job.updateProgress(response.progress);
      
      if (response.error) {
        job.setError(response.error);
      }
      
      // Store the job
      if (response.status === 'completed') {
        this.completedJobs.set(response.jobId, job);
      } else if (response.status === 'failed') {
        this.failedJobs.set(response.jobId, job);
      } else {
        this.activeJobs.set(response.jobId, job);
      }
      
      return job;
    } catch (error) {
      // Handle errors from the Tauri backend
      throw new Error(`Failed to process PDF to image: ${error.message}`);
    }
  }

  /**
   * Process markdown to PDF conversion
   * @param {string} markdownContent - The markdown content to convert
   * @param {string} outputPath - Path to output the PDF
   * @param {Object} options - Conversion options
   * @returns {Promise<FileProcessingJob>} The processing job
   */
  async processMarkdownToPdf(markdownContent, outputPath, options = {}) {
    // Validate inputs
    if (!markdownContent || !outputPath) {
      throw new Error('Markdown content and output path are required');
    }

    try {
      // Call the Tauri backend to process the markdown
      const response = await invoke('process_markdown_to_pdf', {
        request: {
          markdownContent: markdownContent,
          outputPath: outputPath,
          options: options
        }
      });

      // Create a job from the response
      const job = new FileProcessingJob(
        response.jobId,
        'markdown-to-pdf',
        'markdown-content',
        outputPath
      );
      
      job.updateStatus(response.status);
      job.updateProgress(response.progress);
      
      if (response.error) {
        job.setError(response.error);
      }
      
      // Store the job
      if (response.status === 'completed') {
        this.completedJobs.set(response.jobId, job);
      } else if (response.status === 'failed') {
        this.failedJobs.set(response.jobId, job);
      } else {
        this.activeJobs.set(response.jobId, job);
      }
      
      return job;
    } catch (error) {
      // Handle errors from the Tauri backend
      throw new Error(`Failed to process markdown to PDF: ${error.message}`);
    }
  }

  /**
   * Get the status of a file processing job
   * @param {string} jobId - The ID of the job
   * @returns {Promise<FileProcessingJob|null>} The job or null if not found
   */
  async getJobStatus(jobId) {
    // First check local cache
    if (this.activeJobs.has(jobId)) {
      return this.activeJobs.get(jobId);
    }
    
    if (this.completedJobs.has(jobId)) {
      return this.completedJobs.get(jobId);
    }
    
    if (this.failedJobs.has(jobId)) {
      return this.failedJobs.get(jobId);
    }
    
    // If not found locally, try to get from Tauri backend
    try {
      const response = await invoke('get_file_job_status', {
        request: {
          jobId: jobId
        }
      });

      // Create a job from the response
      const job = new FileProcessingJob(
        response.jobId,
        response.taskType,
        'input-path-placeholder', // We don't have the actual input path
        response.outputPath || 'output-path-placeholder'
      );
      
      job.updateStatus(response.status);
      job.updateProgress(response.progress);
      
      if (response.error) {
        job.setError(response.error);
      }
      
      // Cache the job locally
      if (response.status === 'completed') {
        this.completedJobs.set(response.jobId, job);
      } else if (response.status === 'failed') {
        this.failedJobs.set(response.jobId, job);
      } else {
        this.activeJobs.set(response.jobId, job);
      }
      
      return job;
    } catch (error) {
      // If we can't get the job status from the backend, return null
      return null;
    }
  }

  /**
   * Get all active jobs
   * @returns {Array<FileProcessingJob>} Array of active jobs
   */
  getActiveJobs() {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Get all completed jobs
   * @returns {Array<FileProcessingJob>} Array of completed jobs
   */
  getCompletedJobs() {
    return Array.from(this.completedJobs.values());
  }

  /**
   * Get all failed jobs
   * @returns {Array<FileProcessingJob>} Array of failed jobs
   */
  getFailedJobs() {
    return Array.from(this.failedJobs.values());
  }

  /**
   * Cancel a processing job
   * @param {string} jobId - The ID of the job to cancel
   * @returns {boolean} True if job was found and cancelled
   */
  cancelJob(jobId) {
    if (this.activeJobs.has(jobId)) {
      const job = this.activeJobs.get(jobId);
      job.updateStatus('failed');
      job.setError('Job cancelled by user');
      
      this.activeJobs.delete(jobId);
      this.failedJobs.set(jobId, job);
      return true;
    }
    
    return false;
  }

  /**
   * Generate a unique job ID
   * @returns {string} A unique job ID
   */
  generateJobId() {
    return `file-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Simulate processing time (for demonstration purposes)
   * @param {number} ms - Number of milliseconds to wait
   * @returns {Promise<void>} A promise that resolves after the specified time
   */
  simulateProcessing(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup completed and failed jobs older than specified minutes
   * @param {number} minutes - Number of minutes after which to cleanup jobs
   */
  cleanupOldJobs(minutes = 60) {
    const cutoffTime = Date.now() - (minutes * 60 * 1000);
    
    // Cleanup completed jobs
    for (const [jobId, job] of this.completedJobs.entries()) {
      const jobTime = new Date(job.updatedAt).getTime();
      if (jobTime < cutoffTime) {
        this.completedJobs.delete(jobId);
      }
    }
    
    // Cleanup failed jobs
    for (const [jobId, job] of this.failedJobs.entries()) {
      const jobTime = new Date(job.updatedAt).getTime();
      if (jobTime < cutoffTime) {
        this.failedJobs.delete(jobId);
      }
    }
  }
}