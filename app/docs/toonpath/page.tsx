'use client';

import Link from 'next/link';
import { ArrowLeft, Database } from 'lucide-react';

export default function TOONPathDocs() {
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
          href="/"
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8 max-w-4xl mx-auto">
          <article className="max-w-none">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">TOONPath Query Language</h1>

            <p className="text-xl text-gray-700 mb-8">
              TOONPath is a simple, intuitive query language designed specifically for TOON data structures. 
              Unlike JSONPath or SQL, TOONPath uses natural, readable syntax that mirrors how you think about your data.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Why TOONPath?</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-8">
              <li><strong className="text-gray-900">Simple</strong>: No complex syntax to learn - queries look like natural paths</li>
              <li><strong className="text-gray-900">Powerful</strong>: Supports filtering, field selection, sorting, and limiting</li>
              <li><strong className="text-gray-900">TOON-native</strong>: Built specifically for TOON data structures</li>
              <li><strong className="text-gray-900">Type-aware</strong>: Works naturally with TOON's schema-aware format</li>
            </ul>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Quick Start</h2>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Basic Queries</h3>
            <p className="text-gray-700 mb-2">Get all items from an array:</p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-6"><code className="text-gray-900 font-mono text-sm">products</code></pre>

            <p className="text-gray-700 mb-2">Access nested properties:</p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-6"><code className="text-gray-900 font-mono text-sm">store.location</code></pre>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Filtering</h3>
            <p className="text-gray-700 mb-2">Filter with comparisons:</p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-6"><code className="text-gray-900 font-mono text-sm">products.price&gt;100</code></pre>

            <p className="text-gray-700 mb-2">Multiple conditions:</p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-6"><code className="text-gray-900 font-mono text-sm">products.price&gt;100 and inStock==true</code></pre>

            <p className="text-gray-700 mb-2">String matching (quotes required):</p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-6"><code className="text-gray-900 font-mono text-sm">products.category=='electronics'</code></pre>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Field Selection</h3>
            <p className="text-gray-700 mb-2">Select specific fields:</p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-6"><code className="text-gray-900 font-mono text-sm">products.name,price</code></pre>

            <p className="text-gray-700 mb-2">Combine with filtering:</p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-6"><code className="text-gray-900 font-mono text-sm">products.price&gt;100.name,price</code></pre>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Sorting</h3>
            <p className="text-gray-700 mb-2">Sort ascending:</p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-6"><code className="text-gray-900 font-mono text-sm">products sort:price</code></pre>

            <p className="text-gray-700 mb-2">Sort descending:</p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-6"><code className="text-gray-900 font-mono text-sm">products sort:price:desc</code></pre>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Limiting</h3>
            <p className="text-gray-700 mb-2">Limit results:</p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-6"><code className="text-gray-900 font-mono text-sm">products limit:5</code></pre>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Complete Example</h3>
            <pre className="bg-gray-50 p-4 rounded-lg mb-4"><code className="text-gray-900 font-mono text-sm">products.price&gt;100 and inStock==true sort:price:desc limit:10.name,price</code></pre>

            <p className="text-gray-700 mb-2">This query:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-8">
              <li>Gets the <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">products</code> array</li>
              <li>Filters for products over $100 that are in stock</li>
              <li>Sorts by price (descending)</li>
              <li>Takes the top 10 results</li>
              <li>Returns only the name and price fields</li>
            </ol>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Syntax Reference</h2>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Operators</h3>
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left border-b text-gray-900 font-semibold">Operator</th>
                    <th className="px-4 py-2 text-left border-b text-gray-900 font-semibold">Description</th>
                    <th className="px-4 py-2 text-left border-b text-gray-900 font-semibold">Example</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr>
                    <td className="px-4 py-2 border-b"><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-900">==</code></td>
                    <td className="px-4 py-2 border-b">Equal to</td>
                    <td className="px-4 py-2 border-b"><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-900">price==99.99</code></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b"><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-900">!=</code></td>
                    <td className="px-4 py-2 border-b">Not equal to</td>
                    <td className="px-4 py-2 border-b"><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-900">status!='cancelled'</code></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b"><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-900">&gt;</code></td>
                    <td className="px-4 py-2 border-b">Greater than</td>
                    <td className="px-4 py-2 border-b"><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-900">price&gt;50</code></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b"><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-900">&lt;</code></td>
                    <td className="px-4 py-2 border-b">Less than</td>
                    <td className="px-4 py-2 border-b"><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-900">stock&lt;10</code></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b"><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-900">&gt;=</code></td>
                    <td className="px-4 py-2 border-b">Greater than or equal</td>
                    <td className="px-4 py-2 border-b"><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-900">rating&gt;=4.5</code></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b"><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-900">&lt;=</code></td>
                    <td className="px-4 py-2 border-b">Less than or equal</td>
                    <td className="px-4 py-2 border-b"><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-900">price&lt;=100</code></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b"><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-900">and</code></td>
                    <td className="px-4 py-2 border-b">Logical AND</td>
                    <td className="px-4 py-2 border-b"><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-900">price&gt;50 and inStock==true</code></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 border-b"><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-900">or</code></td>
                    <td className="px-4 py-2 border-b">Logical OR</td>
                    <td className="px-4 py-2 border-b"><code className="bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-900">category=='electronics' or category=='computers'</code></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Path Resolution</h3>
            <p className="text-gray-700 mb-2"><strong className="text-gray-900">Important</strong>: TOONPath uses strict path resolution. You must provide the full path from the root.</p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-8"><code className="text-gray-900 font-mono text-sm">{`// Correct
products           // Get 'products' array
store.products     // Get 'products' inside 'store'

// Incorrect
product            // Typo - won't match 'products'
products.store     // Wrong nesting order`}</code></pre>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">String Values</h3>
            <p className="text-gray-700 mb-2">String values in filters must be enclosed in single or double quotes:</p>
            <pre className="bg-gray-50 p-4 rounded-lg mb-8"><code className="text-gray-900 font-mono text-sm">{`products.name=='Laptop'     // Correct
products.name=='Laptop Pro'  // Correct
products.name==Laptop        // Incorrect - missing quotes`}</code></pre>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Common Examples</h2>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">E-commerce Queries</h3>
            <pre className="bg-gray-50 p-4 rounded-lg mb-8"><code className="text-gray-900 font-mono text-sm">{`// Get all products
products

// Products under $50
products.price<50

// Electronics in stock
products.category=='electronics' and inStock==true

// Top 5 rated products
products sort:rating:desc limit:5

// Affordable laptops with name and price
products.category=='computers' and price<1500.name,price`}</code></pre>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Customer Queries</h3>
            <pre className="bg-gray-50 p-4 rounded-lg mb-8"><code className="text-gray-900 font-mono text-sm">{`// Premium customers
customers.isPremium==true

// High spenders
customers.totalSpent>2000

// Recent customers sorted by join date
customers sort:memberSince:desc limit:10

// Customer names and emails only
customers.name,email`}</code></pre>

            <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-3">Order Queries</h3>
            <pre className="bg-gray-50 p-4 rounded-lg mb-8"><code className="text-gray-900 font-mono text-sm">{`// Pending orders
orders.status=='processing'

// Large orders
orders.totalPrice>500

// Recent shipped orders
orders.status=='shipped' sort:orderDate:desc limit:20

// Failed deliveries
orders.status=='cancelled' or shipped==false`}</code></pre>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Best Practices</h2>

            <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-8">
              <li><strong className="text-gray-900">Use exact field names</strong>: TOONPath is case-sensitive. <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">Price</code> ≠ <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">price</code></li>
              <li><strong className="text-gray-900">Quote strings</strong>: Always use quotes for string comparisons</li>
              <li><strong className="text-gray-900">Know your structure</strong>: Use the correct nested path for your data</li>
              <li><strong className="text-gray-900">Combine operators</strong>: Use <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">and</code>/<code className="bg-gray-100 px-2 py-0.5 rounded text-sm">or</code> for complex queries</li>
              <li><strong className="text-gray-900">Select fields wisely</strong>: Reduce data transfer with field selection</li>
              <li><strong className="text-gray-900">Limit results</strong>: Add <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">limit</code> for better performance</li>
            </ol>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Try It Out</h2>
            <p className="text-gray-700 mb-4">
              Head back to the <Link href="/" className="text-primary-600 hover:text-primary-700 underline">home page</Link> to 
              try TOONPath queries with the interactive playground. Paste your JSON data and experiment with different queries!
            </p>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-800">
                Check out the <Link href="/docs/data-manipulation" className="underline">Data Manipulation Guide</Link> for 
                information on updating, inserting, and deleting data with ToonDB.
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

