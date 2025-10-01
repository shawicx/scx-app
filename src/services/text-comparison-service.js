/**
 * Text Comparison Service
 * Handles comparing text documents and highlighting differences
 */
import { TextDocument } from '../models/text-document.js';
import { invoke } from '@tauri-apps/api/core';

export class TextComparisonService {
  constructor() {
    this.comparisonHistory = new Map();
    this.activeComparisons = new Map();
  }

  /**
   * Compare two text documents and highlight differences
   * @param {string} doc1 - First document content
   * @param {string} doc2 - Second document content
   * @param {Object} options - Comparison options
   * @returns {Promise<Object>} Comparison result with differences
   */
  async compareTexts(doc1, doc2, options = {}) {
    // Validate inputs
    if (typeof doc1 !== 'string') {
      throw new Error('First document must be a string');
    }
    
    if (typeof doc2 !== 'string') {
      throw new Error('Second document must be a string');
    }

    // Set default options
    const comparisonOptions = {
      granularity: options.granularity || 'line',
      ignoreWhitespace: options.ignoreWhitespace || false,
      ignoreCase: options.ignoreCase || false,
      ...options
    };

    // Generate a unique comparison ID
    const comparisonId = this.generateComparisonId();
    
    // Create a comparison entry
    const comparisonEntry = {
      id: comparisonId,
      doc1: doc1,
      doc2: doc2,
      options: comparisonOptions,
      status: 'processing',
      startedAt: new Date().toISOString()
    };
    
    // Add to active comparisons
    this.activeComparisons.set(comparisonId, comparisonEntry);
    
    try {
      // Call the Tauri backend to compare texts
      const response = await invoke('compare_texts', {
        request: {
          doc1: doc1,
          doc2: doc2,
          options: comparisonOptions
        }
      });

      // Create result from the response
      const result = {
        differences: response.differences,
        similarityPercent: response.similarityPercent,
        timestamp: response.timestamp,
        options: comparisonOptions
      };
      
      // Update comparison entry
      comparisonEntry.result = result;
      comparisonEntry.status = 'completed';
      comparisonEntry.completedAt = new Date().toISOString();
      
      // Move from active to history
      this.activeComparisons.delete(comparisonId);
      this.comparisonHistory.set(comparisonId, comparisonEntry);
      
      return result;
    } catch (error) {
      // Update comparison entry with error
      comparisonEntry.status = 'failed';
      comparisonEntry.error = error.message;
      comparisonEntry.completedAt = new Date().toISOString();
      
      // Move from active to history
      this.activeComparisons.delete(comparisonId);
      this.comparisonHistory.set(comparisonId, comparisonEntry);
      
      throw new Error(`Failed to compare texts: ${error.message}`);
    }
  }

  /**
   * Compare two texts character by character
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {Object} Comparison result with differences and similarity
   */
  compareByCharacter(text1, text2) {
    const differences = [];
    let matchedChars = 0;
    const maxLength = Math.max(text1.length, text2.length);
    
    // Compare character by character
    for (let i = 0; i < maxLength; i++) {
      const char1 = i < text1.length ? text1[i] : null;
      const char2 = i < text2.length ? text2[i] : null;
      
      if (char1 === char2) {
        matchedChars++;
      } else {
        // Record difference
        differences.push({
          type: char1 === null ? 'added' : char2 === null ? 'removed' : 'modified',
          position: {
            doc1: i,
            doc2: i
          },
          content: {
            doc1: char1,
            doc2: char2
          },
          similarity: char1 && char2 ? this.calculateStringSimilarity(char1, char2) : 0
        });
      }
    }
    
    const similarityPercent = maxLength > 0 ? Math.round((matchedChars / maxLength) * 100) : 100;
    
    return {
      differences: differences,
      similarityPercent: similarityPercent
    };
  }

  /**
   * Compare two texts word by word
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {Object} Comparison result with differences and similarity
   */
  compareByWord(text1, text2) {
    // Split into words
    const words1 = text1.split(/\s+/).filter(word => word.length > 0);
    const words2 = text2.split(/\s+/).filter(word => word.length > 0);
    
    const differences = [];
    let matchedWords = 0;
    const maxLength = Math.max(words1.length, words2.length);
    
    // Compare word by word
    for (let i = 0; i < maxLength; i++) {
      const word1 = i < words1.length ? words1[i] : null;
      const word2 = i < words2.length ? words2[i] : null;
      
      if (word1 === word2) {
        matchedWords++;
      } else {
        // Record difference
        differences.push({
          type: word1 === null ? 'added' : word2 === null ? 'removed' : 'modified',
          position: {
            doc1: i,
            doc2: i
          },
          content: {
            doc1: word1,
            doc2: word2
          },
          similarity: word1 && word2 ? this.calculateStringSimilarity(word1, word2) : 0
        });
      }
    }
    
    const similarityPercent = maxLength > 0 ? Math.round((matchedWords / maxLength) * 100) : 100;
    
    return {
      differences: differences,
      similarityPercent: similarityPercent
    };
  }

