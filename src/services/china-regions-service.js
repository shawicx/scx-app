/**
 * China Regions Service
 * Handles querying and managing Chinese administrative region data
 */
import { ChinaRegionData } from '../models/china-regions-data.js';
import { invoke } from '@tauri-apps/api/core';

export class ChinaRegionsService {
  constructor() {
    this.regionsData = new Map();
    this.loading = false;
    this.lastLoaded = null;
    this.initializeRegionsData();
  }

  /**
   * Initialize regions data with sample data
   * In a real implementation, this would load from a file or API
   */
  initializeRegionsData() {
    // This is a simplified example - in a real implementation, 
    // this would load the complete Chinese administrative region hierarchy
    
    // Create Beijing province
    const beijing = new ChinaRegionData('110000', '北京市', 'province', null);
    beijing.level = 1;
    beijing.setAdditionalInfo({
      population: 21886000,
      area: 16410.54,
      gdp: 4026960000000
    });
    
    // Create Beijing city (municipal districts)
    const beijingCity = new ChinaRegionData('110100', '市辖区', 'city', '110000');
    beijingCity.level = 2;
    
    // Create Chaoyang district
    const chaoyang = new ChinaRegionData('110105', '朝阳区', 'district', '110100');
    chaoyang.level = 3;
    chaoyang.setAdditionalInfo({
      population: 3452000,
      area: 470.8,
      gdp: 760000000000
    });
    
    // Create Haidian district
    const haidian = new ChinaRegionData('110108', '海淀区', 'district', '110100');
    haidian.level = 3;
    haidian.setAdditionalInfo({
      population: 3133000,
      area: 431.0,
      gdp: 950000000000
    });
    
    // Create Shanghai province
    const shanghai = new ChinaRegionData('310000', '上海市', 'province', null);
    shanghai.level = 1;
    shanghai.setAdditionalInfo({
      population: 24871000,
      area: 6340.5,
      gdp: 4321470000000
    });
    
    // Create Shanghai city
    const shanghaiCity = new ChinaRegionData('310100', '市辖区', 'city', '310000');
    shanghaiCity.level = 2;
    
    // Create Huangpu district
    const huangpu = new ChinaRegionData('310101', '黄浦区', 'district', '310100');
    huangpu.level = 3;
    huangpu.setAdditionalInfo({
      population: 466000,
      area: 20.52,
      gdp: 250000000000
    });
    
    // Build hierarchy
    beijing.addChild(beijingCity);
    beijingCity.addChild(chaoyang);
    beijingCity.addChild(haidian);
    
    shanghai.addChild(shanghaiCity);
    shanghaiCity.addChild(huangpu);
    
    // Store in the service
    this.regionsData.set('110000', beijing);
    this.regionsData.set('310000', shanghai);
    
    this.lastLoaded = new Date().toISOString();
  }

  /**
   * Query Chinese administrative regions
   * @param {Object} params - Query parameters
   * @param {string|null} params.parentId - Parent region ID to get children for, or null for root regions
   * @param {number|null} params.level - Specific level to query, or null for any level
   * @param {string|null} params.search - Search term to filter regions by name
   * @returns {Promise<Object>} Query result with regions and loading status
   */
  async queryRegions(params = {}) {
    const { parentId = null, level = null, search = null } = params;
    
    try {
      // Set loading state
      this.loading = true;
      
      // Call the Tauri backend to query regions
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
      
      // Reset loading state
      this.loading = false;
      
      return {
        regions: results,
        loading: this.loading,
        timestamp: response.timestamp
      };
    } catch (error) {
      // Reset loading state
      this.loading = false;
      
      throw new Error(`Failed to query regions: ${error.message}`);
    }
  }

  /**
   * Find a region by ID recursively
   * @param {ChinaRegionData} region - Region to search in
   * @param {string} regionId - ID of region to find
   * @returns {ChinaRegionData|null} Found region or null
   */
  findRegionById(region, regionId) {
    if (region.regionId === regionId) {
      return region;
    }
    
    for (const child of region.children) {
      const found = this.findRegionById(child, regionId);
      if (found) {
        return found;
      }
    }
    
    return null;
  }

  /**
   * Get a region by ID
   * @param {string} regionId - ID of the region to get
   * @returns {ChinaRegionData|null} Region or null if not found
   */
  getRegionById(regionId) {
    if (!regionId || typeof regionId !== 'string') {
      throw new Error('Region ID is required and must be a string');
    }
    
    // Search in root regions first
    if (this.regionsData.has(regionId)) {
      return this.regionsData.get(regionId);
    }
    
    // Search recursively in all regions
    for (const region of this.regionsData.values()) {
      const found = this.findRegionById(region, regionId);
      if (found) {
        return found;
      }
    }
    
    return null;
  }

