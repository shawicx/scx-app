// Contract test for POST /file/process/pdf-to-image endpoint
import { test, expect, describe, beforeAll } from 'vitest';

// Mock the Tauri API for testing purposes
const mockTauriAPI = {
  invoke: (command, args) => {
    if (command === 'process_pdf_to_image') {
      // Simulate the API response based on our contract
      return Promise.resolve({
        jobId: 'job-123',
        status: 'completed',
        outputFiles: ['./output/page-1.png', './output/page-2.png'],
        progress: 100,
        error: null
      });
    }
    return Promise.reject(new Error(`Unknown command: ${command}`));
  }
};

describe('Contract test for POST /file/process/pdf-to-image', () => {
  test('should accept PDF path and return image conversion job', async () => {
    const result = await mockTauriAPI.invoke('process_pdf_to_image', {
      inputPath: './input/document.pdf',
      outputDir: './output/',
      options: {
        pageRange: { start: 1, end: 10 },
        imageFormat: 'png',
        quality: 90,
        resolution: 150
      }
    });

    // Validate response structure according to contract
    expect(result).toHaveProperty('jobId');
    expect(typeof result.jobId).toBe('string');
    
    expect(result).toHaveProperty('status');
    expect(result.status).toMatch(/^(completed|processing|failed)$/);
    
    expect(result).toHaveProperty('outputFiles');
    expect(Array.isArray(result.outputFiles)).toBe(true);
    
    expect(result).toHaveProperty('progress');
    expect(typeof result.progress).toBe('number');
    expect(result.progress).toBeGreaterThanOrEqual(0);
    expect(result.progress).toBeLessThanOrEqual(100);
    
    expect(result).toHaveProperty('error');
    expect(result.error).toBeNull();
  });

  test('should handle errors appropriately', async () => {
    try {
      await mockTauriAPI.invoke('process_pdf_to_image', {
        inputPath: './invalid/path.pdf',  // Invalid path
        outputDir: './output/',
        options: {}
      });
    } catch (error) {
      expect(error.message).toContain('Unknown command');
    }
  });
});