/**
 * Design Artifacts model
 * Represents generated documents from the planning process
 */
export class DesignArtifacts {
  /**
   * Creates a new DesignArtifacts instance
   * @param {string} researchDoc - Path to research document
   * @param {string} dataModelDoc - Path to data model document
   * @param {Array<string>} contractFiles - Array of contract file paths
   * @param {string} quickstartDoc - Path to quickstart document
   */
  constructor(researchDoc = '', dataModelDoc = '', contractFiles = [], quickstartDoc = '') {
    this.researchDoc = researchDoc;
    this.dataModelDoc = dataModelDoc;
    this.contractFiles = contractFiles;
    this.quickstartDoc = quickstartDoc;
  }

  /**
   * Adds a contract file to the artifacts
   * @param {string} filePath - Path to the contract file
   */
  addContractFile(filePath) {
    this.contractFiles.push(filePath);
  }

  /**
   * Checks if all required artifacts are present
   * @returns {Object} Validation result with status and missing artifacts
   */
  validate() {
    const missingArtifacts = [];
    
    if (!this.researchDoc) missingArtifacts.push('researchDoc');
    if (!this.dataModelDoc) missingArtifacts.push('dataModelDoc');
    if (!this.contractFiles || this.contractFiles.length === 0) missingArtifacts.push('contractFiles');
    if (!this.quickstartDoc) missingArtifacts.push('quickstartDoc');

    return {
      status: missingArtifacts.length === 0 ? 'pass' : 'fail',
      missingArtifacts: missingArtifacts
    };
  }

  /**
   * Gets a summary of the design artifacts
   * @returns {Object} Summary information
   */
  getSummary() {
    return {
      totalArtifacts: 3 + (this.contractFiles ? this.contractFiles.length : 0), // research, data model, quickstart + contracts
      hasResearch: !!this.researchDoc,
      hasDataModel: !!this.dataModelDoc,
      hasQuickstart: !!this.quickstartDoc,
      contractCount: this.contractFiles ? this.contractFiles.length : 0
    };
  }

  /**
   * Converts the model to a plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      researchDoc: this.researchDoc,
      dataModelDoc: this.dataModelDoc,
      contractFiles: this.contractFiles,
      quickstartDoc: this.quickstartDoc
    };
  }

  /**
   * Creates a DesignArtifacts instance from a plain object
   * @param {Object} obj - Plain object representation
   * @returns {DesignArtifacts} Instance of DesignArtifacts
   */
  static fromJSON(obj) {
    return new DesignArtifacts(
      obj.researchDoc,
      obj.dataModelDoc,
      obj.contractFiles || [],
      obj.quickstartDoc
    );
  }
}

// Type definitions for documentation purposes
/**
 * @typedef {Object} ResearchDocument
 * @property {string} path - Path to the research document
 * @property {Array<Decision>} decisions - Technical decisions made
 * @property {Array<Alternative>} alternatives - Alternatives considered
 */

/**
 * @typedef {Object} DataModelDocument
 * @property {string} path - Path to the data model document
 * @property {Array<Entity>} entities - Entities defined in the model
 */

/**
 * @typedef {Object} ContractFile
 * @property {string} path - Path to the contract file
 * @property {string} type - Type of contract (API, interface, etc.)
 */

/**
 * @typedef {Object} QuickstartDocument
 * @property {string} path - Path to the quickstart document
 * @property {Array<string>} validationScenarios - Scenarios for validation
 */