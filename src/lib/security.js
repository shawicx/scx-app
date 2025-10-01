/**
 * Security validation utilities for API endpoints
 * Provides comprehensive security validation for all API endpoints including
 * file processing, data generation, audio processing, and Chinese region data operations
 */

/**
 * Validates file paths to prevent directory traversal attacks
 * @param {string} filePath - File path to validate
 * @returns {boolean} True if path is safe, false otherwise
 */
export function isValidFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return false;
  }
  
  // Check for directory traversal
  if (filePath.includes('../') || filePath.includes('..\\')) {
    return false;
  }
  
  // Check for null bytes
  if (filePath.includes('\\0')) {
    return false;
  }
  
  // Check for pipe characters that could be used for command injection
  if (filePath.includes('|')) {
    return false;
  }
  
  // Check for wildcards that could be used for unintended file access
  if (filePath.includes('*') || filePath.includes('?')) {
    return false;
  }
  
  return true;
}

/**
 * Validates audio file paths specifically
 * @param {string} filePath - Audio file path to validate
 * @param {Array<string>} [allowedExtensions] - Allowed audio file extensions
 * @returns {boolean} True if path is safe, false otherwise
 */
export function isValidAudioFilePath(filePath, allowedExtensions = ['.wav', '.mp3', '.flac', '.ogg']) {
  if (!isValidFilePath(filePath)) {
    return false;
  }
  
  const lowerPath = filePath.toLowerCase();
  return allowedExtensions.some(ext => lowerPath.endsWith(ext));
}

/**
 * Validates PDF file paths specifically
 * @param {string} filePath - PDF file path to validate
 * @returns {boolean} True if path is safe, false otherwise
 */
export function isValidPdfFilePath(filePath) {
  if (!isValidFilePath(filePath)) {
    return false;
  }
  
  return filePath.toLowerCase().endsWith('.pdf');
}

/**
 * Sanitizes a file path by removing potentially dangerous characters/sequences
 * @param {string} filePath - File path to sanitize
 * @returns {string} Sanitized file path
 */
export function sanitizeFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return '';
  }
  
  // Remove potentially dangerous sequences
  return filePath
    .replace(/\.\.\//g, '')   // Remove ../
    .replace(/\.\.\\/g, '')   // Remove ..\
    .replace(/\\/g, '/')      // Normalize path separators
    .replace(/\/+/g, '/')     // Replace multiple slashes with single slash
    .replace(/\0/g, '')       // Remove null bytes
    .replace(/\|/g, '')       // Remove pipe characters
    .replace(/\*/g, '')       // Remove asterisks
    .replace(/\?/g, '');      // Remove question marks
}

/**
 * Validates if a path is within allowed directories
 * @param {string} filePath - The path to check
 * @param {Array<string>} allowedBasePaths - Array of allowed base paths
 * @returns {boolean} True if path is within allowed directories
 */
export function isPathInAllowedDirectories(filePath, allowedBasePaths) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  return allowedBasePaths.some(basePath => {
    const normalizedBase = basePath.replace(/\\/g, '/');
    return normalizedPath.startsWith(normalizedBase);
  });
}

/**
 * Validates user input to prevent injection attacks
 * @param {any} input - Input to validate
 * @param {string} type - Expected type ('string', 'number', 'array', 'object')
 * @returns {Object} Validation result with valid status and sanitized value
 */
export function validateUserInput(input, type) {
  let sanitizedInput = input;
  
  switch (type) {
    case 'string':
      if (typeof input !== 'string') {
        return { valid: false, sanitized: null, error: 'Input must be a string' };
      }
      // Sanitize string input
      sanitizedInput = input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/javascript:/gi, '') // Remove javascript protocol
        .replace(/data:/gi, '');       // Remove data protocol
      break;
      
    case 'number':
      if (typeof input !== 'number' && typeof input !== 'string') {
        return { valid: false, sanitized: null, error: 'Input must be a number' };
      }
      const num = Number(input);
      if (isNaN(num)) {
        return { valid: false, sanitized: null, error: 'Input must be a valid number' };
      }
      // Check for extremely large numbers that could cause issues
      if (Math.abs(num) > Number.MAX_SAFE_INTEGER) {
        return { valid: false, sanitized: null, error: 'Number is too large' };
      }
      sanitizedInput = num;
      break;
      
    case 'array':
      if (!Array.isArray(input)) {
        return { valid: false, sanitized: null, error: 'Input must be an array' };
      }
      // Check array length to prevent DoS
      if (input.length > 10000) {
        return { valid: false, sanitized: null, error: 'Array is too large (max 10000 elements)' };
      }
      break;
      
    case 'object':
      if (input === null || typeof input !== 'object' || Array.isArray(input)) {
        return { valid: false, sanitized: null, error: 'Input must be an object' };
      }
      // Check object size to prevent DoS
      if (Object.keys(input).length > 1000) {
        return { valid: false, sanitized: null, error: 'Object has too many properties (max 1000)' };
      }
      break;
      
    default:
      return { valid: false, sanitized: null, error: `Unknown type: ${type}` };
  }
  
  return { valid: true, sanitized: sanitizedInput, error: null };
}

