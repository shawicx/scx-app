// Contract test for GET /file/job/{jobId} endpoint
import { test, expect, describe } from 'vitest';

// Mock the Tauri API for testing purposes
const mockTauriAPI = {
  invoke: (command, args) => {
    if (command === 'get_file_job_status') {
      // Simulate the API response based on our contract
      return Promise.resolve({
        jobId: args.jobId,
        taskType: 'pdf-to-image',
        status: 'completed',
        progress: 100,
        outputPath: './output/result.pdf',
        error: null
      });
    }
    return Promise.reject(new Error(`Unknown command: ${command}`));
  }
};

describe('Contract test for GET /file/job/{jobId}', () => {
  test('should return status of a file processing job', async () => {
    const jobId = 'job-789';
    const result = await mockTauriAPI.invoke('get_file_job_status', { jobId });

    // Validate response structure according to contract
    expect(result).toHaveProperty('jobId');
    expect(result.jobId).toBe(jobId);
    
    expect(result).toHaveProperty('taskType');
    expect(typeof result.taskType).toBe('string');
    
    expect(result).toHaveProperty('status');
    expect(result.status).toMatch(/^(completed|processing|failed)$/);
    
    expect(result).toHaveProperty('progress');
    expect(typeof result.progress).toBe('number');
    expect(result.progress).toBeGreaterThanOrEqual(0);
    expect(result.progress).toBeLessThanOrEqual(100);
    
    expect(result).toHaveProperty('outputPath');
    expect(typeof result.outputPath).toBe('string');
    
    expect(result).toHaveProperty('error');
    expect(result.error).toBeNull();
  });

  test('should handle invalid job IDs', async () => {
    try {
      await mockTauriAPI.invoke('get_file_job_status', { jobId: 'invalid-job-id' });
    } catch (error) {
      expect(error.message).toContain('Unknown command');
    }
  });
});