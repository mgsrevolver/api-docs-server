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
export async function fetchTwilioDocs(forceRefresh = true) {
  console.log('Fetching Twilio documentation...');

  try {
    // Create a documentation object focused exclusively on SendGrid statistics
    const documentation = {
      name: 'Twilio SendGrid',
      title: 'SendGrid API Documentation',
      description: 'SendGrid email delivery and analytics services',
      baseUrl: 'https://api.sendgrid.com',
      lastUpdated: new Date().toISOString(),

      // Only include the SendGrid statistics endpoint
      endpoints: [
        {
          method: 'GET',
          path: '/v3/stats',
          description:
            'Retrieve global email statistics between a given date range',
          category: 'Email Analytics',
          baseUrl: 'https://api.sendgrid.com',
          parameters: [
            {
              name: 'start_date',
              description:
                'The starting date of the statistics to retrieve (YYYY-MM-DD)',
              required: true,
            },
            {
              name: 'end_date',
              description:
                'The end date of the statistics to retrieve (YYYY-MM-DD)',
              required: false,
            },
            {
              name: 'aggregated_by',
              description: 'How to group the statistics (day, week, or month)',
              required: false,
              enum: ['day', 'week', 'month'],
            },
            {
              name: 'limit',
              description: 'The number of results to return',
              required: false,
              type: 'integer',
            },
            {
              name: 'offset',
              description: 'The point in the list to begin retrieving results',
              required: false,
              type: 'integer',
            },
          ],
          headers: [
            {
              name: 'Authorization',
              description: 'Bearer <<YOUR_API_KEY_HERE>>',
              required: true,
            },
            {
              name: 'on-behalf-of',
              description:
                'Make API calls from a parent account on behalf of Subusers or customer accounts',
              required: false,
            },
          ],
          responses: [
            {
              status: 200,
              description: 'Success',
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    date: {
                      type: 'string',
                      description: 'The date the stats were gathered',
                    },
                    stats: {
                      type: 'array',
                      description: 'The individual email activity stats',
                      items: {
                        type: 'object',
                      },
                    },
                  },
                },
              },
            },
          ],
          notes: [
            'Category statistics are available for the previous thirteen months only.',
          ],
          example: `const client = require("@sendgrid/client");
client.setApiKey(process.env.SENDGRID_API_KEY);

const queryParams = { start_date: "2009-07-06" };

const request = {
  url: \`/v3/stats\`,
  method: "GET",
  qs: queryParams,
};

client
  .request(request)
  .then(([response, body]) => {
    console.log(response.statusCode);
    console.log(response.body);
  })
  .catch((error) => {
    console.error(error);
  });`,
        },
      ],

      // Only include the Email Analytics category
      categories: [
        {
          name: 'Email Analytics',
          description: 'Track and analyze email performance metrics',
          endpoints: [], // Will be populated below
        },
      ],
    };

    // Populate category endpoints
    for (const category of documentation.categories) {
      category.endpoints = documentation.endpoints.filter(
        (endpoint) => endpoint.category === category.name
      );
    }

    // Force save the documentation
    await saveDocumentation('twilio', documentation, forceRefresh);
    console.log(
      `SendGrid documentation saved successfully with ${documentation.endpoints.length} endpoints.`
    );

    return documentation;
  } catch (error) {
    console.error('Error creating SendGrid documentation:', error);
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
