/**
 * Audio File model
 * Represents audio files with metadata
 */
export class AudioFile {
  /**
   * Creates a new AudioFile instance
   * @param {string} fileId - Unique identifier for the file
   * @param {string} fileName - Display name of the file
   * @param {string} filePath - File system path
   * @param {string} format - Audio format (e.g., "MP3", "WAV", "FLAC", "OGG")
   */
  constructor(fileId = '', fileName = '', filePath = '', format = '') {
    this.fileId = fileId;
    this.fileName = fileName;
    this.filePath = filePath;
    this.format = format.toUpperCase();
    this.sampleRate = 44100; // Default sample rate
    this.bitRate = 128; // Default bit rate in kbps
    this.duration = 0; // Duration in seconds
    this.channels = 2; // Default to stereo
    this.size = 0; // File size in bytes
    this.waveform = []; // Processed waveform data for visualization
    this.createdAt = new Date().toISOString();
    this.lastAccessed = new Date().toISOString();
  }

  /**
   * Sets audio metadata
   * @param {Object} metadata - Metadata object containing sampleRate, bitRate, duration, channels, size
   */
  setMetadata(metadata) {
    if (metadata.sampleRate !== undefined) this.sampleRate = metadata.sampleRate;
    if (metadata.bitRate !== undefined) this.bitRate = metadata.bitRate;
    if (metadata.duration !== undefined) this.duration = metadata.duration;
    if (metadata.channels !== undefined) this.channels = metadata.channels;
    if (metadata.size !== undefined) this.size = metadata.size;
    if (metadata.createdAt) this.createdAt = metadata.createdAt;
    
    this.lastAccessed = new Date().toISOString();
  }

  /**
   * Sets waveform data for visualization
   * @param {Array<number>} waveform - Array of normalized amplitude values
   */
  setWaveform(waveform) {
    if (!Array.isArray(waveform) || !waveform.every(val => typeof val === 'number' && val >= 0 && val <= 1)) {
      throw new Error('Waveform must be an array of numbers between 0 and 1');
    }
    
    this.waveform = waveform;
    this.lastAccessed = new Date().toISOString();
  }

  /**
   * Gets the duration in a human-readable format (MM:SS)
   * @returns {string} Duration in MM:SS format
   */
  getDurationFormatted() {
    const minutes = Math.floor(this.duration / 60);
    const seconds = Math.floor(this.duration % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Checks if the audio file is stereo
   * @returns {boolean} True if the audio file is stereo
   */
  isStereo() {
    return this.channels === 2;
  }

  /**
   * Checks if the audio file is mono
   * @returns {boolean} True if the audio file is mono
   */
  isMono() {
    return this.channels === 1;
  }

  /**
   * Gets the file size in a human-readable format
   * @returns {string} File size in appropriate units (KB, MB, GB)
   */
  getSizeFormatted() {
    if (this.size < 1024) {
      return `${this.size} B`;
    } else if (this.size < 1024 * 1024) {
      return `${(this.size / 1024).toFixed(2)} KB`;
    } else if (this.size < 1024 * 1024 * 1024) {
      return `${(this.size / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(this.size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  }

  /**
   * Validates the audio file data
   * @returns {Object} Validation result with status and errors
   */
  validate() {
    const errors = [];
    
    if (!this.fileId || typeof this.fileId !== 'string') {
      errors.push('fileId is required and must be a string');
    }
    
    if (!this.fileName || typeof this.fileName !== 'string') {
      errors.push('fileName is required and must be a string');
    }
    
    if (!this.filePath || typeof this.filePath !== 'string') {
      errors.push('filePath is required and must be a string');
    }
    
    if (!this.format || typeof this.format !== 'string') {
      errors.push('format is required and must be a string');
    }
    
    const validFormats = ['MP3', 'WAV', 'FLAC', 'OGG', 'AAC', 'M4A'];
    if (!validFormats.includes(this.format.toUpperCase)) {
      errors.push(`format must be one of: ${validFormats.join(', ')}`);
    }
    
    if (typeof this.sampleRate !== 'number' || this.sampleRate <= 0) {
      errors.push('sampleRate must be a positive number');
    }
    
    if (typeof this.bitRate !== 'number' || this.bitRate <= 0) {
      errors.push('bitRate must be a positive number');
    }
    
    if (typeof this.duration !== 'number' || this.duration < 0) {
      errors.push('duration must be a non-negative number');
    }
    
    if (typeof this.channels !== 'number' || (this.channels !== 1 && this.channels !== 2)) {
      errors.push('channels must be either 1 (mono) or 2 (stereo)');
    }
    
    if (typeof this.size !== 'number' || this.size < 0) {
      errors.push('size must be a non-negative number');
    }
    
    if (!Array.isArray(this.waveform) || !this.waveform.every(val => typeof val === 'number' && val >= 0 && val <= 1)) {
      errors.push('waveform must be an array of numbers between 0 and 1');
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
      fileId: this.fileId,
      fileName: this.fileName,
      filePath: this.filePath,
      format: this.format,
      sampleRate: this.sampleRate,
      bitRate: this.bitRate,
      duration: this.duration,
      channels: this.channels,
      size: this.size,
      waveform: this.waveform,
      createdAt: this.createdAt,
      lastAccessed: this.lastAccessed
    };
  }

  /**
   * Creates an AudioFile instance from a plain object
   * @param {Object} obj - Plain object representation
   * @returns {AudioFile} Instance of AudioFile
   */
  static fromJSON(obj) {
    const audioFile = new AudioFile(obj.fileId, obj.fileName, obj.filePath, obj.format);
    
    if (obj.sampleRate !== undefined) audioFile.sampleRate = obj.sampleRate;
    if (obj.bitRate !== undefined) audioFile.bitRate = obj.bitRate;
    if (obj.duration !== undefined) audioFile.duration = obj.duration;
    if (obj.channels !== undefined) audioFile.channels = obj.channels;
    if (obj.size !== undefined) audioFile.size = obj.size;
    if (obj.waveform) audioFile.waveform = obj.waveform;
    if (obj.createdAt) audioFile.createdAt = obj.createdAt;
    if (obj.lastAccessed) audioFile.lastAccessed = obj.lastAccessed;
    
    return audioFile;
  }
}