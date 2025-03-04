// src/lib/storage.js
import fs from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'data');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

/**
 * Saves API documentation to the local filesystem
 */
export async function saveDocumentation(apiName, data) {
  const filePath = path.join(STORAGE_DIR, `${apiName}.json`);

  try {
    // Create storage directory if it doesn't exist
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }

    // Write the data to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Documentation for ${apiName} saved to ${filePath}`);

    return true;
  } catch (error) {
    console.error(`Error saving ${apiName} documentation:`, error);
    throw error;
  }
}

/**
 * Retrieves API documentation from the local filesystem
 */
export async function getDocumentation(apiName) {
  const filePath = path.join(STORAGE_DIR, `${apiName}.json`);

  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Documentation for ${apiName} not found`);
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data;
  } catch (error) {
    console.error(`Error retrieving ${apiName} documentation:`, error);
    throw error;
  }
}

/**
 * Lists all available API documentation
 */
export async function listAllDocumentation() {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      return [];
    }

    const files = fs.readdirSync(STORAGE_DIR);
    return files
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace('.json', ''));
  } catch (error) {
    console.error('Error listing documentation:', error);
    throw error;
  }
}

/**
 * Retrieves metadata for all available API documentation
 * This returns basic information about each API without the full documentation
 */
export async function getDocumentationMetadata() {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      return [];
    }

    const files = fs.readdirSync(STORAGE_DIR);
    const metadata = [];

    for (const file of files.filter((file) => file.endsWith('.json'))) {
      const apiName = file.replace('.json', '');
      const filePath = path.join(STORAGE_DIR, file);

      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        metadata.push({
          service: apiName,
          name: data.name || data.title || apiName,
          title: data.title || apiName,
          description: data.description || '',
          version: data.version || '',
          endpointCount: data.endpoints?.length || 0,
          lastUpdated: fs.statSync(filePath).mtime,
        });
      } catch (error) {
        console.error(`Error reading metadata for ${apiName}:`, error);
        // Skip this file if there's an error
      }
    }

    return metadata;
  } catch (error) {
    console.error('Error retrieving documentation metadata:', error);
    throw error;
  }
}
