# MetalsTracker - Deployment Guide

MetalsTracker is a self-hosted precious metals portfolio tracker. This document provides quick links to deployment options.

## Quick Start

Choose your preferred deployment method:

### 🚀 **Railway (Recommended - Easiest)**
- **Best for:** Quick deployment without server management
- **Cost:** Free tier available, paid plans start at $5/month
- **Setup time:** ~10 minutes
- **Guide:** [Railway Deployment Guide](./RAILWAY_DEPLOYMENT.md)

**Quick steps:**
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select `Marten213/metals-portfolio`
4. Add environment variables (see guide)
5. Done! Your app is live

### 💻 **Railway CLI (Alternative)**
- **Best for:** Command-line enthusiasts
- **Setup time:** ~15 minutes
- **Guide:** [Railway CLI Deployment Guide](./RAILWAY_CLI_DEPLOYMENT.md)

**Quick steps:**
```bash
npm install -g @railway/cli
railway login
cd ~/metals-portfolio
railway init
railway variables set JWT_SECRET=your_secret
railway variables set VITE_SUPABASE_URL=your_url
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_key
railway up
```

### 🏠 **Self-Hosted (Advanced)**
- **Best for:** Full control, existing infrastructure
- **Cost:** Only your server costs
- **Setup time:** ~30-60 minutes
- **Guide:** [Self-Hosting Guide](./SELF_HOSTING_GUIDE.md)

**Supported platforms:**
- Docker (recommended)
- Linux VPS (Ubuntu, Debian)
- Any server with Node.js 18+

## Required Environment Variables

All deployment methods require these variables:

| Variable | Example | Where to get it |
|----------|---------|-----------------|
| `JWT_SECRET` | `abc123...xyz` | Generate a strong random string (32+ chars) |
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase Project Settings → API (keep secret!) |
| `NODE_ENV` | `production` | Set to `production` for deployment |

**Getting Supabase Credentials:**
1. Go to https://app.supabase.com
2. Select your project
3. Click **"Settings"** → **"API"**
4. Copy **Project URL** and **Service Role Key**

## Comparison

| Feature | Railway | Self-Hosted |
|---------|---------|------------|
| Setup difficulty | ⭐ Easy | ⭐⭐⭐ Hard |
| Setup time | 10 min | 1 hour |
| Cost | Free/paid | Server only |
| Maintenance | Automatic | Manual |
| Scaling | Automatic | Manual |
| Custom domain | Yes | Yes |
| SSL certificate | Automatic | Let's Encrypt |
| Backups | Automatic | Manual |
| Monitoring | Built-in | DIY |

## What You Get

After deployment, you'll have:

✅ **Live application** at your deployed URL
✅ **User authentication** (signup/login)
✅ **Portfolio tracking** (add/edit/delete holdings)
✅ **Live metal prices** (updated every 5 minutes)
✅ **Dashboard** with portfolio value and allocation
✅ **Metal detail pages** with price history
✅ **User settings** for currency and weight units
✅ **AdSense ready** for monetization

## Post-Deployment Checklist

After your app is live:

- [ ] Test user signup/login
- [ ] Add a test holding
- [ ] Verify live prices display
- [ ] Check dashboard calculations
- [ ] Test on mobile device
- [ ] Set up custom domain (optional)
- [ ] Configure AdSense (optional)
- [ ] Set up monitoring/alerts (optional)

## Troubleshooting

### "Supabase connection failed"
- Verify `VITE_SUPABASE_URL` is correct
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check Supabase project is active

### "Build fails"
- Ensure `pnpm-lock.yaml` is in GitHub repository
- Check Node.js version (18+ required)
- View build logs for specific errors

### "Application won't start"
- Check all environment variables are set
- View application logs
- Verify port is available (default: 3000)

### "Prices not updating"
- Check Supabase connection
- Verify price cache table exists
- Check application logs for API errors

## Getting Help

- **Railway Support:** https://railway.app/support
- **Supabase Docs:** https://supabase.com/docs
- **GitHub Issues:** https://github.com/Marten213/metals-portfolio/issues

## Next Steps

1. **Choose a deployment method** (Railway recommended)
2. **Follow the deployment guide** for your chosen method
3. **Test the application** thoroughly
4. **Configure custom domain** (optional)
5. **Set up monitoring** (optional)
6. **Add AdSense** for monetization (optional)

## Architecture

MetalsTracker is built with:

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Express.js + tRPC
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth + JWT
- **Prices:** Yahoo Finance API
- **Styling:** Tailwind CSS + shadcn/ui

## Repository

- **GitHub:** https://github.com/Marten213/metals-portfolio
- **License:** MIT

---

**Ready to deploy?** Start with [Railway Deployment Guide](./RAILWAY_DEPLOYMENT.md) 🚀