  /**
   * Compare two texts line by line
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {Object} Comparison result with differences and similarity
   */
  compareByLine(text1, text2) {
    // Split into lines
    const lines1 = text1.split(/\r?\n/);
    const lines2 = text2.split(/\r?\n/);
    
    const differences = [];
    let matchedLines = 0;
    const maxLength = Math.max(lines1.length, lines2.length);
    
    // Compare line by line
    for (let i = 0; i < maxLength; i++) {
      const line1 = i < lines1.length ? lines1[i] : null;
      const line2 = i < lines2.length ? lines2[i] : null;
      
      if (line1 === line2) {
        matchedLines++;
      } else {
        // Record difference
        differences.push({
          type: line1 === null ? 'added' : line2 === null ? 'removed' : 'modified',
          position: {
            doc1: i,
            doc2: i
          },
          content: {
            doc1: line1,
            doc2: line2
          },
          similarity: line1 && line2 ? this.calculateStringSimilarity(line1, line2) : 0
        });
      }
    }
    
    const similarityPercent = maxLength > 0 ? Math.round((matchedLines / maxLength) * 100) : 100;
    
    return {
      differences: differences,
      similarityPercent: similarityPercent
    };
  }

  /**
   * Calculate granular similarity metrics
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @param {Object} options - Comparison options
   * @returns {Object} Granular similarity metrics
   */
  calculateGranularSimilarity(text1, text2, options) {
    // Calculate various similarity metrics
    const charSimilarity = this.calculateCharacterSimilarity(text1, text2);
    const wordSimilarity = this.calculateWordSimilarity(text1, text2);
    const lineSimilarity = this.calculateLineSimilarity(text1, text2);
    const jaccardSimilarity = this.calculateJaccardSimilarity(text1, text2);
    
    return {
      character: charSimilarity,
      word: wordSimilarity,
      line: lineSimilarity,
      jaccard: jaccardSimilarity
    };
  }

  /**
   * Calculate character-level similarity
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {number} Character similarity percentage
   */
  calculateCharacterSimilarity(text1, text2) {
    if (text1 === text2) return 100;
    if (text1.length === 0 && text2.length === 0) return 100;
    if (text1.length === 0 || text2.length === 0) return 0;
    
    // Simple Levenshtein distance-based similarity
    const distance = this.calculateLevenshteinDistance(text1, text2);
    const maxLength = Math.max(text1.length, text2.length);
    const similarity = ((maxLength - distance) / maxLength) * 100;
    
    return Math.round(similarity);
  }

