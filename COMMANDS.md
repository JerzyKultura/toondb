# ToonDB Command Reference

Quick reference for all commands you'll need.

## 🚀 Initial Setup

### 1. Install Supabase CLI

Choose your preferred method:

```bash
# Homebrew (easiest for macOS)
brew install supabase/tap/supabase

# OR use npx (no installation needed)
# Just prefix all commands with 'npx'
```

### 2. Create Environment File

```bash
cp .env.example .env
# Then edit .env with your Supabase credentials
```

### 3. Reinstall Dependencies

```bash
npm install
```

## 🗄️ Database Setup

```bash
# Initialize Supabase in your project
npx supabase init

# Link to your Supabase project
npx supabase link --project-ref your-project-ref

# Push database schema
npx supabase db push

# Check status
npx supabase status
```

## 🛠️ Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Run tests
npm test
```

## 🚀 Deployment

```bash
# Deploy to Vercel
vercel --prod

# Deploy Edge Functions
npx supabase functions deploy parse-toon
npx supabase functions deploy convert-toon-json
npx supabase functions deploy count-tokens
```

## 📊 Database Commands

```bash
# View database migrations
npx supabase db diff

# Reset database (WARNING: deletes all data)
npx supabase db reset

# Pull remote schema changes
npx supabase db pull

# Generate TypeScript types
npx supabase gen types typescript --local > lib/supabase/database.types.ts
```

## 🔑 Supabase Management

```bash
# List your projects
npx supabase projects list

# View project details
npx supabase projects info

# View logs
npx supabase functions logs parse-toon

# Start local Supabase (for testing)
npx supabase start

# Stop local Supabase
npx supabase stop
```

## 🧪 Testing & Quality

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Check TypeScript errors
npx tsc --noEmit

# Format code (if you add prettier)
npx prettier --write .

# Check for security vulnerabilities
npm audit
```

## 📦 Package Management

```bash
# Add a new dependency
npm install package-name

# Add a dev dependency
npm install --save-dev package-name

# Update all packages
npm update

# Check for outdated packages
npm outdated

# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 🐛 Troubleshooting

```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules
npm install

# Check Supabase connection
npx supabase status

# View database logs
npx supabase db logs
```

## 💡 Quick Workflows

### Create New Table

```bash
# 1. Start dev server
npm run dev

# 2. Go to http://localhost:3000/dashboard
# 3. Click "New Table"
# 4. Enter TOON content
```

### Deploy Changes

```bash
# 1. Push database changes
npx supabase db push

# 2. Build and test locally
npm run build
npm start

# 3. Deploy
vercel --prod

# 4. Deploy Edge Functions
npx supabase functions deploy parse-toon
```

### Update Types After Schema Change

```bash
# After changing database schema
npx supabase db push
npx supabase gen types typescript --local > lib/supabase/database.types.ts
```

## 🔗 Useful Links

- **Supabase Dashboard**: https://app.supabase.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Local Dev**: http://localhost:3000
- **Local Supabase Studio**: http://localhost:54323 (when running `supabase start`)

## 📝 Notes

- Use `npx supabase` if you don't have Supabase CLI installed globally
- Always test locally before deploying to production
- Keep your `.env` file secure and never commit it
- Run `npm run lint` before committing changes

## 🆘 Getting Help

If a command fails:

1. Check you're in the project directory
2. Verify your `.env` file has correct credentials
3. Try running with `npx` prefix for Supabase commands
4. Check `SETUP_FIXES.md` for common issues
5. View error logs for more details

Happy coding! 🎒

