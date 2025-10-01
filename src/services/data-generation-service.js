/**
 * Data Generation Service
 * Handles random data generation, clipboard operations, and Chinese region data queries
 */
import { GeneratedData } from '../models/generated-data.js';
import { ChinaRegionData } from '../models/china-regions-data.js';
import { invoke } from '@tauri-apps/api/core';

export class DataGenerationService {
  constructor() {
    this.chinaRegionsData = this.loadChinaRegionsData();
  }

  /**
   * Load initial Chinese regions data
   * In a real implementation, this would load from a file or API
   * @returns {Array<ChinaRegionData>} Array of Chinese region data
   */
  loadChinaRegionsData() {
    // This is a simplified example - in a real implementation, 
    // this would load the complete Chinese administrative region hierarchy
    const beijing = new ChinaRegionData('110000', '北京市', 'province', null);
    const beijingCity = new ChinaRegionData('110100', '市辖区', 'city', '110000');
    const chaoyang = new ChinaRegionData('110105', '朝阳区', 'district', '110100');
    
    beijing.addChild(beijingCity);
    beijingCity.addChild(chaoyang);
    
    return [beijing];
  }

  /**
   * Generate random data of specified type
   * @param {string} dataType - Type of data to generate
   * @param {number} count - Number of items to generate
   * @param {Object} options - Generation options
   * @returns {Promise<Array<GeneratedData>>} Array of generated data instances
   */
  async generateRandomData(dataType, count = 1, options = {}) {
    if (!dataType || typeof dataType !== 'string') {
      throw new Error('Data type is required and must be a string');
    }

    if (typeof count !== 'number' || count < 1) {
      throw new Error('Count must be a positive number');
    }

    const validDataTypes = [
      'chinese-name', 'english-name', 'phone', 'id-card', 
      'string', 'strong-password', 'date'
    ];

    if (!validDataTypes.includes(dataType)) {
      throw new Error(`Data type must be one of: ${validDataTypes.join(', ')}`);
    }

    try {
      // Call the Tauri backend to generate random data
      const response = await invoke('generate_random_data', {
        request: {
          dataType: dataType,
          count: count,
          options: options
        }
      });

      // Convert the response to GeneratedData instances
      const results = response.generatedData.map(content => 
        new GeneratedData(response.dataType, content)
      );

      return results;
    } catch (error) {
      // Handle errors from the Tauri backend
      throw new Error(`Failed to generate random data: ${error.message}`);
    }
  }

  /**
   * Generate content based on data type
   * @param {string} dataType - Type of data to generate
   * @param {Object} options - Generation options
   * @returns {string} Generated content
   */
  generateContentForType(dataType, options = {}) {
    switch (dataType) {
      case 'chinese-name':
        return this.generateChineseName();
      case 'english-name':
        return this.generateEnglishName();
      case 'phone':
        return this.generatePhoneNumber();
      case 'id-card':
        return this.generateIdCardNumber();
      case 'string':
        const length = options.length || 8;
        return this.generateRandomString(length);
      case 'strong-password':
        return this.generateStrongPassword();
      case 'date':
        const format = options.format || 'YYYY-MM-DD';
        return this.generateDate(format);
      default:
        return `Generated ${dataType} content`;
    }
  }

  /**
   * Generate a Chinese name
   * @returns {string} Generated Chinese name
   */
  generateChineseName() {
    const surnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴'];
    const givenNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军'];
    
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const givenName = givenNames[Math.floor(Math.random() * givenNames.length)];
    
    // Sometimes add a second given name
    if (Math.random() > 0.5) {
      const secondGivenName = givenNames[Math.floor(Math.random() * givenNames.length)];
      return surname + givenName + secondGivenName;
    }
    
    return surname + givenName;
  }

  /**
   * Generate an English name
   * @returns {string} Generated English name
   */
  generateEnglishName() {
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }

