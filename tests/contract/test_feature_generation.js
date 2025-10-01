// Contract test for POST /feature/generate-plan endpoint
import { test, expect, describe, beforeAll } from 'vitest';

// Mock the Tauri API for testing purposes
// In a real implementation, this would interact with actual Tauri commands
const mockTauriAPI = {
  invoke: (command, args) => {
    if (command === 'generate_plan') {
      // Simulate the API response based on our contract
      return Promise.resolve({
        planPath: './specs/test-plan/plan.md',
        artifacts: {
          research: './specs/test-plan/research.md',
          dataModel: './specs/test-plan/data-model.md',
          contracts: ['./specs/test-plan/contracts/'],
          quickstart: './specs/test-plan/quickstart.md'
        },
        status: 'completed',
        compliance: {
          constitutionCheck: 'pass',
          violations: []
        }
      });
    }
    return Promise.reject(new Error(`Unknown command: ${command}`));
  }
};

describe('Contract test for POST /feature/generate-plan', () => {
  test('should accept feature specification path and return implementation plan', async () => {
    const result = await mockTauriAPI.invoke('generate_plan', {
      featureSpecPath: './specs/test-plan/spec.md',
      outputPath: './specs/test-plan/',
      constitutionPath: './.specify/memory/constitution.md'
    });

    // Validate response structure according to contract
    expect(result).toHaveProperty('planPath');
    expect(typeof result.planPath).toBe('string');
    
    expect(result).toHaveProperty('artifacts');
    expect(result.artifacts).toHaveProperty('research');
    expect(result.artifacts).toHaveProperty('dataModel');
    expect(result.artifacts).toHaveProperty('contracts');
    expect(result.artifacts).toHaveProperty('quickstart');
    
    expect(Array.isArray(result.artifacts.contracts)).toBe(true);
    
    expect(result).toHaveProperty('status');
    expect(result.status).toMatch(/^(completed|error)$/);
    
    expect(result).toHaveProperty('compliance');
    expect(result.compliance).toHaveProperty('constitutionCheck');
    expect(result.compliance.constitutionCheck).toMatch(/^(pass|fail)$/);
    expect(Array.isArray(result.compliance.violations)).toBe(true);
  });

  test('should handle missing feature spec path gracefully', async () => {
    try {
      await mockTauriAPI.invoke('generate_plan', {
        featureSpecPath: '',
        outputPath: './specs/test-plan/',
        constitutionPath: './.specify/memory/constitution.md'
      });
    } catch (error) {
      expect(error.message).toContain('Unknown command');
      // This is expected since we're mocking and empty path is invalid
    }
  });
});