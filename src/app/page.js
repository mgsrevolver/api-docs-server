export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">
          API Documentation MCP Server
        </h1>

        <div className="bg-white/10 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">What is this?</h2>
          <p className="mb-4">
            This is a Machine Context Plugin (MCP) server that pre-fetches and
            caches documentation from popular APIs, structures it for AI
            consumption, and provides a recommendation layer for common
            development tasks.
          </p>
        </div>

        <div className="bg-white/10 p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">How to use</h2>
          <p className="mb-4">
            Add this MCP to your AI assistant (like Claude in Cursor) to get
            enhanced documentation and recommendations for API integrations.
          </p>
          <div className="bg-gray-800 p-4 rounded-md">
            <pre>
              <code>
                Endpoint:{' '}
                {`${
                  process.env.NEXT_PUBLIC_BASE_URL ||
                  'https://your-deployed-url.vercel.app'
                }/api/docs`}
              </code>
            </pre>
          </div>
        </div>

        <div className="bg-white/10 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Available APIs</h2>
          <ul className="list-disc pl-6">
            <li className="mb-2">Twilio - Communication services</li>
            <li className="mb-2">SendGrid - Email services</li>
            <li className="mb-2">Cloudinary - Media management</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