  /**
   * Generate a Chinese phone number
   * @returns {string} Generated phone number
   */
  generatePhoneNumber() {
    // Chinese phone numbers start with 1 and have 11 digits
    const prefixes = ['139', '138', '137', '136', '135', '134', '159', '158', '157', '150', '151', '152', '188', '187', '182', '183', '184', '178', '130', '131', '132', '156', '155', '186', '185', '176', '133', '153', '189', '180', '181', '177'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    
    let suffix = '';
    for (let i = 0; i < 8; i++) {
      suffix += Math.floor(Math.random() * 10);
    }
    
    return prefix + suffix;
  }

  /**
   * Generate a Chinese ID card number
   * @returns {string} Generated ID card number
   */
  generateIdCardNumber() {
    // This is a simplified version, not following all real rules
    const provinces = ['11', '12', '13', '14', '15', '21', '22', '23'];
    const province = provinces[Math.floor(Math.random() * provinces.length)];
    
    // Generate random city and district codes
    const city = String(Math.floor(Math.random() * 10)).padStart(2, '0');
    const district = String(Math.floor(Math.random() * 10)).padStart(2, '0');
    
    // Generate birth date (between 1970 and 2000)
    const year = String(Math.floor(Math.random() * 30) + 1970);
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    
    // Random sequence
    const sequence = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    
    // Calculate check digit (simplified)
    const base = province + city + district + year + month + day + sequence;
    
    // In a real system, this would properly calculate the check digit
    const checkDigit = ['X', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'][Math.floor(Math.random() * 11)];
    
    return base + checkDigit;
  }

  /**
   * Generate a random string
   * @param {number} length - Length of the string
   * @returns {string} Generated random string
   */
  generateRandomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Generate a strong password
   * @returns {string} Generated strong password
   */
  generateStrongPassword() {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=';
    
    // Ensure at least one character from each category
    let password = upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    const all = upper + lower + numbers + symbols;
    for (let i = 4; i < 12; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }

  /**
   * Generate a date
   * @param {string} format - Date format (currently only supports basic formatting)
   * @returns {string} Generated date string
   */
  generateDate(format = 'YYYY-MM-DD') {
    const start = new Date(1970, 0, 1);
    const end = new Date(2025, 11, 31);
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    
    if (format === 'YYYY-MM-DD') {
      return randomDate.toISOString().split('T')[0];
    } else if (format === 'MM/DD/YYYY') {
      return (randomDate.getMonth() + 1) + '/' + randomDate.getDate() + '/' + randomDate.getFullYear();
    } else {
      return randomDate.toISOString().split('T')[0];
    }
  }

  /**
   * Copy data to clipboard
   * @param {string} data - Data to copy to clipboard
   * @returns {Promise<boolean>} Promise resolving to success status
   */
  async copyToClipboard(data) {
    if (typeof data !== 'string') {
      throw new Error('Data must be a string');
    }

    try {
      // Call the Tauri backend to copy data to clipboard
      const response = await invoke('copy_to_clipboard', {
        request: {
          data: data
        }
      });
      
      return response.success;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  /**
   * Query Chinese administrative region data
   * @param {string|null} parentId - Parent region ID to get children for, or null for root regions
   * @param {number|null} level - Specific level to query, or null for any level
   * @param {string|null} search - Search term to filter regions by name
   * @returns {Promise<Array<ChinaRegionData>>} Array of matching regions
   */
  async queryChinaRegions(parentId = null, level = null, search = null) {
    try {
      // Call the Tauri backend to get Chinese regions data
      const response = await invoke('get_china_regions', {
        request: {
          parentId: parentId,
          level: level,
          search: search
        }
      });

      // Convert the response to ChinaRegionData instances
      const results = response.regions.map(regionInfo => 
        new ChinaRegionData(
          regionInfo.regionId,
          regionInfo.name,
          regionInfo.regionType,
          regionInfo.parentId
        )
      );

      return results;
    } catch (error) {
      // Handle errors from the Tauri backend
      throw new Error(`Failed to query Chinese regions: ${error.message}`);
    }
  }

  /**
   * Find children of a region by parent ID
   * @param {Array<ChinaRegionData>} regions - Array of regions to search in
   * @param {string} parentId - Parent ID to find children for
   * @returns {Array<ChinaRegionData>} Array of child regions
   */
  findChildrenById(regions, parentId) {
    // This is a simplified implementation
    // In a real implementation, we would traverse the entire hierarchy
    for (const region of regions) {
      if (region.regionId === parentId) {
        return region.children;
      }
      
      if (region.hasChildren()) {
        const nestedResults = this.findChildrenById(region.children, parentId);
        if (nestedResults.length > 0) {
          return nestedResults;
        }
      }
    }
    
    return [];
  }

  /**
   * Get all root-level regions (provinces)
   * @returns {Array<ChinaRegionData>} Array of root regions
   */
  getRootRegions() {
    return this.chinaRegionsData;
  }

  /**
   * Compare two text documents
   * @param {string} doc1 - First document content
   * @param {string} doc2 - Second document content
   * @param {Object} options - Comparison options
   * @returns {Promise<Object>} Comparison result with differences
   */
  async compareTexts(doc1, doc2, options = {}) {
    const granularity = options.granularity || 'line';
    const ignoreWhitespace = options.ignoreWhitespace || false;
    const ignoreCase = options.ignoreCase || false;
    
    try {
      // Call the Tauri backend to compare texts
      const response = await invoke('compare_texts', {
        request: {
          doc1: doc1,
          doc2: doc2,
          options: {
            granularity: granularity,
            ignoreWhitespace: ignoreWhitespace,
            ignoreCase: ignoreCase
          }
        }
      });

      return {
        differences: response.differences,
        similarityPercent: response.similarityPercent,
        timestamp: response.timestamp
      };
    } catch (error) {
      // Handle errors from the Tauri backend
      throw new Error(`Failed to compare texts: ${error.message}`);
    }
  }

  /**
   * Calculate similarity between two strings using a simplified algorithm
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity percentage (0-1)
   */
  calculateSimilarity(str1, str2) {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;
    
    // Simple length-based similarity
    const lengthDiff = Math.abs(str1.length - str2.length) / Math.max(str1.length, str2.length);
    return 1 - lengthDiff;
  }
}