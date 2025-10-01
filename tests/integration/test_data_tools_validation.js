// Integration test for Data Tools Validation
import { test, expect, describe } from 'vitest';

// Mock the Tauri API for testing purposes
const mockTauriAPI = {
  invoke: (command, args) => {
    if (command === 'generate_random_data') {
      return Promise.resolve({
        dataType: args.dataType,
        generatedData: ['generated_value'],
        copiedToClipboard: args.dataType === 'chinese-name' ? true : false, // Specific to copy functionality
        timestamp: new Date().toISOString()
      });
    } else if (command === 'copy_to_clipboard') {
      return Promise.resolve({
        success: true,
        timestamp: new Date().toISOString()
      });
    } else if (command === 'get_china_regions') {
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

describe('Integration test: Data Tools Validation', () => {
  test('should generate random data and copy to clipboard with visual feedback', async () => {
    // Generate random data
    const generateResult = await mockTauriAPI.invoke('generate_random_data', {
      dataType: 'chinese-name',
      count: 1,
      options: {}
    });

    // Validate generated data
    expect(generateResult).toHaveProperty('dataType');
    expect(generateResult.dataType).toBe('chinese-name');
    expect(Array.isArray(generateResult.generatedData)).toBe(true);
    expect(generateResult.generatedData.length).toBe(1);

    // Try to copy to clipboard
    const copyResult = await mockTauriAPI.invoke('copy_to_clipboard', {
      data: generateResult.generatedData[0]
    });

    // Validate clipboard copy
    expect(copyResult).toHaveProperty('success');
    expect(copyResult.success).toBe(true);
  });

  test('should provide loading feedback for Chinese regions query', async () => {
    const result = await mockTauriAPI.invoke('get_china_regions', {
      parentId: null,
      level: 1,
      search: null
    });

    // Validate the region data query response
    expect(result).toHaveProperty('regions');
    expect(Array.isArray(result.regions)).toBe(true);
    
    expect(result).toHaveProperty('loading');
    expect(typeof result.loading).toBe('boolean');
    
    expect(result).toHaveProperty('timestamp');
    expect(typeof result.timestamp).toBe('string');
  });

  test('should handle different data types', async () => {
    const result = await mockTauriAPI.invoke('generate_random_data', {
      dataType: 'phone',
      count: 3,
      options: {}
    });

    expect(result.dataType).toBe('phone');
    expect(Array.isArray(result.generatedData)).toBe(true);
    expect(result.generatedData.length).toBe(3);
  });
});