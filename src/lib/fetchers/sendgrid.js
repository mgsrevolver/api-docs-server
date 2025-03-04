import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Fetches documentation from SendGrid's API reference
 * @returns {Object} Structured documentation data
 */
export async function fetchSendGridDocumentation() {
  try {
    // Base URLs for SendGrid documentation
    const baseApiUrl = 'https://docs.sendgrid.com/api-reference';

    // We'll focus on a few key services for this example
    const services = [
      { name: 'mail_send', url: `${baseApiUrl}/mail-send/mail-send` },
      {
        name: 'email_validation',
        url: `${baseApiUrl}/email-validation/validate-email`,
      },
      {
        name: 'marketing_campaigns',
        url: `${baseApiUrl}/marketing-campaigns/campaigns/campaigns`,
      },
    ];

    const documentation = {};

    // Fetch documentation for each service
    for (const service of services) {
      console.log(`Fetching SendGrid documentation for ${service.name}...`);

      try {
        const response = await axios.get(service.url);
        const $ = cheerio.load(response.data);

        // Extract main content from SendGrid's documentation
        const content = $('.doc-main');

        // Process the content to extract useful information
        const endpoints = [];
        const parameters = [];

        // Extract request parameters if available
        content.find('.param-table tbody tr').each((i, el) => {
          const name = $(el).find('td').eq(0).text().trim();
          const type = $(el).find('td').eq(1).text().trim();
          const description = $(el).find('td').eq(2).text().trim();
          const required = $(el).find('td').eq(3).text().trim() === 'Yes';

          parameters.push({
            name,
            type,
            description,
            required,
          });
        });

        // Find code examples
        const examples = [];
        content.find('.CodeMirror').each((i, el) => {
          const language = $(el).hasClass('cm-s-monokai') ? 'json' : 'python';
          const code = $(el).text().trim();

          if (code) {
            examples.push({
              language,
              code,
            });
          }
        });

        // Structure the documentation
        documentation[service.name] = {
          title: $('h1').first().text().trim(),
          description: $('.DocSearch-content > p').first().text().trim(),
          parameters,
          examples,
          url: service.url,
        };
      } catch (error) {
        console.error(
          `Error fetching ${service.name} documentation:`,
          error.message
        );
        documentation[service.name] = {
          error: `Failed to fetch documentation for ${service.name}`,
          url: service.url,
        };
      }
    }

    return documentation;
  } catch (error) {
    console.error('Error fetching SendGrid documentation:', error);
    throw new Error('Failed to fetch SendGrid documentation');
  }
}
