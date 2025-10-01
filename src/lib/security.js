/**
 * Security validation utilities for API endpoints
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
  
  // Additional checks could go here
  return true;
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
    .replace(/\/+/g, '/');    // Replace multiple slashes with single slash
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
        .replace(/'/g, '&#x27;');
      break;
      
    case 'number':
      if (typeof input !== 'number' && typeof input !== 'string') {
        return { valid: false, sanitized: null, error: 'Input must be a number' };
      }
      const num = Number(input);
      if (isNaN(num)) {
        return { valid: false, sanitized: null, error: 'Input must be a valid number' };
      }
      sanitizedInput = num;
      break;
      
    case 'array':
      if (!Array.isArray(input)) {
        return { valid: false, sanitized: null, error: 'Input must be an array' };
      }
      break;
      
    case 'object':
      if (input === null || typeof input !== 'object' || Array.isArray(input)) {
        return { valid: false, sanitized: null, error: 'Input must be an object' };
      }
      break;
      
    default:
      return { valid: false, sanitized: null, error: `Unknown type: ${type}` };
  }
  
  return { valid: true, sanitized: sanitizedInput, error: null };
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