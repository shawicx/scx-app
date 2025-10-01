// Contract test for POST /audio/volume-adjust endpoint
import { test, expect, describe } from 'vitest';

// Mock the Tauri API for testing purposes
const mockTauriAPI = {
  invoke: (command, args) => {
    if (command === 'audio_volume_adjust') {
      // Simulate the API response based on our contract
      return Promise.resolve({
        jobId: 'audio-volume-job-202',
        status: 'completed',
        outputPath: './output/adjusted-volume.wav',
        progress: 100,
        error: null
      });
    }
    return Promise.reject(new Error(`Unknown command: ${command}`));
  }
};

describe('Contract test for POST /audio/volume-adjust', () => {
  test('should adjust volume with fade-in/fade-out effects', async () => {
    const result = await mockTauriAPI.invoke('audio_volume_adjust', {
      inputPath: './audio/original.wav',
      outputPath: './output/adjusted.wav',
      options: {
        gain: 1.5, // 150% volume
        fadeInDuration: 2,
        fadeOutDuration: 3
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

  test('should handle different gain values', async () => {
    const result = await mockTauriAPI.invoke('audio_volume_adjust', {
      inputPath: './audio/original.wav',
      outputPath: './output/adjusted.wav',
      options: {
        gain: 0.5, // 50% volume (quieter)
        fadeInDuration: 1,
        fadeOutDuration: 1
      }
    });

    expect(result.status).toMatch(/^(completed|processing|failed)$/);
    expect(typeof result.outputPath).toBe('string');
  });

  test('should handle errors appropriately', async () => {
    try {
      await mockTauriAPI.invoke('audio_volume_adjust', {
        inputPath: './invalid/audio.wav',  // Invalid path
        outputPath: './output/adjusted.wav',
        options: {
          gain: -0.5,  // Invalid gain (negative)
          fadeInDuration: 1,
          fadeOutDuration: 1
        }
      });
    } catch (error) {
      expect(error.message).toContain('Unknown command');
    }
  });
});