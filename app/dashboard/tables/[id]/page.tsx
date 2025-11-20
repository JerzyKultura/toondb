'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Edit, Trash2, Calendar, Database, Plus, Check, X } from 'lucide-react';
import { InsertRowForm } from '@/components/InsertRowForm';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';

interface Table {
  id: string;
  name: string;
  description: string | null;
  schema_fields: Record<string, string>;
  row_count: number;
  data: any;
  toon_content: string | null;
  delimiter: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export default function TableDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [table, setTable] = useState<Table | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [showRowDeleteModal, setShowRowDeleteModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedTableKey, setSelectedTableKey] = useState<string>('');
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [editedRowData, setEditedRowData] = useState<Record<string, any>>({});
  const [editingToon, setEditingToon] = useState(false);
  const [editedToonContent, setEditedToonContent] = useState('');

  const getTableKeys = () => {
    if (!table?.data) return [];
    return Object.keys(table.data).filter(key => Array.isArray(table.data[key]));
  };

  const getCurrentTableData = () => {
    if (!table?.data || !selectedTableKey) return [];
    return table.data[selectedTableKey] || [];
  };

  useEffect(() => {
    fetchTable();
  }, [params.id]);

  // Set default selected table when data loads
  useEffect(() => {
    if (table?.data && !selectedTableKey) {
      const tableKeys = Object.keys(table.data).filter(key => Array.isArray(table.data[key]));
      if (tableKeys.length > 0) {
        setSelectedTableKey(tableKeys[0]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table?.data]);

  const fetchTable = async () => {
    try {
      const response = await fetch(`/api/tables/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch table');
      }
      const data = await response.json();
      setTable(data.table);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load table');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/tables/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete table');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete table');
      setShowDeleteConfirm(false);
    }
  };

  const downloadToon = () => {
    if (!table?.toon_content) return;
    
    const blob = new Blob([table.toon_content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${table.name}.toon`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    if (!table?.data) return;
    
    const json = JSON.stringify(table.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${table.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEditRow = (row: any, index: number) => {
    setEditingRowIndex(index);
    setEditedRowData({ ...row });
  };

  const handleCancelEdit = () => {
    setEditingRowIndex(null);
    setEditedRowData({});
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedRowData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    if (editingRowIndex === null || !table || !selectedTableKey) return;

    const currentData = getCurrentTableData();
    const originalRow = currentData[editingRowIndex];
    
    if (!originalRow) return;

    // Find identifier field (usually 'id' or 'name')
    const idField = 'id' in originalRow ? 'id' : 'name' in originalRow ? 'name' : Object.keys(originalRow)[0];
    const selector = originalRow[idField];

    // Update each changed field
    const changes = Object.keys(editedRowData).filter(key => editedRowData[key] !== originalRow[key]);
    
    try {
      for (const key of changes) {
        const path = `${selectedTableKey}[${idField}=='${selector}'].${key}`;
        
        const response = await fetch(`/api/tables/${params.id}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path, value: editedRowData[key] }),
        });

        if (!response.ok) {
          throw new Error('Failed to update');
        }
      }

      setSuccessMessage('Row updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      setEditingRowIndex(null);
      setEditedRowData({});
      fetchTable();
    } catch (err) {
      alert('Failed to save changes');
    }
  };

  const handleInsertRow = async (newData: Record<string, any>) => {
    if (!table || !selectedTableKey) return;
    
    const response = await fetch(`/api/tables/${params.id}/insert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: selectedTableKey, item: newData }),
    });

    if (!response.ok) {
      throw new Error('Failed to insert');
    }

    setSuccessMessage('Row added successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
    fetchTable();
  };

  const handleDeleteRow = async () => {
    if (selectedRow === null || !table || !selectedTableKey) return;

    const idField = 'id' in selectedRow ? 'id' : 'name' in selectedRow ? 'name' : Object.keys(selectedRow)[0];
    const selector = { [idField]: selectedRow[idField] };

    const response = await fetch(`/api/tables/${params.id}/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: selectedTableKey, selector }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete');
    }

    setSuccessMessage('Row deleted successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
    setShowRowDeleteModal(false);
    setSelectedRow(null);
    fetchTable();
  };

  const handleEditToon = () => {
    setEditedToonContent(table?.toon_content || '');
    setEditingToon(true);
  };

  const handleCancelToonEdit = () => {
    setEditingToon(false);
    setEditedToonContent('');
  };

  const handleSaveToon = async () => {
    if (!table) return;

    try {
      const response = await fetch(`/api/tables/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toon_content: editedToonContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to update TOON content');
      }

      setSuccessMessage('TOON content updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      setEditingToon(false);
      fetchTable();
    } catch (err) {
      alert('Failed to save TOON content');
    }
  };

  const getSchema = () => {
    if (!table?.data || !selectedTableKey) return [];
    const currentData = table.data[selectedTableKey];
    if (!Array.isArray(currentData) || currentData.length === 0) return [];
    
    const firstItem = currentData[0];
    if (!firstItem) return [];
    
    return Object.keys(firstItem).map(key => ({
      name: key,
      type: typeof firstItem[key],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading table...</p>
        </div>
      </div>
    );
  }

  if (error || !table) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Table not found'}</p>
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-6">
        <Link href="/dashboard" className="flex items-center space-x-2 mb-8">
          <Database className="w-8 h-8 text-primary-600" />
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{table.name}</h1>
              {table.description && (
                <p className="text-gray-600 mt-2">{table.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={downloadToon}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download TOON</span>
              </button>
              <button
                onClick={downloadJson}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download JSON</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Created {new Date(table.created_at).toLocaleDateString()}</span>
            </div>
            <div>
              Delimiter: <span className="font-mono">{table.delimiter === '\t' ? '\\t' : table.delimiter}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Visibility</h3>
            <p className="text-3xl font-bold text-gray-900">
              {table.is_public ? 'Public' : 'Private'}
            </p>
          </div>
        </div>

        {/* TOON Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">TOON Format</h2>
            {!editingToon ? (
              <button
                onClick={handleEditToon}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <Edit className="w-4 h-4" />
                <span>Edit TOON</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveToon}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Check className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancelToonEdit}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
          {editingToon ? (
            <textarea
              value={editedToonContent}
              onChange={(e) => setEditedToonContent(e.target.value)}
              className="w-full min-h-[400px] bg-gray-50 p-4 rounded-lg text-sm font-mono text-gray-800 border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              spellCheck={false}
            />
          ) : (
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono text-gray-800 border border-gray-200">
{table.toon_content}
            </pre>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Data Preview */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">Data Preview</h2>
              {getTableKeys().length > 1 && (
                <select
                  value={selectedTableKey}
                  onChange={(e) => setSelectedTableKey(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                >
                  {getTableKeys().map((key) => (
                    <option key={key} value={key}>
                      {key} ({table.data[key]?.length || 0} rows)
                    </option>
                  ))}
                </select>
              )}
            </div>
            <button
              onClick={() => setShowInsertModal(true)}
              disabled={!selectedTableKey}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Add Row</span>
            </button>
          </div>
          
          {getCurrentTableData().length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {getCurrentTableData()[0] && Object.keys(getCurrentTableData()[0]).map((field) => (
                      <th
                        key={field}
                        className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                      >
                        {field}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {getCurrentTableData().slice(0, 100).map((row: any, idx: number) => {
                    const isEditing = editingRowIndex === idx;
                    return (
                      <tr key={idx} className={isEditing ? "bg-blue-50" : "hover:bg-gray-50"}>
                        {Object.keys(row).map((field) => (
                          <td key={field} className="px-6 py-4 text-sm text-gray-900">
                            {isEditing ? (
                              typeof row[field] === 'boolean' ? (
                                <select
                                  value={String(editedRowData[field])}
                                  onChange={(e) => handleFieldChange(field, e.target.value === 'true')}
                                  className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                >
                                  <option value="true">true</option>
                                  <option value="false">false</option>
                                </select>
                              ) : typeof row[field] === 'number' ? (
                                <input
                                  type="number"
                                  step="any"
                                  value={editedRowData[field] ?? ''}
                                  onChange={(e) => handleFieldChange(field, parseFloat(e.target.value))}
                                  className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={editedRowData[field] ?? ''}
                                  onChange={(e) => handleFieldChange(field, e.target.value)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                                />
                              )
                            ) : (
                              String(row[field] ?? '-')
                            )}
                          </td>
                        ))}
                        <td className="px-6 py-4 text-sm">
                          {isEditing ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSaveEdit}
                                className="text-green-600 hover:text-green-700"
                                title="Save"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-600 hover:text-gray-700"
                                title="Cancel"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditRow(row, idx)}
                                className="text-primary-600 hover:text-primary-700"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedRow(row);
                                  setShowRowDeleteModal(true);
                                }}
                                className="text-red-600 hover:text-red-700"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {getCurrentTableData().length > 100 && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Showing first 100 of {getCurrentTableData().length} rows
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </div>
      </main>

      {/* Delete Table Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Delete Table?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{table.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Row Form */}
      <InsertRowForm
        isOpen={showInsertModal}
        onClose={() => setShowInsertModal(false)}
        onInsert={handleInsertRow}
        schema={getSchema()}
      />

      {/* Delete Row Confirmation */}
      <DeleteConfirmModal
        isOpen={showRowDeleteModal}
        onClose={() => {
          setShowRowDeleteModal(false);
          setSelectedRow(null);
        }}
        onConfirm={handleDeleteRow}
        itemCount={1}
        loading={false}
      />
    </div>
  );
}

