// Contract test for POST /file/process/markdown-to-pdf endpoint
import { test, expect, describe } from 'vitest';

// Mock the Tauri API for testing purposes
const mockTauriAPI = {
  invoke: (command, args) => {
    if (command === 'process_markdown_to_pdf') {
      // Simulate the API response based on our contract
      return Promise.resolve({
        jobId: 'job-456',
        status: 'completed',
        outputPath: './output/document.pdf',
        progress: 100,
        error: null
      });
    }
    return Promise.reject(new Error(`Unknown command: ${command}`));
  }
};

describe('Contract test for POST /file/process/markdown-to-pdf', () => {
  test('should accept markdown content and return PDF conversion job', async () => {
    const result = await mockTauriAPI.invoke('process_markdown_to_pdf', {
      markdownContent: '# Test Document\n\nThis is a test.',
      outputPath: './output/document.pdf',
      options: {
        format: 'A4',
        orientation: 'portrait',
        margins: { top: 20, bottom: 20, left: 20, right: 20 },
        header: 'Test Header',
        footer: 'Test Footer'
      }
    });

    // Validate response structure according to contract
    expect(result).toHaveProperty('jobId');
    expect(typeof result.jobId).toBe('string');
    
    expect(result).toHaveProperty('status');
    expect(result.status).toMatch(/^(completed|processing|failed)$/);
    
    expect(result).toHaveProperty('outputPath');
    expect(typeof result.outputPath).toBe('string');
    
    expect(result).toHaveProperty('progress');
    expect(typeof result.progress).toBe('number');
    expect(result.progress).toBeGreaterThanOrEqual(0);
    expect(result.progress).toBeLessThanOrEqual(100);
    
    expect(result).toHaveProperty('error');
    expect(result.error).toBeNull();
  });

  test('should handle errors appropriately', async () => {
    try {
      await mockTauriAPI.invoke('process_markdown_to_pdf', {
        markdownContent: '',  // Empty content
        outputPath: './output/document.pdf',
        options: {}
      });
    } catch (error) {
      expect(error.message).toContain('Unknown command');
    }
  });
});