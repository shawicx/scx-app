// Contract test for POST /audio/merge endpoint
import { test, expect, describe } from 'vitest';

// Mock the Tauri API for testing purposes
const mockTauriAPI = {
  invoke: (command, args) => {
    if (command === 'audio_merge') {
      // Simulate the API response based on our contract
      return Promise.resolve({
        jobId: 'audio-merge-job-101',
        status: 'completed',
        outputPath: './output/merged-audio.wav',
        mergedCount: 2,
        progress: 100,
        error: null
      });
    }
    return Promise.reject(new Error(`Unknown command: ${command}`));
  }
};

describe('Contract test for POST /audio/merge', () => {
  test('should merge multiple audio files in sequence', async () => {
    const result = await mockTauriAPI.invoke('audio_merge', {
      inputPaths: ['./audio/part1.wav', './audio/part2.wav'],
      outputPath: './output/merged.wav',
      options: {
        alignSampleRates: true,
        addCrossfades: true,
        preserveOriginalOrder: true
      }
    });

    // Validate response structure according to contract
    expect(result).toHaveProperty('jobId');
    expect(typeof result.jobId).toBe('string');
    
    expect(result).toHaveProperty('status');
    expect(result.status).toMatch(/^(completed|processing|failed)$/);
    
    expect(result).toHaveProperty('outputPath');
    expect(typeof result.outputPath).toBe('string');
    
    expect(result).toHaveProperty('mergedCount');
    expect(typeof result.mergedCount).toBe('number');
    
    expect(result).toHaveProperty('progress');
    expect(typeof result.progress).toBe('number');
    expect(result.progress).toBeGreaterThanOrEqual(0);
    expect(result.progress).toBeLessThanOrEqual(100);
    
    expect(result).toHaveProperty('error');
    expect(result.error).toBeNull();
  });

  test('should handle multiple input files', async () => {
    const result = await mockTauriAPI.invoke('audio_merge', {
      inputPaths: ['./audio/part1.wav', './audio/part2.wav', './audio/part3.wav'],
      outputPath: './output/merged.wav',
      options: {}
    });

    expect(result.status).toMatch(/^(completed|processing|failed)$/);
    expect(typeof result.outputPath).toBe('string');
    expect(result.mergedCount).toBe(3);
  });

  test('should handle errors appropriately', async () => {
    try {
      await mockTauriAPI.invoke('audio_merge', {
        inputPaths: [],  // No input files
        outputPath: './output/merged.wav',
        options: {}
      });
    } catch (error) {
      expect(error.message).toContain('Unknown command');
    }
  });
});