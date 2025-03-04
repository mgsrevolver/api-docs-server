// src/lib/storage.js
import fs from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'data');
const DOCS_DIR = path.join(process.cwd(), 'data', 'docs');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Ensure docs directory exists
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

/**
 * Saves API documentation to the local filesystem
 */
export async function saveDocumentation(apiName, data) {
  const docsFilePath = path.join(DOCS_DIR, `${apiName.toLowerCase()}.json`);

  try {
    // Create docs directory if it doesn't exist
    if (!fs.existsSync(DOCS_DIR)) {
      fs.mkdirSync(DOCS_DIR, { recursive: true });
    }

    // Write the data only to the docs directory
    fs.writeFileSync(docsFilePath, JSON.stringify(data, null, 2));

    console.log(`Documentation for ${apiName} saved to ${docsFilePath}`);

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
  const docsFilePath = path.join(DOCS_DIR, `${apiName.toLowerCase()}.json`);

  try {
    // Try the new docs location first
    if (fs.existsSync(docsFilePath)) {
      const data = JSON.parse(fs.readFileSync(docsFilePath, 'utf8'));
      return data;
    }

    // Fall back to the original location
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return data;
    }

    // If neither exists, throw an error
    throw new Error(`Documentation for ${apiName} not found`);
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
    const result = new Set();

    // Check both directories for documentation files
    if (fs.existsSync(STORAGE_DIR)) {
      const files = fs.readdirSync(STORAGE_DIR);
      files
        .filter((file) => file.endsWith('.json'))
        .forEach((file) => result.add(file.replace('.json', '')));
    }

    if (fs.existsSync(DOCS_DIR)) {
      const files = fs.readdirSync(DOCS_DIR);
      files
        .filter((file) => file.endsWith('.json'))
        .forEach((file) => result.add(file.replace('.json', '')));
    }

    return Array.from(result);
  } catch (error) {
    console.error('Error listing documentation:', error);
    throw error;
  }
}

/**
 * List all available API documentation files (alias for MCP compatibility)
 * @returns {string[]} Array of API names
 */
export async function listDocumentation() {
  try {
    return await listAllDocumentation();
  } catch (error) {
    console.error('Error in listDocumentation:', error);
    return [];
  }
}

/**
 * Retrieves metadata for all available API documentation
 * This returns basic information about each API without the full documentation
 */
export async function getDocumentationMetadata() {
  try {
    const apiNames = await listAllDocumentation();
    const metadata = [];

    for (const apiName of apiNames) {
      try {
        const data = await getDocumentation(apiName);
        metadata.push({
          service: apiName,
          name: data.name || data.title || apiName,
          title: data.title || apiName,
          description: data.description || '',
          version: data.version || '',
          endpointCount: data.endpoints?.length || 0,
          categoryCount: data.categories?.length || 0,
          lastUpdated: data.lastUpdated || new Date().toISOString(),
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
