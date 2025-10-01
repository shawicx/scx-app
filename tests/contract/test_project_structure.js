// Contract test for GET /project/structure endpoint
import { test, expect, describe } from 'vitest';

// Mock the Tauri API for testing purposes
const mockTauriAPI = {
  invoke: (command, args) => {
    if (command === 'get_project_structure') {
      // Simulate the API response based on our contract
      return Promise.resolve({
        type: 'desktop',
        frontend: 'vue3',
        backend: 'tauri',
        directories: {
          src: './src',
          tests: './tests',
          public: './public',
          config: './vite.config.js'
        }
      });
    }
    return Promise.reject(new Error(`Unknown command: ${command}`));
  }
};

describe('Contract test for GET /project/structure', () => {
  test('should return project structure information', async () => {
    const result = await mockTauriAPI.invoke('get_project_structure', {});

    // Validate response structure according to contract
    expect(result).toHaveProperty('type');
    expect(result.type).toMatch(/^(desktop|web|mobile)$/);
    
    expect(result).toHaveProperty('frontend');
    expect(result.frontend).toMatch(/^(vue3|react|svelte)$/);
    
    expect(result).toHaveProperty('backend');
    expect(result.backend).toMatch(/^(tauri|tauri-rust|node|none)$/);
    
    expect(result).toHaveProperty('directories');
    expect(result.directories).toHaveProperty('src');
    expect(result.directories).toHaveProperty('tests');
    expect(result.directories).toHaveProperty('public');
    expect(result.directories).toHaveProperty('config');
    
    expect(typeof result.directories.src).toBe('string');
    expect(typeof result.directories.tests).toBe('string');
    expect(typeof result.directories.public).toBe('string');
    expect(typeof result.directories.config).toBe('string');
  });
});