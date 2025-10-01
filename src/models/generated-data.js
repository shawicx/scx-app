/**
 * Generated Data model
 * Represents random data that can be copied to clipboard
 */
export class GeneratedData {
  /**
   * Creates a new GeneratedData instance
   * @param {string} dataType - Type of data (e.g., "chinese-name", "phone", "id-card", "random-string")
   * @param {string} content - The actual generated data
   */
  constructor(dataType = '', content = '') {
    this.dataType = dataType;
    this.content = content;
    this.generatedAt = new Date().toISOString();
    this.copiedToClipboard = false;
    this.copyCount = 0;
  }

  /**
   * Marks the data as copied to clipboard
   */
  markAsCopied() {
    this.copiedToClipboard = true;
    this.copyCount += 1;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Resets the copy status
   */
  resetCopyStatus() {
    this.copiedToClipboard = false;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Validates the generated data
   * @returns {Object} Validation result with status and errors
   */
  validate() {
    const errors = [];
    
    if (!this.dataType || typeof this.dataType !== 'string') {
      errors.push('dataType is required and must be a string');
    }
    
    const validDataTypes = [
      'chinese-name', 'english-name', 'phone', 'id-card', 
      'string', 'strong-password', 'date'
    ];
    
    if (!validDataTypes.includes(this.dataType)) {
      errors.push(`dataType must be one of: ${validDataTypes.join(', ')}`);
    }
    
    if (typeof this.content !== 'string') {
      errors.push('content must be a string');
    }
    
    if (typeof this.generatedAt !== 'string') {
      errors.push('generatedAt must be a string (ISO date)');
    }
    
    if (typeof this.copiedToClipboard !== 'boolean') {
      errors.push('copiedToClipboard must be a boolean');
    }
    
    if (typeof this.copyCount !== 'number' || this.copyCount < 0 || !Number.isInteger(this.copyCount)) {
      errors.push('copyCount must be a non-negative integer');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Checks if the content matches the expected format for the data type
   * @returns {boolean} True if content format is valid for the data type
   */
  isContentValid() {
    // Basic format validation based on data type
    switch (this.dataType) {
      case 'phone':
        // Chinese phone number validation (basic pattern)
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(this.content);
      
      case 'id-card':
        // Chinese ID card validation (basic pattern)
        const idCardRegex = /^\d{17}[\dXx]$/;
        return idCardRegex.test(this.content);
      
      case 'chinese-name':
        // Chinese name validation (basic pattern - should contain Chinese characters)
        const chineseNameRegex = /^[\u4e00-\u9fa5]{2,4}$/;
        return chineseNameRegex.test(this.content);
      
      case 'string':
        // For random string, just check if not empty
        return this.content.length > 0;
      
      case 'date':
        // Date validation - check if it's a valid ISO string or other common format
        return !isNaN(Date.parse(this.content));
      
      default:
        // For other types, just check if not empty
        return this.content.length > 0;
    }
  }

  /**
   * Converts the model to a plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      dataType: this.dataType,
      content: this.content,
      generatedAt: this.generatedAt,
      copiedToClipboard: this.copiedToClipboard,
      copyCount: this.copyCount,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Creates a GeneratedData instance from a plain object
   * @param {Object} obj - Plain object representation
   * @returns {GeneratedData} Instance of GeneratedData
   */
  static fromJSON(obj) {
    const data = new GeneratedData(obj.dataType, obj.content);
    
    if (obj.generatedAt) data.generatedAt = obj.generatedAt;
    if (obj.copiedToClipboard !== undefined) data.copiedToClipboard = obj.copiedToClipboard;
    if (obj.copyCount !== undefined) data.copyCount = obj.copyCount;
    if (obj.updatedAt) data.updatedAt = obj.updatedAt;
    
    return data;
  }
}