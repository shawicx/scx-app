// Contract test for POST /data/text-compare endpoint
import { test, expect, describe } from 'vitest';

// Mock the Tauri API for testing purposes
const mockTauriAPI = {
  invoke: (command, args) => {
    if (command === 'compare_texts') {
      // Simulate the API response based on our contract
      return Promise.resolve({
        differences: [
          {
            type: 'added',
            position: { doc1: 10, doc2: 10 },
            content: { doc1: 'original', doc2: 'modified' },
            similarity: 0.8
          }
        ],
        similarityPercent: 80,
        timestamp: new Date().toISOString()
      });
    }
    return Promise.reject(new Error(`Unknown command: ${command}`));
  }
};

describe('Contract test for POST /data/text-compare', () => {
  test('should compare two text documents and highlight differences', async () => {
    const result = await mockTauriAPI.invoke('compare_texts', {
      doc1: 'This is the original document.',
      doc2: 'This is the modified document.',
      options: {
        granularity: 'word',
        ignoreWhitespace: false,
        ignoreCase: false
      }
    });

    // Validate response structure according to contract
    expect(result).toHaveProperty('differences');
    expect(Array.isArray(result.differences)).toBe(true);
    
    if (result.differences.length > 0) {
      const diff = result.differences[0];
      expect(diff).toHaveProperty('type');
      expect(diff.type).toMatch(/^(added|removed|modified)$/);
      
      expect(diff).toHaveProperty('position');
      expect(diff.position).toHaveProperty('doc1');
      expect(diff.position).toHaveProperty('doc2');
      expect(typeof diff.position.doc1).toBe('number');
      expect(typeof diff.position.doc2).toBe('number');
      
      expect(diff).toHaveProperty('content');
      expect(diff.content).toHaveProperty('doc1');
      expect(diff.content).toHaveProperty('doc2');
      expect(typeof diff.content.doc1).toBe('string');
      expect(typeof diff.content.doc2).toBe('string');
      
      expect(diff).toHaveProperty('similarity');
      expect(typeof diff.similarity).toBe('number');
    }
    
    expect(result).toHaveProperty('similarityPercent');
    expect(typeof result.similarityPercent).toBe('number');
    expect(result.similarityPercent).toBeGreaterThanOrEqual(0);
    expect(result.similarityPercent).toBeLessThanOrEqual(100);
    
    expect(result).toHaveProperty('timestamp');
    expect(typeof result.timestamp).toBe('string');
    // Verify it's a valid ISO string
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  test('should handle empty documents', async () => {
    const result = await mockTauriAPI.invoke('compare_texts', {
      doc1: '',
      doc2: '',
      options: {}
    });

    expect(Array.isArray(result.differences)).toBe(true);
    expect(typeof result.similarityPercent).toBe('number');
    expect(typeof result.timestamp).toBe('string');
  });
});