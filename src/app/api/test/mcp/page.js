'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MCPTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [queryType, setQueryType] = useState('nlp'); // 'nlp' or 'specific'
  const [query, setQuery] = useState('');
  const [api, setApi] = useState('sendgrid');
  const [endpoint, setEndpoint] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = queryType === 'nlp' ? { query } : { api, endpoint };

      console.log('Sending MCP query with payload:', payload);

      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch results');
      }

      setResult(data);
    } catch (err) {
      console.error('Error querying MCP:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">MCP Query Tester</h1>

      <div className="bg-white shadow-md rounded p-6 mb-6">
        <div className="mb-4">
          <div className="flex space-x-4 mb-4">
            <button
              type="button"
              className={`px-4 py-2 rounded ${
                queryType === 'nlp' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => setQueryType('nlp')}
            >
              Natural Language Query
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded ${
                queryType === 'specific'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
              onClick={() => setQueryType('specific')}
            >
              Specific API/Endpoint
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {queryType === 'nlp' ? (
              <div>
                <label htmlFor="query" className="block mb-2 font-medium">
                  What would you like to do?
                </label>
                <input
                  type="text"
                  id="query"
                  className="w-full p-2 border rounded"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., How do I get email statistics?"
                  required
                />
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="api" className="block mb-2 font-medium">
                    API
                  </label>
                  <select
                    id="api"
                    className="w-full p-2 border rounded"
                    value={api}
                    onChange={(e) => setApi(e.target.value)}
                    required
                  >
                    <option value="sendgrid">SendGrid</option>
                    <option value="twilio">Twilio</option>
                    <option value="cloudinary">Cloudinary</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="endpoint" className="block mb-2 font-medium">
                    Endpoint
                  </label>
                  <input
                    type="text"
                    id="endpoint"
                    className="w-full p-2 border rounded"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="e.g., stats or /v3/stats"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Querying...' : 'Query MCP'}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white shadow-md rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
