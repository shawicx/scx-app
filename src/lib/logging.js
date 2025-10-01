/**
 * Logging utilities for request/response logging
 * Provides comprehensive logging for API calls, file operations, and system events
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
 * @param {Object} [metadata] - Additional metadata
 */
export function logRequest(method, endpoint, params = {}, metadata = {}) {
  const logger = createLogger('API');
  logger.info(`${method} ${endpoint}`, {
    timestamp: new Date().toISOString(),
    params: Object.keys(params || {}),
    paramCount: Object.keys(params || {}).length,
    ...metadata
  });
}

/**
 * Logs a file operation request
 * @param {string} operation - File operation type (read, write, delete, etc.)
 * @param {string} filePath - Path to the file
 * @param {Object} [options] - Operation options
 */
export function logFileOperation(operation, filePath, options = {}) {
  const logger = createLogger('FILE');
  logger.info(`${operation.toUpperCase()} file`, {
    filePath,
    timestamp: new Date().toISOString(),
    ...options
  });
}

/**
 * Logs an audio processing request
 * @param {string} operation - Audio operation type (convert, trim, etc.)
 * @param {string} inputFile - Input file path
 * @param {string} outputFile - Output file path
 * @param {Object} [options] - Processing options
 */
export function logAudioOperation(operation, inputFile, outputFile, options = {}) {
  const logger = createLogger('AUDIO');
  logger.info(`${operation.toUpperCase()} audio`, {
    inputFile,
    outputFile,
    timestamp: new Date().toISOString(),
    ...options
  });
}

/**
 * Logs a data processing request
 * @param {string} operation - Data operation type (generate, compare, etc.)
 * @param {Object} [data] - Data being processed
 * @param {Object} [options] - Processing options
 */
export function logDataOperation(operation, data = {}, options = {}) {
  const logger = createLogger('DATA');
  logger.info(`${operation.toUpperCase()} data`, {
    dataType: data.dataType || typeof data,
    timestamp: new Date().toISOString(),
    ...options
  });
}

/**
 * Logs a response with standardized format
 * @param {string} endpoint - API endpoint
 * @param {Object} response - Response object
 * @param {number} [duration] - Request duration in milliseconds
 * @param {string} [operationType] - Type of operation (api, file, audio, data)
 */
export function logResponse(endpoint, response, duration, operationType = 'API') {
  const logger = createLogger(operationType);
  const hasError = !!response?.error;
  const success = response?.success !== undefined ? response.success : !hasError;
  
  const logData = {
    timestamp: new Date().toISOString(),
    endpoint,
    hasError,
    success,
    ...(duration && { duration: `${duration}ms` }),
    responseKeys: Object.keys(response || {}),
    resultSize: response ? JSON.stringify(response).length : 0
  };
  
  if (hasError) {
    logger.error(`${operationType} Response Error:`, logData);
  } else {
    logger.info(`${operationType} Response:`, logData);
  }
}

/**
 * Logs a file operation response
 * @param {string} operation - File operation type
 * @param {string} filePath - Path to the file
 * @param {Object} result - Operation result
 * @param {number} [duration] - Operation duration in milliseconds
 */
export function logFileOperationResponse(operation, filePath, result, duration) {
  const logger = createLogger('FILE');
  const hasError = !!result?.error;
  const success = result?.success !== undefined ? result.success : !hasError;
  
  const logData = {
    timestamp: new Date().toISOString(),
    operation,
    filePath,
    hasError,
    success,
    ...(duration && { duration: `${duration}ms` }),
    resultSize: result ? JSON.stringify(result).length : 0
  };
  
  if (hasError) {
    logger.error(`FILE ${operation} Error:`, logData);
  } else {
    logger.info(`FILE ${operation} Success:`, logData);
  }
}

/**
 * Logs an audio operation response
 * @param {string} operation - Audio operation type
 * @param {string} inputFile - Input file path
 * @param {string} outputFile - Output file path
 * @param {Object} result - Operation result
 * @param {number} [duration] - Operation duration in milliseconds
 */
