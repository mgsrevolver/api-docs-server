'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SendGridVisualizationPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/test/sendgrid');

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || 'Unknown error occurred');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching SendGrid documentation:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Force refresh function
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test/sendgrid?refresh=true');

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        alert('Documentation refreshed successfully!');
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error refreshing SendGrid documentation:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter endpoints based on category and search
  const getFilteredEndpoints = () => {
    if (!data || !data.endpoints) return [];

    return data.endpoints.filter((endpoint) => {
      // Category filter
      const categoryMatch =
        selectedCategory === 'all' || endpoint.category === selectedCategory;

      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const searchMatch =
        searchQuery === '' ||
        endpoint.path.toLowerCase().includes(searchLower) ||
        endpoint.method.toLowerCase().includes(searchLower) ||
        endpoint.description.toLowerCase().includes(searchLower);

      return categoryMatch && searchMatch;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">
            Loading SendGrid Documentation...
          </h1>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-5/6 mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">
            Error Loading SendGrid Documentation
          </h1>
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">No Data Available</h1>
          <p>No SendGrid documentation data is available.</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 mt-4 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Refresh Documentation
          </button>
        </div>
      </div>
    );
  }

  const filteredEndpoints = getFilteredEndpoints();

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">SendGrid API Documentation</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Overview</h2>
          <p className="mb-4">{data.description}</p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded">
              <span className="text-sm text-blue-500">Base URL</span>
              <p className="font-mono">{data.baseUrl}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <span className="text-sm text-blue-500">Last Updated</span>
              <p>{new Date(data.lastUpdated).toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <span className="text-sm text-blue-500">Total Endpoints</span>
              <p>{data.endpoints?.length || 0}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <span className="text-sm text-blue-500">Categories</span>
              <p>{data.categories?.length || 0}</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 mt-6 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Refresh Documentation
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Filter Endpoints</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All Categories</option>
                {data.categories?.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search endpoints..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-500">
            Showing {filteredEndpoints.length} of {data.endpoints?.length || 0}{' '}
            endpoints
          </div>
        </div>

        <div className="space-y-6">
          {filteredEndpoints.map((endpoint, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="flex items-center p-4 border-b">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium mr-3
                  ${
                    endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' : ''
                  }
                  ${
                    endpoint.method === 'POST'
                      ? 'bg-green-100 text-green-800'
                      : ''
                  }
                  ${
                    endpoint.method === 'PUT'
                      ? 'bg-yellow-100 text-yellow-800'
                      : ''
                  }
                  ${
                    endpoint.method === 'DELETE'
                      ? 'bg-red-100 text-red-800'
                      : ''
                  }
                `}
                >
                  {endpoint.method}
                </span>
                <span className="font-mono text-gray-900">{endpoint.path}</span>
                {endpoint.category && (
                  <span className="ml-auto px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    {endpoint.category}
                  </span>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 mb-4">
                  {endpoint.description || 'No description available'}
                </p>

                {endpoint.parameters && endpoint.parameters.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Parameters
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Required
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {endpoint.parameters.map((param, paramIndex) => (
                            <tr key={paramIndex}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {param.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {param.type || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {param.required ? (
                                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                                    Required
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                    Optional
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {param.description || 'No description'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {endpoint.headers && endpoint.headers.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Headers</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Required
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {endpoint.headers.map((header, headerIndex) => (
                            <tr key={headerIndex}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {header.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {header.required ? (
                                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                                    Required
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                    Optional
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {header.description || 'No description'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {endpoint.responses && endpoint.responses.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Responses
                    </h4>
                    <div className="space-y-2">
                      {endpoint.responses.map((response, respIndex) => (
                        <div key={respIndex} className="border rounded p-3">
                          <div className="flex items-center">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium mr-2
                              ${
                                response.status >= 200 && response.status < 300
                                  ? 'bg-green-100 text-green-800'
                                  : ''
                              }
                              ${
                                response.status >= 300 && response.status < 400
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : ''
                              }
                              ${
                                response.status >= 400
                                  ? 'bg-red-100 text-red-800'
                                  : ''
                              }
                            `}
                            >
                              {response.status}
                            </span>
                            <span className="text-sm">
                              {response.description || ''}
                            </span>
                          </div>
                          {response.schema && (
                            <div className="mt-2">
                              <pre className="bg-gray-50 p-3 rounded font-mono text-sm overflow-x-auto">
                                {JSON.stringify(response.schema, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {endpoint.notes && endpoint.notes.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {endpoint.notes.map((note, noteIndex) => (
                        <li key={noteIndex} className="text-gray-700">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {endpoint.example && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Example</h4>
                    <pre className="bg-gray-50 p-3 rounded font-mono text-sm overflow-x-auto">
                      {endpoint.example}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredEndpoints.length === 0 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">
              No endpoints found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