  /**
   * Get all root-level regions (provinces)
   * @returns {Array<ChinaRegionData>} Array of root regions
   */
  getRootRegions() {
    return Array.from(this.regionsData.values());
  }

  /**
   * Get all regions as a flat list
   * @returns {Array<ChinaRegionData>} Array of all regions
   */
  getAllRegions() {
    const allRegions = [];
    
    for (const region of this.regionsData.values()) {
      allRegions.push(region);
      allRegions.push(...this.flattenRegionHierarchy(region));
    }
    
    return allRegions;
  }

  /**
   * Flatten a region hierarchy into a single array
   * @param {ChinaRegionData} region - Region to flatten
   * @returns {Array<ChinaRegionData>} Array of all regions in the hierarchy
   */
  flattenRegionHierarchy(region) {
    let result = [];
    
    for (const child of region.children) {
      result.push(child);
      result = result.concat(this.flattenRegionHierarchy(child));
    }
    
    return result;
  }

  /**
   * Download region data as JSON
   * @param {string|null} regionId - Specific region to download, or null for all
   * @returns {Promise<Object>} Download result with data and filename
   */
  async downloadRegionData(regionId = null) {
    try {
      // Call the Tauri backend to download region data
      const response = await invoke('download_region_data', {
        request: {
          regionId: regionId
        }
      });
      
      return {
        data: response.data,
        filename: response.filename,
        size: response.size,
        timestamp: response.timestamp
      };
    } catch (error) {
      throw new Error(`Failed to prepare region data for download: ${error.message}`);
    }
  }

  /**
   * Refresh region data from source
   * @returns {Promise<boolean>} True if refresh was successful
   */
  async refreshData() {
    try {
      // Set loading state
      this.loading = true;
      
      // Call the Tauri backend to refresh data
      const response = await invoke('refresh_china_regions_data');
      
      // Update the last loaded timestamp
      this.lastLoaded = response.timestamp || new Date().toISOString();
      
      // Reset loading state
      this.loading = false;
      
      return response.success;
    } catch (error) {
      // Reset loading state
      this.loading = false;
      
      throw new Error(`Failed to refresh region data: ${error.message}`);
    }
  }

  /**
   * Check if data is currently loading
   * @returns {boolean} True if data is loading
   */
  isLoading() {
    return this.loading;
  }

  /**
   * Get the timestamp of last data load
   * @returns {string|null} ISO timestamp or null if never loaded
   */
  getLastLoaded() {
    return this.lastLoaded;
  }

  /**
   * Get statistics about the loaded region data
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const allRegions = this.getAllRegions();
    const provinces = allRegions.filter(region => region.level === 1);
    const cities = allRegions.filter(region => region.level === 2);
    const districts = allRegions.filter(region => region.level === 3);
    
    return {
      totalRegions: allRegions.length,
      provinces: provinces.length,
      cities: cities.length,
      districts: districts.length,
      lastLoaded: this.lastLoaded,
      loading: this.loading
    };
  }

  /**
   * Simulate network delay (for demonstration purposes)
   * @param {number} ms - Number of milliseconds to wait
   * @returns {Promise<void>} A promise that resolves after the specified time
   */
  simulateNetworkDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate a region ID format
   * @param {string} regionId - Region ID to validate
   * @returns {boolean} True if region ID format is valid
   */
  validateRegionIdFormat(regionId) {
    if (!regionId || typeof regionId !== 'string') {
      return false;
    }
    
    // Chinese administrative region IDs are typically 6-digit numeric codes
    const regionIdRegex = /^\d{6}$/;
    return regionIdRegex.test(regionId);
  }

  /**
   * Search regions by name with fuzzy matching
   * @param {string} searchTerm - Term to search for
   * @param {number} limit - Maximum number of results to return
   * @returns {Array<ChinaRegionData>} Array of matching regions
   */
  searchRegionsByName(searchTerm, limit = 10) {
    if (!searchTerm || typeof searchTerm !== 'string') {
      return [];
    }
    
    const allRegions = this.getAllRegions();
    const searchTermLower = searchTerm.toLowerCase();
    
    // Filter regions by name match
    const matches = allRegions.filter(region => 
      region.name.toLowerCase().includes(searchTermLower)
    );
    
    // Sort by relevance (exact matches first)
    matches.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aExact = aName === searchTermLower ? 0 : 1;
      const bExact = bName === searchTermLower ? 0 : 1;
      
      if (aExact !== bExact) {
        return aExact - bExact;
      }
      
      // Then sort alphabetically
      return aName.localeCompare(bName);
    });
    
    // Limit results
    return matches.slice(0, limit);
  }
}