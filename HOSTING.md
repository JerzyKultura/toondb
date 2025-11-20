# ToonDB Hosting Guide

This guide shows you how to host ToonDB on various platforms. Choose the option that best fits your needs.

## Quick Comparison

| Platform | Difficulty | Cost | Best For |
|----------|-----------|------|----------|
| **Vercel** | ⭐ Easy | Free tier available | Quick deployment, recommended |
| **Netlify** | ⭐ Easy | Free tier available | Alternative to Vercel |
| **Railway** | ⭐⭐ Medium | $5/month minimum | All-in-one with database |
| **Docker** | ⭐⭐⭐ Advanced | Variable | Self-hosting, full control |

## Prerequisites (All Methods)

1. **Supabase Account** (Required)
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Note your Project URL and API keys

2. **Node.js 18+** (For local testing)

## Option 1: Vercel (Recommended) ⭐

**Why Vercel?** Zero configuration, automatic deployments, free tier, optimized for Next.js.

### Method A: One-Click Deploy

1. Click this button:
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JerzyKultura/toondb)

2. Connect your GitHub account
3. Configure environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
4. Click "Deploy"
5. Your app will be live at `https://your-project.vercel.app`

### Method B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd toondb
vercel

# Follow prompts and add environment variables when asked
```

### Method C: GitHub Integration

1. Fork this repository on GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your forked repository
4. Add environment variables (see below)
5. Click "Deploy"

**Environment Variables for Vercel:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

### Custom Domain on Vercel

1. Go to your project settings
2. Click "Domains"
3. Add your domain: `app.yourdomain.com`
4. Update DNS records as instructed
5. SSL is automatic!

---

## Option 2: Netlify

**Why Netlify?** Similar to Vercel, good alternative, excellent build tools.

### Deploy to Netlify

1. Fork this repository
2. Go to [app.netlify.com](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your fork
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Functions directory:** `netlify/functions` (optional)

6. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

7. Click "Deploy site"

### Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

---

## Option 3: Railway

**Why Railway?** Includes database, automatic deployments, simple pricing.

### Deploy to Railway

1. Fork this repository
2. Go to [railway.app](https://railway.app)
3. Click "Start a New Project"
4. Choose "Deploy from GitHub repo"
5. Select your forked repository
6. Railway will auto-detect Next.js

7. Add environment variables:
   - Click on your service
   - Go to "Variables" tab
   - Add:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     PORT=3000
     ```

8. Railway will automatically deploy
9. Get your URL from the "Settings" tab

### Railway with Database (Optional)

If you want to use Railway's PostgreSQL instead of Supabase:

1. Add PostgreSQL service in Railway
2. Connect it to your app
3. Use `DATABASE_URL` environment variable
4. Update your app configuration

---

## Option 4: Docker (Self-Hosting)

**Why Docker?** Full control, self-hosted, can run anywhere.

### Using Docker

1. **Build the image:**
   ```bash
   docker build -t toondb .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     -p 3000:3000 \
     -e NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key \
     -e SUPABASE_SERVICE_ROLE_KEY=your_service_role_key \
     --name toondb \
     toondb
   ```

3. **Access your app:**
   ```
   http://localhost:3000
   ```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  toondb:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

### Deploy Docker to Cloud

**DigitalOcean App Platform:**
1. Connect your GitHub repository
2. Select "Docker" as runtime
3. Add environment variables
4. Deploy

**AWS ECS / Google Cloud Run / Azure Container Instances:**
- Push image to container registry
- Create service with image
- Configure environment variables
- Set up load balancer (optional)

---

## Option 5: Other Platforms

### Render

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect repository
4. Build command: `npm run build`
5. Start command: `npm start`
6. Add environment variables
7. Deploy

### Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Launch app
flyctl launch

# Deploy
flyctl deploy
```

### Cloudflare Pages

1. Go to Cloudflare Pages dashboard
2. Connect GitHub repository
3. Framework preset: Next.js
4. Add environment variables
5. Deploy

---

## Supabase Setup (Required for All)

No matter which hosting platform you choose, you need Supabase configured:

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in/up
3. "New Project"
4. Choose organization and region
5. Set database password (save it!)
6. Wait for project to provision (~2 minutes)

### 2. Get API Credentials

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJhbGc...` (long string)
   - **service_role key:** `eyJhbGc...` (long string, keep secret!)

### 3. Set Up Database Schema

**Option A: Using Supabase Dashboard**
1. Go to SQL Editor
2. Create new query
3. Copy and paste the schema from `supabase/migrations/`
4. Run the query

