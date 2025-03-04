// src/app/page.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const response = await fetch('/api/docs');

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setServices(result.services || []);
        } else {
          throw new Error(result.error || 'Unknown error occurred');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            API Documentation MCP
          </h1>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Overview Section */}
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Machine Context Plugin for API Documentation
              </h2>
              <p className="mb-4">
                This Machine Context Plugin (MCP) provides AI assistants with
                access to comprehensive API documentation for popular services.
                AI assistants can query this MCP to get detailed information
                about API endpoints, parameters, and usage examples.
              </p>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium text-blue-800 mb-2">
                  Integration Instructions
                </h3>
                <p className="text-blue-700 mb-2">
                  AI assistants can access this documentation through the
                  following endpoint:
                </p>
                <pre className="bg-blue-100 p-3 rounded font-mono text-sm overflow-x-auto mb-3">
                  GET /api/docs
                </pre>
                <p className="text-blue-700">Query parameters:</p>
                <ul className="list-disc list-inside text-blue-700 mb-2">
                  <li>
                    <strong>service</strong>: Filter by service name (e.g.,
                    twilio, sendgrid)
                  </li>
                  <li>
                    <strong>query</strong>: Natural language query to search
                    across all services
                  </li>
                  <li>
                    <strong>method</strong>: Filter by HTTP method (GET, POST,
                    PUT, DELETE)
                  </li>
                  <li>
                    <strong>path</strong>: Filter by API path (partial match)
                  </li>
                </ul>
                <p className="text-blue-700">Example:</p>
                <pre className="bg-blue-100 p-3 rounded font-mono text-sm overflow-x-auto">
                  GET /api/docs?query=send a text message
                </pre>
              </div>
            </div>

            {/* Services Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Available API Documentation
              </h2>

              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ) : error ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                  <p>Error loading services: {error}</p>
                </div>
              ) : services.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <div
                      key={service.service}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 px-4 py-5 border-b sm:px-6">
                        <h3 className="text-lg font-medium text-gray-900">
                          {service.name}
                        </h3>
                      </div>
                      <div className="px-4 py-5 sm:p-6">
                        <p className="text-sm text-gray-500 mb-4">
                          {service.description || 'No description available'}
                        </p>
                        <div className="flex flex-col space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Endpoints:</span>
                            <span className="font-medium">
                              {service.endpointCount}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Categories:</span>
                            <span className="font-medium">
                              {service.categoryCount}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Last Updated:</span>
                            <span className="font-medium">
                              {service.lastUpdated
                                ? new Date(
                                    service.lastUpdated
                                  ).toLocaleDateString()
                                : 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-5">
                          <Link
                            href={`/view/${service.service}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            View Documentation
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">
                    No API documentation is currently available.
                  </p>
                  <p className="text-gray-500 mt-2">
                    Try refreshing the documentation using the links below.
                  </p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/api/test/twilio?refresh=true"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Refresh Twilio Docs
                  </Link>
                  <Link
                    href="/api/test/sendgrid?refresh=true"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Refresh SendGrid Docs
                  </Link>
                  <Link
                    href="/api/fetch/all"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Refresh All Docs
                  </Link>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  API Testing
                </h3>
                <p className="text-gray-500 mb-4">
                  Try out the API endpoints with some sample queries:
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <a
                    href="/api/docs?service=twilio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Get all Twilio documentation
                  </a>
                  <a
                    href="/api/docs?query=send text message"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Search for "send text message"
                  </a>
                  <a
                    href="/api/docs?service=twilio&method=post"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Get Twilio POST endpoints
                  </a>
                  <a
                    href="/api/docs?service=sendgrid&path=mail"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Get SendGrid mail endpoints
                  </a>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                      <svg
                        className="h-6 w-6 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-lg font-medium text-gray-900 truncate">
                        SendGrid API
                      </dt>
                      <dd className="flex items-baseline">
                        <p className="text-sm text-gray-500">
                          Email delivery and analytics services
                        </p>
                      </dd>
                    </div>
                  </div>
                  <div className="mt-5">
                    <a
                      href="/view/sendgrid"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View SendGrid Documentation
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-500">
            API Documentation MCP — Built with Next.js for AI Assistants
          </p>
        </div>
      </footer>
    </div>
  );
}
