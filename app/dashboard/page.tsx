'use client';

import { useState, useEffect } from 'react';
import { Database, Plus, Search, FileText, Activity, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Table {
  id: string;
  name: string;
  description: string | null;
  row_count: number;
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables');
      if (response.ok) {
        const data = await response.json();
        setTables(data.tables || []);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-8">
          <Database className="w-8 h-8 text-primary-600" />
          <span className="text-xl font-bold text-gray-900">ToonDB</span>
        </div>
        
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 px-4 py-3 bg-primary-50 text-primary-600 rounded-lg"
          >
            <Database className="w-5 h-5" />
            <span className="font-medium">Tables</span>
          </Link>
          <Link
            href="/dashboard/query"
            className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition"
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">Query</span>
          </Link>
          <Link
            href="/dashboard/analytics"
            className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition"
          >
            <Activity className="w-5 h-5" />
            <span className="font-medium">Analytics</span>
          </Link>
          <Link
            href="/dashboard/api-keys"
            className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">API Keys</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Tables</h1>
          <p className="text-gray-600">
            Manage your TOON datasets and tables
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Tables</p>
                <p className="text-3xl font-bold text-gray-900">{tables.length}</p>
              </div>
              <Database className="w-12 h-12 text-primary-200" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Token Savings</p>
                <p className="text-3xl font-bold text-green-600">~45%</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Search and Create */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <Link
            href="/dashboard/tables/new"
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Plus className="w-5 h-5" />
            <span>New Table</span>
          </Link>
        </div>

        {/* Tables List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading tables...</p>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tables yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first TOON table to get started
            </p>
            <Link
              href="/dashboard/tables/new"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Create Table</span>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTables.map((table) => (
                  <tr key={table.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/tables/${table.id}`}
                        className="font-medium text-primary-600 hover:text-primary-700"
                      >
                        {table.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {table.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(table.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/tables/${table.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

