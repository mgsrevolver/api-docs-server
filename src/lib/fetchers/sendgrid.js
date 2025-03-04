import axios from 'axios';
import * as cheerio from 'cheerio';
import { saveDocumentation } from '../storage';

/**
 * Fetches documentation from SendGrid's API reference
 * @returns {Object} Structured documentation data
 */
export async function fetchSendGridDocumentation() {
  try {
    // Create a documentation object with multiple endpoints
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
        // New Email Activity API endpoint
        {
          method: 'GET',
          path: '/v3/messages/{msg_id}',
          description: 'Get all of the details about the specified message',
          category: 'Email Activity',
          parameters: [
            {
              name: 'msg_id',
              description:
                'The ID of the message you are requesting details for',
              required: true,
              type: 'string',
              in: 'path',
            },
          ],
          headers: [
            {
              name: 'Authorization',
              description: 'Bearer <<YOUR_API_KEY_HERE>>',
              required: true,
            },
          ],
          responses: [
            {
              status: 200,
              description: 'Success',
              schema: {
                type: 'object',
                properties: {
                  from_email: {
                    type: 'string',
                    format: 'email',
                    description:
                      "The 'From' email address used to deliver the message",
                  },
                  msg_id: {
                    type: 'string',
                    description: 'A unique ID assigned to the message',
                  },
                  subject: {
                    type: 'string',
                    description: "The email's subject line",
                  },
                  to_email: {
                    type: 'string',
                    format: 'email',
                    description: "The intended recipient's email address",
                  },
                  status: {
                    type: 'string',
                    enum: ['processed', 'delivered', 'not_delivered'],
                    description: "The message's status",
                  },
                  template_id: {
                    type: 'string',
                    description:
                      'The ID associated with a Twilio SendGrid email template',
                  },
                  asm_group_id: {
                    type: 'integer',
                    description:
                      'The unsubscribe group associated with this email',
                    minimum: 1,
                  },
                  teammate: {
                    type: 'string',
                    description: "Teammate's username",
                    pattern: '^$|^[A-Za-z0-9]+',
                    minLength: 0,
                    maxLength: 64,
                  },
                  api_key_id: {
                    type: 'string',
                    description:
                      'The ID of the API Key used to authenticate the sending request',
                    pattern: '^[A-Za-z0-9]+',
                    minLength: 3,
                    maxLength: 50,
                  },
                  events: {
                    type: 'array',
                    description: 'List of events related to email message',
                    items: {
                      type: 'object',
                    },
                  },
                  originating_ip: {
                    type: 'string',
                    format: 'ipv4',
                    description:
                      'This is the IP of the user who sent the message',
                  },
                  categories: {
                    type: 'array',
                    description: 'Categories users associated to the message',
                    items: {
                      type: 'string',
                    },
                  },
                  unique_args: {
                    type: 'string',
                    description:
                      'JSON hash of key-value pairs associated with the message',
                  },
                  outbound_ip: {
                    type: 'string',
                    format: 'ipv4',
                    description:
                      'IP used to send to the remote Mail Transfer Agent',
                  },
                  outbound_ip_type: {
                    type: 'string',
                    enum: ['dedicated', 'shared'],
                    description:
                      'Whether or not the outbound IP is dedicated vs shared',
                  },
                },
              },
            },
            {
              status: 400,
              description: 'Bad Request',
            },
            {
              status: 404,
              description: 'Not Found',
            },
            {
              status: 429,
              description: 'Too Many Requests',
            },
          ],
          notes: [
            'You must purchase additional email activity history to gain access to the Email Activity Feed API.',
            'The Email Activity API allows you to query all of your stored messages, query individual messages, and download a CSV with data about the stored messages.',
          ],
          example: `const client = require("@sendgrid/client");
client.setApiKey(process.env.SENDGRID_API_KEY);

const msg_id = "msg_id";

const request = {
  url: \`/v3/messages/\${msg_id}\`,
  method: "GET",
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
        {
          name: 'Email Activity',
          description: 'Query and inspect details about your sent messages',
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
