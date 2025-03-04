import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write a simple test file
    const filePath = path.join(dataDir, 'docs.json');
    const sampleData = {
      testapi: {
        name: 'Test API',
        description: 'This is just a test',
        endpoints: ['test1', 'test2'],
      },
    };

    fs.writeFileSync(filePath, JSON.stringify(sampleData, null, 2));

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'Test file written successfully',
        path: filePath,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in file test:', error);
    return new NextResponse(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