/**
 * Validates audio processing parameters
 * @param {Object} params - Audio processing parameters
 * @returns {Object} Validation result
 */
export function validateAudioParams(params) {
  const violations = [];
  
  if (!params || typeof params !== 'object') {
    violations.push('Parameters must be an object');
    return { valid: false, violations };
  }
  
  // Validate input path
  if (params.inputPath) {
    if (!isValidAudioFilePath(params.inputPath)) {
      violations.push('Invalid audio file path');
    }
  }
  
  // Validate output path
  if (params.outputPath) {
    if (!isValidFilePath(params.outputPath)) {
      violations.push('Invalid output file path');
    }
  }
  
  // Validate segments if present
  if (params.segments) {
    if (!Array.isArray(params.segments)) {
      violations.push('Segments must be an array');
    } else {
      for (const [index, segment] of params.segments.entries()) {
        if (!segment || typeof segment !== 'object') {
          violations.push(`Segment at index ${index} must be an object`);
        } else {
          if (typeof segment.startTime !== 'number' || segment.startTime < 0) {
            violations.push(`Segment at index ${index} must have a non-negative startTime`);
          }
          
          if (typeof segment.endTime !== 'number' || segment.endTime < 0) {
            violations.push(`Segment at index ${index} must have a non-negative endTime`);
          }
          
          if (segment.startTime >= segment.endTime) {
            violations.push(`Segment at index ${index} startTime must be less than endTime`);
          }
        }
      }
    }
  }
  
  // Validate target format if present
  if (params.targetFormat) {
    const validFormats = ['mp3', 'wav', 'flac', 'ogg'];
    if (typeof params.targetFormat !== 'string' || !validFormats.includes(params.targetFormat.toLowerCase())) {
      violations.push(`Target format must be one of: ${validFormats.join(', ')}`);
    }
  }
  
  return {
    valid: violations.length === 0,
    violations: violations
  };
}

/**
 * Validates file processing parameters
 * @param {Object} params - File processing parameters
 * @returns {Object} Validation result
 */
export function validateFileParams(params) {
  const violations = [];
  
  if (!params || typeof params !== 'object') {
    violations.push('Parameters must be an object');
    return { valid: false, violations };
  }
  
  // Validate input path
  if (params.inputPath) {
    if (!isValidFilePath(params.inputPath)) {
      violations.push('Invalid input file path');
    }
  }
  
  // Validate output directory
  if (params.outputDir) {
    if (!isValidFilePath(params.outputDir)) {
      violations.push('Invalid output directory path');
    }
  }
  
  // Validate output path
  if (params.outputPath) {
    if (!isValidFilePath(params.outputPath)) {
      violations.push('Invalid output file path');
    }
  }
  
  return {
    valid: violations.length === 0,
    violations: violations
  };
}

/**
 * Validates data generation parameters
 * @param {Object} params - Data generation parameters
 * @returns {Object} Validation result
 */
export function validateDataParams(params) {
  const violations = [];
  
  if (!params || typeof params !== 'object') {
    violations.push('Parameters must be an object');
    return { valid: false, violations };
  }
  
  // Validate data type if present
  if (params.dataType) {
    const validDataTypes = [
      'chinese-name', 'english-name', 'phone', 'id-card', 
      'string', 'strong-password', 'date'
    ];
    
    if (typeof params.dataType !== 'string' || !validDataTypes.includes(params.dataType)) {
      violations.push(`Data type must be one of: ${validDataTypes.join(', ')}`);
    }
  }
  
  // Validate count if present
  if (params.count !== undefined) {
    if (typeof params.count !== 'number' || params.count < 1 || params.count > 10000) {
      violations.push('Count must be between 1 and 10000');
    }
  }
  
  return {
    valid: violations.length === 0,
    violations: violations
  };
}

