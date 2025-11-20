# ToonDB Data Manipulation Guide

Complete guide to inserting, updating, and deleting data in ToonDB.

## Overview

ToonDB provides a powerful path-based API for manipulating data within your TOON tables. You can:

- **Update** specific fields using path selectors
- **Insert** new rows or objects
- **Delete** items matching criteria
- **Bulk operations** for multiple changes in one request

## Path Syntax

The path syntax allows you to target specific data within your TOON structure:

### Basic Path

```
products           # Access products array
store.products     # Access nested array at store.products
```

### Selectors

Target specific items within an array:

```
products['Keyboard']                    # Match by string value (name field)
products[id==8]                         # Match by filter
products[price>100]                     # Match by comparison
products[category=='electronics']       # String values require quotes
```

### Field Access

Specify the field to update:

```
products[id==8].price                   # Update price field of item with id==8
products['Keyboard'].stock              # Update stock of item named 'Keyboard'
```

## Update Operations

### Web Console

1. Navigate to your table detail page
2. Click the **Edit** button on any row
3. Modify fields in the modal
4. Click **Save Changes**

### API Endpoint

**POST** `/api/tables/{tableId}/update`

```json
{
  "path": "products[id==8].price",
  "value": 120.00
}
```

**Response:**
```json
{
  "success": true,
  "message": "Updated 1 item(s)",
  "modifiedCount": 1
}
```

### TypeScript SDK

```typescript
import { ToonDB } from 'toondb';

const db = new ToonDB({
  url: 'https://your-project.supabase.co',
  apiKey: 'your_api_key'
});

// Update single field
await db.tables.updateValue(
  'table-id',
  'products[id==8].price',
  120.00
);

// Update with string selector
await db.tables.updateValue(
  'table-id',
  "products['Mechanical Keyboard'].price",
  120.00
);

// Update nested field
await db.tables.updateValue(
  'table-id',
  'store.inventory[sku==\'KB-001\'].quantity',
  50
);
```

### Python SDK

```python
from toondb import ToonDB

db = ToonDB(
    url="https://your-project.supabase.co",
    api_key="your_api_key"
)

# Update single field
db.tables.update_value(
    table_id='table-id',
    path='products[id==8].price',
    value=120.00
)

# Update with string selector
db.tables.update_value(
    table_id='table-id',
    path="products['Mechanical Keyboard'].price",
    value=120.00
)
```

## Insert Operations

### Web Console

1. Navigate to your table detail page
2. Click the **Add Row** button
3. Fill in the form fields
4. Click **Add Row** to insert

### API Endpoint

**POST** `/api/tables/{tableId}/insert`

```json
{
  "path": "products",
  "item": {
    "id": 16,
    "name": "New Keyboard",
    "price": 99.99,
    "stock": 25
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item inserted successfully",
  "insertedCount": 1
}
```

### TypeScript SDK

```typescript
// Insert into top-level array
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
);

// Insert into nested array
await db.tables.insertItem(
  'table-id',
  'store.inventory',
  {
    sku: 'KB-016',
    location: 'Warehouse A',
    quantity: 100
  }
);
```

### Python SDK

```python
# Insert into top-level array
db.tables.insert_item(
    table_id='table-id',
    path='products',
    item={
        'id': 16,
        'name': 'New Keyboard',
        'price': 99.99,
        'stock': 25
    }
)

# Disable validation if needed
db.tables.insert_item(
    table_id='table-id',
    path='products',
    item={'id': 17, 'name': 'Test'},
    validate=False
)
```

## Delete Operations

### Web Console

1. Navigate to your table detail page
2. Click the **Delete** (trash) icon on a row
3. Confirm deletion in the modal

### API Endpoint

**POST** `/api/tables/{tableId}/delete`

```json
{
  "path": "products",
  "selector": {
    "id": 8
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deleted 1 item(s)",
  "deletedCount": 1
}
```

### TypeScript SDK

```typescript
// Delete by single field
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
);

// Delete from nested array
await db.tables.deleteItem(
  'table-id',
  'store.inventory',
  { location: 'Warehouse B' }
);
```

### Python SDK

```python
# Delete by single field
db.tables.delete_item(
    table_id='table-id',
    path='products',
    selector={'id': 8}
)

# Delete by multiple criteria
db.tables.delete_item(
    table_id='table-id',
    path='products',
    selector={'category': 'electronics', 'stock': 0}
)
```

## Bulk Operations

Execute multiple operations in a single transaction for better performance and consistency.

### API Endpoint

**POST** `/api/tables/{tableId}/bulk`

```json
{
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
}
```

**Response:**
```json
{
  "success": true,
  "message": "All 3 operations completed successfully",
  "results": [
    { "success": true, "message": "Updated 1 item(s)", "count": 1 },
    { "success": true, "message": "Item inserted successfully", "count": 1 },
    { "success": true, "message": "Deleted 1 item(s)", "count": 1 }
  ]
}
```

### TypeScript SDK

