import axios from 'axios';
import * as cheerio from 'cheerio';
import { saveDocumentation } from '../storage';

/**
 * Fetches documentation from SendGrid's API reference
 * @returns {Object} Structured documentation data
 */
export async function fetchSendGridDocumentation() {
  try {
    // Create a documentation object focused exclusively on the statistics endpoint
    const documentation = {
      name: 'SendGrid',
      title: 'SendGrid API Documentation',
      description: 'SendGrid email delivery and analytics services',
      baseUrl: 'https://api.sendgrid.com',
      lastUpdated: new Date().toISOString(),

      endpoints: [
        {
          method: 'GET',
          path: '/v3/stats',
          description:
            'Retrieve global email statistics between a given date range',
          category: 'Email Analytics',
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

    // Save the documentation
    await saveDocumentation('sendgrid', documentation);
    console.log(
      `SendGrid documentation saved successfully with ${documentation.endpoints.length} endpoints.`
    );

    return documentation;
  } catch (error) {
    console.error('Error creating SendGrid documentation:', error);
    throw error;
  }
}