  /**
   * Calculate word-level similarity
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {number} Word similarity percentage
   */
  calculateWordSimilarity(text1, text2) {
    const words1 = text1.split(/\s+/).filter(word => word.length > 0);
    const words2 = text2.split(/\s+/).filter(word => word.length > 0);
    
    if (words1.length === 0 && words2.length === 0) return 100;
    if (words1.length === 0 || words2.length === 0) return 0;
    
    // Jaccard similarity for words
    const set1 = new Set(words1);
    const set2 = new Set(words2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    if (union.size === 0) return 100;
    
    const jaccard = (intersection.size / union.size) * 100;
    return Math.round(jaccard);
  }

  /**
   * Calculate line-level similarity
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {number} Line similarity percentage
   */
  calculateLineSimilarity(text1, text2) {
    const lines1 = text1.split(/\r?\n/).filter(line => line.length > 0);
    const lines2 = text2.split(/\r?\n/).filter(line => line.length > 0);
    
    if (lines1.length === 0 && lines2.length === 0) return 100;
    if (lines1.length === 0 || lines2.length === 0) return 0;
    
    // Jaccard similarity for lines
    const set1 = new Set(lines1);
    const set2 = new Set(lines2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    if (union.size === 0) return 100;
    
    const jaccard = (intersection.size / union.size) * 100;
    return Math.round(jaccard);
  }

  /**
   * Calculate Jaccard similarity between two texts
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {number} Jaccard similarity percentage
   */
  calculateJaccardSimilarity(text1, text2) {
    const chars1 = text1.split('');
    const chars2 = text2.split('');
    
    if (chars1.length === 0 && chars2.length === 0) return 100;
    if (chars1.length === 0 || chars2.length === 0) return 0;
    
    const set1 = new Set(chars1);
    const set2 = new Set(chars2);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    if (union.size === 0) return 100;
    
    const jaccard = (intersection.size / union.size) * 100;
    return Math.round(jaccard);
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Levenshtein distance
   */
  calculateLevenshteinDistance(str1, str2) {
    if (str1 === str2) return 0;
    if (str1.length === 0) return str2.length;
    if (str2.length === 0) return str1.length;

    const matrix = [];
    
    // Initialize first row and column
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fill the matrix
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate similarity between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Similarity percentage (0-100)
   */
  calculateStringSimilarity(str1, str2) {
    if (str1 === str2) return 100;
    if (str1.length === 0 || str2.length === 0) return 0;
    
    // Simple length-based similarity
    const lengthDiff = Math.abs(str1.length - str2.length) / Math.max(str1.length, str2.length);
    return Math.round((1 - lengthDiff) * 100);
  }

  /**
   * Generate a unique comparison ID
   * @returns {string} A unique comparison ID
   */
  generateComparisonId() {
    return `text-comparison-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get comparison history
   * @returns {Array<Object>} Array of comparison history entries
   */
  getComparisonHistory() {
    return Array.from(this.comparisonHistory.values());
  }

  /**
   * Get active comparisons
   * @returns {Array<Object>} Array of active comparison entries
   */
  getActiveComparisons() {
    return Array.from(this.activeComparisons.values());
  }

  /**
   * Get a specific comparison by ID
   * @param {string} comparisonId - The ID of the comparison to get
   * @returns {Object|null} Comparison entry or null if not found
   */
  getComparisonById(comparisonId) {
    if (this.comparisonHistory.has(comparisonId)) {
      return this.comparisonHistory.get(comparisonId);
    }
    
    if (this.activeComparisons.has(comparisonId)) {
      return this.activeComparisons.get(comparisonId);
    }
    
    return null;
  }

  /**
   * Clear comparison history
   * @param {boolean} includeActive - Whether to also clear active comparisons
   */
  clearHistory(includeActive = false) {
    this.comparisonHistory.clear();
    
    if (includeActive) {
      this.activeComparisons.clear();
    }
  }

  /**
   * Get statistics about comparisons
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const totalCompleted = this.comparisonHistory.size;
    const totalActive = this.activeComparisons.size;
    
    // Calculate average similarity
    let totalSimilarity = 0;
    let similarityCount = 0;
    
    for (const entry of this.comparisonHistory.values()) {
      if (entry.result && entry.result.similarityPercent !== undefined) {
        totalSimilarity += entry.result.similarityPercent;
        similarityCount++;
      }
    }
    
    const averageSimilarity = similarityCount > 0 ? 
      Math.round(totalSimilarity / similarityCount) : 0;
    
    return {
      totalCompleted: totalCompleted,
      totalActive: totalActive,
      averageSimilarity: averageSimilarity,
      mostRecent: totalCompleted > 0 ? 
        Array.from(this.comparisonHistory.values())[totalCompleted - 1] : null
    };
  }

  /**
   * Export comparison result to various formats
   * @param {string} comparisonId - The ID of the comparison to export
   * @param {string} format - Export format (json, csv, html)
   * @returns {Promise<Object>} Export result with data and metadata
   */
  async exportComparison(comparisonId, format = 'json') {
    const comparison = this.getComparisonById(comparisonId);
    
    if (!comparison) {
      throw new Error(`Comparison with ID ${comparisonId} not found`);
    }
    
    if (comparison.status !== 'completed') {
      throw new Error('Cannot export incomplete comparison');
    }

    try {
      // Call the Tauri backend to export comparison
      const response = await invoke('export_text_comparison', {
        request: {
          comparisonId: comparisonId,
          format: format.toLowerCase()
        }
      });

      return {
        data: response.data,
        filename: response.filename,
        format: response.format,
        size: response.size,
        timestamp: response.timestamp
      };
    } catch (error) {
      throw new Error(`Failed to export comparison: ${error.message}`);
    }
  }

  /**
   * Export comparison result to CSV
   * @param {Object} comparison - Comparison entry
   * @returns {string} CSV-formatted string
   */
  exportToCsv(comparison) {
    let csv = 'Type,Position Doc1,Position Doc2,Content Doc1,Content Doc2,Similarity\n';
    
    for (const diff of comparison.result.differences) {
      csv += `"${diff.type}",${diff.position.doc1},${diff.position.doc2},"${diff.content.doc1 || ''}","${diff.content.doc2 || ''}",${diff.similarity || 0}\n`;
    }
    
    return csv;
  }

  /**
   * Export comparison result to HTML
   * @param {Object} comparison - Comparison entry
   * @returns {string} HTML-formatted string
   */
  exportToHtml(comparison) {
    let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Text Comparison Result</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .added { background-color: #d4edda; }
        .removed { background-color: #f8d7da; }
        .modified { background-color: #fff3cd; }
    </style>
</head>
<body>
    <h1>Text Comparison Result</h1>
    <p><strong>Similarity:</strong> ${comparison.result.similarityPercent}%</p>
    <p><strong>Date:</strong> ${comparison.completedAt || comparison.startedAt}</p>
    
    <table>
        <thead>
            <tr>
                <th>Type</th>
                <th>Position Doc1</th>
                <th>Position Doc2</th>
                <th>Content Doc1</th>
                <th>Content Doc2</th>
                <th>Similarity</th>
            </tr>
        </thead>
        <tbody>
`;

    for (const diff of comparison.result.differences) {
      html += `            <tr class="${diff.type}">
                <td>${diff.type}</td>
                <td>${diff.position.doc1}</td>
                <td>${diff.position.doc2}</td>
                <td>${diff.content.doc1 || ''}</td>
                <td>${diff.content.doc2 || ''}</td>
                <td>${diff.similarity || 0}</td>
            </tr>
`;
    }

    html += `        </tbody>
    </table>
</body>
</html>`;

    return html;
  }
}