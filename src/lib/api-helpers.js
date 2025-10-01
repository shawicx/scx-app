/**
 * API Helpers
 * Provides utility functions for error handling and validation across API endpoints
 */

/**
 * Creates a standardized error response
 * @param {string} message - Error message
 * @param {number} [code=500] - HTTP status code
 * @param {Object} [details=null] - Additional error details
 * @returns {Object} Standardized error response
 */
export function createErrorResponse(message, code = 500, details = null) {
  return {
    error: {
      code: code,
      message: message,
      details: details || {},
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Creates a standardized success response
 * @param {any} data - Response data
 * @param {Object} [meta={}] - Additional metadata
 * @returns {Object} Standardized success response
 */
export function createSuccessResponse(data, meta = {}) {
  return {
    success: true,
    data: data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}

/**
 * Validates input parameters for API endpoints
 * @param {Object} params - Parameters to validate
 * @param {Object} requiredFields - Required field names and validation rules
 * @returns {Object} Validation result with valid status and errors
 */
export function validateInput(params, requiredFields) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(requiredFields)) {
    const value = params[field];
    
    // Check if required field exists
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`Field '${field}' is required`);
      continue;
    }
    
    // Skip validation if field is not required and is empty
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    // Validate type if specified
    if (rules.type) {
      if (rules.type === 'array' && !Array.isArray(value)) {
        errors.push(`Field '${field}' must be an array`);
      } else if (rules.type !== 'array' && typeof value !== rules.type) {
        errors.push(`Field '${field}' must be of type ${rules.type}`);
      }
    }
    
    // Validate custom function if specified
    if (rules.validator && typeof rules.validator === 'function') {
      const validatorResult = rules.validator(value);
      if (validatorResult !== true && typeof validatorResult === 'string') {
        errors.push(`Field '${field}': ${validatorResult}`);
      }
    }
    
    // Validate min/max length if specified
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`Field '${field}' must be at least ${rules.minLength} characters`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`Field '${field}' must be no more than ${rules.maxLength} characters`);
      }
    }
    
    // Validate min/max value if specified for numbers
    if (typeof value === 'number') {
      if (rules.minValue !== undefined && value < rules.minValue) {
        errors.push(`Field '${field}' must be at least ${rules.minValue}`);
      }
      if (rules.maxValue !== undefined && value > rules.maxValue) {
        errors.push(`Field '${field}' must be no more than ${rules.maxValue}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Sanitizes input data to prevent security issues
 * @param {any} data - Data to sanitize
 * @returns {any} Sanitized data
 */
export function sanitizeInput(data) {
  if (typeof data === 'string') {
    // Remove potentially dangerous characters
    return data
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item));
  }
  
  if (data !== null && typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
}

/**
 * Common validation rules for feature specification paths
 */
export const featureSpecificationPathRules = {
  featureSpecPath: {
    required: true,
    type: 'string',
    validator: (path) => {
      if (typeof path !== 'string') return 'Path must be a string';
      if (!path.endsWith('.md') && !path.endsWith('.json')) return 'Path must point to a markdown or JSON file';
      if (!path.startsWith('./specs/') && !path.includes('/specs/')) return 'Path must be within specs directory';
      return true;
    }
  }
};

/**
 * Common validation rules for output paths
 */
export const outputPathRules = {
  outputPath: {
    required: true,
    type: 'string',
    validator: (path) => {
      if (typeof path !== 'string') return 'Path must be a string';
      if (!path.startsWith('./specs/') && !path.includes('/specs/')) return 'Output path must be within specs directory';
      return true;
    }
  }
};

/**
 * Common validation rules for constitution paths
 */
export const constitutionPathRules = {
  constitutionPath: {
    required: true,
    type: 'string',
    validator: (path) => {
      if (typeof path !== 'string') return 'Path must be a string';
      if (!path.includes('constitution')) return 'Path must point to a constitution file';
      return true;
    }
  }
};

/**
 * Logs an API request with appropriate details
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Request parameters
 * @param {string} [level='info'] - Log level
 */
export function logApiRequest(endpoint, params, level = 'info') {
  const logData = {
    timestamp: new Date().toISOString(),
    endpoint,
    level,
    params: Object.keys(params || {})
  };
  
  console[level]('API Request:', logData);
}

/**
 * Logs an API response with appropriate details
 * @param {string} endpoint - API endpoint
 * @param {Object} response - API response
 * @param {string} [level='info'] - Log level
 */
export function logApiResponse(endpoint, response, level = 'info') {
  const logData = {
    timestamp: new Date().toISOString(),
    endpoint,
    level,
    hasError: !!response.error,
    success: response.success || (!response.error)
  };
  
  console[level]('API Response:', logData);
}

/**
 * Wraps an async function with common error handling
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function with error handling
 */
export function withErrorHandling(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('API Error:', error);
      return createErrorResponse(
        error.message || 'An unexpected error occurred',
        error.statusCode || 500,
        { originalError: error.toString() }
      );
    }
  };
}