```typescript
const result = await db.tables.bulkOperation('table-id', [
  {
    op: 'update',
    path: 'products[id==8].price',
    value: 120.00
  },
  {
    op: 'update',
    path: 'products[id==9].stock',
    value: 15
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
]);

console.log(`Completed: ${result.results.filter(r => r.success).length}/${result.results.length}`);
```

### Python SDK

```python
result = db.tables.bulk_operation(
    table_id='table-id',
    operations=[
        {
            'op': 'update',
            'path': 'products[id==8].price',
            'value': 120.00
        },
        {
            'op': 'insert',
            'path': 'products',
            'item': {
                'id': 17,
                'name': 'New Mouse',
                'price': 29.99
            }
        },
        {
            'op': 'delete',
            'path': 'products',
            'selector': {'stock': 0}
        }
    ]
)

print(f"Success: {result['success']}")
print(f"Message: {result['message']}")
```

## Schema Validation

ToonDB uses flexible schema validation to maintain data integrity while allowing evolution.

### How It Works

1. **Schema Detection**: Automatically detects field types from existing data
2. **Validation**: Checks new items against detected schema
3. **Warnings**: Suggests field names for typos
4. **Evolution**: Allows new fields with warnings

### Insert with Validation

By default, insertions are validated:

```typescript
// This will validate against existing schema
await db.tables.insertItem('table-id', 'products', {
  id: 16,
  name: 'New Product',
  price: 99.99,
  // New field - will generate warning but succeed
  warranty_years: 2
});
```

### Disable Validation

```python
# Skip validation for special cases
db.tables.insert_item(
    table_id='table-id',
    path='products',
    item={'id': 17, 'test_field': 'value'},
    validate=False
)
```

## Error Handling

### Common Errors

**Path Not Found**
```json
{
  "error": "Property 'products' not found"
}
```

**Selector No Match**
```json
{
  "error": "No items found matching selector"
}
```

**Validation Failed**
```json
{
  "error": "Validation failed",
  "errors": [
    "Required field 'id' is missing",
    "Field 'price' has wrong type: expected number, got string"
  ],
  "warnings": [
    "New field 'waranty' - did you mean 'warranty'?"
  ]
}
```

### Error Handling in Code

**TypeScript:**
```typescript
try {
  await db.tables.updateValue('table-id', 'products[id==999].price', 100);
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error('Product not found');
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
  } else {
    console.error('Error:', error.message);
  }
}
```

**Python:**
```python
from toondb.exceptions import NotFoundError, ValidationError

try:
    db.tables.update_value('table-id', 'products[id==999].price', 100)
except ValidationError as e:
    print(f"Validation error: {e}")
except NotFoundError as e:
    print(f"Not found: {e}")
except Exception as e:
    print(f"Error: {e}")
```

## Best Practices

### 1. Use Specific Selectors

```typescript
// Good: Specific selector
await db.tables.updateValue('table-id', 'products[id==8].price', 120);

// Avoid: Ambiguous selector (updates first match only)
await db.tables.updateValue('table-id', 'products[price>0].price', 120);
```

### 2. Validate Before Bulk Operations

```typescript
// Validate individual operations first
const testUpdate = await db.tables.updateValue('table-id', 'products[id==8].price', 120);

if (testUpdate.success) {
  // Then proceed with bulk
  await db.tables.bulkOperation('table-id', [...operations]);
}
```

### 3. Handle Schema Evolution

```typescript
// Add new fields with validation enabled
// Review warnings to catch typos
const result = await db.tables.insertItem('table-id', 'products', {
  id: 16,
  name: 'New Product',
  new_field: 'value'  // Will generate warning
});

// Check warnings
console.log(result.warnings);
```

### 4. Use Transactions for Related Changes

```typescript
// Use bulk operations for related changes
await db.tables.bulkOperation('table-id', [
  { op: 'update', path: 'products[id==8].stock', value: 10 },
  { op: 'update', path: 'inventory[sku==\'KB-008\'].quantity', value: 10 }
]);
```

## Examples

### E-commerce: Update Product Inventory

```typescript
// Update stock after sale
await db.tables.bulkOperation('ecommerce-db', [
  {
    op: 'update',
    path: 'products[id==8].stock',
    value: 23  // Decrease by 2
  },
  {
    op: 'insert',
    path: 'orders',
    item: {
      id: 1001,
      product_id: 8,
      quantity: 2,
      timestamp: new Date().toISOString()
    }
  }
]);
```

### User Management: Add New User

```python
# Create new user profile
db.tables.insert_item(
    table_id='users-db',
    path='users',
    item={
        'id': 42,
        'username': 'alice',
        'email': 'alice@example.com',
        'role': 'user',
        'created_at': '2025-11-17T10:00:00Z'
    }
)
```

### Cleanup: Remove Inactive Items

```typescript
// Remove out-of-stock products
await db.tables.deleteItem('products-db', 'products', {
  stock: 0,
  discontinued: true
});
```

## See Also

- [TOONPath Query Language](./TOONPATH.md) - For reading data
- [API Reference](./API.md) - Full API documentation
- [TypeScript SDK](../sdk/typescript/README.md) - TypeScript SDK docs
- [Python SDK](../sdk/python/README.md) - Python SDK docs

