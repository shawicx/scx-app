/**
 * Feature Specification model
 * Represents an input document defining the feature to be implemented
 */
export class FeatureSpecification {
  /**
   * Creates a new FeatureSpecification instance
   * @param {string} featureName - Name of the feature
   * @param {string} branch - Git branch name
   * @param {Array<FunctionalRequirement>} requirements - List of functional requirements
   * @param {Array<UserStory>} userStories - User scenarios
   */
  constructor(featureName = '', branch = '', requirements = [], userStories = []) {
    this.featureName = featureName;
    this.branch = branch;
    this.requirements = requirements;
    this.userStories = userStories;
  }

  /**
   * Validates the feature specification against constitutional principles
   * @returns {Object} Validation result with status and violations
   */
  validate() {
    const violations = [];
    
    // Check if feature name is provided
    if (!this.featureName || this.featureName.trim() === '') {
      violations.push('Feature name is required');
    }
    
    // Check if there are requirements
    if (!this.requirements || this.requirements.length === 0) {
      violations.push('At least one requirement is required');
    }
    
    // Check if there are user stories
    if (!this.userStories || this.userStories.length === 0) {
      violations.push('At least one user story is required');
    }

    return {
      status: violations.length === 0 ? 'pass' : 'fail',
      violations: violations
    };
  }

  /**
   * Checks if the feature specification is compliant with constitutional principles
   * @returns {boolean} True if compliant, false otherwise
   */
  isConstitutionallyCompliant() {
    const validation = this.validate();
    return validation.status === 'pass';
  }

  /**
   * Converts the model to a plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      featureName: this.featureName,
      branch: this.branch,
      requirements: this.requirements,
      userStories: this.userStories
    };
  }

  /**
   * Creates a FeatureSpecification instance from a plain object
   * @param {Object} obj - Plain object representation
   * @returns {FeatureSpecification} Instance of FeatureSpecification
   */
  static fromJSON(obj) {
    return new FeatureSpecification(
      obj.featureName,
      obj.branch,
      obj.requirements || [],
      obj.userStories || []
    );
  }
}

// Type definitions for documentation purposes
/**
 * @typedef {Object} FunctionalRequirement
 * @property {string} id - Requirement identifier
 * @property {string} description - Description of the requirement
 * @property {boolean} isTestable - Whether the requirement is testable
 */

/**
 * @typedef {Object} UserStory
 * @property {string} id - User story identifier
 * @property {string} description - Description of the user story
 * @property {string} acceptanceCriteria - Criteria for acceptance
 */