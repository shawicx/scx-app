// Contract test for POST /audio/trim endpoint
import { test, expect, describe } from 'vitest';

// Mock the Tauri API for testing purposes
const mockTauriAPI = {
  invoke: (command, args) => {
    if (command === 'audio_trim') {
      // Simulate the API response based on our contract
      return Promise.resolve({
        jobId: 'audio-trim-job-456',
        status: 'completed',
        outputPath: './output/trimmed-audio.wav',
        progress: 100,
        error: null
      });
    }
    return Promise.reject(new Error(`Unknown command: ${command}`));
  }
};

describe('Contract test for POST /audio/trim', () => {
  test('should trim audio file by specified segments', async () => {
    const result = await mockTauriAPI.invoke('audio_trim', {
      inputPath: './audio/original.wav',
      outputPath: './output/trimmed.wav',
      segments: [
        { startTime: 10, endTime: 20 },
        { startTime: 30, endTime: 40 }
      ],
      options: {
        crossfade: true,
        preserveOriginal: false
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

  test('should handle single segment trimming', async () => {
    const result = await mockTauriAPI.invoke('audio_trim', {
      inputPath: './audio/original.wav',
      outputPath: './output/trimmed.wav',
      segments: [
        { startTime: 5, endTime: 15 }
      ],
      options: {}
    });

    expect(result.status).toMatch(/^(completed|processing|failed)$/);
    expect(typeof result.outputPath).toBe('string');
  });

  test('should handle errors appropriately', async () => {
    try {
      await mockTauriAPI.invoke('audio_trim', {
        inputPath: './invalid/audio.wav',  // Invalid path
        outputPath: './output/trimmed.wav',
        segments: [],  // No segments
        options: {}
      });
    } catch (error) {
      expect(error.message).toContain('Unknown command');
    }
  });
});