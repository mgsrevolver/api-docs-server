// src/lib/storage.js
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// Define the storage directory
const STORAGE_DIR = path.join(process.cwd(), 'data');

/**
 * Initialize the storage directory
 */
export async function initStorage() {
  try {
    // Check if storage directory exists
    if (!fs.existsSync(STORAGE_DIR)) {
      await fsPromises.mkdir(STORAGE_DIR, { recursive: true });
      console.log(`Created storage directory at ${STORAGE_DIR}`);
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw error;
  }
}

/**
 * Save documentation for a service
 * @param {string} service - Service name (e.g., 'twilio', 'sendgrid')
 * @param {object} data - Documentation data to save
 */
export async function saveDocumentation(service, data) {
  try {
    // Ensure storage is initialized
    await initStorage();

    // Ensure data directory exists
    if (!fs.existsSync(STORAGE_DIR)) {
      await fsPromises.mkdir(STORAGE_DIR, { recursive: true });
    }

    // Add timestamp
    data.lastUpdated = new Date().toISOString();

    // Create file path
    const filePath = path.join(STORAGE_DIR, `${service}.json`);

    // Convert to pretty-printed JSON and save
    const jsonData = JSON.stringify(data, null, 2);
    await fsPromises.writeFile(filePath, jsonData, 'utf8');

    console.log(`Saved ${service} documentation to ${filePath}`);
    return { success: true, path: filePath };
  } catch (error) {
    console.error(`Error saving ${service} documentation:`, error);
    throw error;
  }
}

/**
 * Get documentation for a service
 * @param {string} service - Service name (e.g., 'twilio', 'sendgrid')
 * @returns {object} Documentation data
 */
export async function getDocumentation(service) {
  try {
    // Create file path
    const filePath = path.join(STORAGE_DIR, `${service}.json`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Documentation for ${service} not found`);
    }

    // Read and parse file
    const jsonData = await fsPromises.readFile(filePath, 'utf8');
    const data = JSON.parse(jsonData);

    return data;
  } catch (error) {
    console.error(`Error getting ${service} documentation:`, error);
    throw error;
  }
}

/**
 * List all available documentation services
 * @returns {Array<string>} List of service names
 */
export async function listDocumentations() {
  try {
    // Ensure storage is initialized
    await initStorage();

    // Read directory
    const files = await fsPromises.readdir(STORAGE_DIR);

    // Filter JSON files and remove extension
    const services = files
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace('.json', ''));

    return services;
  } catch (error) {
    console.error('Error listing documentations:', error);
    throw error;
  }
}

/**
 * Get metadata about all available documentations
 * @returns {Array<object>} List of documentation metadata
 */
export async function getDocumentationMetadata() {
  try {
    // Get list of services
    const services = await listDocumentations();

    // Get metadata for each service
    const metadata = await Promise.all(
      services.map(async (service) => {
        try {
          const data = await getDocumentation(service);

          return {
            service,
            name: data.name || service,
            description: data.description || '',
            endpointCount: data.endpoints?.length || 0,
            categoryCount: data.categories?.length || 0,
            lastUpdated: data.lastUpdated || null,
          };
        } catch (error) {
          console.error(`Error getting metadata for ${service}:`, error);
          return {
            service,
            name: service,
            description: 'Error loading metadata',
            error: error.message,
          };
        }
      })
    );

    return metadata;
  } catch (error) {
    console.error('Error getting documentation metadata:', error);
    throw error;
  }
}
