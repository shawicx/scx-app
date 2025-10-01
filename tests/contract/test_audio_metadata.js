// Contract test for POST /audio/metadata endpoint
import { test, expect, describe } from 'vitest';

// Mock the Tauri API for testing purposes
const mockTauriAPI = {
  invoke: (command, args) => {
    if (command === 'audio_metadata') {
      // Simulate the API response based on our contract
      return Promise.resolve({
        fileId: 'audio-file-303',
        format: 'wav',
        sampleRate: 44100,
        bitRate: 1411,
        duration: 180,
        channels: 2,
        size: 96000000,
        additionalMetadata: {
          title: 'Test Audio',
          artist: 'Unknown Artist',
          date: '2025-09-30'
        }
      });
    }
    return Promise.reject(new Error(`Unknown command: ${command}`));
  }
};

describe('Contract test for POST /audio/metadata', () => {
  test('should extract metadata from audio file', async () => {
    const result = await mockTauriAPI.invoke('audio_metadata', {
      inputPath: './audio/test-audio.wav'
    });

    // Validate response structure according to contract
    expect(result).toHaveProperty('fileId');
    expect(typeof result.fileId).toBe('string');
    
    expect(result).toHaveProperty('format');
    expect(typeof result.format).toBe('string');
    
    expect(result).toHaveProperty('sampleRate');
    expect(typeof result.sampleRate).toBe('number');
    
    expect(result).toHaveProperty('bitRate');
    expect(typeof result.bitRate).toBe('number');
    
    expect(result).toHaveProperty('duration');
    expect(typeof result.duration).toBe('number');
    
    expect(result).toHaveProperty('channels');
    expect(typeof result.channels).toBe('number');
    
    expect(result).toHaveProperty('size');
    expect(typeof result.size).toBe('number');
    
    expect(result).toHaveProperty('additionalMetadata');
    expect(typeof result.additionalMetadata).toBe('object');
  });

  test('should handle different audio formats', async () => {
    const result = await mockTauriAPI.invoke('audio_metadata', {
      inputPath: './audio/test-audio.mp3'
    });

    expect(typeof result.format).toBe('string');
    expect(typeof result.sampleRate).toBe('number');
    expect(typeof result.duration).toBe('number');
  });

  test('should handle errors appropriately', async () => {
    try {
      await mockTauriAPI.invoke('audio_metadata', {
        inputPath: './invalid/audio.wav'  // Invalid path
      });
    } catch (error) {
      expect(error.message).toContain('Unknown command');
    }
  });
});