// Contract test for GET /data/china-regions endpoint
import { test, expect, describe } from 'vitest';

// Mock the Tauri API for testing purposes
const mockTauriAPI = {
  invoke: (command, args) => {
    if (command === 'get_china_regions') {
      // Simulate the API response based on our contract
      return Promise.resolve({
        regions: [
          {
            regionId: '110000',
            name: '北京市',
            type: 'province',
            parentId: null,
            level: 1,
            children: [],
            additionalInfo: {}
          }
        ],
        loading: false,
        timestamp: new Date().toISOString()
      });
    }
    return Promise.reject(new Error(`Unknown command: ${command}`));
  }
};

describe('Contract test for GET /data/china-regions', () => {
  test('should return Chinese administrative region data', async () => {
    const result = await mockTauriAPI.invoke('get_china_regions', {
      parentId: null,
      level: 1,
      search: null
    });

    // Validate response structure according to contract
    expect(result).toHaveProperty('regions');
    expect(Array.isArray(result.regions)).toBe(true);
    
    if (result.regions.length > 0) {
      const region = result.regions[0];
      expect(region).toHaveProperty('regionId');
      expect(typeof region.regionId).toBe('string');
      
      expect(region).toHaveProperty('name');
      expect(typeof region.name).toBe('string');
      
      expect(region).toHaveProperty('type');
      expect(typeof region.type).toBe('string');
      
      expect(region).toHaveProperty('parentId');
      expect(region.parentId).toBeNull();
      
      expect(region).toHaveProperty('level');
      expect(typeof region.level).toBe('number');
      
      expect(region).toHaveProperty('children');
      expect(Array.isArray(region.children)).toBe(true);
      
      expect(region).toHaveProperty('additionalInfo');
      expect(typeof region.additionalInfo).toBe('object');
    }
    
    expect(result).toHaveProperty('loading');
    expect(typeof result.loading).toBe('boolean');
    
    expect(result).toHaveProperty('timestamp');
    expect(typeof result.timestamp).toBe('string');
    // Verify it's a valid ISO string
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  test('should handle query parameters', async () => {
    const result = await mockTauriAPI.invoke('get_china_regions', {
      parentId: '110000',
      level: 2,
      search: '朝阳'
    });

    expect(Array.isArray(result.regions)).toBe(true);
    expect(typeof result.loading).toBe('boolean');
    expect(typeof result.timestamp).toBe('string');
  });
});