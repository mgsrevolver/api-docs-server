import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Fetches documentation from Twilio's API reference
 * @returns {Object} Structured documentation data
 */
export async function fetchTwilioDocumentation() {
  try {
    // Base URLs for Twilio documentation
    const baseApiUrl = 'https://www.twilio.com/docs/api';

    // We'll focus on a few key services for this example
    const services = [
      { name: 'messaging', url: `${baseApiUrl}/messaging` },
      { name: 'voice', url: `${baseApiUrl}/voice` },
      { name: 'verify', url: `${baseApiUrl}/verify` },
    ];

    const documentation = {};

    // Fetch documentation for each service
    for (const service of services) {
      console.log(`Fetching Twilio documentation for ${service.name}...`);

      try {
        const response = await axios.get(service.url);
        const $ = cheerio.load(response.data);

        // Extract main content, removing navigation and unnecessary elements
        const content = $('.content-wrapper');

        // Remove any scripts or styles
        content.find('script, style').remove();

        // Process the content to extract useful information
        const endpoints = [];

        // Find endpoint descriptions
        content.find('h2, h3').each((i, el) => {
          const title = $(el).text().trim();

          // Skip if it's not an endpoint title
          if (
            !title ||
            title.toLowerCase().includes('introduction') ||
            title.toLowerCase().includes('overview')
          ) {
            return;
          }

          // Get the next paragraph as description
          const description = $(el).next('p').text().trim();

          // Look for code examples
          let examples = [];
          const codeBlock = $(el).nextAll('pre').first();
          if (codeBlock.length > 0) {
            examples.push({
              language:
                codeBlock
                  .find('code')
                  .attr('class')
                  ?.replace('language-', '') || 'bash',
              code: codeBlock.text().trim(),
            });
          }

          endpoints.push({
            title,
            description,
            examples,
            url: `${service.url}#${$(el).attr('id') || ''}`,
          });
        });

        // Structure the documentation
        documentation[service.name] = {
          title: $('h1').first().text().trim(),
          description: $('.content-wrapper > p').first().text().trim(),
          endpoints,
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
    console.error('Error fetching Twilio documentation:', error);
    throw new Error('Failed to fetch Twilio documentation');
  }
}
