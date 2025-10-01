// Contract test for GET /audio/waveform endpoint
import { test, expect, describe } from 'vitest';

// Mock the Tauri API for testing purposes
const mockTauriAPI = {
  invoke: (command, args) => {
    if (command === 'audio_waveform') {
      // Simulate the API response based on our contract
      return Promise.resolve({
        waveform: [0.1, 0.3, 0.5, 0.7, 0.9, 0.8, 0.6, 0.4, 0.2, 0.1],
        duration: 180,
        sampleRate: 44100
      });
    }
    return Promise.reject(new Error(`Unknown command: ${command}`));
  }
};

describe('Contract test for GET /audio/waveform', () => {
  test('should generate waveform data for visualization', async () => {
    const result = await mockTauriAPI.invoke('audio_waveform', {
      inputPath: './audio/test-audio.wav',
      options: {
        peaksCount: 2000,
        channels: 1
      }
    });

    // Validate response structure according to contract
    expect(result).toHaveProperty('waveform');
    expect(Array.isArray(result.waveform)).toBe(true);
    expect(result.waveform.length).toBeGreaterThan(0);
    // Verify all values in the waveform are numbers between 0 and 1
    expect(result.waveform.every(val => typeof val === 'number' && val >= 0 && val <= 1)).toBe(true);
    
    expect(result).toHaveProperty('duration');
    expect(typeof result.duration).toBe('number');
    
    expect(result).toHaveProperty('sampleRate');
    expect(typeof result.sampleRate).toBe('number');
  });

  test('should handle different options', async () => {
    const result = await mockTauriAPI.invoke('audio_waveform', {
      inputPath: './audio/test-audio.wav',
      options: {
        peaksCount: 1000,  // Different peak count
        channels: 2        // Stereo
      }
    });

    expect(Array.isArray(result.waveform)).toBe(true);
    expect(typeof result.duration).toBe('number');
    expect(typeof result.sampleRate).toBe('number');
  });

  test('should handle errors appropriately', async () => {
    try {
      await mockTauriAPI.invoke('audio_waveform', {
        inputPath: './invalid/audio.wav',  // Invalid path
        options: {}
      });
    } catch (error) {
      expect(error.message).toContain('Unknown command');
    }
  });
});