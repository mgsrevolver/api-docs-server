// app/api/mcp/route.js
import { NextResponse } from 'next/server';
import { getDocumentation, listDocumentation } from '@/lib/storage';

export async function POST(request) {
  try {
    console.log('MCP query request received');

    const body = await request.json();
    console.log('Request body:', body);

    const { query, api, endpoint } = body;

    // Case 1: Specific API and endpoint requested
    if (api && endpoint) {
      console.log(
        `Looking for specific docs: API=${api}, Endpoint=${endpoint}`
      );
      const docs = await getSpecificDocs(api, endpoint);
      return NextResponse.json({ docs });
    }

    // Case 2: Natural language query
    if (query) {
      console.log(`Processing natural language query: "${query}"`);
      const recommendations = await findRelevantAPIs(query);
      return NextResponse.json({ recommendations });
    }

    // Fallback - list available APIs
    console.log('No specific query provided, listing available APIs');
    const availableAPIs = await listAvailableAPIs();
    console.log('Available APIs to return:', availableAPIs);

    return NextResponse.json({
      available_apis: availableAPIs,
      suggestion: 'Try asking about a specific API or task',
    });
  } catch (error) {
    console.error('MCP query error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      {
        error: 'Failed to process MCP query',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper function to get specific API endpoint documentation
async function getSpecificDocs(api, endpoint) {
  const documentation = await getDocumentation(api.toLowerCase());

  if (!documentation) {
    return { error: `Documentation for ${api} not found` };
  }

  // Find the specific endpoint (exact or fuzzy match)
  const matchedEndpoint = documentation.endpoints.find(
    (e) =>
      e.path.toLowerCase().includes(endpoint.toLowerCase()) ||
      e.description.toLowerCase().includes(endpoint.toLowerCase())
  );

  if (!matchedEndpoint) {
    return {
      error: `Endpoint ${endpoint} not found in ${api} documentation`,
      available_endpoints: documentation.endpoints.map((e) => ({
        path: e.path,
        description: e.description,
      })),
    };
  }

  return matchedEndpoint;
}

// Helper function to find relevant APIs based on natural language query
async function findRelevantAPIs(query) {
  // Get all available APIs
  const apis = await listAvailableAPIs();
  const results = [];

  // Lowercase query for case-insensitive matching
  const lowercaseQuery = query.toLowerCase();

  // Keywords to look for in the query
  const keywords = {
    email: ['email', 'mail', 'message', 'send'],
    stats: ['stats', 'statistics', 'analytics', 'metrics', 'performance'],
    messaging: ['sms', 'text', 'message', 'notification'],
    media: ['image', 'video', 'media', 'file', 'upload'],
    search: ['search', 'find', 'query'],
  };

  // Match APIs based on the query
  for (const apiName of apis) {
    const documentation = await getDocumentation(apiName);

    if (!documentation) continue;

    // Score endpoints based on keyword relevance
    const matchedEndpoints = documentation.endpoints.filter((endpoint) => {
      const endpointText = `${endpoint.description} ${endpoint.path} ${
        endpoint.category || ''
      }`.toLowerCase();

      // Check for direct mention of the endpoint
      if (endpointText.includes(lowercaseQuery)) return true;

      // Check for keyword matches
      for (const [category, categoryKeywords] of Object.entries(keywords)) {
        if (
          categoryKeywords.some((keyword) =>
            lowercaseQuery.includes(keyword)
          ) &&
          categoryKeywords.some((keyword) => endpointText.includes(keyword))
        ) {
          return true;
        }
      }

      return false;
    });

    if (matchedEndpoints.length > 0) {
      results.push({
        api: documentation.name,
        relevance: matchedEndpoints.length,
        matched_endpoints: matchedEndpoints.map((e) => ({
          path: e.path,
          description: e.description,
          example: e.example,
        })),
      });
    }
  }

  // Sort by relevance
  return results.sort((a, b) => b.relevance - a.relevance);
}

// Helper function to list all available APIs
async function listAvailableAPIs() {
  try {
    // Get the actual list of available documentation files
    const apis = await listDocumentation();
    console.log('Available APIs:', apis);

    // If no APIs are found, return a default list
    if (!apis || apis.length === 0) {
      console.log('No APIs found, returning default list');
      return ['sendgrid'];
    }

    return apis;
  } catch (error) {
    console.error('Error listing available APIs:', error);
    // Fallback to hardcoded list in case of error
    return ['sendgrid'];
  }
}