**Option B: Using Supabase CLI**
```bash
# Install Supabase CLI
npm install -g supabase

# Login
npx supabase login

# Link to project
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push
```

### 4. Configure Storage

1. Go to Storage in Supabase dashboard
2. Create new bucket: `toon-files`
3. Set policy to public or authenticated (based on needs)

### 5. Configure Authentication

1. Go to Authentication → Settings
2. Enable Email provider
3. Add Site URL: `https://your-deployed-app.com`
4. Add Redirect URLs: `https://your-deployed-app.com/auth/callback`
5. (Optional) Enable OAuth providers (Google, GitHub)

---

## Environment Variables Reference

All platforms need these environment variables:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional
NEXT_PUBLIC_APP_URL=https://your-deployed-app.com
NODE_ENV=production
```

### Where to Get These Values:

1. **NEXT_PUBLIC_SUPABASE_URL:**
   - Supabase Dashboard → Settings → API → Project URL

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY:**
   - Supabase Dashboard → Settings → API → Project API keys → anon public

3. **SUPABASE_SERVICE_ROLE_KEY:**
   - Supabase Dashboard → Settings → API → Project API keys → service_role
   - ⚠️ Keep this secret! Never expose in client code!

---

## Post-Deployment Checklist

After deploying to any platform:

- [ ] Test the homepage loads
- [ ] Try logging in/signing up
- [ ] Create a test table
- [ ] Run a test query
- [ ] Check that TOON encoding/decoding works
- [ ] Verify API endpoints work
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring/alerts
- [ ] Set up backups (Supabase has automatic backups)
- [ ] Review security settings

---

## Troubleshooting

### "Failed to connect to Supabase"
- Check environment variables are set correctly
- Verify Supabase project is active
- Ensure anon key is correct
- Check if your IP is allowed (Supabase settings)

### "Build failed"
- Ensure Node.js version is 18+
- Check all dependencies are in package.json
- Try: `rm -rf node_modules package-lock.json && npm install`
- Review build logs for specific errors

### "Page not loading"
- Check browser console for errors
- Verify all environment variables are set
- Check network tab for failed requests
- Ensure Supabase URL is correct

### "Authentication not working"
- Add your deployed URL to Supabase → Authentication → URL Configuration
- Set Site URL: `https://your-app.com`
- Add Redirect URL: `https://your-app.com/auth/callback`

### "Database queries failing"
- Run Supabase migrations: `npx supabase db push`
- Check RLS policies in Supabase
- Verify service_role key is set correctly
- Check Supabase logs for errors

---

## Cost Estimates

### Free Tier (Recommended for Starting)

**Vercel Free:**
- 100GB bandwidth/month
- Unlimited deployments
- ✅ Perfect for most small to medium projects

**Supabase Free:**
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- ✅ Great for prototypes and small apps

**Total: $0/month** ✨

### Production (Recommended)

**Vercel Pro ($20/month):**
- 1TB bandwidth
- Team collaboration
- Analytics
- Preview deployments

**Supabase Pro ($25/month):**
- 8GB database
- 100GB storage
- Daily backups
- No pausing
- Email support

**Total: ~$45/month**

### Enterprise

**Vercel Enterprise (Custom):**
- Custom limits
- SLA
- Support

**Supabase Enterprise (Custom):**
- Dedicated infrastructure
- Custom support
- Custom limits

**Total: Contact for pricing**

---

## Performance Tips

1. **Enable caching** - Use Vercel/Netlify CDN
2. **Optimize images** - Use Next.js Image component
3. **Database indexes** - Add indexes for common queries
4. **Connection pooling** - Enable in Supabase
5. **Monitor** - Set up Vercel Analytics or similar

---

## Security Checklist

- [ ] Never commit `.env` file
- [ ] Keep service_role key secret
- [ ] Enable RLS (Row Level Security) in Supabase
- [ ] Use HTTPS only (automatic on most platforms)
- [ ] Set up CORS properly
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Monitor access logs

---

## Getting Help

- **Documentation:** [README.md](./README.md)
- **Detailed Deployment:** [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- **Quick Start:** [QUICKSTART.md](./QUICKSTART.md)
- **GitHub Issues:** [Report issues](https://github.com/JerzyKultura/toondb/issues)

---

## Next Steps

After hosting:

1. 📖 Read the [API Documentation](./docs/API.md)
2. 🎨 Customize the UI
3. 🔧 Configure authentication
4. 📊 Set up analytics
5. 🚀 Build your first TOON app!

**Happy hosting! 🎉**
