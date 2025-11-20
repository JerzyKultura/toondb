# ToonDB Quick Start Guide

Get ToonDB running in 5 minutes!

## Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Git

## Step 1: Clone and Setup

```bash
# Clone repository
git clone <your-repo-url>
cd toondb

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh
```

## Step 2: Configure Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project (or use existing)
3. Get your credentials:
   - Project URL: Settings > API > Project URL
   - Anon Key: Settings > API > Project API keys > anon public

## Step 3: Update Environment Variables

Edit `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 4: Setup Database

```bash
# Link to your Supabase project
npx supabase link --project-ref your-project-ref

# Push database schema
npx supabase db push
```

## Step 5: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 🎉

## Step 6: Create Your First Table

### Using the Web UI

1. Go to http://localhost:3000/dashboard
2. Click "New Table"
3. Enter:
   - Name: `users`
   - TOON Content:
     ```
     users[3]{id,name,role}:
       1,Alice,admin
       2,Bob,user
       3,Charlie,user
     ```
4. Click "Create"

### Using the Python SDK

```python
from toondb import ToonDB

db = ToonDB(
    url="https://your-project.supabase.co",
    api_key="your_api_key"
)

table = db.tables.create(
    name="users",
    toon_content="""
users[3]{id,name,role}:
  1,Alice,admin
  2,Bob,user
  3,Charlie,user
    """
)

print(f"Created table with {table.row_count} rows")
```

### Using the TypeScript SDK

```typescript
import { ToonDB } from '@toondb/client';

const db = new ToonDB({
  url: 'https://your-project.supabase.co',
  apiKey: 'your_api_key'
});

const table = await db.tables.create({
  name: 'users',
  toonContent: `
users[3]{id,name,role}:
  1,Alice,admin
  2,Bob,user
  3,Charlie,user
  `
});

console.log(`Created table with ${table.row_count} rows`);
```

## Next Steps

### Explore the Dashboard

- View tables: http://localhost:3000/dashboard
- Query data: http://localhost:3000/dashboard/query
- Check analytics: http://localhost:3000/dashboard/analytics

### Try the Examples

```bash
# LLM Chatbot
cd examples/llm-chatbot
npm install
npm run dev

# RAG System
cd examples/rag-system
pip install -r requirements.txt
python app.py
```

### Read the Docs

- [Full Documentation](./README.md)
- [API Reference](./docs/API.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## Common Issues

### Database Connection Error

```bash
# Check if you're linked to the right project
npx supabase projects list

# Re-link if needed
npx supabase link --project-ref your-project-ref
```

### Authentication Error

Make sure your `.env` has the correct credentials:
- `NEXT_PUBLIC_SUPABASE_URL` - should end with `.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - starts with `eyJ`

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

## Getting Help

- Documentation: https://docs.toondb.io
- GitHub Issues: https://github.com/toondb/toondb/issues
- Email: support@toondb.io
- Community: https://community.toondb.io

## What's Next?

1. **Deploy to Production**: Follow [DEPLOYMENT.md](./docs/DEPLOYMENT.md)
2. **Build a Chatbot**: Check out [examples/llm-chatbot](./examples/llm-chatbot)
3. **Create a RAG System**: See [examples/rag-system](./examples/rag-system)
4. **Join the Community**: https://community.toondb.io

Happy building! 🎒