/**
 * Validates Chinese region data parameters
 * @param {Object} params - Chinese region data parameters
 * @returns {Object} Validation result
 */
export function validateChinaRegionParams(params) {
  const violations = [];
  
  if (!params || typeof params !== 'object') {
    violations.push('Parameters must be an object');
    return { valid: false, violations };
  }
  
  // Validate parent ID if present
  if (params.parentId !== undefined && params.parentId !== null) {
    if (typeof params.parentId !== 'string' || !/^\d{6}$/.test(params.parentId)) {
      violations.push('Parent ID must be a 6-digit numeric string');
    }
  }
  
  // Validate level if present
  if (params.level !== undefined && params.level !== null) {
    if (typeof params.level !== 'number' || params.level < 1 || params.level > 5) {
      violations.push('Level must be between 1 and 5');
    }
  }
  
  // Validate search term if present
  if (params.search !== undefined && params.search !== null) {
    if (typeof params.search !== 'string') {
      violations.push('Search term must be a string');
    } else if (params.search.length > 100) {
      violations.push('Search term is too long (max 100 characters)');
    }
  }
  
  return {
    valid: violations.length === 0,
    violations: violations
  };
}

/**
 * Validates text comparison parameters
 * @param {Object} params - Text comparison parameters
 * @returns {Object} Validation result
 */
export function validateTextComparisonParams(params) {
  const violations = [];
  
  if (!params || typeof params !== 'object') {
    violations.push('Parameters must be an object');
    return { valid: false, violations };
  }
  
  // Validate documents
  if (params.doc1 !== undefined) {
    if (typeof params.doc1 !== 'string') {
      violations.push('First document must be a string');
    } else if (params.doc1.length > 1000000) { // 1MB limit
      violations.push('First document is too large (max 1MB)');
    }
  }
  
  if (params.doc2 !== undefined) {
    if (typeof params.doc2 !== 'string') {
      violations.push('Second document must be a string');
    } else if (params.doc2.length > 1000000) { // 1MB limit
      violations.push('Second document is too large (max 1MB)');
    }
  }
  
  // Validate options if present
  if (params.options !== undefined && params.options !== null) {
    if (typeof params.options !== 'object' || Array.isArray(params.options)) {
      violations.push('Options must be an object');
    } else {
      // Validate granularity if present
      if (params.options.granularity !== undefined) {
        const validGranularities = ['character', 'word', 'line'];
        if (typeof params.options.granularity !== 'string' || 
            !validGranularities.includes(params.options.granularity)) {
          violations.push(`Granularity must be one of: ${validGranularities.join(', ')}`);
        }
      }
    }
  }
  
  return {
    valid: violations.length === 0,
    violations: violations
  };
}

/**
 * Common security rules for feature specification paths
 */
export const featureSpecSecurityRules = {
  validate: (path) => {
    if (!path || typeof path !== 'string') {
      return { valid: false, error: 'Path must be a non-empty string' };
    }
    
    if (!isValidFilePath(path)) {
      return { valid: false, error: 'Path contains unsafe patterns' };
    }
    
    if (!isPathInAllowedDirectories(path, ['./specs/', '../specs/'])) {
      return { valid: false, error: 'Path is not within allowed directories' };
    }
    
    if (!path.endsWith('.md') && !path.endsWith('.json')) {
      return { valid: false, error: 'File must be markdown or JSON format' };
    }
    
    return { valid: true, error: null };
  }
};

/**
 * Common security rules for output paths
 */
export const outputPathSecurityRules = {
  validate: (path) => {
    if (!path || typeof path !== 'string') {
      return { valid: false, error: 'Path must be a non-empty string' };
    }
    
    if (!isValidFilePath(path)) {
      return { valid: false, error: 'Path contains unsafe patterns' };
    }
    
    if (!isPathInAllowedDirectories(path, ['./specs/', '../specs/', './output/'])) {
      return { valid: false, error: 'Path is not within allowed directories' };
    }
    
    return { valid: true, error: null };
  }
};

/**
 * Validates an API request for security compliance
 * @param {string} endpoint - The API endpoint being called
 * @param {Object} params - Request parameters
 * @returns {Object} Validation result with valid status and any violations
 */
