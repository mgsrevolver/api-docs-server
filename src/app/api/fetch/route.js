import fs from 'fs';
import path from 'path';
import { fetchSendGridDocumentation } from '@/lib/fetchers/sendgrid';

// Ensure the data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
}

// Save documentation to disk
function saveDocs(docs) {
  const dataDir = ensureDataDir();
  fs.writeFileSync(
    path.join(dataDir, 'documentation.json'),
    JSON.stringify(docs, null, 2)
  );
}

// Get current documentation from disk
function getCurrentDocs() {
  const dataDir = ensureDataDir();
  const docsPath = path.join(dataDir, 'documentation.json');
  if (fs.existsSync(docsPath)) {
    return JSON.parse(fs.readFileSync(docsPath, 'utf8'));
  }
  return {};
}

// Fetch all documentation
async function fetchAllDocumentation() {
  const results = {};
  const errors = [];

  try {
    // Fetch SendGrid documentation
    console.log('Fetching SendGrid documentation...');
    const sendgridData = await fetchSendGridDocumentation();
    results.sendgrid = sendgridData;
    console.log('SendGrid documentation fetched successfully');
  } catch (error) {
    console.error('Error fetching SendGrid documentation:', error);
    errors.push(`SendGrid: ${error.message}`);
  }

  return { results, errors };
}

export async function GET(request) {
  try {
    // Check for API key (simple security)
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (key !== 'dev-key') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch documentation
    const { results, errors } = await fetchAllDocumentation();

    // Save to disk
    saveDocs(results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Documentation fetched and saved successfully',
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in fetch route:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
