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
          <h1 className="text-3xl font-bold text-blue-600">
            API Documentation Viewer
          </h1>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Overview Section */}
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                API Documentation Viewer
              </h2>
              <p className="mb-4 text-gray-700">
                This application provides access to comprehensive API
                documentation for services like SendGrid. You can view detailed
                information about API endpoints, parameters, and usage examples.
              </p>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium text-blue-800 mb-2">
                  Available Documentation
                </h3>
                <p className="text-blue-700 mb-2">
                  Currently, we have documentation available for:
                </p>
                <ul className="list-disc list-inside text-blue-700 mb-2">
                  <li>
                    <strong>SendGrid</strong>: Email delivery and analytics
                    services
                  </li>
                </ul>
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
                </div>
              ) : error ? (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                  <p>Error loading services: {error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-1">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-5 border-b sm:px-6">
                      <h3 className="text-lg font-medium text-blue-600">
                        SendGrid API
                      </h3>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                      <p className="text-sm text-gray-700 mb-4">
                        SendGrid provides cloud-based email delivery services
                        that assist businesses with email delivery, including
                        sending transactional emails, marketing campaigns, and
                        analytics.
                      </p>
                      <div className="flex flex-col space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-700">Features:</span>
                          <span className="font-medium text-gray-900">
                            Email Statistics, Email Delivery
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Base URL:</span>
                          <span className="font-medium text-gray-900">
                            https://api.sendgrid.com
                          </span>
                        </div>
                      </div>
                      <div className="mt-5">
                        <Link
                          href="/view/sendgrid"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          View SendGrid Documentation
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/api/test/sendgrid?refresh=true"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Refresh SendGrid Docs
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-500">
            API Documentation Viewer — Built with Next.js
          </p>
        </div>
      </footer>
    </div>
  );
}
