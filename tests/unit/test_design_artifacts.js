// Unit tests for Design Artifacts model
import { test, expect, describe } from 'vitest';
import { DesignArtifacts } from '../../../src/models/design-artifacts.js';

describe('DesignArtifacts Model', () => {
  test('should create design artifacts with provided parameters', () => {
    const artifacts = new DesignArtifacts(
      './research.md',
      './data-model.md',
      ['./contracts/api.json'],
      './quickstart.md'
    );

    expect(artifacts.researchDoc).toBe('./research.md');
    expect(artifacts.dataModelDoc).toBe('./data-model.md');
    expect(artifacts.contractFiles).toHaveLength(1);
    expect(artifacts.contractFiles[0]).toBe('./contracts/api.json');
    expect(artifacts.quickstartDoc).toBe('./quickstart.md');
  });

  test('should create empty design artifacts with default parameters', () => {
    const artifacts = new DesignArtifacts();

    expect(artifacts.researchDoc).toBe('');
    expect(artifacts.dataModelDoc).toBe('');
    expect(Array.isArray(artifacts.contractFiles)).toBe(true);
    expect(artifacts.contractFiles).toHaveLength(0);
    expect(artifacts.quickstartDoc).toBe('');
  });

  test('should add a contract file to artifacts', () => {
    const artifacts = new DesignArtifacts();
    artifacts.addContractFile('./new-contract.json');
    
    expect(artifacts.contractFiles).toHaveLength(1);
    expect(artifacts.contractFiles[0]).toBe('./new-contract.json');
  });

  test('should validate complete design artifacts', () => {
    const artifacts = new DesignArtifacts(
      './research.md',
      './data-model.md',
      ['./contracts/api.json'],
      './quickstart.md'
    );

    const validation = artifacts.validate();
    expect(validation.status).toBe('pass');
    expect(validation.missingArtifacts).toHaveLength(0);
  });

  test('should fail validation for artifacts without research doc', () => {
    const artifacts = new DesignArtifacts(
      '',  // Missing research doc
      './data-model.md',
      ['./contracts/api.json'],
      './quickstart.md'
    );

    const validation = artifacts.validate();
    expect(validation.status).toBe('fail');
    expect(validation.missingArtifacts).toContain('researchDoc');
  });

  test('should fail validation for artifacts without data model doc', () => {
    const artifacts = new DesignArtifacts(
      './research.md',
      '',  // Missing data model doc
      ['./contracts/api.json'],
      './quickstart.md'
    );

    const validation = artifacts.validate();
    expect(validation.status).toBe('fail');
    expect(validation.missingArtifacts).toContain('dataModelDoc');
  });

  test('should fail validation for artifacts without contract files', () => {
    const artifacts = new DesignArtifacts(
      './research.md',
      './data-model.md',
      [],  // No contract files
      './quickstart.md'
    );

    const validation = artifacts.validate();
    expect(validation.status).toBe('fail');
    expect(validation.missingArtifacts).toContain('contractFiles');
  });

  test('should fail validation for artifacts without quickstart doc', () => {
    const artifacts = new DesignArtifacts(
      './research.md',
      './data-model.md',
      ['./contracts/api.json'],
      ''  // Missing quickstart doc
    );

    const validation = artifacts.validate();
    expect(validation.status).toBe('fail');
    expect(validation.missingArtifacts).toContain('quickstartDoc');
  });

  test('should get correct summary for complete artifacts', () => {
    const artifacts = new DesignArtifacts(
      './research.md',
      './data-model.md',
      ['./contracts/api.json', './contracts/other.json'],
      './quickstart.md'
    );

    const summary = artifacts.getSummary();
    expect(summary.totalArtifacts).toBe(5); // research, data model, quickstart + 2 contracts
    expect(summary.hasResearch).toBe(true);
    expect(summary.hasDataModel).toBe(true);
    expect(summary.hasQuickstart).toBe(true);
    expect(summary.contractCount).toBe(2);
  });

  test('should get correct summary for partial artifacts', () => {
    const artifacts = new DesignArtifacts(
      './research.md',
      '',  // Missing data model
      ['./contracts/api.json'],
      ''  // Missing quickstart
    );

    const summary = artifacts.getSummary();
    expect(summary.totalArtifacts).toBe(3); // research + quickstart + 1 contract
    expect(summary.hasResearch).toBe(true);
    expect(summary.hasDataModel).toBe(false);
    expect(summary.hasQuickstart).toBe(false);
    expect(summary.contractCount).toBe(1);
  });

  test('should convert to JSON correctly', () => {
    const artifacts = new DesignArtifacts(
      './research.md',
      './data-model.md',
      ['./contracts/api.json'],
      './quickstart.md'
    );

    const json = artifacts.toJSON();
    expect(json.researchDoc).toBe('./research.md');
    expect(json.dataModelDoc).toBe('./data-model.md');
    expect(json.contractFiles).toHaveLength(1);
    expect(json.contractFiles[0]).toBe('./contracts/api.json');
    expect(json.quickstartDoc).toBe('./quickstart.md');
  });

  test('should create from JSON correctly', () => {
    const json = {
      researchDoc: './research.md',
      dataModelDoc: './data-model.md',
      contractFiles: ['./contracts/api.json', './contracts/other.json'],
      quickstartDoc: './quickstart.md'
    };

    const artifacts = DesignArtifacts.fromJSON(json);
    expect(artifacts.researchDoc).toBe('./research.md');
    expect(artifacts.dataModelDoc).toBe('./data-model.md');
    expect(artifacts.contractFiles).toHaveLength(2);
    expect(artifacts.contractFiles[0]).toBe('./contracts/api.json');
    expect(artifacts.contractFiles[1]).toBe('./contracts/other.json');
    expect(artifacts.quickstartDoc).toBe('./quickstart.md');
  });
});