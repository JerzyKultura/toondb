'use client';

import Link from 'next/link';
import { ArrowLeft, Database } from 'lucide-react';

export default function DataManipulationDocs() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Database className="w-6 h-6 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">ToonDB</span>
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <Link
          href="/docs/toonpath"
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to TOONPath Docs</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto">
          <article className="max-w-none">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">ToonDB Data Manipulation Guide</h1>

            <p className="text-xl text-gray-700 mb-8">
              Complete guide to inserting, updating, and deleting data in ToonDB.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Overview</h2>
            <p className="text-gray-700 mb-4">
              ToonDB provides a powerful path-based API for manipulating data within your TOON tables. You can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-8">
              <li><strong className="text-gray-900">Update</strong> specific fields using path selectors</li>
              <li><strong className="text-gray-900">Insert</strong> new rows or objects</li>
              <li><strong className="text-gray-900">Delete</strong> items matching criteria</li>
              <li><strong className="text-gray-900">Bulk operations</strong> for multiple changes in one request</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Path Syntax</h2>
            <p className="text-gray-700 mb-4">
              The path syntax allows you to target specific data within your TOON structure:
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Basic Path</h3>
            <pre className="bg-gray-50 p-4 rounded-lg mb-6"><code className="text-gray-900 font-mono text-sm">{`products           # Access products array
store.products     # Access nested array at store.products`}</code></pre>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Selectors</h3>
            <p className="text-gray-700 mb-2">Target specific items within an array:</p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-6"><code className="text-gray-900 font-mono text-sm">{`products['Keyboard']                    # Match by string value (name field)
products[id==8]                         # Match by filter
products[price>100]                     # Match by comparison
products[category=='electronics']       # String values require quotes`}</code></pre>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Field Access</h3>
            <p className="text-gray-700 mb-2">Specify the field to update:</p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-6"><code className="text-gray-900 font-mono text-sm">{`products[id==8].price                   # Update price field of item with id==8
products['Keyboard'].stock              # Update stock of item named 'Keyboard'`}</code></pre>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Update Operations</h2>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Web Console</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
              <li>Navigate to your table detail page</li>
              <li>Click the <strong className="text-gray-900">Edit</strong> button on any row</li>
              <li>Modify fields inline</li>
              <li>Click <strong className="text-gray-900">Save</strong></li>
            </ol>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">API Endpoint</h3>
            <p className="text-gray-700 mb-2"><strong className="text-gray-900">POST</strong> <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">/api/tables/{'{tableId}'}/update</code></p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-4"><code className="text-gray-900 font-mono text-sm">{`{
  "path": "products[id==8].price",
  "value": 120.00
}`}</code></pre>

            <p className="text-gray-700 mb-2"><strong className="text-gray-900">Response:</strong></p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-8"><code className="text-gray-900 font-mono text-sm">{`{
  "success": true,
  "message": "Updated 1 item(s)",
  "modifiedCount": 1
}`}</code></pre>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">TypeScript SDK</h3>
            <pre className="bg-gray-50 p-4 rounded-lg mb-8"><code className="text-gray-900 font-mono text-sm">{`import { ToonDB } from 'toondb';

const db = new ToonDB({
  url: 'https://your-project.supabase.co',
  apiKey: 'your_api_key'
});

// Update single field
await db.tables.updateValue(
  'table-id',
  'products[id==8].price',
  120.00
);`}</code></pre>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Python SDK</h3>
            <pre className="bg-gray-50 p-4 rounded-lg mb-8"><code className="text-gray-900 font-mono text-sm">{`from toondb import ToonDB

db = ToonDB(
    url="https://your-project.supabase.co",
    api_key="your_api_key"
)

