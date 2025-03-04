import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

// Simple keyword matching for recommendations
function findRelevantAPIs(query) {
  const keywords = {
    sms: { api: 'twilio', endpoints: ['messaging', 'sms'] },
    email: { api: 'sendgrid', endpoints: ['mail_send', 'email_validation'] },
    verification: { api: 'twilio', endpoints: ['verify', 'authentication'] },
    images: { api: 'cloudinary', endpoints: ['upload', 'transformation'] },
    media: { api: 'cloudinary', endpoints: ['upload', 'transformation'] },
    call: { api: 'twilio', endpoints: ['voice', 'calls'] },
    phone: { api: 'twilio', endpoints: ['voice', 'phone_numbers'] },
  };

  // Very simple keyword matching
  const recommendations = [];
  const queryLower = query.toLowerCase();

  Object.keys(keywords).forEach((keyword) => {
    if (queryLower.includes(keyword)) {
      recommendations.push({
        keyword,
        ...keywords[keyword],
        confidence: 0.8, // Simple fixed confidence score
      });
    }
  });

  return recommendations.length > 0
    ? recommendations
    : [
        {
          message:
            'No specific APIs matched. Consider exploring Twilio for communication, SendGrid for email, or Cloudinary for media.',
        },
      ];
}

// Get all available APIs from our storage
function listAvailableAPIs() {
  try {
    const dataFilePath = path.join(process.cwd(), 'data', 'docs.json');

    // Check if file exists
    if (!fs.existsSync(dataFilePath)) {
      return ['twilio', 'sendgrid', 'cloudinary']; // Default list if file doesn't exist yet
    }

    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    return Object.keys(data);
  } catch (error) {
    console.error('Error listing APIs:', error);
    return ['twilio', 'sendgrid', 'cloudinary']; // Fallback to default list
  }
}

// Get specific documentation for an API and endpoint
function getSpecificDocs(api, endpoint) {
  try {
    const dataFilePath = path.join(process.cwd(), 'data', 'docs.json');

    // Check if file exists
    if (!fs.existsSync(dataFilePath)) {
      return { error: 'Documentation not yet available. Try again later.' };
    }

    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

    // Check if the API exists
    if (!data[api]) {
      return {
        error: `API '${api}' not found`,
        available_apis: Object.keys(data),
      };
    }

    // If no specific endpoint is requested, return all endpoints for the API
    if (!endpoint) {
      return {
        api,
        endpoints: Object.keys(data[api]),
        docs: data[api],
      };
    }

    // Check if the endpoint exists
    if (!data[api][endpoint]) {
      return {
        error: `Endpoint '${endpoint}' not found for API '${api}'`,
        available_endpoints: Object.keys(data[api]),
      };
    }

    // Return the specific documentation
    return {
      api,
      endpoint,
      docs: data[api][endpoint],
    };
  } catch (error) {
    console.error('Error getting specific docs:', error);
    return { error: 'Failed to retrieve documentation' };
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const api = searchParams.get('api');
  const endpoint = searchParams.get('endpoint');
  const query = searchParams.get('query');

  // If specific API and endpoint requested
  if (api) {
    const docs = getSpecificDocs(api, endpoint);
    return NextResponse.json(docs);
  }

  // If natural language query
  if (query) {
    const recommendations = findRelevantAPIs(query);
    return NextResponse.json({ query, recommendations });
  }

  // Fallback - list available APIs
  return NextResponse.json({
    available_apis: listAvailableAPIs(),
    suggestion: 'Try asking about a specific API or task',
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { query, api, endpoint } = body;

    // If specific API and endpoint requested
    if (api) {
      const docs = getSpecificDocs(api, endpoint);
      return NextResponse.json(docs);
    }

    // If natural language query
    if (query) {
      const recommendations = findRelevantAPIs(query);
      return NextResponse.json({ query, recommendations });
    }

    // Fallback - list available APIs
    return NextResponse.json({
      available_apis: listAvailableAPIs(),
      suggestion: 'Try asking about a specific API or task',
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
