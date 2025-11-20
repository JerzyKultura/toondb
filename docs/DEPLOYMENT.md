# ToonDB Deployment Guide

This guide covers deploying ToonDB to production using Vercel and Supabase.

## Prerequisites

- Node.js 18+ installed
- Supabase account (Pro tier recommended)
- Vercel account (optional, for deployment)
- Git repository set up

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose organization and region
4. Set project name: `toondb-production`
5. Generate a strong database password
6. Select Pro plan ($25/month) for production features

### 1.2 Configure Database

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Push database schema
npx supabase db push
```

### 1.3 Enable Required Extensions

Run in Supabase SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### 1.4 Configure Authentication

1. Go to Authentication > Settings
2. Enable Email provider
3. Configure SMTP for custom emails (optional)
4. Add OAuth providers (Google, GitHub)
5. Set Site URL to your production domain

### 1.5 Configure Storage

1. Go to Storage
2. Create bucket: `toon-files`
3. Set public/private policies
4. Configure upload size limit (100MB)

## Step 2: Environment Variables

Create `.env.production` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=https://app.toondb.io
NODE_ENV=production

# Optional: Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

## Step 3: Vercel Deployment

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 3.2 Deploy

```bash
# Login
vercel login

# Deploy
vercel --prod
```

### 3.3 Configure Vercel Project

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all variables from `.env.production`
5. Select "Production" environment
6. Save

### 3.4 Configure Custom Domain

1. Go to Settings > Domains
2. Add custom domain: `app.toondb.io`
3. Configure DNS records at your provider
4. Wait for SSL certificate generation

## Step 4: Deploy Edge Functions

```bash
# Deploy parse-toon function
npx supabase functions deploy parse-toon

# Deploy convert function
npx supabase functions deploy convert-toon-json

# Deploy token counter
npx supabase functions deploy count-tokens
```

## Step 5: Configure Monitoring

### 5.1 Supabase Monitoring

1. Go to Supabase Dashboard
2. Navigate to Monitoring
3. Set up alerts:
   - Database CPU > 80%
   - Storage > 80%
   - API error rate > 5%

### 5.2 Vercel Analytics

1. Go to Vercel Dashboard
2. Enable Analytics
3. Configure Web Vitals tracking

### 5.3 External Monitoring (Optional)

Set up [UptimeRobot](https://uptimerobot.com):

```bash
# Monitor endpoints
- https://app.toondb.io
- https://app.toondb.io/api/health
- https://your-project.supabase.co/rest/v1/
```

## Step 6: Security Configuration

### 6.1 Enable CORS

Update Supabase CORS settings:

```json
{
  "allowed_origins": [
    "https://app.toondb.io",
    "https://www.toondb.io"
  ],
  "allowed_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  "allowed_headers": ["Content-Type", "Authorization"]
}
```

### 6.2 Configure Rate Limiting

In Supabase Dashboard:
- API Settings > Rate Limiting
- Set limits per IP: 100 requests/minute
- Set limits per user: 1000 requests/hour

### 6.3 Enable Database Backups

1. Go to Database > Backups
2. Enable daily backups (included in Pro)
3. Set retention period: 7 days
4. Test restore procedure

## Step 7: Performance Optimization

### 7.1 Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_toon_tables_user_name 
  ON toon_tables(user_id, name);

CREATE INDEX IF NOT EXISTS idx_query_history_user_date 
  ON query_history(user_id, created_at DESC);

-- Enable query plan caching
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
```

### 7.2 Enable Connection Pooling

In Supabase:
- Database > Settings > Connection Pooling
- Enable transaction mode
- Pool size: 20 (adjust based on load)

### 7.3 Configure CDN

Vercel automatically provides CDN. Additional optimization:

```js
// next.config.js
module.exports = {
  images: {
    domains: ['your-project.supabase.co'],
  },
  compress: true,
  poweredByHeader: false,
}
```

## Step 8: Testing

### 8.1 Smoke Tests

```bash
# Test API endpoints
curl https://app.toondb.io/api/health

# Test authentication
curl -X POST https://app.toondb.io/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test table creation
curl -X POST https://app.toondb.io/api/tables \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"test","toon_content":"test[1]{id}:\n  1"}'
```

### 8.2 Load Testing

```bash
# Install k6
brew install k6

# Run load test
k6 run load-test.js
```

## Step 9: Post-Deployment

### 9.1 Monitor Initial Traffic

- Check Vercel Analytics
- Monitor Supabase metrics
- Review error logs

### 9.2 Set Up Alerts

Configure email alerts for:
- API errors > 1%
- Response time > 1s
- Database connections > 80%
- Storage > 80%

### 9.3 Documentation

Update documentation with:
- Production URL
- API endpoints
- Support contact

## Troubleshooting

### Database Connection Errors

```bash
# Check connection pooling
npx supabase db pooler status

# Restart pooler
npx supabase db pooler restart
```

### Edge Function Errors

```bash
# View logs
npx supabase functions logs parse-toon

# Redeploy
npx supabase functions deploy parse-toon --no-verify-jwt
```

### High Memory Usage

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;
```

## Maintenance

### Weekly Tasks

- Review error logs
- Check storage usage
- Monitor API performance
- Review security alerts

### Monthly Tasks

- Update dependencies
- Review database performance
- Optimize slow queries
- Test backup restore

## Scaling

### When to Scale Up

Scale up when:
- Database CPU > 70% sustained
- Connection pool maxed out
- Storage > 70%
- API response time > 500ms p95

### Scaling Options

1. **Database**: Upgrade to Small ($5/month) - 2GB RAM
2. **Bandwidth**: Add $0.09/GB after 250GB
3. **Edge Functions**: Included up to 2M invocations
4. **Storage**: $0.021/GB after 8GB

## Support

- Email: support@toondb.io
- Documentation: https://docs.toondb.io
- Status Page: https://status.toondb.io
- Community: https://community.toondb.io