export function validateApiRequest(endpoint, params) {
  const violations = [];
  
  // Common validation for all endpoints
  if (!endpoint || typeof endpoint !== 'string') {
    violations.push('Endpoint must be a valid string');
  }
  
  if (params && typeof params === 'object') {
    // Check for potential injection patterns in string parameters
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        if (value.includes('javascript:') || value.includes('data:')) {
          violations.push(`Parameter ${key} contains potential URL injection`);
        }
        
        if (value.includes('__proto__') || value.includes('constructor')) {
          violations.push(`Parameter ${key} contains potential prototype pollution`);
        }
      }
    }
  }
  
  // Endpoint-specific validation
  switch (endpoint) {
    case 'generate_plan':
      if (params.featureSpecPath) {
        const validation = featureSpecSecurityRules.validate(params.featureSpecPath);
        if (!validation.valid) {
          violations.push(`featureSpecPath: ${validation.error}`);
        }
      }
      
      if (params.outputPath) {
        const validation = outputPathSecurityRules.validate(params.outputPath);
        if (!validation.valid) {
          violations.push(`outputPath: ${validation.error}`);
        }
      }
      break;
      
    case 'get_project_structure':
      // No specific security validation needed for this endpoint
      break;
      
    case 'execute_contract_test':
      if (params.contractPath) {
        const validation = outputPathSecurityRules.validate(params.contractPath);
        if (!validation.valid) {
          violations.push(`contractPath: ${validation.error}`);
        }
      }
      
      if (params.testType) {
        const validTestTypes = ['contract', 'integration', 'unit'];
        if (!validTestTypes.includes(params.testType)) {
          violations.push(`testType: must be one of ${validTestTypes.join(', ')}`);
        }
      }
      break;
      
    // File processing endpoints
    case 'process_pdf_to_image':
      const pdfValidation = validateFileParams(params);
      if (!pdfValidation.valid) {
        violations.push(...pdfValidation.violations.map(v => `File params: ${v}`));
      }
      break;
      
    case 'process_markdown_to_pdf':
      if (params.markdownContent && typeof params.markdownContent === 'string') {
        if (params.markdownContent.length > 1000000) { // 1MB limit
          violations.push('Markdown content is too large (max 1MB)');
        }
      }
      
      const mdValidation = validateFileParams(params);
      if (!mdValidation.valid) {
        violations.push(...mdValidation.violations.map(v => `File params: ${v}`));
      }
      break;
      
    case 'get_file_job_status':
      if (params.jobId && typeof params.jobId !== 'string') {
        violations.push('Job ID must be a string');
      }
      break;
      
    // Data generation endpoints
    case 'generate_random_data':
      const dataValidation = validateDataParams(params);
      if (!dataValidation.valid) {
        violations.push(...dataValidation.violations.map(v => `Data params: ${v}`));
      }
      break;
      
    case 'copy_to_clipboard':
      if (params.data && typeof params.data === 'string') {
        if (params.data.length > 100000) { // 100KB limit
          violations.push('Data is too large to copy to clipboard (max 100KB)');
        }
      }
      break;
      
    case 'get_china_regions':
      const chinaValidation = validateChinaRegionParams(params);
      if (!chinaValidation.valid) {
        violations.push(...chinaValidation.violations.map(v => `China region params: ${v}`));
      }
      break;
      
    case 'compare_texts':
      const textValidation = validateTextComparisonParams(params);
      if (!textValidation.valid) {
        violations.push(...textValidation.violations.map(v => `Text comparison params: ${v}`));
      }
      break;
      
    // Audio processing endpoints
    case 'process_audio':
    case 'trim_audio':
    case 'convert_audio':
    case 'merge_audio':
    case 'adjust_volume':
    case 'extract_audio_metadata':
    case 'generate_waveform':
      const audioValidation = validateAudioParams(params);
      if (!audioValidation.valid) {
        violations.push(...audioValidation.violations.map(v => `Audio params: ${v}`));
      }
      break;
      
    case 'get_audio_job_status':
      if (params.jobId && typeof params.jobId !== 'string') {
        violations.push('Audio job ID must be a string');
      }
      break;
  }
  
  return {
    valid: violations.length === 0,
    violations: violations
  };
}

/**
 * Creates a security middleware function
 * @param {Function} next - Next function in the middleware chain
 * @returns {Function} Secured function
 */
export function withSecurity(next) {
  return async (endpoint, params) => {
    const validation = validateApiRequest(endpoint, params);
    
    if (!validation.valid) {
      throw new Error(`Security validation failed: ${validation.violations.join('; ')}`);
    }
    
    return await next(endpoint, params);
  };
}