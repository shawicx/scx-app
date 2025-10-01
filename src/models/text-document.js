/**
 * Text Document model
 * Represents text content that can be compared with other documents
 */
export class TextDocument {
  /**
   * Creates a new TextDocument instance
   * @param {string} docId - Unique identifier for the document
   * @param {string} title - Title of the document
   * @param {string} content - The actual text content
   */
  constructor(docId = '', title = '', content = '') {
    this.docId = docId;
    this.title = title;
    this.content = content;
    this.wordCount = this.calculateWordCount();
    this.lineCount = this.calculateLineCount();
    this.sections = this.splitIntoSections();
    this.createdAt = new Date().toISOString();
    this.lastModified = new Date().toISOString();
  }

  /**
   * Calculates the word count of the document
   * @returns {number} Number of words in the document
   */
  calculateWordCount() {
    if (!this.content || typeof this.content !== 'string') {
      return 0;
    }
    
    // Split content by whitespace and filter out empty strings
    const words = this.content.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }

  /**
   * Calculates the line count of the document
   * @returns {number} Number of lines in the document
   */
  calculateLineCount() {
    if (!this.content || typeof this.content !== 'string') {
      return 0;
    }
    
    // Split content by newlines
    const lines = this.content.split(/\r?\n/);
    return lines.length;
  }

  /**
   * Splits the document into sections based on double line breaks
   * @returns {Array<string>} Array of text sections
   */
  splitIntoSections() {
    if (!this.content || typeof this.content !== 'string') {
      return [];
    }
    
    // Split content by double newlines (paragraphs)
    return this.content.split(/\r?\n\s*\r?\n/).map(section => section.trim()).filter(section => section.length > 0);
  }

  /**
   * Updates the document content and recalculates metadata
   * @param {string} newContent - New content for the document
   */
  updateContent(newContent) {
    if (typeof newContent !== 'string') {
      throw new Error('Content must be a string');
    }
    
    this.content = newContent;
    this.wordCount = this.calculateWordCount();
    this.lineCount = this.calculateLineCount();
    this.sections = this.splitIntoSections();
    this.lastModified = new Date().toISOString();
  }

  /**
   * Updates the document title
   * @param {string} newTitle - New title for the document
   */
  updateTitle(newTitle) {
    if (typeof newTitle !== 'string') {
      throw new Error('Title must be a string');
    }
    
    this.title = newTitle;
    this.lastModified = new Date().toISOString();
  }

  /**
   * Gets a summary of the document
   * @returns {Object} Document summary with key information
   */
  getSummary() {
    return {
      docId: this.docId,
      title: this.title,
      wordCount: this.wordCount,
      lineCount: this.lineCount,
      sectionCount: this.sections.length,
      createdAt: this.createdAt,
      lastModified: this.lastModified
    };
  }

  /**
   * Searches for a term in the document
   * @param {string} searchTerm - Term to search for
   * @param {boolean} caseSensitive - Whether the search should be case sensitive
   * @returns {Array<Object>} Array of matches with position and context
   */
  search(searchTerm, caseSensitive = false) {
    if (!searchTerm || typeof searchTerm !== 'string') {
      return [];
    }
    
    let content = this.content;
    let term = searchTerm;
    
    if (!caseSensitive) {
      content = content.toLowerCase();
      term = term.toLowerCase();
    }
    
    const results = [];
    let index = content.indexOf(term);
    
    while (index !== -1) {
      // Get context around the match (100 characters before and after)
      const start = Math.max(0, index - 100);
      const end = Math.min(content.length, index + term.length + 100);
      const context = this.content.substring(start, end);
      
      results.push({
        position: index,
        context: context,
        matchedText: this.content.substring(index, index + term.length)
      });
      
      index = content.indexOf(term, index + 1);
    }
    
    return results;
  }

  /**
   * Validates the text document data
   * @returns {Object} Validation result with status and errors
   */
  validate() {
    const errors = [];
    
    if (!this.docId || typeof this.docId !== 'string') {
      errors.push('docId is required and must be a string');
    }
    
    if (typeof this.title !== 'string') {
      errors.push('title must be a string');
    }
    
    if (typeof this.content !== 'string') {
      errors.push('content must be a string');
    }
    
    if (typeof this.wordCount !== 'number' || this.wordCount < 0) {
      errors.push('wordCount must be a non-negative number');
    }
    
    if (typeof this.lineCount !== 'number' || this.lineCount < 0) {
      errors.push('lineCount must be a non-negative number');
    }
    
    if (!Array.isArray(this.sections)) {
      errors.push('sections must be an array');
    }
    
    if (typeof this.createdAt !== 'string') {
      errors.push('createdAt must be a string (ISO date)');
    }
    
    if (typeof this.lastModified !== 'string') {
      errors.push('lastModified must be a string (ISO date)');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Converts the model to a plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      docId: this.docId,
      title: this.title,
      content: this.content,
      wordCount: this.wordCount,
      lineCount: this.lineCount,
      sections: this.sections,
      createdAt: this.createdAt,
      lastModified: this.lastModified
    };
  }

  /**
   * Creates a TextDocument instance from a plain object
   * @param {Object} obj - Plain object representation
   * @returns {TextDocument} Instance of TextDocument
   */
  static fromJSON(obj) {
    const doc = new TextDocument(obj.docId, obj.title, obj.content);
    
    if (obj.wordCount !== undefined) doc.wordCount = obj.wordCount;
    if (obj.lineCount !== undefined) doc.lineCount = obj.lineCount;
    if (obj.sections) doc.sections = obj.sections;
    if (obj.createdAt) doc.createdAt = obj.createdAt;
    if (obj.lastModified) doc.lastModified = obj.lastModified;
    
    return doc;
  }
}