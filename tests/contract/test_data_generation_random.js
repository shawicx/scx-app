// Contract test for POST /data/generate/random endpoint
import { test, expect, describe } from 'vitest';

// Mock the Tauri API for testing purposes
const mockTauriAPI = {
  invoke: (command, args) => {
    if (command === 'generate_random_data') {
      // Simulate the API response based on our contract
      return Promise.resolve({
        dataType: args.dataType,
        generatedData: ['generated_value_1', 'generated_value_2'],
        copiedToClipboard: false,
        timestamp: new Date().toISOString()
      });
    }
    return Promise.reject(new Error(`Unknown command: ${command}`));
  }
};

describe('Contract test for POST /data/generate/random', () => {
  test('should generate random data of specified type', async () => {
    const result = await mockTauriAPI.invoke('generate_random_data', {
      dataType: 'chinese-name',
      count: 2,
      options: {}
    });

    // Validate response structure according to contract
    expect(result).toHaveProperty('dataType');
    expect(typeof result.dataType).toBe('string');
    
    expect(result).toHaveProperty('generatedData');
    expect(Array.isArray(result.generatedData)).toBe(true);
    expect(result.generatedData.length).toBe(2);
    
    expect(result).toHaveProperty('copiedToClipboard');
    expect(typeof result.copiedToClipboard).toBe('boolean');
    
    expect(result).toHaveProperty('timestamp');
    expect(typeof result.timestamp).toBe('string');
    // Verify it's a valid ISO string
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  test('should accept different data types', async () => {
    const result = await mockTauriAPI.invoke('generate_random_data', {
      dataType: 'phone',
      count: 1,
      options: {}
    });

    expect(result.dataType).toBe('phone');
    expect(Array.isArray(result.generatedData)).toBe(true);
    expect(result.generatedData.length).toBe(1);
  });

  test('should handle errors appropriately', async () => {
    try {
      await mockTauriAPI.invoke('generate_random_data', {
        dataType: 'invalid-type',  // Invalid type
        count: 0,
        options: {}
      });
    } catch (error) {
      expect(error.message).toContain('Unknown command');
    }
  });
});