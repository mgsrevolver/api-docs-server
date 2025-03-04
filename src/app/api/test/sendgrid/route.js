// src/app/api/test/sendgrid/route.js
import { NextResponse } from 'next/server';
import { fetchSendGridDocumentation } from '../../../../lib/fetchers/sendgrid';
import { getDocumentation } from '../../../../lib/storage';

export async function GET(request) {
  try {
    console.log('Testing SendGrid API fetch...');

    // First, try to get existing documentation
    let docs = null;
    try {
      docs = await getDocumentation('sendgrid');
      console.log('Found existing SendGrid documentation');
    } catch (error) {
      console.log('No existing documentation found, fetching new...');
    }

    // If no docs exist or we want to force a refresh
    if (!docs) {
      console.log('Fetching new SendGrid documentation...');
      docs = await fetchSendGridDocumentation();
      console.log('Documentation fetched successfully');
    }

    return NextResponse.json({
      success: true,
      data: docs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in SendGrid test route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
