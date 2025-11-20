# Multi-Table TOON File Support

## Overview

ToonDB now fully supports TOON files that contain multiple tables/arrays. This is essential for complex datasets like the `ecommerce-store.toon` example, which includes:

- `products` (15 items)
- `customers` (10 items)  
- `orders` (20 items)
- `reviews` (12 items)
- `inventory` (15 items)
- `shipping` (8 items)
- `promotions` (5 items)

Plus non-array data like `store` (object) and `analytics` (object).

## How It Works

### Automatic Table Detection

When you open a TOON file with multiple tables, the system:

1. **Detects all array fields** in the TOON data structure
2. **Auto-selects** the first table by default
3. **Shows a dropdown** if multiple tables exist

### UI Features

#### Table Selector Dropdown

When a TOON file has multiple tables, a dropdown appears next to the "Data Preview" heading:

```
Data Preview  [products (15 rows) ▼]    [+ Add Row]
```

The dropdown shows:
- Table name
- Row count for each table
- Easy switching between tables

#### Single Table Files

For files with only one table, no dropdown is shown - it just works as before.

### Data Operations

All CRUD operations work correctly with the selected table:

#### Update

```typescript
// Automatically uses the selected table
await db.tables.updateValue('table-id', 'products[id==8].price', 120.00);
```

#### Insert

```typescript
// Adds to the selected table
await db.tables.insertItem('table-id', 'products', {
  id: 16,
  name: 'New Product',
  price: 99.99
});
```

#### Delete

```typescript
// Deletes from the selected table
await db.tables.deleteItem('table-id', 'products', { id: 8 });
```

## Implementation Details

### State Management

Added `selectedTableKey` state to track which table is currently active:

```typescript
const [selectedTableKey, setSelectedTableKey] = useState<string>('');
```

### Helper Functions

**`getTableKeys()`**
- Filters TOON data to return only array fields
- Used to populate the table selector dropdown

**`getCurrentTableData()`**
- Returns the data array for the currently selected table
- Handles cases where selected table doesn't exist

### Path Resolution

All API calls now use the `selectedTableKey` for path construction:

```typescript
// Before (assumed first table)
const path = Object.keys(table.data)[0];

// After (uses selected table)
const path = selectedTableKey;
```

## Example: ecommerce-store.toon

### Structure

```toon
store:
  name: TechHub Electronics
  location: San Francisco, CA

categories[5]: Electronics,Computers,Accessories,Audio,Gaming

products[15]{id,name,category,price,inStock,rating,sales}:
  1,UltraBook Pro 15,Computers,1299.99,true,4.8,245
  ...

customers[10]{id,name,email,memberSince,isPremium}:
  1,Alice Johnson,alice@email.com,2020-03-15,true
  ...

orders[20]{id,customerId,productId,quantity,totalPrice}:
  1,1,7,1,249.99,2024-01-15
  ...
```

### Usage

1. **Navigate** to the ecommerce-store table
2. **See** the dropdown showing: products, customers, orders, reviews, etc.
3. **Select** "products" from dropdown
4. **View** all 15 products in the table
5. **Click "Add Row"** to add a new product
6. **Switch** to "customers" to see customer data
7. **Edit/Delete** works on the selected table

## Benefits

### Better Organization

- Keep related data in one file
- Logical grouping (e.g., store + products + customers)
- Easier to manage complex datasets

### Improved UX

- Quick switching between tables
- Clear indication of which table you're viewing
- No need to create separate files for related data

### Consistent API

- All CRUD operations work the same
- Path syntax remains intuitive
- No breaking changes to existing code

## Backward Compatibility

Single-table TOON files continue to work exactly as before:

- No dropdown shown
- First (only) table auto-selected
- No UI changes for simple files

## Edge Cases Handled

### Empty Tables

If a table has no rows, it still appears in the dropdown but shows "(0 rows)".

### Non-Array Fields

Objects and primitives (like `store` and `analytics`) are filtered out of the table selector since they can't be displayed in table format.

### Schema Detection

The schema is detected from the **first row of the selected table**, ensuring correct field types for forms.

### Table Switching

When switching tables:
- Form closes if open
- Selection clears
- Schema updates automatically
- Success messages persist briefly

## Testing

### Manual Test Steps

1. **Create/import** ecommerce-store.toon file
2. **Navigate** to table detail page
3. **Verify** dropdown shows all tables
4. **Select** "products" - should show 15 products
5. **Click "Add Row"** - form should show product fields
6. **Add** a new product - should insert to products array
7. **Switch** to "customers" - should show 10 customers
8. **Edit** a customer - should update customer data
9. **Switch** back to "products" - new product should still be there
10. **Delete** a product - should remove from products array

### API Testing

```bash
# Update in selected table
curl -X POST http://localhost:3000/api/tables/{id}/update \
  -H "Content-Type: application/json" \
  -d '{"path":"products[id==8].price","value":120.00}'

# Insert into selected table
curl -X POST http://localhost:3000/api/tables/{id}/insert \
  -H "Content-Type: application/json" \
  -d '{"path":"customers","item":{"id":11,"name":"New Customer"}}'

# Delete from selected table
curl -X POST http://localhost:3000/api/tables/{id}/delete \
  -H "Content-Type: application/json" \
  -d '{"path":"orders","selector":{"id":20}}'
```

## Future Enhancements

Potential improvements for multi-table support:

1. **Bulk operations across tables** - Update multiple tables in one call
2. **Table-to-table navigation** - Quick links for foreign keys
3. **Multi-table view** - See related data side-by-side
4. **Cross-table queries** - Join-like operations in TOONPath
5. **Schema visualization** - See relationships between tables
6. **Table templates** - Quick add for common table structures

## Conclusion

Multi-table support makes ToonDB suitable for complex, real-world datasets while maintaining simplicity for single-table use cases. The ecommerce-store example demonstrates how a complete e-commerce system can be managed in a single TOON file with an intuitive UI.

