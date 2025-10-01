/**
 * Chinese Administrative Region Data model
 * Represents geographical data that can be queried and downloaded
 */
export class ChinaRegionData {
  /**
   * Creates a new ChinaRegionData instance
   * @param {string} regionId - Unique identifier for the region
   * @param {string} name - Name of the administrative region
   * @param {string} type - Type of region (e.g., "province", "city", "district")
   * @param {string|null} parentId - ID of parent region, null for root regions
   */
  constructor(regionId = '', name = '', type = '', parentId = null) {
    this.regionId = regionId;
    this.name = name;
    this.type = type;
    this.parentId = parentId;
    this.children = [];
    this.additionalInfo = {};
    this.level = parentId ? 0 : 1; // Default level, will be calculated properly
  }

  /**
   * Adds a child region
   * @param {ChinaRegionData} child - Child region to add
   */
  addChild(child) {
    if (!(child instanceof ChinaRegionData)) {
      throw new Error('Child must be an instance of ChinaRegionData');
    }
    
    // Set the child's level based on parent's level
    child.level = this.level + 1;
    
    // Set the child's parent ID if it doesn't already have one
    if (!child.parentId) {
      child.parentId = this.regionId;
    }
    
    this.children.push(child);
  }

  /**
   * Removes a child region by regionId
   * @param {string} regionId - ID of the child region to remove
   * @returns {boolean} True if child was found and removed
   */
  removeChild(regionId) {
    const index = this.children.findIndex(child => child.regionId === regionId);
    if (index !== -1) {
      this.children.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Gets a child region by regionId
   * @param {string} regionId - ID of the child region to get
   * @returns {ChinaRegionData|null} The child region or null if not found
   */
  getChildById(regionId) {
    return this.children.find(child => child.regionId === regionId) || null;
  }

  /**
   * Sets additional information for the region
   * @param {Object} info - Additional information to set
   */
  setAdditionalInfo(info) {
    this.additionalInfo = { ...this.additionalInfo, ...info };
  }

  /**
   * Validates the region data
   * @returns {Object} Validation result with status and errors
   */
  validate() {
    const errors = [];
    
    if (!this.regionId || typeof this.regionId !== 'string') {
      errors.push('regionId is required and must be a string');
    }
    
    if (!this.name || typeof this.name !== 'string') {
      errors.push('name is required and must be a string');
    }
    
    if (!this.type || typeof this.type !== 'string') {
      errors.push('type is required and must be a string');
    }
    
    const validTypes = ['province', 'city', 'district', 'county', 'town', 'village'];
    if (!validTypes.includes(this.type)) {
      errors.push(`type must be one of: ${validTypes.join(', ')}`);
    }
    
    if (this.parentId !== null && typeof this.parentId !== 'string') {
      errors.push('parentId must be a string or null');
    }
    
    if (!Array.isArray(this.children)) {
      errors.push('children must be an array');
    } else {
      for (const [index, child] of this.children.entries()) {
        if (!(child instanceof ChinaRegionData)) {
          errors.push(`children[${index}] must be an instance of ChinaRegionData`);
        }
      }
    }
    
    if (typeof this.additionalInfo !== 'object' || this.additionalInfo === null || Array.isArray(this.additionalInfo)) {
      errors.push('additionalInfo must be an object');
    }
    
    if (typeof this.level !== 'number' || this.level < 0) {
      errors.push('level must be a non-negative number');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Checks if this region has any children
   * @returns {boolean} True if region has children
   */
  hasChildren() {
    return this.children.length > 0;
  }

  /**
   * Gets the full hierarchy path from root to this region
   * @returns {Array<ChinaRegionData>} Array of regions from root to this region
   */
  getHierarchyPath() {
    const path = [this];
    let current = this;
    
    // Traverse up the parent hierarchy
    while (current.parentId) {
      // In a real implementation, we would need to have access to the parent objects
      // For now, return just the current region
      break;
    }
    
    return path.reverse();
  }

  /**
   * Flattens the region hierarchy into a single array
   * @returns {Array<ChinaRegionData>} Array of all regions in the hierarchy
   */
  flattenHierarchy() {
    let result = [this];
    
    for (const child of this.children) {
      result = result.concat(child.flattenHierarchy());
    }
    
    return result;
  }

  /**
   * Converts the model to a plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      regionId: this.regionId,
      name: this.name,
      type: this.type,
      parentId: this.parentId,
      level: this.level,
      children: this.children.map(child => child.toJSON()),
      additionalInfo: this.additionalInfo
    };
  }

  /**
   * Creates a ChinaRegionData instance from a plain object
   * @param {Object} obj - Plain object representation
   * @returns {ChinaRegionData} Instance of ChinaRegionData
   */
  static fromJSON(obj) {
    const region = new ChinaRegionData(obj.regionId, obj.name, obj.type, obj.parentId);
    
    if (obj.level !== undefined) region.level = obj.level;
    if (obj.additionalInfo) region.additionalInfo = obj.additionalInfo;
    if (obj.children && Array.isArray(obj.children)) {
      region.children = obj.children.map(childObj => ChinaRegionData.fromJSON(childObj));
    }
    
    return region;
  }
}