// Unit tests for Implementation Plan model
import { test, expect, describe } from 'vitest';
import { ImplementationPlan } from '../../../src/models/implementation-plan.js';

describe('ImplementationPlan Model', () => {
  test('should create an implementation plan with provided parameters', () => {
    const technicalContext = {
      languageVersion: 'Vue 3',
      dependencies: ['@tauri-apps/api'],
      storage: 'Local file system',
      targetPlatform: 'Desktop',
      projectType: 'Desktop application'
    };
    
    const constitutionChecks = [
      { principle: 'Test-First', status: 'pass', details: 'TDD approach followed' }
    ];

    const plan = new ImplementationPlan(
      [{ number: 0, name: 'Research', description: 'Research phase' }],
      technicalContext,
      constitutionChecks
    );

    expect(plan.phases).toHaveLength(1);
    expect(plan.technicalContext).toBe(technicalContext);
    expect(plan.constitutionChecks).toBe(constitutionChecks);
  });

  test('should create an empty implementation plan with default parameters', () => {
    const plan = new ImplementationPlan();

    expect(Array.isArray(plan.phases)).toBe(true);
    expect(plan.phases).toHaveLength(0);
    expect(plan.technicalContext).toBe(null);
    expect(Array.isArray(plan.constitutionChecks)).toBe(true);
    expect(plan.constitutionChecks).toHaveLength(0);
  });

  test('should add a phase to the plan', () => {
    const plan = new ImplementationPlan();
    const phase = { number: 1, name: 'Design', description: 'Design phase' };
    
    plan.addPhase(phase);
    
    expect(plan.phases).toHaveLength(1);
    expect(plan.phases[0]).toBe(phase);
  });

  test('should set technical context', () => {
    const plan = new ImplementationPlan();
    const context = { languageVersion: 'Vue 3' };
    
    plan.setTechnicalContext(context);
    
    expect(plan.technicalContext).toBe(context);
  });

  test('should add a constitution check', () => {
    const plan = new ImplementationPlan();
    const check = { principle: 'Security', status: 'pass', details: 'Secure by default' };
    
    plan.addConstitutionCheck(check);
    
    expect(plan.constitutionChecks).toHaveLength(1);
    expect(plan.constitutionChecks[0]).toBe(check);
  });

  test('should validate a valid implementation plan', () => {
    const technicalContext = {
      languageVersion: 'Vue 3',
      dependencies: ['@tauri-apps/api'],
      storage: 'Local file system',
      targetPlatform: 'Desktop',
      projectType: 'Desktop application'
    };
    
    const plan = new ImplementationPlan(
      [{ number: 0, name: 'Research', description: 'Research phase' }],
      technicalContext,
      [{ principle: 'Test-First', status: 'pass', details: 'TDD approach followed' }]
    );

    const validation = plan.validate();
    expect(validation.status).toBe('pass');
    expect(validation.violations).toHaveLength(0);
  });

  test('should fail validation for plan without phases', () => {
    const technicalContext = {
      languageVersion: 'Vue 3',
      dependencies: ['@tauri-apps/api'],
      storage: 'Local file system',
      targetPlatform: 'Desktop',
      projectType: 'Desktop application'
    };
    
    const plan = new ImplementationPlan([], technicalContext, []);

    const validation = plan.validate();
    expect(validation.status).toBe('fail');
    expect(validation.violations).toContain('At least one phase is required');
  });

  test('should fail validation for plan without technical context', () => {
    const plan = new ImplementationPlan(
      [{ number: 0, name: 'Research', description: 'Research phase' }],
      null,  // No technical context
      []
    );

    const validation = plan.validate();
    expect(validation.status).toBe('fail');
    expect(validation.violations).toContain('Technical context is required');
  });

  test('should check constitutional compliance correctly', () => {
    // Plan with all checks passing should be compliant
    const compliantPlan = new ImplementationPlan(
      [],
      { languageVersion: 'Vue 3' },
      [
        { principle: 'Test-First', status: 'pass', details: 'TDD approach followed' },
        { principle: 'Security', status: 'pass', details: 'Secure by default' }
      ]
    );
    expect(compliantPlan.isConstitutionallyCompliant()).toBe(true);

    // Plan with failing check should not be compliant
    const nonCompliantPlan = new ImplementationPlan(
      [],
      { languageVersion: 'Vue 3' },
      [
        { principle: 'Test-First', status: 'pass', details: 'TDD approach followed' },
        { principle: 'Security', status: 'fail', details: 'Security issue found' }
      ]
    );
    expect(nonCompliantPlan.isConstitutionallyCompliant()).toBe(false);

    // Plan without any checks should not be compliant
    const noChecksPlan = new ImplementationPlan([], { languageVersion: 'Vue 3' }, []);
    expect(noChecksPlan.isConstitutionallyCompliant()).toBe(false);
  });

  test('should convert to JSON correctly', () => {
    const technicalContext = {
      languageVersion: 'Vue 3',
      dependencies: ['@tauri-apps/api'],
      storage: 'Local file system',
      targetPlatform: 'Desktop',
      projectType: 'Desktop application'
    };
    
    const plan = new ImplementationPlan(
      [{ number: 0, name: 'Research', description: 'Research phase' }],
      technicalContext,
      [{ principle: 'Test-First', status: 'pass', details: 'TDD approach followed' }]
    );

    const json = plan.toJSON();
    expect(json.phases).toHaveLength(1);
    expect(json.technicalContext).toBe(technicalContext);
    expect(json.constitutionChecks).toHaveLength(1);
  });

  test('should create from JSON correctly', () => {
    const json = {
      phases: [{ number: 0, name: 'Research', description: 'Research phase' }],
      technicalContext: {
        languageVersion: 'Vue 3',
        dependencies: ['@tauri-apps/api'],
        storage: 'Local file system',
        targetPlatform: 'Desktop',
        projectType: 'Desktop application'
      },
      constitutionChecks: [{ principle: 'Test-First', status: 'pass', details: 'TDD approach followed' }]
    };

    const plan = ImplementationPlan.fromJSON(json);
    expect(plan.phases).toHaveLength(1);
    expect(plan.technicalContext).toStrictEqual(json.technicalContext);
    expect(plan.constitutionChecks).toHaveLength(1);
  });
});