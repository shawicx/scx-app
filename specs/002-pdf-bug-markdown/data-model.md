# Data Model: Multi-Function Desktop App - PDF, Data & Audio Tools

## Entities

### File Processing Job
- **Description**: Represents a file processing task (PDF/image conversion, markdown/PDF conversion)
- **Attributes**: 
  - jobId: string (unique identifier)
  - taskType: string (e.g., "pdf-to-image", "markdown-to-pdf")
  - status: string (e.g., "queued", "processing", "completed", "failed")
  - inputPath: string (path to input file)
  - outputPath: string (path to output file)
  - progress: number (0-100 percentage)
  - error: string (error message if failed)
- **Relationships**: Initiated by user request for file conversion

### Audio Processing Job
- **Description**: Represents an audio processing task (recording, trimming, conversion, merging)
- **Attributes**:
  - jobId: string (unique identifier)
  - taskType: string (e.g., "record-to-text", "trim", "convert", "merge", "volume-adjust")
  - status: string (e.g., "queued", "processing", "completed", "failed")
  - inputFiles: Array<string> (paths to input audio files)
  - outputPath: string (path to output file)
  - progress: number (0-100 percentage)
  - error: string (error message if failed)
  - options: Object (task-specific options like trim start/end times, conversion format)
- **Relationships**: Initiated by user request for audio processing

### Generated Data
- **Description**: Represents random data that can be copied to clipboard
- **Attributes**:
  - dataType: string (e.g., "chinese-name", "phone", "id-card", "random-string")
  - content: string (the actual generated data)
  - generatedAt: Date (timestamp of generation)
  - copiedToClipboard: boolean (whether data has been copied)
  - copyCount: number (how many times copied to clipboard)
- **Relationships**: Created by random data generation service

### Chinese Administrative Region Data
- **Description**: Represents geographical data that can be queried and downloaded
- **Attributes**:
  - regionId: string (unique identifier for the region)
  - name: string (name of the administrative region)
  - type: string (e.g., "province", "city", "district")
  - parentId: string (ID of parent region, null for root regions)
  - level: number (hierarchical level)
  - children: Array<RegionData> (sub-regions)
  - additionalInfo: Object (metadata about the region)
- **Relationships**: Organized in a hierarchical tree structure

### Audio File
- **Description**: Represents audio files with metadata
- **Attributes**:
  - fileId: string (unique identifier)
  - fileName: string (display name)
  - filePath: string (file system path)
  - format: string (e.g., "MP3", "WAV", "FLAC", "OGG")
  - sampleRate: number (samples per second)
  - bitRate: number (bits per second)
  - duration: number (length in seconds)
  - channels: number (1 for mono, 2 for stereo, etc.)
  - size: number (file size in bytes)
  - waveform: Array<number> (processed waveform data for visualization)
  - createdAt: Date (timestamp of file creation/import)
- **Relationships**: Processed by Audio Processing Job

### Text Document
- **Description**: Represents text content that can be compared with other documents
- **Attributes**:
  - docId: string (unique identifier)
  - title: string (document title)
  - content: string (the actual text content)
  - wordCount: number (number of words)
  - lineCount: number (number of lines)
  - sections: Array<string> (sections of the document)
  - createdAt: Date (timestamp of creation)
  - lastModified: Date (timestamp of last modification)
- **Relationships**: Used in text comparison functionality

## Validation Rules
- All file paths must comply with Tauri security model and use proper permission scoping
- File processing jobs must validate file types and sizes before processing
- Audio processing jobs must validate format compatibility
- Chinese region data must maintain hierarchical integrity
- Generated data must meet format requirements for its type

## State Transitions
- File Processing Job: queued → processing → completed/failed
- Audio Processing Job: queued → processing → completed/failed
- Generated Data: created → copied/uncopied
- Chinese Administrative Region Data: requested → loading → loaded/failed
- Audio File: imported → processed → ready for operations
- Text Document: created → edited → compared/analyzed