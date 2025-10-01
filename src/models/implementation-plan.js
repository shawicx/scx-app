/**
 * Implementation Plan model
 * Represents an output document with technical approach and phases
 */
import { FeatureSpecification } from './feature-specification.js';

export class ImplementationPlan {
  /**
   * Creates a new ImplementationPlan instance
   * @param {Array<Phase>} phases - Array of planning phases (0-2)
   * @param {TechnicalContext} technicalContext - Detected project stack
   * @param {Array<ConstitutionCheck>} constitutionChecks - Compliance verifications
   */
  constructor(phases = [], technicalContext = null, constitutionChecks = []) {
    this.phases = phases;
    this.technicalContext = technicalContext;
    this.constitutionChecks = constitutionChecks;
  }

  /**
   * Adds a phase to the implementation plan
   * @param {Phase} phase - Phase to add
   */
  addPhase(phase) {
    this.phases.push(phase);
  }

  /**
   * Updates the technical context of the plan
   * @param {TechnicalContext} context - New technical context
   */
  setTechnicalContext(context) {
    this.technicalContext = context;
  }

  /**
   * Adds a constitution check to the plan
   * @param {ConstitutionCheck} check - Constitution check to add
   */
  addConstitutionCheck(check) {
    this.constitutionChecks.push(check);
  }

  /**
   * Validates the implementation plan against constitutional principles
   * @returns {Object} Validation result with status and violations
   */
  validate() {
    const violations = [];
    
    // Check if there are phases
    if (!this.phases || this.phases.length === 0) {
      violations.push('At least one phase is required');
    }
    
    // Check if technical context is defined
    if (!this.technicalContext) {
      violations.push('Technical context is required');
    }
    
    // Validate constitution checks exist
    if (!this.constitutionChecks) {
      violations.push('Constitution checks array is required');
    }

    return {
      status: violations.length === 0 ? 'pass' : 'fail',
      violations: violations
    };
  }

  /**
   * Checks if all constitutional checks have passed
   * @returns {boolean} True if all checks passed, false otherwise
   */
  isConstitutionallyCompliant() {
    if (!this.constitutionChecks || this.constitutionChecks.length === 0) {
      return false;
    }
    
    return this.constitutionChecks.every(check => check.status === 'pass');
  }

  /**
   * Converts the model to a plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      phases: this.phases,
      technicalContext: this.technicalContext,
      constitutionChecks: this.constitutionChecks
    };
  }

  /**
   * Creates an ImplementationPlan instance from a plain object
   * @param {Object} obj - Plain object representation
   * @returns {ImplementationPlan} Instance of ImplementationPlan
   */
  static fromJSON(obj) {
    return new ImplementationPlan(
      obj.phases || [],
      obj.technicalContext,
      obj.constitutionChecks || []
    );
  }
}

// Type definitions for documentation purposes
/**
 * @typedef {Object} Phase
 * @property {number} number - Phase number (0-2)
 * @property {string} name - Phase name
 * @property {string} description - Phase description
 * @property {Array<string>} tasks - Tasks to be completed in this phase
 */

/**
 * @typedef {Object} TechnicalContext
 * @property {string} languageVersion - Language and version (e.g., 'Vue 3')
 * @property {Array<string>} dependencies - Project dependencies
 * @property {string} storage - Storage type
 * @property {string} targetPlatform - Target platform
 * @property {string} projectType - Project type
 */

/**
 * @typedef {Object} ConstitutionCheck
 * @property {string} principle - Name of the constitutional principle
 * @property {string} status - Status of the check ('pass' or 'fail')
 * @property {string} details - Details about the check
 */

/**
 * @typedef {Object} FeatureSpecification
 * @property {string} featureName - Name of the feature
 * @property {string} branch - Git branch name
 * @property {Array<FunctionalRequirement>} requirements - List of requirements
 * @property {Array<UserStory>} userStories - List of user stories
 */