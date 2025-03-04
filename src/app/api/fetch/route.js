import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fetchTwilioDocumentation } from '@/lib/fetchers/twilio';
import { fetchSendGridDocumentation } from '@/lib/fetchers/sendgrid';

// Ensure the data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
}

// Save the fetched documentation to a JSON file
function saveDocs(docs) {
  const dataDir = ensureDataDir();
  const filePath = path.join(dataDir, 'docs.json');
  fs.writeFileSync(filePath, JSON.stringify(docs, null, 2));
}

// Get the current documentation if it exists
function getCurrentDocs() {
  const filePath = path.join(process.cwd(), 'data', 'docs.json');
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return {};
}

// Fetch documentation from all sources
async function fetchAllDocumentation() {
  const results = {};
  const errors = [];

  try {
    // Fetch Twilio documentation
    console.log('Fetching Twilio documentation...');
    const twilioData = await fetchTwilioDocumentation();
    results.twilio = twilioData;
    console.log('Twilio documentation fetched successfully');
  } catch (error) {
    console.error('Error fetching Twilio documentation:', error);
    errors.push(`Twilio: ${error.message}`);
  }

  try {
    // Fetch SendGrid documentation
    console.log('Fetching SendGrid documentation...');
    const sendGridData = await fetchSendGridDocumentation();
    results.sendgrid = sendGridData;
    console.log('SendGrid documentation fetched successfully');
  } catch (error) {
    console.error('Error fetching SendGrid documentation:', error);
    errors.push(`SendGrid: ${error.message}`);
  }

  // Add placeholder for Cloudinary (to be implemented)
  results.cloudinary = {
    status: 'Not implemented yet',
    message: 'Cloudinary documentation fetching will be added in the future',
  };

  return { results, errors };
}

export async function GET(request) {
  console.log('Fetch endpoint called');

  // Check for admin key to prevent unauthorized fetching
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  // Super basic security - you should use a proper auth system in production
  if (key !== process.env.ADMIN_KEY && key !== 'dev-key') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Starting documentation fetch...');

    // Test writing to the data directory
    const dataDir = ensureDataDir();
    console.log('Data directory ensured:', dataDir);

    const testFilePath = path.join(dataDir, 'test.txt');
    try {
      fs.writeFileSync(testFilePath, 'Test write');
      console.log('Successfully wrote test file');
      fs.unlinkSync(testFilePath); // Delete test file
    } catch (writeError) {
      console.error('Error writing test file:', writeError);
      return NextResponse.json(
        {
          error: 'Cannot write to data directory',
          details: writeError.message,
        },
        { status: 500 }
      );
    }

    const { results, errors } = await fetchAllDocumentation();
    console.log(
      'Fetch completed with',
      Object.keys(results).length,
      'APIs and',
      errors.length,
      'errors'
    );

    // Get current docs and merge with new ones
    const currentDocs = getCurrentDocs();
    console.log('Current docs has', Object.keys(currentDocs).length, 'APIs');

    const mergedDocs = { ...currentDocs, ...results };
    console.log('Merged docs has', Object.keys(mergedDocs).length, 'APIs');

    // Save the merged docs
    try {
      saveDocs(mergedDocs);
      console.log('Successfully saved merged docs');
    } catch (saveError) {
      console.error('Error saving merged docs:', saveError);
      return NextResponse.json(
        { error: 'Failed to save documentation', details: saveError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Documentation fetched and saved successfully',
      apis: Object.keys(mergedDocs),
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error in fetch endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch documentation',
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
