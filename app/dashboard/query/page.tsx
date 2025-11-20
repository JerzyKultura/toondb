'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, Play, Download, Clock, Hash } from 'lucide-react';
import { encode as encodeToon } from '@/lib/toon/encoder';

interface Table {
  id: string;
  name: string;
  row_count: number;
  data: any;
}

interface QueryResult {
  results: any[];
  execution_time_ms: number;
  row_count: number;
}

export default function QueryPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [toonPathQuery, setToonPathQuery] = useState('hikes');
  const [results, setResults] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables');
      if (response.ok) {
        const data = await response.json();
        setTables(data.tables || []);
        if (data.tables && data.tables.length > 0) {
          setSelectedTableId(data.tables[0].id);
          // Set initial query based on first table structure
          const firstTable = data.tables[0];
          if (firstTable.data && typeof firstTable.data === 'object') {
            const keys = Object.keys(firstTable.data);
            if (keys.length > 0) {
              setToonPathQuery(keys[0]);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const executeQuery = async () => {
    if (!selectedTableId) {
      setError('Please select a table');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table_id: selectedTableId,
          query: toonPathQuery,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Query failed');
      }

      // Ensure results is always an array
      if (data.results && !Array.isArray(data.results)) {
        data.results = [];
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query execution failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = (format: 'json' | 'csv' | 'toon') => {
    if (!results || !results.results) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(results.results, null, 2);
      filename = 'query_results.json';
      mimeType = 'application/json';
    } else if (format === 'toon') {
      // TOON format
      if (results.results.length === 0) return;
      
      try {
        // Wrap results in an object with a "results" key for TOON encoding
        const dataToEncode = { results: results.results };
        console.log('Data to encode:', dataToEncode);
        content = encodeToon(dataToEncode, { delimiter: ',' });
        filename = 'query_results.toon';
        mimeType = 'text/plain';
      } catch (error) {
        console.error('Error encoding TOON:', error);
        console.error('Error details:', error instanceof Error ? error.message : error);
        console.error('Data that failed:', results.results);
        alert(`Failed to encode results as TOON format: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    } else {
      // CSV
      if (results.results.length === 0) return;
      
      const headers = Object.keys(results.results[0]);
      const csvRows = [
        headers.join(','),
        ...results.results.map((row: any) => 
          headers.map(header => {
            const value = row[header];
            const stringValue = value === null || value === undefined ? '' : String(value);
            return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
          }).join(',')
        )
      ];
      content = csvRows.join('\n');
      filename = 'query_results.csv';
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exampleQueries = [
    { label: 'All items', query: 'hikes' },
    { label: 'Filter >7km', query: 'hikes.distanceKm>7' },
    { label: 'Sunny only', query: 'hikes.wasSunny==true' },
    { label: 'Sort & limit', query: 'hikes sort:distanceKm limit:3' },
    { label: 'Multiple filters', query: 'hikes.distanceKm>7 and wasSunny==true' },
  ];

  const getSmartQuery = () => {
    const table = tables.find(t => t.id === selectedTableId);
    if (!table || !table.data) return 'data';
    
    // If data is an object with array properties
    if (typeof table.data === 'object' && !Array.isArray(table.data)) {
      const keys = Object.keys(table.data);
      if (keys.length > 0) {
        return keys[0];
      }
    }
    
    return 'data';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6">
        <Link href="/dashboard" className="flex items-center space-x-2 mb-8">
          <Database className="w-8 h-8 text-primary-600" />
          <span className="text-xl font-bold text-gray-900">ToonDB</span>
        </Link>
        
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition"
          >
            <Database className="w-5 h-5" />
            <span className="font-medium">Tables</span>
          </Link>
          <Link
            href="/dashboard/query"
            className="flex items-center space-x-3 px-4 py-3 bg-primary-50 text-primary-600 rounded-lg"
          >
            <Play className="w-5 h-5" />
            <span className="font-medium">Query</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-6xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TOONPath Query Editor</h1>
          <p className="text-gray-600 mb-8">
            Query your TOON data with simple, intuitive TOONPath expressions
          </p>

          {/* Query Editor */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
            <div className="mb-4">
              <label htmlFor="table" className="block text-sm font-medium text-gray-700 mb-2">
                Select Table
              </label>
              <select
                id="table"
                value={selectedTableId}
                onChange={(e) => {
                  setSelectedTableId(e.target.value);
                  setToonPathQuery(getSmartQuery());
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
              >
                {tables.length === 0 ? (
                  <option value="">No tables available</option>
                ) : (
                  tables.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.name} ({table.row_count} rows)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                TOONPath Query
              </label>
              <textarea
                id="query"
                value={toonPathQuery}
                onChange={(e) => setToonPathQuery(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm text-gray-900 bg-white"
                placeholder="hikes.distanceKm>7 sort:distanceKm limit:5"
              />
              
              {/* Quick Examples */}
              <div className="mt-3 flex flex-wrap gap-2">
                {exampleQueries.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setToonPathQuery(example.query)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                  >
                    {example.label}
                  </button>
                ))}
                <button
                  onClick={() => setToonPathQuery(getSmartQuery())}
                  disabled={!selectedTableId}
                  className="px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition disabled:opacity-50"
                >
                  Auto-detect
                </button>
              </div>
            </div>

            <button
              onClick={executeQuery}
              disabled={loading || !selectedTableId}
              className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-5 h-5" />
              <span>{loading ? 'Executing...' : 'Execute Query'}</span>
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Results */}
          {results && (
            <>
              {/* Stats */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{results.execution_time_ms}ms</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Hash className="w-4 h-4" />
                    <span>{results.row_count} results</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadResults('toon')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    TOON
                  </button>
                  <button
                    onClick={() => downloadResults('json')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    JSON
                  </button>
                  <button
                    onClick={() => downloadResults('csv')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                  >
                    <Download className="w-4 h-4 inline mr-2" />
                    CSV
                  </button>
                </div>
              </div>

              {/* Results Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  {!results.results || !Array.isArray(results.results) || results.results.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                      No results found
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          {typeof results.results[0] === 'object' && results.results[0] !== null ? (
                            Object.keys(results.results[0]).map((key) => (
                              <th
                                key={key}
                                className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                              >
                                {key}
                              </th>
                            ))
                          ) : (
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                              Value
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {results.results.map((row: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            {typeof row === 'object' && row !== null ? (
                              Object.keys(results.results[0]).map((key) => (
                                <td key={key} className="px-6 py-4 text-sm text-gray-900">
                                  {typeof row[key] === 'object' 
                                    ? JSON.stringify(row[key])
                                    : String(row[key] ?? '-')}
                                </td>
                              ))
                            ) : (
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {typeof row === 'object' ? JSON.stringify(row) : String(row)}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Help Section */}
          {!results && !error && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">TOONPath Syntax Guide:</h3>
              <div className="text-sm text-blue-800 space-y-3">
                <div>
                  <strong>Basic Queries:</strong>
                  <ul className="mt-1 ml-4 space-y-1 list-disc list-inside">
                    <li><code className="bg-blue-100 px-1 rounded">hikes</code> - Get all items in hikes array</li>
                    <li><code className="bg-blue-100 px-1 rounded">context.location</code> - Get nested property</li>
                  </ul>
                </div>
                <div>
                  <strong>Filtering:</strong>
                  <ul className="mt-1 ml-4 space-y-1 list-disc list-inside">
                    <li><code className="bg-blue-100 px-1 rounded">hikes.distanceKm&gt;7</code> - Filter by comparison</li>
                    <li><code className="bg-blue-100 px-1 rounded">hikes.wasSunny==true</code> - Boolean filter</li>
                    <li><code className="bg-blue-100 px-1 rounded">hikes.companion==&apos;ana&apos;</code> - String filter (quotes required)</li>
                    <li><code className="bg-blue-100 px-1 rounded">hikes.distanceKm&gt;7 and wasSunny==true</code> - Multiple conditions</li>
                    <li><code className="bg-blue-100 px-1 rounded">hikes.companion in [&apos;ana&apos;,&apos;luis&apos;]</code> - In operator</li>
                  </ul>
                </div>
                <div>
                  <strong>Field Selection:</strong>
                  <ul className="mt-1 ml-4 space-y-1 list-disc list-inside">
                    <li><code className="bg-blue-100 px-1 rounded">hikes.name,distanceKm</code> - Select specific fields</li>
                    <li><code className="bg-blue-100 px-1 rounded">hikes.distanceKm&gt;7.name,companion</code> - Filter then select</li>
                  </ul>
                </div>
                <div>
                  <strong>Sorting & Limiting:</strong>
                  <ul className="mt-1 ml-4 space-y-1 list-disc list-inside">
                    <li><code className="bg-blue-100 px-1 rounded">hikes sort:distanceKm</code> - Sort ascending</li>
                    <li><code className="bg-blue-100 px-1 rounded">hikes sort:distanceKm:desc</code> - Sort descending</li>
                    <li><code className="bg-blue-100 px-1 rounded">hikes limit:5</code> - Limit results</li>
                    <li><code className="bg-blue-100 px-1 rounded">hikes.distanceKm&gt;7 sort:elevationGain limit:3</code> - Combined</li>
                  </ul>
                </div>
                <div>
                  <strong>Operators:</strong>
                  <ul className="mt-1 ml-4 space-y-1 list-disc list-inside">
                    <li>Comparison: <code className="bg-blue-100 px-1 rounded">==</code>, <code className="bg-blue-100 px-1 rounded">!=</code>, <code className="bg-blue-100 px-1 rounded">&lt;</code>, <code className="bg-blue-100 px-1 rounded">&gt;</code>, <code className="bg-blue-100 px-1 rounded">&lt;=</code>, <code className="bg-blue-100 px-1 rounded">&gt;=</code></li>
                    <li>Logical: <code className="bg-blue-100 px-1 rounded">and</code>, <code className="bg-blue-100 px-1 rounded">or</code></li>
                    <li>Membership: <code className="bg-blue-100 px-1 rounded">in</code></li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
