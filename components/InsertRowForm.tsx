'use client';

import { useState } from 'react';
import { Plus, X, FileText, FormInput } from 'lucide-react';

interface InsertRowFormProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (data: Record<string, any>) => Promise<void>;
  schema: Array<{ name: string; type: string }>;
}

export function InsertRowForm({ isOpen, onClose, onInsert, schema }: InsertRowFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [plainInput, setPlainInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'form' | 'plain'>('form');

  if (!isOpen) return null;

  const parsePlainInput = (input: string): Record<string, any> => {
    const values = input.split(',').map(v => v.trim());
    const result: Record<string, any> = {};

    schema.forEach((field, index) => {
      if (index < values.length) {
        const value = values[index];
        
        // Convert based on field type
        if (field.type === 'number') {
          result[field.name] = parseFloat(value);
        } else if (field.type === 'boolean') {
          result[field.name] = value.toLowerCase() === 'true';
        } else {
          result[field.name] = value;
        }
      }
    });

    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let dataToInsert: Record<string, any>;
      
      if (mode === 'plain') {
        dataToInsert = parsePlainInput(plainInput);
      } else {
        dataToInsert = formData;
      }

      await onInsert(dataToInsert);
      setFormData({});
      setPlainInput('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to insert');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: any, type: string) => {
    let parsedValue = value;
    if (type === 'number') {
      parsedValue = value === '' ? '' : parseFloat(value);
    } else if (type === 'boolean') {
      parsedValue = value === 'true';
    }
    setFormData(prev => ({ ...prev, [key]: parsedValue }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Add New Row
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Mode Toggle */}
          <div className="mb-4 flex items-center justify-center space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('form')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition ${
                mode === 'form'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FormInput className="w-4 h-4" />
              <span>Form Fields</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('plain')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition ${
                mode === 'plain'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Plain Input</span>
            </button>
          </div>

          {mode === 'plain' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter values (comma-separated)
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  Order: {schema.map(f => f.name).join(', ')}
                </div>
                <textarea
                  value={plainInput}
                  onChange={(e) => setPlainInput(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white font-mono"
                  rows={3}
                  placeholder={`Example: ${schema.map((f, i) => {
                    if (f.type === 'number') return i + 1;
                    if (f.type === 'boolean') return 'true';
                    return 'value';
                  }).join(',')}`}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Types: {schema.map(f => `${f.name} (${f.type})`).join(', ')}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
            {schema.map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.name}
                  <span className="text-gray-500 ml-2">({field.type})</span>
                </label>
                {field.type === 'boolean' ? (
                  <select
                    value={String(formData[field.name] || false)}
                    onChange={e => handleChange(field.name, e.target.value, field.type)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                  >
                    <option value="false">false</option>
                    <option value="true">true</option>
                  </select>
                ) : field.type === 'number' ? (
                  <input
                    type="number"
                    step="any"
                    value={formData[field.name] || ''}
                    onChange={e => handleChange(field.name, e.target.value, field.type)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                    placeholder={`Enter ${field.name}`}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[field.name] || ''}
                    onChange={e => handleChange(field.name, e.target.value, field.type)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-gray-900 bg-white"
                    placeholder={`Enter ${field.name}`}
                  />
                )}
              </div>
            ))}
            </div>
          )}

          <div className="mt-6 flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Row'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

