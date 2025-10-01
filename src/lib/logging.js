/**
 * Logging utilities for request/response logging
 */

/**
 * Creates a logger instance with different log levels
 * @param {string} [prefix] - Optional prefix for log messages
 * @returns {Object} Logger object with log methods
 */
export function createLogger(prefix = '') {
  const logPrefix = prefix ? `[${prefix}]` : '';
  
  return {
    /**
     * Logs an info message
     * @param {...any} args - Arguments to log
     */
    info: (...args) => {
      const timestamp = new Date().toISOString();
      console.log(`[INFO] ${timestamp} ${logPrefix}`, ...args);
    },
    
    /**
     * Logs a warning message
     * @param {...any} args - Arguments to log
     */
    warn: (...args) => {
      const timestamp = new Date().toISOString();
      console.warn(`[WARN] ${timestamp} ${logPrefix}`, ...args);
    },
    
    /**
     * Logs an error message
     * @param {...any} args - Arguments to log
     */
    error: (...args) => {
      const timestamp = new Date().toISOString();
      console.error(`[ERROR] ${timestamp} ${logPrefix}`, ...args);
    },
    
    /**
     * Logs a debug message
     * @param {...any} args - Arguments to log
     */
    debug: (...args) => {
      const timestamp = new Date().toISOString();
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[DEBUG] ${timestamp} ${logPrefix}`, ...args);
      }
    }
  };
}

/**
 * Logs a request with standardized format
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Request parameters
 */
export function logRequest(method, endpoint, params = {}) {
  const logger = createLogger('API');
  logger.info(`${method} ${endpoint}`, {
    timestamp: new Date().toISOString(),
    params: Object.keys(params || {}),
    paramCount: Object.keys(params || {}).length
  });
}

/**
 * Logs a response with standardized format
 * @param {string} endpoint - API endpoint
 * @param {Object} response - Response object
 * @param {number} [duration] - Request duration in milliseconds
 */
export function logResponse(endpoint, response, duration) {
  const logger = createLogger('API');
  const hasError = !!response?.error;
  const success = response?.success !== undefined ? response.success : !hasError;
  
  const logData = {
    timestamp: new Date().toISOString(),
    endpoint,
    hasError,
    success,
    ...(duration && { duration: `${duration}ms` }),
    responseKeys: Object.keys(response || {})
  };
  
  if (hasError) {
    logger.error('API Response Error:', logData);
  } else {
    logger.info('API Response:', logData);
  }
}

/**
 * Higher-order function to wrap API calls with logging
 * @param {Function} apiCall - The API call function to wrap
 * @param {string} endpoint - The endpoint name
 * @param {string} [method='POST'] - The HTTP method
 * @returns {Function} Wrapped function with logging
 */
export function withLogging(apiCall, endpoint, method = 'POST') {
  return async (...args) => {
    const startTime = Date.now();
    logRequest(method, endpoint, args[0] || {});
    
    try {
      const result = await apiCall(...args);
      const duration = Date.now() - startTime;
      logResponse(endpoint, result, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logResponse(endpoint, { error: error.message }, duration);
      throw error;
    }
  };
}

/**
 * Logs an API error with additional context
 * @param {string} endpoint - API endpoint
 * @param {Error} error - Error object
 * @param {Object} [context] - Additional context information
 */
export function logApiError(endpoint, error, context = {}) {
  const logger = createLogger('API_ERROR');
  logger.error(`Error in ${endpoint}:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context
  });
}