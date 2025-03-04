// src/app/api/test/twilio/route.js
import { NextResponse } from 'next/server';
import { fetchTwilioDocs } from '../../../../lib/fetchers/twilio';
import { getDocumentation } from '../../../../lib/storage';

export async function GET(request) {
  try {
    console.log('Testing Twilio API fetch...');

    // First, try to get existing documentation
    let docs = null;
    try {
      docs = await getDocumentation('twilio');
      console.log('Found existing Twilio documentation');
    } catch (error) {
      console.log('No existing documentation found, fetching new...');
    }

    // If no docs exist or we want to force a refresh
    if (!docs) {
      console.log('Fetching new Twilio documentation...');
      docs = await fetchTwilioDocs();
      console.log('Documentation fetched successfully');
    }

    return NextResponse.json({
      success: true,
      data: docs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in Twilio test route:', error);
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
