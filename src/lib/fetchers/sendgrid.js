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
        // Email Activity API endpoint
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
        // Account Provisioning API - Create Account endpoint
        {
          method: 'POST',
          path: '/v3/partners/accounts',
          description:
            'Creates a new account, with specified offering, under the organization',
          category: 'Account Provisioning',
          parameters: [
            {
              name: 'profile.first_name',
              type: 'string',
              required: false,
              description: 'First name of the account holder',
              in: 'body',
            },
            {
              name: 'profile.last_name',
              type: 'string',
              required: false,
              description: 'Last name of the account holder',
              in: 'body',
            },
            {
              name: 'profile.company_name',
              type: 'string',
              required: false,
              description: 'Company name of the account holder',
              in: 'body',
            },
            {
              name: 'profile.company_website',
              type: 'string',
              required: false,
              description: 'Company website of the account holder',
              in: 'body',
            },
            {
              name: 'profile.email',
              type: 'string',
              required: false,
              description: 'Email of the account holder',
              in: 'body',
            },
            {
              name: 'profile.phone',
              type: 'string',
              required: false,
              description:
                'Phone number with E.164 standard format: [+][country code][subscriber number]',
              in: 'body',
            },
            {
              name: 'profile.timezone',
              type: 'string',
              required: false,
              description:
                'Area/Location as listed in the IANA Time Zone database',
              in: 'body',
            },
            {
              name: 'offerings[].name',
              type: 'string',
              required: true,
              description: 'Name of the offering',
              in: 'body',
            },
            {
              name: 'offerings[].type',
              type: 'string',
              required: true,
              description: 'Type of offering (must be "package" or "addon")',
              in: 'body',
            },
            {
              name: 'offerings[].quantity',
              type: 'integer',
              required: false,
              description:
                'Quantity of the specified addon. If offering type is package, quantity must be 1',
              in: 'body',
            },
          ],
          headers: [
            {
              name: 'Authorization',
              description: 'Bearer <<YOUR_API_KEY_HERE>>',
              required: true,
            },
            {
              name: 'T-Test-Account',
              description:
                'OPTIONAL Custom request header provided ONLY for a test account',
              required: false,
            },
          ],
          responses: [
            {
              status: 201,
              description: 'Created',
              schema: {
                type: 'object',
                properties: {
                  account_id: {
                    type: 'string',
                    description: 'Twilio SendGrid account ID',
                  },
                },
              },
            },
            {
              status: 400,
              description: 'Bad Request',
            },
            {
              status: 401,
              description: 'Unauthorized',
            },
            {
              status: 403,
              description: 'Forbidden',
            },
            {
              status: 500,
              description: 'Internal Server Error',
            },
            {
              status: 502,
              description: 'Bad Gateway',
            },
            {
              status: 503,
              description: 'Service Unavailable',
            },
            {
              status: 504,
              description: 'Gateway Timeout',
            },
          ],
          notes: [
            'The Account Provisioning API is for companies that have a formal reseller partnership with Twilio SendGrid.',
            'You can access Twilio SendGrid sub-account functionality without becoming a reseller using the Twilio SendGrid Subusers feature, available with Pro and Premier plans.',
            'The response to a new account creation is the Twilio Sendgrid account ID, which should be recorded for future use.',
          ],
          example: `const client = require("@sendgrid/client");
client.setApiKey(process.env.SENDGRID_API_KEY);

const data = {
  profile: {
    first_name: "Sender",
    last_name: "Wiz",
    company_name: "Twilio SendGrid",
    company_website: "https://sendgrid.com",
    email: "test@test.com",
    timezone: "Asia/Tokyo",
  },
  offerings: [
    {
      name: "org.ei.free.v1",
      type: "package",
      quantity: 1,
    },
  ],
};

const request = {
  url: \`/v3/partners/accounts\`,
  method: "POST",
  body: data,
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
          alternativeExamples: [
            {
              title: 'Create test customer account',
              code: `const client = require("@sendgrid/client");
client.setApiKey(process.env.SENDGRID_API_KEY);

const headers = { "T-Test-Account": "true" };
const data = {
  profile: {
    first_name: "Sender",
    last_name: "Wiz",
    company_name: "Twilio SendGrid",
    company_website: "https://sendgrid.com",
    email: "test@test.com",
    timezone: "Asia/Tokyo",
  },
  offerings: [
    {
      name: "org.ei.free.v1",
      type: "package",
      quantity: 1,
    },
  ],
};

const request = {
  url: \`/v3/partners/accounts\`,
  method: "POST",
  headers: headers,
  body: data,
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
        {
          name: 'Account Provisioning',
          description: 'Manage customer accounts for Twilio SendGrid resellers',
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
