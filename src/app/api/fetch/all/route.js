// src/app/api/fetch/all/route.js
import { NextResponse } from 'next/server';
import { fetchTwilioDocs } from '@/lib/fetchers/twilioFetcher';
import { fetchSendGridDocs } from '@/lib/fetchers/sendgridFetcher';
import { getDocumentationMetadata } from '@/lib/storage';

export async function GET() {
  try {
    const results = {
      success: true,
      services: [],
      startTime: new Date().toISOString(),
    };

    // Fetch Twilio documentation
    try {
      console.log('Fetching Twilio documentation...');
      const twilioData = await fetchTwilioDocs();
      results.services.push({
        name: 'Twilio',
        status: 'success',
        endpoints: twilioData.endpoints?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching Twilio documentation:', error);
      results.services.push({
        name: 'Twilio',
        status: 'error',
        error: error.message,
      });
    }

    // Fetch SendGrid documentation
    try {
      console.log('Fetching SendGrid documentation...');
      const sendGridData = await fetchSendGridDocs();
      results.services.push({
        name: 'SendGrid',
        status: 'success',
        endpoints: sendGridData.endpoints?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching SendGrid documentation:', error);
      results.services.push({
        name: 'SendGrid',
        status: 'error',
        error: error.message,
      });
    }

    // Add additional service fetchers here

    // Get updated metadata
    results.metadata = await getDocumentationMetadata();
    results.endTime = new Date().toISOString();
    results.duration =
      (new Date(results.endTime) - new Date(results.startTime)) / 1000;

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in fetch all endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
