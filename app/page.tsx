'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, Play, FileJson, FileText, Search } from 'lucide-react';
import { encode as encodeToon } from '@/lib/toon/encoder';

const defaultJSON = `{
  "products": [
    {
      "id": 1,
      "name": "Laptop Pro",
      "price": 1299.99,
      "inStock": true
    },
    {
      "id": 2,
      "name": "Wireless Mouse",
      "price": 29.99,
      "inStock": true
    },
    {
      "id": 3,
      "name": "USB-C Hub",
      "price": 49.99,
      "inStock": false
    }
  ],
  "store": {
    "name": "Tech Store",
    "location": "San Francisco"
  }
}`;

export default function Home() {
  const [jsonInput, setJsonInput] = useState(defaultJSON);
  const [toonOutput, setToonOutput] = useState('');
  const [query, setQuery] = useState('products.price>30');
  const [queryResult, setQueryResult] = useState('');
  const [queryResultToon, setQueryResultToon] = useState('');
  const [error, setError] = useState('');
  const [showResultAsToon, setShowResultAsToon] = useState(true);
  const [dbName, setDbName] = useState('');
  const [creatingDb, setCreatingDb] = useState(false);
  const [createdLink, setCreatedLink] = useState('');

  // Convert JSON to TOON in real-time
  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonInput);
      const toon = encodeToon(parsed);
      setToonOutput(toon);
      setError('');
    } catch (err) {
      setError('Invalid JSON');
    }
  }, [jsonInput]);

  // Execute query
  const executeQuery = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      // Simple client-side query execution
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_id: 'playground',
          query: query,
          data: parsed
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const jsonOutput = JSON.stringify(result.results, null, 2);
        setQueryResult(jsonOutput);
        
        // Convert results to TOON
        try {
          const toonResult = encodeToon({ results: result.results });
          setQueryResultToon(toonResult);
        } catch (err) {
          setQueryResultToon('Error converting to TOON');
        }
      } else {
        const errorMsg = 'Query failed. Try: products, products.price>30, products.name';
        setQueryResult(errorMsg);
        setQueryResultToon(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'Error: ' + (err instanceof Error ? err.message : 'Unknown error');
      setQueryResult(errorMsg);
      setQueryResultToon(errorMsg);
    }
  };

  // Create database from playground
  const createDatabase = async () => {
    if (!dbName.trim()) {
      alert('Please enter a database name');
      return;
    }

    if (!toonOutput) {
      alert('Please enter valid JSON data first');
      return;
    }

    setCreatingDb(true);
    setCreatedLink('');

    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: dbName,
          toon_content: toonOutput,
          description: 'Created from playground',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const tableId = result.table.id;
        const link = `${window.location.origin}/dashboard/tables/${tableId}`;
        setCreatedLink(link);
        
        // Copy to clipboard
        await navigator.clipboard.writeText(link);
        alert('Database created! Link copied to clipboard.');
      } else {
        alert('Failed to create database');
      }
    } catch (err) {
      alert('Error creating database: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setCreatingDb(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">ToonDB</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/docs"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              Documentation
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-primary-600 hover:text-primary-700 transition"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Token-Optimized Database
          <span className="text-primary-600"> for AI Projects</span>
        </h1>
        <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
          Save 30-60% on LLM API costs. Try it now with your JSON data!
        </p>
      </section>

      {/* Interactive Playground - 3 Panels */}
      <section className="container mx-auto px-6 pb-20">
        {/* Save Database Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Save your data as a ToonDB table
              </label>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  placeholder="Enter database name (e.g., my-products-db)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={createDatabase}
                  disabled={creatingDb || !dbName.trim()}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {creatingDb ? 'Creating...' : 'Create & Copy Link'}
                </button>
              </div>
              {createdLink && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 mb-1 font-semibold">Database created successfully!</p>
                  <a
                    href={createdLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 underline break-all"
                  >
                    {createdLink}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Panel Headers */}
          <div className="grid grid-cols-3 bg-gray-100 border-b border-gray-300">
            <div className="p-4 border-r border-gray-300">
              <div className="flex items-center space-x-2 text-gray-900 font-semibold">
                <FileJson className="w-5 h-5" />
                <span>1. Your JSON Data</span>
              </div>
            </div>
            <div className="p-4 border-r border-gray-300">
              <div className="flex items-center space-x-2 text-primary-600 font-semibold">
                <FileText className="w-5 h-5" />
                <span>2. TOON Format {error && <span className="text-red-500 text-xs">({error})</span>}</span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-2 text-green-600 font-semibold">
                <Search className="w-5 h-5" />
                <span>3. Query Playground</span>
              </div>
            </div>
          </div>

          {/* Panel Content */}
          <div className="grid grid-cols-3 divide-x divide-gray-200" style={{ height: '600px' }}>
            {/* Left Panel: JSON Input */}
            <div className="flex flex-col">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="flex-1 p-4 font-mono text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Paste your JSON data here..."
                spellCheck={false}
              />
            </div>

            {/* Middle Panel: TOON Output */}
            <div className="flex flex-col bg-primary-50">
              <pre className="flex-1 p-4 font-mono text-sm text-gray-900 overflow-auto">
                {toonOutput || 'TOON output will appear here...'}
              </pre>
            </div>

            {/* Right Panel: Query Playground */}
            <div className="flex flex-col">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  TOONPath Query
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && executeQuery()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono text-gray-900 bg-white focus:ring-2 focus:ring-green-500"
                    placeholder="products.price>30"
                  />
                  <button
                    onClick={executeQuery}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-1"
                  >
                    <Play className="w-4 h-4" />
                    <span>Run</span>
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-500">
                    Try: <code className="bg-gray-200 px-1 rounded">products</code>,{' '}
                    <code className="bg-gray-200 px-1 rounded">products.price&gt;30</code>
                  </div>
                  {queryResult && (
                    <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-300 p-0.5">
                      <button
                        onClick={() => setShowResultAsToon(true)}
                        className={`px-2 py-1 text-xs rounded ${
                          showResultAsToon
                            ? 'bg-green-600 text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        TOON
                      </button>
                      <button
                        onClick={() => setShowResultAsToon(false)}
                        className={`px-2 py-1 text-xs rounded ${
                          !showResultAsToon
                            ? 'bg-green-600 text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        JSON
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <pre className="flex-1 p-4 font-mono text-sm text-gray-900 bg-green-50 overflow-auto">
                {queryResult 
                  ? (showResultAsToon ? queryResultToon : queryResult)
                  : 'Query results will appear here...\n\nClick "Run" to execute your query.'}
              </pre>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex items-center justify-center space-x-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition shadow-lg"
          >
            Start Building with ToonDB →
          </Link>
          <Link
            href="/docs/toonpath"
            className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition shadow-lg border border-gray-200"
          >
            View Query Documentation
          </Link>
        </div>
      </section>


      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-6 h-6 text-primary-600" />
            <span className="font-semibold text-gray-900">ToonDB</span>
          </div>
          <div className="flex items-center space-x-6 text-gray-600">
            <Link href="/docs" className="hover:text-gray-900 transition">
              Docs
            </Link>
            <Link href="https://github.com/toon-format/toon" className="hover:text-gray-900 transition">
              GitHub
            </Link>
            <Link href="/support" className="hover:text-gray-900 transition">
              Support
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-500 text-sm">
          © 2024 ToonDB. Built with TOON format.
        </div>
      </footer>
    </div>
  );
}

