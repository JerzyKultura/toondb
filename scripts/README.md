# ToonDB Scripts

This directory contains utility scripts for ToonDB.

## Available Scripts

### quick-deploy.sh
Interactive deployment script that helps you deploy ToonDB to various platforms.

**Usage:**
```bash
chmod +x scripts/quick-deploy.sh
./scripts/quick-deploy.sh
```

**Supports:**
- Vercel (recommended)
- Netlify
- Docker
- Railway

### deploy.sh
Direct deployment script for Vercel (assumes you're already logged in).

**Usage:**
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### setup.sh
Initial setup script for local development.

**Usage:**
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

## Quick Start

For first-time setup:
```bash
./scripts/setup.sh
```

For deployment:
```bash
./scripts/quick-deploy.sh
```

## More Information

- [Hosting Guide](../HOSTING.md) - Comprehensive deployment documentation
- [Quick Start](../QUICKSTART.md) - Get started in 5 minutes
- [README](../README.md) - Main documentation
