# ToonDB TypeScript SDK

Official TypeScript/JavaScript client for ToonDB - Token-Oriented Object Notation Database

## Installation

```bash
npm install @toondb/client
# or
yarn add @toondb/client
# or
pnpm add @toondb/client
```

## Quick Start

```typescript
import { ToonDB } from '@toondb/client';

// Initialize client
const db = new ToonDB({
  url: 'https://your-project.supabase.co',
  apiKey: 'your_api_key'
});

// Create a table from TOON content
const table = await db.tables.create({
  name: 'users',
  toonContent: `
users[3]{id,name,role}:
  1,Alice,admin
  2,Bob,user
  3,Charlie,user
  `
});

console.log(`Created table: ${table.name} with ${table.row_count} rows`);

// Query data
const results = await db.queries.execute(
  table.id,
  "SELECT * FROM users WHERE role = 'user'"
);

console.log(`Found ${results.rowCount} users`);
results.results.forEach(row => console.log(row));

// Convert JSON to TOON
const jsonData = {
  users: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]
};

const toonOutput = await db.converter.jsonToToon(jsonData);
console.log(toonOutput);
```

## Features

- **Full TypeScript Support**: Complete type definitions for better IDE support
- **Table Management**: Create, read, update, delete tables
- **Query Execution**: Run SQL queries on your data
- **Format Conversion**: Convert between JSON and TOON formats
- **Token Comparison**: Compare token counts to measure savings
- **Error Handling**: Typed error classes for better error handling

## Documentation

Full documentation available at: https://docs.toondb.io

## Examples

### List All Tables

```typescript
const tables = await db.tables.list();
tables.forEach(table => {
  console.log(`${table.name}: ${table.row_count} rows`);
});
```

### Get a Specific Table

```typescript
const table = await db.tables.get('table-id');
console.log(table.toon_content);
```

### Update a Table

```typescript
const updatedTable = await db.tables.update('table-id', {
  description: 'Updated description',
  isPublic: true
});
```

### Delete a Table

```typescript
const success = await db.tables.delete('table-id');
if (success) {
  console.log('Table deleted successfully');
}
```

### Convert TOON to JSON

```typescript
const toonContent = `
users[2]{id,name}:
  1,Alice
  2,Bob
`;

const jsonData = await db.converter.toonToJson(toonContent);
console.log(jsonData);
// Output: { users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] }
```

### Compare Token Counts

```typescript
const toonContent = 'users[2]{id,name}:\n  1,Alice\n  2,Bob';
const jsonContent = JSON.stringify({
  users: [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]
});

const comparison = await db.converter.compareTokens(toonContent, jsonContent);
console.log(`Token savings: ${comparison.savingsPercentage}%`);
```

## Error Handling

```typescript
import {
  ToonDB,
  ToonDBError,
  AuthenticationError,
  ValidationError,
  NotFoundError
} from '@toondb/client';

try {
  const db = new ToonDB({
    url: '...',
    apiKey: '...'
  });
  
  const table = await db.tables.get('invalid-id');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
  } else if (error instanceof NotFoundError) {
    console.error('Table not found');
  } else if (error instanceof ToonDBError) {
    console.error('API error:', error.message);
  }
}
```

## Configuration

### Custom Timeout

```typescript
const db = new ToonDB({
  url: '...',
  apiKey: '...',
  timeout: 60000 // 60 seconds
});
```

## TypeScript

This SDK is written in TypeScript and includes full type definitions. No additional `@types` package is needed.

```typescript
import type { Table, QueryResult, TokenComparison } from '@toondb/client';

const table: Table = await db.tables.get('table-id');
const result: QueryResult = await db.queries.execute(table.id, 'SELECT * FROM data');
```

## License

MIT License - see LICENSE file for details

