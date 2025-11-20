# ToonDB API Reference

Complete API documentation for ToonDB REST endpoints.

## Base URL

```
https://your-project.supabase.co
```

## Authentication

All API requests require authentication using either:

1. **Session Token** (from authentication)
2. **API Key** (for programmatic access)

### Using Session Token

```bash
curl -H "Authorization: Bearer SESSION_TOKEN" \
  https://your-project.supabase.co/api/tables
```

### Using API Key

```bash
curl -H "Authorization: Bearer API_KEY" \
  https://your-project.supabase.co/api/tables
```

## Endpoints

### Authentication

#### Sign Up

```http
POST /api/auth/signup
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "full_name": "John Doe"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "message": "Check your email to confirm your account"
}
```

#### Sign In

```http
POST /api/auth/signin
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

#### Sign Out

```http
POST /api/auth/signout
```

**Response:**

```json
{
  "message": "Signed out successfully"
}
```

### Tables

#### List Tables

```http
GET /api/tables
```

**Response:**

```json
{
  "tables": [
    {
      "id": "uuid",
      "name": "users",
      "description": "User data",
      "row_count": 100,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Table

```http
GET /api/tables/{id}
```

**Response:**

```json
{
  "table": {
    "id": "uuid",
    "name": "users",
    "description": "User data",
    "schema_fields": {
      "id": "number",
      "name": "string",
      "role": "string"
    },
    "row_count": 100,
    "data": [...],
    "toon_content": "users[100]{id,name,role}:...",
    "delimiter": ",",
    "is_public": false,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Create Table

```http
POST /api/tables
```

**Request Body:**

```json
{
  "name": "users",
  "description": "User data",
  "toon_content": "users[3]{id,name,role}:\n  1,Alice,admin\n  2,Bob,user\n  3,Charlie,user",
  "delimiter": ","
}
```

**Response:**

```json
{
  "table": {
    "id": "uuid",
    "name": "users",
    "row_count": 3,
    ...
  }
}
```

#### Update Table

```http
PUT /api/tables/{id}
```

**Request Body:**

```json
{
  "name": "updated_users",
  "description": "Updated description",
  "toon_content": "users[4]{id,name,role}:...",
  "is_public": true
}
```

**Response:**

```json
{
  "table": {
    "id": "uuid",
    "name": "updated_users",
    ...
  }
}
```

#### Delete Table

```http
DELETE /api/tables/{id}
```

**Response:**

```json
{
  "success": true
}
```

### Queries

#### Execute Query

```http
POST /api/query
```

**Request Body:**

```json
{
  "table_id": "uuid",
  "sql": "SELECT * FROM users WHERE role = 'user'"
}
```

**Response:**

```json
{
  "results": [
    { "id": 2, "name": "Bob", "role": "user" },
    { "id": 3, "name": "Charlie", "role": "user" }
  ],
  "execution_time_ms": 45,
  "row_count": 2
}
```

### Conversion

#### Convert Format

```http
POST /api/convert
```

**JSON to TOON:**

```json
{
  "content": "{\"users\":[{\"id\":1,\"name\":\"Alice\"}]}",
  "from_format": "json",
  "to_format": "toon",
  "options": {
    "delimiter": ",",
    "indent": 2
  }
}
```

**Response:**

```json
{
  "output": "users[1]{id,name}:\n  1,Alice",
  "token_comparison": {
    "toon": 15,
    "json": 35,
    "savings": 20,
    "savings_percentage": 57.14
  }
}
```

**TOON to JSON:**

```json
{
  "content": "users[1]{id,name}:\n  1,Alice",
  "from_format": "toon",
  "to_format": "json",
  "options": {
    "strict": true
  }
}
```

**Response:**

```json
{
  "output": "{\n  \"users\": [\n    {\"id\": 1, \"name\": \"Alice\"}\n  ]\n}",
  "token_comparison": {
    "toon": 15,
    "json": 35,
    "savings": 20,
    "savings_percentage": 57.14
  }
}
```

### API Keys

#### List API Keys

```http
GET /api/api-keys
```

**Response:**

```json
{
  "api_keys": [
    {
      "id": "uuid",
      "name": "Production Key",
      "key_prefix": "toon_1234567",
      "last_used_at": "2024-01-01T00:00:00Z",
      "expires_at": "2025-01-01T00:00:00Z",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create API Key

```http
POST /api/api-keys
```

**Request Body:**

```json
{
  "name": "Production Key",
  "expires_in_days": 365
}
```

**Response:**

```json
{
  "api_key": {
    "id": "uuid",
    "name": "Production Key",
    "key_prefix": "toon_1234567",
    ...
  },
  "key": "toon_1234567890abcdef...",
  "warning": "Save this key now. You won't be able to see it again."
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication failed)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Error Examples

**400 Bad Request:**

```json
{
  "error": "Name and toon_content are required"
}
```

**401 Unauthorized:**

```json
{
  "error": "Invalid API key or unauthorized"
}
```

**404 Not Found:**

```json
{
  "error": "Table not found"
}
```

**429 Rate Limit:**

```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

## Rate Limits

- **Authenticated requests**: 1000 requests/hour per user
- **Anonymous requests**: 100 requests/hour per IP
- **Edge functions**: 2M invocations/month

## Best Practices

### 1. Use API Keys for Programmatic Access

```bash
# Good: Use API key for scripts
curl -H "Authorization: Bearer toon_api_key" ...

# Bad: Use user credentials in scripts
```

### 2. Handle Errors Gracefully

```javascript
try {
  const response = await fetch('/api/tables', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.error);
  }
} catch (error) {
  console.error('Network Error:', error);
}
```

### 3. Implement Retry Logic

```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        continue;
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

### 4. Batch Operations

```javascript
// Good: Create multiple tables in parallel
await Promise.all([
  createTable('users'),
  createTable('posts'),
  createTable('comments')
]);

// Bad: Sequential requests
await createTable('users');
await createTable('posts');
await createTable('comments');
```

## SDKs

Instead of calling the API directly, use our official SDKs:

- [Python SDK](../sdk/python/README.md)
- [TypeScript SDK](../sdk/typescript/README.md)

## Support

- API Status: https://status.toondb.io
- Documentation: https://docs.toondb.io
- Support: support@toondb.io

