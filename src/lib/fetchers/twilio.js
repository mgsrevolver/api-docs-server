// src/lib/fetchers/twilioFetcher.js
import axios from 'axios';
import * as cheerio from 'cheerio';
import { saveDocumentation } from '../storage';

// Base URLs for Twilio documentation
const API_REF_URL = 'https://www.twilio.com/docs/api/rest';
const API_ENDPOINTS = [
  { name: 'SMS', url: 'https://www.twilio.com/docs/sms/api' },
  { name: 'Voice', url: 'https://www.twilio.com/docs/voice/api' },
  { name: 'Verify', url: 'https://www.twilio.com/docs/verify/api' },
  {
    name: 'Conversations',
    url: 'https://www.twilio.com/docs/conversations/api',
  },
  { name: 'Programmable Chat', url: 'https://www.twilio.com/docs/chat/rest' },
  { name: 'Programmable Video', url: 'https://www.twilio.com/docs/video/api' },
];

/**
 * Fetches comprehensive documentation from Twilio's API reference
 */
export async function fetchTwilioDocs() {
  console.log('Fetching Twilio documentation...');

  try {
    // Initialize our documentation object
    const documentation = {
      name: 'Twilio',
      description:
        'Twilio APIs for voice, video, messaging, authentication, and more',
      baseUrl: 'https://api.twilio.com/',
      endpoints: [],
      categories: [],
      lastUpdated: new Date().toISOString(),
    };

    // First fetch the main API reference page to get overall structure
    const mainResponse = await axios.get(API_REF_URL);
    const main$ = cheerio.load(mainResponse.data);

    // Extract the main API description
    const apiDescription = main$('.docs-content p').first().text().trim();
    if (apiDescription) {
      documentation.description = apiDescription;
    }

    // Process each API category
    for (const endpoint of API_ENDPOINTS) {
      console.log(`Processing Twilio ${endpoint.name} API...`);

      try {
        const categoryResponse = await axios.get(endpoint.url);
        const $ = cheerio.load(categoryResponse.data);

        // Create a category object
        const category = {
          name: endpoint.name,
          description: $('.docs-content p').first().text().trim(),
          endpoints: [],
        };

        // Extract endpoints from this category page
        $('.docs-content table tbody tr').each((i, el) => {
          // Extract the method and path (usually in the first column)
          const methodCell = $(el).find('td').first();
          const methodText = methodCell.text().trim();

          // Look for HTTP methods (GET, POST, DELETE, PUT)
          const methodMatch = methodText.match(/\b(GET|POST|DELETE|PUT)\b/i);
          const method = methodMatch ? methodMatch[0].toUpperCase() : '';

          // Extract path - often follows the HTTP method
          let path = '';
          const pathMatch = methodText.match(/\/[a-zA-Z0-9\/\-_.{}]+/);
          if (pathMatch) {
            path = pathMatch[0];
          }

          // Extract description (usually in the second column)
          const descriptionCell = $(el).find('td').eq(1);
          const description = descriptionCell.text().trim();

          // Only add if we have meaningful data
          if (method && path) {
            const endpoint = {
              method,
              path,
              description,
              category: endpoint.name,
              parameters: [],
              responses: [],
            };

            // Add to both the category and the main endpoints list
            category.endpoints.push(endpoint);
            documentation.endpoints.push(endpoint);
          }
        });

        // Also look for API endpoint descriptions that might be in headings and paragraphs
        $('.docs-content h2, .docs-content h3').each((i, el) => {
          const headingText = $(el).text().trim();

          // Look for patterns that suggest an API endpoint
          const methodMatch = headingText.match(/\b(GET|POST|DELETE|PUT)\b/i);

          if (methodMatch) {
            const method = methodMatch[0].toUpperCase();

            // Look for a path pattern
            const pathMatch = headingText.match(/\/[a-zA-Z0-9\/\-_.{}]+/);
            if (pathMatch) {
              const path = pathMatch[0];

              // Get description from the paragraph that follows
              const description = $(el).next('p').text().trim();

              const endpoint = {
                method,
                path,
                description,
                category: endpoint.name,
                parameters: [],
                responses: [],
              };

              // Add to both the category and the main endpoints list
              category.endpoints.push(endpoint);
              documentation.endpoints.push(endpoint);
            }
          }
        });

        // Extract parameters if there's a parameters table
        $('.docs-content table').each((i, table) => {
          const tableTitle = $(table)
            .prev('h2, h3, h4')
            .text()
            .trim()
            .toLowerCase();

          if (
            tableTitle.includes('parameter') ||
            tableTitle.includes('request')
          ) {
            // This might be a parameters table
            const headers = $(table)
              .find('thead th')
              .map((i, el) => $(el).text().trim())
              .get();

            // Check if this is indeed a parameters table
            const isParamsTable = headers.some(
              (header) =>
                header.toLowerCase().includes('parameter') ||
                header.toLowerCase().includes('name')
            );

            if (isParamsTable) {
              $(table)
                .find('tbody tr')
                .each((i, row) => {
                  const cells = $(row)
                    .find('td')
                    .map((i, el) => $(el).text().trim())
                    .get();

                  // Try to identify which column is which
                  let nameIndex = headers.findIndex(
                    (h) =>
                      h.toLowerCase().includes('parameter') ||
                      h.toLowerCase().includes('name')
                  );
                  let typeIndex = headers.findIndex((h) =>
                    h.toLowerCase().includes('type')
                  );
                  let requiredIndex = headers.findIndex(
                    (h) =>
                      h.toLowerCase().includes('required') ||
                      h.toLowerCase().includes('optional')
                  );
                  let descIndex = headers.findIndex((h) =>
                    h.toLowerCase().includes('description')
                  );

                  // Default indices if we couldn't identify the columns
                  if (nameIndex === -1) nameIndex = 0;
                  if (typeIndex === -1) typeIndex = 1;
                  if (requiredIndex === -1) requiredIndex = 2;
                  if (descIndex === -1)
                    descIndex = Math.min(3, cells.length - 1);

                  const param = {
                    name: cells[nameIndex] || '',
                    type:
                      typeIndex >= 0 && typeIndex < cells.length
                        ? cells[typeIndex]
                        : '',
                    required:
                      requiredIndex >= 0 && requiredIndex < cells.length
                        ? cells[requiredIndex]
                            .toLowerCase()
                            .includes('required')
                        : false,
                    description:
                      descIndex >= 0 && descIndex < cells.length
                        ? cells[descIndex]
                        : '',
                  };

                  // Find the last endpoint in this category to add parameters to
                  if (category.endpoints.length > 0 && param.name) {
                    const lastEndpoint =
                      category.endpoints[category.endpoints.length - 1];
                    lastEndpoint.parameters.push(param);

                    // Also update in the main endpoints list
                    const mainIndex = documentation.endpoints.findIndex(
                      (e) =>
                        e.method === lastEndpoint.method &&
                        e.path === lastEndpoint.path
                    );

                    if (mainIndex !== -1) {
                      documentation.endpoints[mainIndex].parameters.push(param);
                    }
                  }
                });
            }
          }
        });

        // Add the populated category to documentation
        if (category.endpoints.length > 0) {
          documentation.categories.push(category);
        }
      } catch (error) {
        console.error(`Error processing ${endpoint.name} API:`, error);
      }
    }

    // Save the fetched documentation
    await saveDocumentation('twilio', documentation);
    console.log(
      `Twilio documentation saved successfully with ${documentation.endpoints.length} endpoints.`
    );

    return documentation;
  } catch (error) {
    console.error('Error fetching Twilio documentation:', error);
    throw error;
  }
}

/**
 * Extracts parameters data from a parameters table
 */
function extractParameters($, tableSelector) {
  const parameters = [];

  $(tableSelector)
    .find('tbody tr')
    .each((i, el) => {
      const name = $(el).find('td').eq(0).text().trim();
      const description = $(el).find('td').eq(1).text().trim();
      const required = description.toLowerCase().includes('required');

      parameters.push({
        name,
        description,
        required,
      });
    });

  return parameters;
}

/**
 * Helper function to extract text from the first paragraph after a heading
 */
function getDescriptionAfterHeading($, heading) {
  return $(heading).next('p').text().trim();
}