# Update single field
db.tables.update_value(
    table_id='table-id',
    path='products[id==8].price',
    value=120.00
)`}</code></pre>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Insert Operations</h2>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Web Console</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
              <li>Navigate to your table detail page</li>
              <li>Click the <strong className="text-gray-900">Add Row</strong> button</li>
              <li>Choose <strong className="text-gray-900">Form Fields</strong> or <strong className="text-gray-900">Plain Input</strong> mode</li>
              <li>Fill in the data</li>
              <li>Click <strong className="text-gray-900">Add Row</strong> to insert</li>
            </ol>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">API Endpoint</h3>
            <p className="text-gray-700 mb-2"><strong className="text-gray-900">POST</strong> <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">/api/tables/{'{tableId}'}/insert</code></p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-8"><code className="text-gray-900 font-mono text-sm">{`{
  "path": "products",
  "item": {
    "id": 16,
    "name": "New Keyboard",
    "price": 99.99,
    "stock": 25
  }
}`}</code></pre>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">TypeScript SDK</h3>
            <pre className="bg-gray-50 p-4 rounded-lg mb-8"><code className="text-gray-900 font-mono text-sm">{`// Insert into top-level array
await db.tables.insertItem(
  'table-id',
  'products',
  {
    id: 16,
    name: 'New Keyboard',
    price: 99.99,
    stock: 25,
    category: 'electronics'
  }
);`}</code></pre>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Delete Operations</h2>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Web Console</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
              <li>Navigate to your table detail page</li>
              <li>Click the <strong className="text-gray-900">Delete</strong> (trash) icon on a row</li>
              <li>Confirm deletion in the modal</li>
            </ol>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">API Endpoint</h3>
            <p className="text-gray-700 mb-2"><strong className="text-gray-900">POST</strong> <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">/api/tables/{'{tableId}'}/delete</code></p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-8"><code className="text-gray-900 font-mono text-sm">{`{
  "path": "products",
  "selector": {
    "id": 8
  }
}`}</code></pre>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">TypeScript SDK</h3>
            <pre className="bg-gray-50 p-4 rounded-lg mb-8"><code className="text-gray-900 font-mono text-sm">{`// Delete by single field
await db.tables.deleteItem(
  'table-id',
  'products',
  { id: 8 }
);

// Delete by multiple criteria
await db.tables.deleteItem(
  'table-id',
  'products',
  { category: 'electronics', stock: 0 }
);`}</code></pre>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Bulk Operations</h2>
            <p className="text-gray-700 mb-4">
              Execute multiple operations in a single transaction for better performance and consistency.
            </p>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">API Endpoint</h3>
            <p className="text-gray-700 mb-2"><strong className="text-gray-900">POST</strong> <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">/api/tables/{'{tableId}'}/bulk</code></p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-8"><code className="text-gray-900 font-mono text-sm">{`{
  "operations": [
    {
      "op": "update",
      "path": "products[id==8].price",
      "value": 120.00
    },
    {
      "op": "insert",
      "path": "products",
      "item": {
        "id": 17,
        "name": "New Product",
        "price": 50.00
      }
    },
    {
      "op": "delete",
      "path": "products",
      "selector": { "id": 5 }
    }
  ]
}`}</code></pre>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">TypeScript SDK</h3>
            <pre className="bg-gray-50 p-4 rounded-lg mb-8"><code className="text-gray-900 font-mono text-sm">{`const result = await db.tables.bulkOperation('table-id', [
  {
    op: 'update',
    path: 'products[id==8].price',
    value: 120.00
  },
  {
    op: 'insert',
    path: 'products',
    item: {
      id: 17,
      name: 'New Mouse',
      price: 29.99
    }
  },
  {
    op: 'delete',
    path: 'products',
    selector: { stock: 0 }
  }
]);`}</code></pre>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Best Practices</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-8">
              <li><strong className="text-gray-900">Use specific selectors</strong>: Target exact items to avoid unintended updates</li>
              <li><strong className="text-gray-900">Validate before bulk operations</strong>: Test individual operations first</li>
              <li><strong className="text-gray-900">Handle schema evolution</strong>: Review warnings when adding new fields</li>
              <li><strong className="text-gray-900">Use transactions</strong>: Bulk operations for related changes ensure consistency</li>
            </ol>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Try It Out</h2>
            <p className="text-gray-700 mb-4">
              Head to the <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 underline">dashboard</Link> to 
              start manipulating your TOON data. Create a table and try the inline editing, add rows, and delete operations!
            </p>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Need to Query Data?</h3>
              <p className="text-blue-800">
                Check out the <Link href="/docs/toonpath" className="underline">TOONPath Query Language</Link> guide for 
                reading and filtering your TOON data.
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

