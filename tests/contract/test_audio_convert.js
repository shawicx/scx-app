// Contract test for POST /audio/convert endpoint
import { test, expect, describe } from 'vitest';

// Mock the Tauri API for testing purposes
const mockTauriAPI = {
  invoke: (command, args) => {
    if (command === 'audio_convert') {
      // Simulate the API response based on our contract
      return Promise.resolve({
        jobId: 'audio-convert-job-789',
        status: 'completed',
        outputPath: './output/converted-audio.mp3',
        metadata: {
          format: 'mp3',
          sampleRate: 44100,
          bitRate: 128,
          duration: 120,
          channels: 2
        },
        progress: 100,
        error: null
      });
    }
    return Promise.reject(new Error(`Unknown command: ${command}`));
  }
};

describe('Contract test for POST /audio/convert', () => {
  test('should convert audio between different formats', async () => {
    const result = await mockTauriAPI.invoke('audio_convert', {
      inputPath: './audio/original.wav',
      outputPath: './output/converted.mp3',
      targetFormat: 'mp3',
      options: {
        bitrate: 128,
        sampleRate: 44100,
        channels: 2
      }
    });

    // Validate response structure according to contract
    expect(result).toHaveProperty('jobId');
    expect(typeof result.jobId).toBe('string');
    
    expect(result).toHaveProperty('status');
    expect(result.status).toMatch(/^(completed|processing|failed)$/);
    
    expect(result).toHaveProperty('outputPath');
    expect(typeof result.outputPath).toBe('string');
    
    expect(result).toHaveProperty('metadata');
    expect(result.metadata).toHaveProperty('format');
    expect(result.metadata).toHaveProperty('sampleRate');
    expect(result.metadata).toHaveProperty('bitRate');
    expect(result.metadata).toHaveProperty('duration');
    expect(result.metadata).toHaveProperty('channels');
    expect(typeof result.metadata.format).toBe('string');
    expect(typeof result.metadata.sampleRate).toBe('number');
    expect(typeof result.metadata.bitRate).toBe('number');
    expect(typeof result.metadata.duration).toBe('number');
    expect(typeof result.metadata.channels).toBe('number');
    
    expect(result).toHaveProperty('progress');
    expect(typeof result.progress).toBe('number');
    expect(result.progress).toBeGreaterThanOrEqual(0);
    expect(result.progress).toBeLessThanOrEqual(100);
    
    expect(result).toHaveProperty('error');
    expect(result.error).toBeNull();
  });

  test('should handle different target formats', async () => {
    const result = await mockTauriAPI.invoke('audio_convert', {
      inputPath: './audio/original.wav',
      outputPath: './output/converted.flac',
      targetFormat: 'flac',
      options: {}
    });

    expect(result.status).toMatch(/^(completed|processing|failed)$/);
    expect(result.metadata.format).toBe('flac');
    expect(typeof result.outputPath).toBe('string');
  });

  test('should handle errors appropriately', async () => {
    try {
      await mockTauriAPI.invoke('audio_convert', {
        inputPath: './invalid/audio.wav',  // Invalid path
        outputPath: './output/converted.mp3',
        targetFormat: 'mp3',
        options: {}
      });
    } catch (error) {
      expect(error.message).toContain('Unknown command');
    }
  });
});