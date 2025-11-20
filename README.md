# ToonDB - Token-Oriented Object Notation Database

A production-grade database platform optimized for AI/LLM projects using the TOON format for efficient token usage and cost savings.

## 🚀 Quick Deploy

Deploy ToonDB to production in minutes:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JerzyKultura/toondb)

**Other hosting options:** [See HOSTING.md](./HOSTING.md) for detailed guides on Vercel, Netlify, Railway, Docker, and more.

## Features

- **TOON Format Support**: Native encode/decode with 30-60% token savings
- **Advanced Query Engine**: SQL support with JOINs, aggregations, full-text search
- **Web Console**: Professional dashboard with SQL editor, visualizations, and analytics
- **Edge Functions**: Serverless TOON processing for large files
- **SDKs**: Python and TypeScript/JavaScript clients
- **Authentication**: Email/password, OAuth (Google, GitHub), API keys
- **Performance**: Query caching, smart indexing, real-time monitoring
- **Security**: Row-level security, rate limiting, audit logs

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (Pro recommended)
- Vercel account (optional)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your_project_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Initialize Supabase
npx supabase init

# Link to your Supabase project
npx supabase link --project-ref your-project-ref

# Push database schema
npx supabase db push

# Run development server
npm run dev
```

Visit http://localhost:3000

### Database Setup

The database schema includes:

- **toon_tables**: Store TOON datasets with metadata
- **toon_files**: TOON file storage with versioning
- **api_keys**: API authentication keys
- **query_history**: Query analytics and performance tracking
- **user_profiles**: Extended user information

## TOON Format

TOON (Token-Oriented Object Notation) is a compact format designed for LLM efficiency:

```toon
users[3]{id,name,role}:
  1,Alice,admin
  2,Bob,user
  3,Charlie,user
```

vs JSON (37 tokens vs 80+ tokens):

```json
{
  "users": [
    {"id": 1, "name": "Alice", "role": "admin"},
    {"id": 2, "name": "Bob", "role": "user"},
    {"id": 3, "name": "Charlie", "role": "user"}
  ]
}
```

## API Usage

### REST API

```bash
# Upload TOON data
curl -X POST https://your-domain.com/api/tables \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "users",
    "toon_content": "users[3]{id,name,role}:\n  1,Alice,admin\n  2,Bob,user\n  3,Charlie,user"
  }'

# Query data
curl -X POST https://your-domain.com/api/query \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT * FROM users WHERE role = '\''user'\''"
  }'
```

### Python SDK

```python
from toondb import ToonDB

# Initialize client
db = ToonDB(
    url="https://your-project.supabase.co",
    api_key="your_api_key"
)

# Upload TOON data
db.tables.create(
    name="users",
    toon_content="""
users[3]{id,name,role}:
  1,Alice,admin
  2,Bob,user
  3,Charlie,user
    """
)

# Query data
results = db.query("SELECT * FROM users WHERE role = 'user'")

# Convert to TOON
toon_output = db.to_toon(results)
print(toon_output)
```

### TypeScript SDK

```typescript
import { ToonDB } from '@toondb/client';

const db = new ToonDB({
  url: 'https://your-project.supabase.co',
  apiKey: 'your_api_key'
});

// Upload TOON data
await db.tables.create({
  name: 'users',
  toonContent: `
users[3]{id,name,role}:
  1,Alice,admin
  2,Bob,user
  3,Charlie,user
  `
});

// Query data
const results = await db.query("SELECT * FROM users WHERE role = 'user'");

// Convert to TOON
const toonOutput = db.toToon(results);
console.log(toonOutput);
```

## Architecture

```
┌─────────────┐
│  Next.js    │  ← Web Console + API Routes
│  Frontend   │
└──────┬──────┘
       │
┌──────▼──────┐
│  Supabase   │
│  ┌────────┐ │
│  │PostgreSQL│  ← Database (8GB)
│  └────────┘ │
│  ┌────────┐ │
│  │Edge Func│  ← TOON Processing
│  └────────┘ │
│  ┌────────┐ │
│  │Storage │  ← File Storage (100GB)
│  └────────┘ │
│  ┌────────┐ │
│  │  Auth  │  ← Authentication
│  └────────┘ │
└─────────────┘
```

## Development

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

**📚 Complete Hosting Guide:** See [HOSTING.md](./HOSTING.md) for comprehensive deployment instructions including:
- ⭐ Vercel (one-click deploy)
- Netlify
- Railway  
- Docker / Self-hosting
- And more platforms

**Quick Deploy to Vercel:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Supabase Edge Functions

```bash
# Deploy TOON parser function
npx supabase functions deploy parse-toon

# Deploy conversion function
npx supabase functions deploy convert-toon-json

# Deploy token counter
npx supabase functions deploy count-tokens
```

## Performance

- **Query Performance**: p50 < 50ms, p95 < 200ms, p99 < 500ms
- **Token Savings**: 30-60% reduction vs JSON
- **Bandwidth**: 250GB/month
- **Connections**: Connection pooling (60-200 concurrent)
- **Edge Functions**: 2M invocations/month

## Security

- Row-Level Security (RLS) policies
- API key authentication with expiration
- Rate limiting (configurable)
- Encryption at rest
- Audit logging (7-day retention)
- Email notifications for security events

## Documentation

- [🚀 Hosting Guide](./HOSTING.md) - **Deploy to production**
- [Quick Start](./QUICKSTART.md) - Get started in 5 minutes
- [Deployment Guide](./docs/DEPLOYMENT.md) - Detailed Vercel deployment
- [API Reference](./docs/API.md)
- [TOON Format Specification](https://github.com/toon-format/toon/blob/main/SPEC.md)
- [Examples](./examples/)

## Examples

- [LLM Chatbot with TOON Storage](./examples/llm-chatbot)
- [Data Analytics Dashboard](./examples/analytics-dashboard)
- [RAG System with TOON](./examples/rag-system)
- [Fine-tuning Dataset Manager](./examples/dataset-manager)

## Support

- Email: support@toondb.io
- GitHub Issues: [github.com/toondb/toondb/issues](https://github.com/toondb/toondb/issues)
- Documentation: [docs.toondb.io](https://docs.toondb.io)
- Community Forum: [community.toondb.io](https://community.toondb.io)

## License

MIT License - see [LICENSE](LICENSE) file for details

## Credits

- TOON Format: [toon-format/toon](https://github.com/toon-format/toon)
- Built with Next.js, Supabase, and TypeScript

