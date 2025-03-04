// src/app/api/docs/route.js
import { NextResponse } from 'next/server';
import { getDocumentation, getDocumentationMetadata } from '@/lib/storage';

/**
 * Main documentation endpoint for AI assistants to query
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const query = searchParams.get('query') || '';
    const service = searchParams.get('service') || '';
    const method = searchParams.get('method') || '';
    const path = searchParams.get('path') || '';

    // If a specific service is requested, return just that documentation
    if (service) {
      try {
        const serviceData = await getDocumentation(service.toLowerCase());

        // Apply any additional filters
        let filteredData = { ...serviceData };

        if (filteredData.endpoints && (method || path || query)) {
          filteredData.endpoints = filteredData.endpoints.filter((endpoint) => {
            // Filter by HTTP method if specified
            if (
              method &&
              endpoint.method.toLowerCase() !== method.toLowerCase()
            ) {
              return false;
            }

            // Filter by path if specified (partial match)
            if (
              path &&
              !endpoint.path.toLowerCase().includes(path.toLowerCase())
            ) {
              return false;
            }

            // Filter by natural language query if specified
            if (query) {
              const normalizedQuery = query.toLowerCase();
              const matchesQuery =
                endpoint.path.toLowerCase().includes(normalizedQuery) ||
                endpoint.description.toLowerCase().includes(normalizedQuery) ||
                (endpoint.category &&
                  endpoint.category.toLowerCase().includes(normalizedQuery));

              if (!matchesQuery) {
                return false;
              }
            }

            return true;
          });
        }

        return NextResponse.json({
          success: true,
          data: filteredData,
        });
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: `Documentation for ${service} not found or could not be retrieved.`,
          },
          { status: 404 }
        );
      }
    }

    // If natural language query is provided, search across all documentations
    if (query) {
      const results = await searchDocumentation(query);
      return NextResponse.json({
        success: true,
        query,
        results,
      });
    }

    // Default: return metadata about all available documentations
    const metadata = await getDocumentationMetadata();
    return NextResponse.json({
      success: true,
      services: metadata,
    });
  } catch (error) {
    console.error('Error in documentation API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Search across all documentation using natural language query
 * @param {string} query - Natural language query
 * @returns {Promise<Array>} - Array of matching results
 */
async function searchDocumentation(query) {
  try {
    // Get metadata to know which services to search
    const metadata = await getDocumentationMetadata();
    const normalizedQuery = query.toLowerCase();

    // Extract keywords from the query
    const keywords = extractKeywords(normalizedQuery);

    // Results will hold all matches
    const results = [];

    // Search each service's documentation
    for (const service of metadata) {
      try {
        const serviceData = await getDocumentation(service.service);

        // Skip if no endpoints
        if (!serviceData.endpoints || !serviceData.endpoints.length) {
          continue;
        }

        // Search for matching endpoints
        const matchingEndpoints = serviceData.endpoints.filter((endpoint) => {
          // Calculate relevance score based on keyword matches
          let score = 0;
          const endpointTexts = [
            endpoint.path.toLowerCase(),
            endpoint.description.toLowerCase(),
            endpoint.category ? endpoint.category.toLowerCase() : '',
            ...(endpoint.parameters || []).map(
              (p) => p.name.toLowerCase() + ' ' + p.description.toLowerCase()
            ),
          ].join(' ');

          // Check each keyword for a match
          for (const keyword of keywords) {
            if (endpointTexts.includes(keyword)) {
              score += 1;

              // Boost score for exact matches in important fields
              if (endpoint.path.toLowerCase().includes(keyword)) score += 2;
              if (endpoint.method.toLowerCase() === keyword) score += 3;
              if (
                endpoint.category &&
                endpoint.category.toLowerCase().includes(keyword)
              )
                score += 1;
            }
          }

          // Also check for direct query match
          if (endpointTexts.includes(normalizedQuery)) {
            score += 5;
          }

          // Include if score is above threshold
          return score > 0;
        });

        // Sort by relevance (more parameters matching = higher relevance)
        matchingEndpoints.sort((a, b) => {
          // Calculate match score for each endpoint
          const scoreA = calculateMatchScore(a, keywords, normalizedQuery);
          const scoreB = calculateMatchScore(b, keywords, normalizedQuery);

          return scoreB - scoreA;
        });

        // Add top results to the results array
        if (matchingEndpoints.length > 0) {
          results.push({
            service: serviceData.name,
            description: serviceData.description,
            baseUrl: serviceData.baseUrl,
            matches: matchingEndpoints.slice(0, 5).map((endpoint) => ({
              ...endpoint,
              relevance: calculateMatchScore(
                endpoint,
                keywords,
                normalizedQuery
              ),
            })),
          });
        }
      } catch (error) {
        console.error(
          `Error searching ${service.service} documentation:`,
          error
        );
      }
    }

    // Sort results by services with most relevant matches first
    results.sort((a, b) => {
      // Get max relevance from each service's matches
      const maxRelevanceA = Math.max(...a.matches.map((m) => m.relevance));
      const maxRelevanceB = Math.max(...b.matches.map((m) => m.relevance));

      return maxRelevanceB - maxRelevanceA;
    });

    return results;
  } catch (error) {
    console.error('Error searching documentation:', error);
    throw error;
  }
}

