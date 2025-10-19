/**
 * File processing service handling PDF, image, and markdown operations
 * Uses Tauri backend for processing
 */
import { invoke } from '@tauri-apps/api/core';

/**
 * Convert PDF to images using Tauri backend
 * @param {string} pdfPath - Path to the PDF file
 * @param {Object} options - Conversion options
 * @returns {Promise<Object>} - Conversion result
 */
export async function convertPdfToImages(pdfPath, options = {}) {
  try {
    // Prepare options with defaults
    const opts = {
      format: options.format || 'png',
      scale: options.scale || 1.5,
      dpi: options.dpi || 150,
      ...options
    };

    // Call the Tauri command
    const result = await invoke('process_pdf_to_image', {
      request: {
        input_path: pdfPath,
        output_dir: opts.outputDir || './output',
        options: opts
      }
    });

    return result;
  } catch (error) {
    console.error('Error converting PDF to images:', error);
    throw error;
  }
}

/**
 * Convert Markdown to PDF using Tauri backend
 * @param {string} markdownContent - Markdown content to convert
 * @param {Object} options - Conversion options
 * @returns {Promise<Object>} - Conversion result
 */
export async function convertMarkdownToPdf(markdownContent, options = {}) {
  try {
    const opts = {
      format: options.format || 'A4',
      landscape: options.landscape || false,
      margin: options.margin || 20,
      outputPath: options.outputPath || `./output/markdown-${Date.now()}.pdf`,
      ...options
    };

    // 调用 Tauri 后端命令
    const result = await invoke('process_markdown_to_pdf', {
      markdown_content: markdownContent,
      output_path: opts.outputPath,
      options: opts
    });

    return result;
  } catch (error) {
    console.error('Error converting Markdown to PDF:', error);
    throw error;
  }
}

/**
 * Batch process multiple files
 * @param {Array} files - Array of file paths to process
 * @param {string} operation - Operation type ('pdf-to-image', 'markdown-to-pdf', etc.)
 * @param {Object} options - Operation options
 * @returns {Promise<Array>} - Array of results
 */
export async function batchProcessFiles(files, operation, options = {}) {
  try {
    const results = [];
    
    for (const file of files) {
      let result;
      
      switch (operation) {
        case 'pdf-to-image':
          result = await convertPdfToImages(file, options);
          break;
        case 'markdown-to-pdf':
          // This would require reading file content first
          result = await convertMarkdownToPdf(file, options);
          break;
        default:
          throw new Error(`Unsupported operation: ${operation}`);
      }
      
      results.push(result);
    }
    
    return results;
  } catch (error) {
    console.error('Error during batch processing:', error);
    throw error;
  }
}

/**
 * Get file information
 * @param {string} filePath - Path to the file
 * @returns {Promise<Object>} - File information
 */
export async function getFileInfo(filePath) {
  try {
    const result = await invoke('get_file_info', {
      filePath
    });

    return result;
  } catch (error) {
    console.error('Error getting file info:', error);
    throw error;
  }
}