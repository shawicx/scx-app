// Unit tests for Feature Specification model
import { test, expect, describe } from 'vitest';
import { FeatureSpecification } from '../../../src/models/feature-specification.js';

describe('FeatureSpecification Model', () => {
  test('should create a feature specification with provided parameters', () => {
    const featureSpec = new FeatureSpecification(
      'Test Feature',
      'feature/test',
      [{ id: 'FR-001', description: 'Test requirement', isTestable: true }],
      [{ id: 'US-001', description: 'Test user story', acceptanceCriteria: 'Acceptance criteria' }]
    );

    expect(featureSpec.featureName).toBe('Test Feature');
    expect(featureSpec.branch).toBe('feature/test');
    expect(featureSpec.requirements).toHaveLength(1);
    expect(featureSpec.userStories).toHaveLength(1);
  });

  test('should create an empty feature specification with default parameters', () => {
    const featureSpec = new FeatureSpecification();

    expect(featureSpec.featureName).toBe('');
    expect(featureSpec.branch).toBe('');
    expect(Array.isArray(featureSpec.requirements)).toBe(true);
    expect(featureSpec.requirements).toHaveLength(0);
    expect(Array.isArray(featureSpec.userStories)).toBe(true);
    expect(featureSpec.userStories).toHaveLength(0);
  });

  test('should validate a valid feature specification', () => {
    const featureSpec = new FeatureSpecification(
      'Valid Feature',
      'feature/valid',
      [{ id: 'FR-001', description: 'A requirement', isTestable: true }],
      [{ id: 'US-001', description: 'A user story', acceptanceCriteria: 'Acceptance criteria' }]
    );

    const validation = featureSpec.validate();
    expect(validation.status).toBe('pass');
    expect(validation.violations).toHaveLength(0);
  });

  test('should fail validation for feature specification without name', () => {
    const featureSpec = new FeatureSpecification(
      '',  // No feature name
      'feature/invalid',
      [{ id: 'FR-001', description: 'A requirement', isTestable: true }],
      [{ id: 'US-001', description: 'A user story', acceptanceCriteria: 'Acceptance criteria' }]
    );

    const validation = featureSpec.validate();
    expect(validation.status).toBe('fail');
    expect(validation.violations).toContain('Feature name is required');
  });

  test('should fail validation for feature specification without requirements', () => {
    const featureSpec = new FeatureSpecification(
      'Test Feature',
      'feature/invalid',
      [],  // No requirements
      [{ id: 'US-001', description: 'A user story', acceptanceCriteria: 'Acceptance criteria' }]
    );

    const validation = featureSpec.validate();
    expect(validation.status).toBe('fail');
    expect(validation.violations).toContain('At least one requirement is required');
  });

  test('should fail validation for feature specification without user stories', () => {
    const featureSpec = new FeatureSpecification(
      'Test Feature',
      'feature/invalid',
      [{ id: 'FR-001', description: 'A requirement', isTestable: true }],
      []  // No user stories
    );

    const validation = featureSpec.validate();
    expect(validation.status).toBe('fail');
    expect(validation.violations).toContain('At least one user story is required');
  });

  test('should check constitutional compliance correctly', () => {
    // Valid feature spec should be compliant
    const validFeatureSpec = new FeatureSpecification(
      'Valid Feature',
      'feature/valid',
      [{ id: 'FR-001', description: 'A requirement', isTestable: true }],
      [{ id: 'US-001', description: 'A user story', acceptanceCriteria: 'Acceptance criteria' }]
    );
    expect(validFeatureSpec.isConstitutionallyCompliant()).toBe(true);

    // Invalid feature spec should not be compliant
    const invalidFeatureSpec = new FeatureSpecification('', 'feature/invalid', [], []);
    expect(invalidFeatureSpec.isConstitutionallyCompliant()).toBe(false);
  });

  test('should convert to JSON correctly', () => {
    const featureSpec = new FeatureSpecification(
      'Test Feature',
      'feature/test',
      [{ id: 'FR-001', description: 'A requirement', isTestable: true }],
      [{ id: 'US-001', description: 'A user story', acceptanceCriteria: 'Acceptance criteria' }]
    );

    const json = featureSpec.toJSON();
    expect(json.featureName).toBe('Test Feature');
    expect(json.branch).toBe('feature/test');
    expect(json.requirements).toHaveLength(1);
    expect(json.userStories).toHaveLength(1);
  });

  test('should create from JSON correctly', () => {
    const json = {
      featureName: 'Test Feature',
      branch: 'feature/test',
      requirements: [{ id: 'FR-001', description: 'A requirement', isTestable: true }],
      userStories: [{ id: 'US-001', description: 'A user story', acceptanceCriteria: 'Acceptance criteria' }]
    };

    const featureSpec = FeatureSpecification.fromJSON(json);
    expect(featureSpec.featureName).toBe('Test Feature');
    expect(featureSpec.branch).toBe('feature/test');
    expect(featureSpec.requirements).toHaveLength(1);
    expect(featureSpec.userStories).toHaveLength(1);
  });
});