export function logAudioOperationResponse(operation, inputFile, outputFile, result, duration) {
  const logger = createLogger('AUDIO');
  const hasError = !!result?.error;
  const success = result?.success !== undefined ? result.success : !hasError;
  
  const logData = {
    timestamp: new Date().toISOString(),
    operation,
    inputFile,
    outputFile,
    hasError,
    success,
    ...(duration && { duration: `${duration}ms` }),
    resultSize: result ? JSON.stringify(result).length : 0
  };
  
  if (hasError) {
    logger.error(`AUDIO ${operation} Error:`, logData);
  } else {
    logger.info(`AUDIO ${operation} Success:`, logData);
  }
}

/**
 * Logs a data operation response
 * @param {string} operation - Data operation type
 * @param {Object} data - Data being processed
 * @param {Object} result - Operation result
 * @param {number} [duration] - Operation duration in milliseconds
 */
export function logDataOperationResponse(operation, data, result, duration) {
  const logger = createLogger('DATA');
  const hasError = !!result?.error;
  const success = result?.success !== undefined ? result.success : !hasError;
  
  const logData = {
    timestamp: new Date().toISOString(),
    operation,
    dataType: data?.dataType || typeof data,
    hasError,
    success,
    ...(duration && { duration: `${duration}ms` }),
    resultSize: result ? JSON.stringify(result).length : 0
  };
  
  if (hasError) {
    logger.error(`DATA ${operation} Error:`, logData);
  } else {
    logger.info(`DATA ${operation} Success:`, logData);
  }
}

/**
 * Higher-order function to wrap API calls with logging
 * @param {Function} apiCall - The API call function to wrap
 * @param {string} endpoint - The endpoint name
 * @param {string} [method='POST'] - The HTTP method
 * @param {string} [operationType='API'] - Type of operation (API, FILE, AUDIO, DATA)
 * @returns {Function} Wrapped function with logging
 */
export function withLogging(apiCall, endpoint, method = 'POST', operationType = 'API') {
  return async (...args) => {
    const startTime = Date.now();
    logRequest(method, endpoint, args[0] || {}, { operationType });
    
    try {
      const result = await apiCall(...args);
      const duration = Date.now() - startTime;
      logResponse(endpoint, result, duration, operationType);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logResponse(endpoint, { error: error.message }, duration, operationType);
      throw error;
    }
  };
}

/**
 * Higher-order function to wrap file operations with logging
 * @param {Function} fileOperation - The file operation function to wrap
 * @param {string} operation - The operation name
 * @returns {Function} Wrapped function with logging
 */
export function withFileLogging(fileOperation, operation) {
  return async (filePath, ...args) => {
    const startTime = Date.now();
    logFileOperation(operation, filePath, args[0] || {});
    
    try {
      const result = await fileOperation(filePath, ...args);
      const duration = Date.now() - startTime;
      logFileOperationResponse(operation, filePath, result, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logFileOperationResponse(operation, filePath, { error: error.message }, duration);
      throw error;
    }
  };
}

/**
 * Higher-order function to wrap audio operations with logging
 * @param {Function} audioOperation - The audio operation function to wrap
 * @param {string} operation - The operation name
 * @returns {Function} Wrapped function with logging
 */
export function withAudioLogging(audioOperation, operation) {
  return async (inputFile, outputFile, ...args) => {
    const startTime = Date.now();
    logAudioOperation(operation, inputFile, outputFile, args[0] || {});
    
    try {
      const result = await audioOperation(inputFile, outputFile, ...args);
      const duration = Date.now() - startTime;
      logAudioOperationResponse(operation, inputFile, outputFile, result, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logAudioOperationResponse(operation, inputFile, outputFile, { error: error.message }, duration);
      throw error;
    }
  };
}

/**
 * Higher-order function to wrap data operations with logging
 * @param {Function} dataOperation - The data operation function to wrap
 * @param {string} operation - The operation name
 * @returns {Function} Wrapped function with logging
 */
export function withDataLogging(dataOperation, operation) {
  return async (data, ...args) => {
    const startTime = Date.now();
    logDataOperation(operation, data, args[0] || {});
    
    try {
      const result = await dataOperation(data, ...args);
      const duration = Date.now() - startTime;
      logDataOperationResponse(operation, data, result, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logDataOperationResponse(operation, data, { error: error.message }, duration);
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