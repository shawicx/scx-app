/**
 * Audio Processing Service
 * Handles audio recording, conversion, trimming, merging, and metadata extraction
 */
import { AudioProcessingJob } from '../models/audio-job.js';
import { AudioFile } from '../models/audio-file.js';
import { invoke } from '@tauri-apps/api/core';

export class AudioProcessingService {
  constructor() {
    this.activeJobs = new Map();
    this.completedJobs = new Map();
    this.failedJobs = new Map();
    this.audioFiles = new Map();
  }

  /**
   * Convert recorded audio to text
   * @param {string} audioFilePath - Path to the audio file
   * @param {Object} options - Speech recognition options
   * @returns {Promise<AudioProcessingJob>} The processing job
   */
  async recordToText(audioFilePath, options = {}) {
    if (!audioFilePath || typeof audioFilePath !== 'string') {
      throw new Error('Audio file path is required and must be a string');
    }

    try {
      // Call the Tauri backend to process audio to text
      const response = await invoke('process_audio', {
        request: {
          inputPath: audioFilePath,
          outputPath: '',
          taskType: 'record-to-text',
          options: options
        }
      });

      // Create a job from the response
      const job = new AudioProcessingJob(
        response.jobId,
        'record-to-text',
        [audioFilePath],
        response.outputPath || ''
      );
      
      job.updateStatus(response.status);
      job.updateProgress(response.progress);
      
      if (response.error) {
        job.setError(response.error);
      }
      
      // If completed, add transcript
      if (response.status === 'completed') {
        job.transcript = 'Transcribed text from audio'; // In a real implementation, this would come from the response
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
      throw new Error(`Failed to convert audio to text: ${error.message}`);
    }
  }

  /**
   * Trim audio file by selecting segments
   * @param {string} inputPath - Path to the input audio file
   * @param {string} outputPath - Path to output the trimmed audio
   * @param {Array<Object>} segments - Array of segment objects with startTime and endTime
   * @param {Object} options - Trimming options
   * @returns {Promise<AudioProcessingJob>} The processing job
   */
  async trimAudio(inputPath, outputPath, segments, options = {}) {
    // Validate inputs
    if (!inputPath || typeof inputPath !== 'string') {
      throw new Error('Input path is required and must be a string');
    }
    
    if (!outputPath || typeof outputPath !== 'string') {
      throw new Error('Output path is required and must be a string');
    }
    
    if (!Array.isArray(segments) || segments.length === 0) {
      throw new Error('Segments must be a non-empty array');
    }
    
    for (const [index, segment] of segments.entries()) {
      if (!segment || typeof segment !== 'object') {
        throw new Error(`Segment at index ${index} must be an object`);
      }
      
      if (typeof segment.startTime !== 'number' || segment.startTime < 0) {
        throw new Error(`Segment at index ${index} must have a non-negative startTime`);
      }
      
      if (typeof segment.endTime !== 'number' || segment.endTime < 0) {
        throw new Error(`Segment at index ${index} must have a non-negative endTime`);
      }
      
      if (segment.startTime >= segment.endTime) {
        throw new Error(`Segment at index ${index} startTime must be less than endTime`);
      }
    }

    try {
      // Call the Tauri backend to trim audio
      const response = await invoke('trim_audio', {
        request: {
          inputPath: inputPath,
          outputPath: outputPath,
          segments: segments,
          options: options
        }
      });

      // Create a job from the response
      const job = new AudioProcessingJob(
        response.jobId,
        'trim',
        [inputPath],
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
      throw new Error(`Failed to trim audio: ${error.message}`);
    }
  }

  /**
   * Convert audio between different formats
   * @param {string} inputPath - Path to the input audio file
   * @param {string} outputPath - Path to output the converted audio
   * @param {string} targetFormat - Target format (mp3 | wav | flac | ogg)
   * @param {Object} options - Conversion options
   * @returns {Promise<AudioProcessingJob>} The processing job
   */
  async convertAudio(inputPath, outputPath, targetFormat, options = {}) {
    // Validate inputs
    if (!inputPath || typeof inputPath !== 'string') {
      throw new Error('Input path is required and must be a string');
    }
    
    if (!outputPath || typeof outputPath !== 'string') {
      throw new Error('Output path is required and must be a string');
    }
    
    if (!targetFormat || typeof targetFormat !== 'string') {
      throw new Error('Target format is required and must be a string');
    }
    
    const validFormats = ['mp3', 'wav', 'flac', 'ogg'];
    if (!validFormats.includes(targetFormat.toLowerCase())) {
      throw new Error(`Target format must be one of: ${validFormats.join(', ')}`);
    }

    try {
      // Call the Tauri backend to convert audio
      const response = await invoke('convert_audio', {
        request: {
          inputPath: inputPath,
          outputPath: outputPath,
          targetFormat: targetFormat.toLowerCase(),
          options: options
        }
      });

      // Create a job from the response
      const job = new AudioProcessingJob(
        response.jobId,
        'convert',
        [inputPath],
        outputPath
      );
      
      job.updateStatus(response.status);
      job.updateProgress(response.progress);
      
      if (response.error) {
        job.setError(response.error);
      }
      
      // If completed, add metadata
      if (response.status === 'completed' && response.metadata) {
        job.metadata = response.metadata;
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
      throw new Error(`Failed to convert audio: ${error.message}`);
    }
  }

  /**
   * Merge multiple audio files in sequence
   * @param {Array<string>} inputPaths - Array of input audio file paths
   * @param {string} outputPath - Path to output the merged audio
   * @param {Object} options - Merging options
   * @returns {Promise<AudioProcessingJob>} The processing job
   */
  async mergeAudioFiles(inputPaths, outputPath, options = {}) {
    // Validate inputs
    if (!Array.isArray(inputPaths) || inputPaths.length === 0) {
      throw new Error('Input paths must be a non-empty array');
    }
    
    if (!inputPaths.every(path => typeof path === 'string' && path.length > 0)) {
      throw new Error('All input paths must be non-empty strings');
    }
    
    if (!outputPath || typeof outputPath !== 'string') {
      throw new Error('Output path is required and must be a string');
    }

    try {
      // Call the Tauri backend to merge audio files
      const response = await invoke('merge_audio', {
        request: {
          inputPaths: inputPaths,
          outputPath: outputPath,
          options: options
        }
      });

      // Create a job from the response
      const job = new AudioProcessingJob(
        response.jobId,
        'merge',
        inputPaths,
        outputPath
      );
      
      job.updateStatus(response.status);
      job.updateProgress(response.progress);
      
      if (response.error) {
        job.setError(response.error);
      }
      
      // If completed, add merged count
      if (response.status === 'completed') {
        job.mergedCount = inputPaths.length;
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
      throw new Error(`Failed to merge audio files: ${error.message}`);
    }
  }

  /**
   * Adjust audio volume with fade-in/fade-out effects
   * @param {string} inputPath - Path to the input audio file
   * @param {string} outputPath - Path to output the adjusted audio
   * @param {Object} options - Volume adjustment options
   * @returns {Promise<AudioProcessingJob>} The processing job
   */
  async adjustVolume(inputPath, outputPath, options = {}) {
    // Validate inputs
    if (!inputPath || typeof inputPath !== 'string') {
      throw new Error('Input path is required and must be a string');
    }
    
    if (!outputPath || typeof outputPath !== 'string') {
      throw new Error('Output path is required and must be a string');
    }
    
    if (options.gain !== undefined && (typeof options.gain !== 'number' || options.gain < 0)) {
      throw new Error('Gain must be a non-negative number');
    }
    
    if (options.fadeInDuration !== undefined && (typeof options.fadeInDuration !== 'number' || options.fadeInDuration < 0)) {
      throw new Error('Fade-in duration must be a non-negative number');
    }
    
    if (options.fadeOutDuration !== undefined && (typeof options.fadeOutDuration !== 'number' || options.fadeOutDuration < 0)) {
      throw new Error('Fade-out duration must be a non-negative number');
    }

    try {
      // Call the Tauri backend to adjust volume
      const response = await invoke('adjust_volume', {
        request: {
          inputPath: inputPath,
          outputPath: outputPath,
          options: options
        }
      });

      // Create a job from the response
      const job = new AudioProcessingJob(
        response.jobId,
        'volume-adjust',
        [inputPath],
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
      throw new Error(`Failed to adjust volume: ${error.message}`);
    }
  }

  /**
   * Extract metadata from audio file
   * @param {string} inputPath - Path to the input audio file
   * @returns {Promise<AudioFile>} Audio file with metadata
   */
  async extractMetadata(inputPath) {
    // Validate input
    if (!inputPath || typeof inputPath !== 'string') {
      throw new Error('Input path is required and must be a string');
    }

    try {
      // Call the Tauri backend to extract metadata
      const response = await invoke('extract_audio_metadata', {
        request: {
          inputPath: inputPath
        }
      });

      // Create audio file with metadata from the response
      const audioFile = new AudioFile(
        response.fileId,
        inputPath.split('/').pop() || 'audio-file',
        inputPath,
        response.format
      );
      
      // Set metadata from the response
      audioFile.setMetadata({
        sampleRate: response.sampleRate,
        bitRate: response.bitRate,
        duration: response.duration,
        channels: response.channels,
        size: response.size
      });
      
      // Store additional metadata if available
      if (response.additionalMetadata) {
        audioFile.additionalInfo = response.additionalMetadata;
      }
      
      // Store the audio file
      this.audioFiles.set(response.fileId, audioFile);
      
      return audioFile;
    } catch (error) {
      throw new Error(`Failed to extract metadata: ${error.message}`);
    }
  }

  /**
   * Generate waveform data for visualization
   * @param {string} inputPath - Path to the input audio file
   * @param {Object} options - Waveform generation options
   * @returns {Promise<Object>} Waveform data with duration and sample rate
   */
  async generateWaveformData(inputPath, options = {}) {
    // Validate input
    if (!inputPath || typeof inputPath !== 'string') {
      throw new Error('Input path is required and must be a string');
    }

    try {
      // Call the Tauri backend to generate waveform data
      const response = await invoke('generate_waveform', {
        request: {
          inputPath: inputPath,
          options: options
        }
      });

      return {
        waveform: response.waveform,
        duration: response.duration,
        sampleRate: response.sampleRate
      };
    } catch (error) {
      throw new Error(`Failed to generate waveform data: ${error.message}`);
    }
  }

  /**
   * Get the status of an audio processing job
   * @param {string} jobId - The ID of the job
   * @returns {Promise<AudioProcessingJob|null>} The job or null if not found
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
      const response = await invoke('get_audio_job_status', {
        request: {
          jobId: jobId
        }
      });

      // Create a job from the response
      const job = new AudioProcessingJob(
        response.jobId,
        response.taskType,
        ['input-path-placeholder'], // We don't have the actual input path
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
   * @returns {Array<AudioProcessingJob>} Array of active jobs
   */
  getActiveJobs() {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Get all completed jobs
   * @returns {Array<AudioProcessingJob>} Array of completed jobs
   */
  getCompletedJobs() {
    return Array.from(this.completedJobs.values());
  }

  /**
   * Get all failed jobs
   * @returns {Array<AudioProcessingJob>} Array of failed jobs
   */
  getFailedJobs() {
    return Array.from(this.failedJobs.values());
  }

  /**
   * Cancel an audio processing job
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
   * Get an audio file by ID
   * @param {string} fileId - The ID of the audio file
   * @returns {AudioFile|null} The audio file or null if not found
   */
  getAudioFile(fileId) {
    return this.audioFiles.get(fileId) || null;
  }

  /**
   * Get all audio files
   * @returns {Array<AudioFile>} Array of audio files
   */
  getAllAudioFiles() {
    return Array.from(this.audioFiles.values());
  }

  /**
   * Generate a unique job ID
   * @returns {string} A unique job ID
   */
  generateJobId() {
    return `audio-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
    
    // Cleanup old audio files
    for (const [fileId, audioFile] of this.audioFiles.entries()) {
      const lastAccessed = new Date(audioFile.lastAccessed).getTime();
      if (lastAccessed < cutoffTime) {
        this.audioFiles.delete(fileId);
      }
    }
  }
}