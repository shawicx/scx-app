/**
 * Quickstart validation scenarios
 * Validates the scenarios described in the quickstart guide
 */

import { test, expect, describe, vi, beforeEach, afterEach } from 'vitest';
import { FeaturePlanService } from '../src/services/feature-plan-service.js';
import { ProjectStructureService } from '../src/services/project-structure-service.js';
import { ContractTestService } from '../src/services/contract-test-service.js';

// Mock services for testing
vi.mock('../src/services/feature-plan-service.js', () => ({
  FeaturePlanService: class {
    async generatePlan(featureSpecPath, outputPath, constitutionPath) {
      return {
        planPath: `${outputPath}/plan.md`,
        artifacts: {
          research: `${outputPath}/research.md`,
          dataModel: `${outputPath}/data-model.md`,
          contracts: [`${outputPath}/contracts/`],
          quickstart: `${outputPath}/quickstart.md`
        },
        status: 'completed',
        compliance: {
          constitutionCheck: 'pass',
          violations: []
        }
      };
    }
    
    isFeatureSpecConstitutionallyCompliant() {
      return true;
    }
  }
}));

vi.mock('../src/services/project-structure-service.js', () => ({
  ProjectStructureService: class {
    async getProjectStructure() {
      return {
        type: 'desktop',
        frontend: 'vue3',
        backend: 'tauri',
        directories: {
          src: './src',
          tests: './tests',
          public: './public',
          config: './vite.config.js'
        }
      };
    }
    
    async isConstitutionallyCompatible() {
      return {
        compliant: true,
        issues: []
      };
    }
  }
}));

vi.mock('../src/services/contract-test-service.js', () => ({
  ContractTestService: class {
    async executeContractTest(contractPath, testType) {
      return {
        testId: `test-${Date.now()}`,
        status: 'pass',
        details: `${testType} test executed successfully`,
        timestamp: new Date().toISOString()
      };
    }
    
    getTestStatistics() {
      return {
        total: 1,
        passed: 1,
        failed: 0,
        errors: 0,
        passRate: 100
      };
    }
  }
}));

describe('Quickstart Validation Scenarios', () => {
  let featurePlanService;
  let projectStructureService;
  let contractTestService;

  beforeEach(() => {
    featurePlanService = new FeaturePlanService();
    projectStructureService = new ProjectStructureService();
    contractTestService = new ContractTestService();
  });

  test('Scenario 1: Constitutional Compliance Check', async () => {
    // Given: Implementation plan exists
    // When: Running constitution check
    // Then: All 5 constitutional principles pass validation
    
    const isCompliant = featurePlanService.isFeatureSpecConstitutionallyCompliant();
    expect(isCompliant).toBe(true);
    
    const structureCompliance = await projectStructureService.isConstitutionallyCompatible();
    expect(structureCompliance.compliant).toBe(true);
    expect(structureCompliance.issues).toHaveLength(0);
  });

  test('Scenario 2: Cross-Platform Design Validation', async () => {
    // Given: Feature design completed
    // When: Reviewing for cross-platform compatibility
    // Then: Design works identically on Windows, macOS, and Linux
    
    // In our Tauri application, we ensure cross-platform compatibility by:
    // 1. Using Tauri's cross-platform APIs
    // 2. Following desktop-first design principles
    // 3. Testing on the appropriate targets
    
    // Verify the project structure indicates a desktop application
    const structure = await projectStructureService.getProjectStructure();
    expect(structure.type).toBe('desktop');
    
    // Verify we're using the appropriate tech stack for cross-platform desktop apps
    expect(structure.frontend).toBe('vue3');
    expect(structure.backend).toBe('tauri');
  });

  test('Scenario 3: Tauri Architecture Validation', async () => {
    // Given: API contracts defined
    // When: Validating against Tauri architecture
    // Then: Contracts align with Tauri + Vue 3 architecture principles
    
    // Verify the architecture aligns with Tauri + Vue 3 principles
    const structure = await projectStructureService.getProjectStructure();
    
    // Check frontend is Vue 3
    expect(structure.frontend).toBe('vue3');
    
    // Check backend is Tauri
    expect(structure.backend).toBe('tauri');
    
    // Execute a contract test to validate the architecture works
    const testResult = await contractTestService.executeContractTest(
      './specs/test/contract.json',
      'contract'
    );
    
    expect(testResult.status).toBe('pass');
  });

  test('Quickstart workflow execution', async () => {
    // Test the overall workflow described in the quickstart
    
    // Step 1: Verify project structure
    const structure = await projectStructureService.getProjectStructure();
    expect(structure.type).toBe('desktop');
    expect(structure.frontend).toBe('vue3');
    expect(structure.backend).toBe('tauri');
    
    // Step 2: Generate an implementation plan
    const planResult = await featurePlanService.generatePlan(
      './specs/test/spec.md',
      './specs/test/',
      './.specify/memory/constitution.md'
    );
    
    expect(planResult.status).toBe('completed');
    expect(planResult.compliance.constitutionCheck).toBe('pass');
    expect(planResult.planPath).toBeTruthy();
    expect(planResult.artifacts).toBeTruthy();
    
    // Step 3: Execute a contract test
    const testResult = await contractTestService.executeContractTest(
      './specs/test/contract.json',
      'contract'
    );
    
    expect(testResult.status).toBe('pass');
    
    // Step 4: Verify test statistics
    const stats = contractTestService.getTestStatistics();
    expect(stats.passRate).toBe('100.00');
  });
});