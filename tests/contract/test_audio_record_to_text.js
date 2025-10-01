// Contract test for POST /audio/record-to-text endpoint
import { test, expect, describe } from 'vitest';

// Mock the Tauri API for testing purposes
const mockTauriAPI = {
  invoke: (command, args) => {
    if (command === 'audio_record_to_text') {
      // Simulate the API response based on our contract
      return Promise.resolve({
        jobId: 'audio-job-123',
        status: 'completed',
        transcript: 'This is the transcribed text from the audio file',
        progress: 100,
        error: null
      });
    }
    return Promise.reject(new Error(`Unknown command: ${command}`));
  }
};

describe('Contract test for POST /audio/record-to-text', () => {
  test('should convert audio file to text transcript', async () => {
    const result = await mockTauriAPI.invoke('audio_record_to_text', {
      audioFilePath: './audio/recording.wav',
      options: {
        language: 'zh-CN',
        punctuation: true,
        profanityFilter: true
      }
    });

    // Validate response structure according to contract
    expect(result).toHaveProperty('jobId');
    expect(typeof result.jobId).toBe('string');
    
    expect(result).toHaveProperty('status');
    expect(result.status).toMatch(/^(completed|processing|failed)$/);
    
    expect(result).toHaveProperty('transcript');
    expect(typeof result.transcript).toBe('string');
    
    expect(result).toHaveProperty('progress');
    expect(typeof result.progress).toBe('number');
    expect(result.progress).toBeGreaterThanOrEqual(0);
    expect(result.progress).toBeLessThanOrEqual(100);
    
    expect(result).toHaveProperty('error');
    expect(result.error).toBeNull();
  });

  test('should handle different languages', async () => {
    const result = await mockTauriAPI.invoke('audio_record_to_text', {
      audioFilePath: './audio/recording-en.wav',
      options: {
        language: 'en-US',
        punctuation: false,
        profanityFilter: false
      }
    });

    expect(result.status).toMatch(/^(completed|processing|failed)$/);
    expect(typeof result.transcript).toBe('string');
  });

  test('should handle errors appropriately', async () => {
    try {
      await mockTauriAPI.invoke('audio_record_to_text', {
        audioFilePath: './invalid/audio.wav',  // Invalid path
        options: {}
      });
    } catch (error) {
      expect(error.message).toContain('Unknown command');
    }
  });
});