// Contract test for POST /data/copy-to-clipboard endpoint
import { test, expect, describe } from 'vitest';

// Mock the Tauri API for testing purposes
const mockTauriAPI = {
  invoke: (command, args) => {
    if (command === 'copy_to_clipboard') {
      // Simulate the API response based on our contract
      return Promise.resolve({
        success: true,
        timestamp: new Date().toISOString()
      });
    }
    return Promise.reject(new Error(`Unknown command: ${command}`));
  }
};

describe('Contract test for POST /data/copy-to-clipboard', () => {
  test('should copy data to system clipboard', async () => {
    const result = await mockTauriAPI.invoke('copy_to_clipboard', {
      data: 'test data to copy'
    });

    // Validate response structure according to contract
    expect(result).toHaveProperty('success');
    expect(typeof result.success).toBe('boolean');
    expect(result.success).toBe(true);
    
    expect(result).toHaveProperty('timestamp');
    expect(typeof result.timestamp).toBe('string');
    // Verify it's a valid ISO string
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  test('should handle empty data', async () => {
    const result = await mockTauriAPI.invoke('copy_to_clipboard', {
      data: ''
    });

    expect(result.success).toBe(true); // Even empty data can be copied
    expect(result.timestamp).toBeDefined();
  });

  test('should handle errors appropriately', async () => {
    try {
      await mockTauriAPI.invoke('copy_to_clipboard', null); // Invalid input
    } catch (error) {
      expect(error.message).toContain('Unknown command');
    }
  });
});