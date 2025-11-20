'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload } from 'lucide-react';

export default function NewTable() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    toonContent: '',
    delimiter: ','
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          toon_content: formData.toonContent,
          delimiter: formData.delimiter,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create table');
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create table');
    } finally {
      setLoading(false);
    }
  };

  const exampleToon = `users[3]{id,name,role}:
  1,Alice,admin
  2,Bob,user
  3,Charlie,user`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6">
        <Link href="/dashboard" className="flex items-center space-x-2 mb-8">
          <span className="text-xl font-bold text-gray-900">ToonDB</span>
        </Link>
        
        <Link
          href="/dashboard"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Table</h1>
          <p className="text-gray-600 mb-8">
            Import your data in TOON format for efficient token usage
          </p>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Table Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Table Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="e.g., users, products, orders"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="Brief description of this table"
              />
            </div>

            {/* Delimiter */}
            <div>
              <label htmlFor="delimiter" className="block text-sm font-medium text-gray-700 mb-2">
                Delimiter
              </label>
              <select
                id="delimiter"
                value={formData.delimiter}
                onChange={(e) => setFormData({ ...formData, delimiter: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value=",">Comma (,)</option>
                <option value="\t">Tab (\t)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>

            {/* TOON Content */}
            <div>
              <label htmlFor="toonContent" className="block text-sm font-medium text-gray-700 mb-2">
                TOON Content *
              </label>
              <textarea
                id="toonContent"
                required
                value={formData.toonContent}
                onChange={(e) => setFormData({ ...formData, toonContent: e.target.value })}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm text-gray-900 bg-white"
                placeholder={exampleToon}
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter your data in TOON format. See example above.
              </p>
            </div>

            {/* Example */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Example TOON Format:</h3>
              <pre className="text-sm text-blue-800 font-mono">
{exampleToon}
              </pre>
              <p className="mt-2 text-sm text-blue-700">
                Format: <code>tableName[count]&#123;field1,field2,...&#125;:</code> followed by data rows
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>{loading ? 'Creating...' : 'Create Table'}</span>
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