/**
 * Calculate how well an endpoint matches a query
 */
function calculateMatchScore(endpoint, keywords, fullQuery) {
  let score = 0;
  const endpointTexts = [
    endpoint.path.toLowerCase(),
    endpoint.description.toLowerCase(),
    endpoint.category ? endpoint.category.toLowerCase() : '',
    ...(endpoint.parameters || []).map(
      (p) => p.name.toLowerCase() + ' ' + p.description.toLowerCase()
    ),
  ].join(' ');

  // Check each keyword for a match
  for (const keyword of keywords) {
    if (endpointTexts.includes(keyword)) {
      score += 1;

      // Boost score for exact matches in important fields
      if (endpoint.path.toLowerCase().includes(keyword)) score += 2;
      if (endpoint.method.toLowerCase() === keyword) score += 3;
      if (
        endpoint.category &&
        endpoint.category.toLowerCase().includes(keyword)
      )
        score += 1;
    }
  }

  // Also check for direct query match
  if (endpointTexts.includes(fullQuery)) {
    score += 5;
  }

  return score;
}

/**
 * Extract keywords from a natural language query
 */
function extractKeywords(query) {
  // List of common stop words to filter out
  const stopWords = new Set([
    'a',
    'an',
    'the',
    'and',
    'or',
    'but',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'in',
    'on',
    'at',
    'to',
    'for',
    'with',
    'about',
    'against',
    'between',
    'into',
    'through',
    'during',
    'before',
    'after',
    'above',
    'below',
    'from',
    'up',
    'down',
    'of',
    'off',
    'over',
    'under',
    'again',
    'further',
    'then',
    'once',
    'here',
    'there',
    'when',
    'where',
    'why',
    'how',
    'all',
    'any',
    'both',
    'each',
    'few',
    'more',
    'most',
    'other',
    'some',
    'such',
    'no',
    'nor',
    'not',
    'only',
    'own',
    'same',
    'so',
    'than',
    'too',
    'very',
    'can',
    'will',
    'just',
    'should',
    'now',
    'i',
    'me',
    'my',
    'myself',
    'we',
    'our',
    'ours',
    'ourselves',
    'you',
    'your',
    'yours',
    'yourself',
    'yourselves',
    'he',
    'him',
    'his',
    'himself',
    'she',
    'her',
    'hers',
    'herself',
    'it',
    'its',
    'itself',
    'they',
    'them',
    'their',
    'theirs',
    'themselves',
    'what',
    'which',
    'who',
    'whom',
    'this',
    'that',
    'these',
    'those',
    'am',
    'have',
    'has',
    'had',
    'having',
    'do',
    'does',
    'did',
    'doing',
    'would',
    'could',
    'should',
    'ought',
    'get',
    'gets',
    'got',
    'use',
    'used',
    'using',
  ]);

  // Domain-specific keywords to always include
  const alwaysInclude = new Set([
    'sms',
    'message',
    'call',
    'voice',
    'phone',
    'text',
    'media',
    'mms',
    'video',
    'email',
    'send',
    'receive',
    'create',
    'delete',
    'update',
    'get',
    'post',
    'put',
    'api',
    'verify',
    'authentication',
    'image',
    'upload',
    'download',
    'user',
    'account',
  ]);

  // Split the query into words
  const words = query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .split(/\s+/) // Split on whitespace
    .filter(
      (word) =>
        word.length > 1 && (!stopWords.has(word) || alwaysInclude.has(word))
    );

  return words;
}
