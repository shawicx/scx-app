/**
 * Validation utilities combining security and business validation
 */

import { validateInput, featureSpecificationPathRules, outputPathRules } from '../src/lib/api-helpers.js';
import { validateApiRequest, featureSpecSecurityRules, outputPathSecurityRules } from '../src/lib/security.js';

/**
 * Validates feature specification parameters for the generate_plan endpoint
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validation result with valid status and any violations
 */
export function validateFeatureSpecParams(params) {
  // Combine business validation rules with security validation
  const businessValidation = validateInput(params, {
    featureSpecPath: {
      required: true,
      type: 'string',
      validator: (path) => {
        if (typeof path !== 'string') return 'Path must be a string';
        if (!path.endsWith('.md') && !path.endsWith('.json')) return 'Path must point to a markdown or JSON file';
        if (!path.startsWith('./specs/') && !path.includes('/specs/')) return 'Path must be within specs directory';
        return true;
      }
    },
    outputPath: {
      required: true,
      type: 'string',
      validator: (path) => {
        if (typeof path !== 'string') return 'Path must be a string';
        if (!path.startsWith('./specs/') && !path.includes('/specs/')) return 'Output path must be within specs directory';
        return true;
      }
    },
    constitutionPath: {
      required: true,
      type: 'string',
      validator: (path) => {
        if (typeof path !== 'string') return 'Path must be a string';
        if (!path.includes('constitution')) return 'Path must point to a constitution file';
        return true;
      }
    }
  });

  // Perform additional security validation
  let securityViolations = [];
  if (params.featureSpecPath) {
    const securityValidation = featureSpecSecurityRules.validate(params.featureSpecPath);
    if (!securityValidation.valid) {
      securityViolations.push(`featureSpecPath security: ${securityValidation.error}`);
    }
  }
  
  if (params.outputPath) {
    const securityValidation = outputPathSecurityRules.validate(params.outputPath);
    if (!securityValidation.valid) {
      securityViolations.push(`outputPath security: ${securityValidation.error}`);
    }
  }

  const violations = [...businessValidation.errors, ...securityViolations];
  
  return {
    valid: violations.length === 0,
    violations: violations
  };
}

/**
 * Validates contract test parameters for the execute_contract_test endpoint
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validation result with valid status and any violations
 */
export function validateContractTestParams(params) {
  // Business validation
  const businessValidation = validateInput(params, {
    contractPath: {
      required: true,
      type: 'string'
    },
    testType: {
      required: true,
      type: 'string',
      validator: (type) => {
        const validTypes = ['contract', 'integration', 'unit'];
        if (!validTypes.includes(type)) return `Invalid test type: ${type}. Must be one of: ${validTypes.join(', ')}`;
        return true;
      }
    }
  });

  // Security validation
  let securityViolations = [];
  if (params.contractPath) {
    const securityValidation = outputPathSecurityRules.validate(params.contractPath);
    if (!securityValidation.valid) {
      securityViolations.push(`contractPath security: ${securityValidation.error}`);
    }
  }

  const violations = [...businessValidation.errors, ...securityViolations];
  
  return {
    valid: violations.length === 0,
    violations: violations
  };
}

/**
 * Validates project structure parameters for the get_project_structure endpoint
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validation result with valid status and any violations
 */
export function validateProjectStructureParams(params) {
  // This endpoint doesn't take parameters, so validation is simple
  return {
    valid: true,
    violations: []
  };
}

/**
 * Unified validation function for all API endpoints
 * @param {string} endpoint - The endpoint name
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validation result with valid status and any violations
 */
export function validateApiEndpoint(endpoint, params) {
  switch (endpoint) {
    case 'generate_plan':
      return validateFeatureSpecParams(params);
    case 'get_project_structure':
      return validateProjectStructureParams(params);
    case 'execute_contract_test':
      return validateContractTestParams(params);
    default:
      return {
        valid: false,
        violations: [`Unknown endpoint: ${endpoint}`]
      };
  }
}

/**
 * Combines input validation (from api-helpers) with security validation
 * @param {Object} params - Parameters to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Comprehensive validation result
 */
export function comprehensiveValidateInput(params, rules) {
  // First perform business logic validation
  const businessValidation = validateInput(params, rules);
  
  // Then perform security validation for string fields
  const securityViolations = [];
  
  for (const [field, rules] of Object.entries(rules)) {
    const value = params[field];
    
    if (value && typeof value === 'string') {
      // Check for potential security issues
      if (value.includes('javascript:') || value.includes('data:')) {
        securityViolations.push(`Parameter ${field} contains potential URL injection`);
      }
      
      if (value.includes('__proto__') || value.includes('constructor')) {
        securityViolations.push(`Parameter ${field} contains potential prototype pollution`);
      }
      
      // Apply path security rules if this looks like a path field
      if (field.toLowerCase().includes('path')) {
        if (!isValidFilePath(value)) {
          securityViolations.push(`Parameter ${field} contains unsafe path patterns`);
        }
      }
    }
  }
  
  const violations = [...businessValidation.errors, ...securityViolations];
  
  return {
    valid: violations.length === 0,
    violations: violations
  };
}

/**
 * Helper function to validate file paths for security
 * @param {string} filePath - File path to validate
 * @returns {boolean} True if path is safe, false otherwise
 */
function isValidFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return false;
  }
  
  // Check for directory traversal
  if (filePath.includes('../') || filePath.includes('..\\')) {
    return false;
  }
  
  return true;
}