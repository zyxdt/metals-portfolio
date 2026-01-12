# Railway Deployment Guide for MetalsTracker

This guide walks you through deploying the MetalsTracker application to Railway, a modern hosting platform that supports Node.js applications with automatic builds and deployments.

## Prerequisites

- A Railway account (free tier available at https://railway.app)
- Your GitHub repository: https://github.com/Marten213/metals-portfolio
- Supabase project with credentials (already configured)

## Step-by-Step Deployment

### 1. Create a Railway Project

1. Go to https://railway.app and sign in (or create an account)
2. Click **"New Project"** in the dashboard
3. Select **"Deploy from GitHub"**
4. Authorize Railway to access your GitHub account
5. Select the repository: **metals-portfolio**
6. Click **"Deploy Now"**

Railway will automatically detect the Node.js project and start building.

### 2. Configure Environment Variables

After the project is created, you need to add environment variables. In the Railway dashboard:

1. Click on your project
2. Go to the **"Variables"** tab
3. Add the following environment variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required for production mode |
| `PORT` | `3000` | Railway will automatically assign this |
| `JWT_SECRET` | Your JWT secret | Generate a strong random string (min 32 chars) |
| `VITE_SUPABASE_URL` | Your Supabase URL | From Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | From Supabase project settings (keep secret!) |
| `VITE_APP_TITLE` | `MetalsTracker` | Application title |
| `VITE_APP_LOGO` | `/logo.svg` | Logo path (optional) |

**Getting Supabase Credentials:**
- Go to https://app.supabase.com
- Select your project
- Click **"Settings"** → **"API"**
- Copy **Project URL** → `VITE_SUPABASE_URL`
- Copy **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 3. Add PostgreSQL Database (Optional)

If you want Railway to manage your database instead of using Supabase:

1. In your Railway project, click **"+ Add"**
2. Select **"PostgreSQL"**
3. Railway will automatically set `DATABASE_URL` environment variable
4. Update your Supabase configuration to use this database URL

**Note:** For this guide, we're using Supabase for both auth and database, so you can skip this step.

### 4. Configure Build and Start Commands

Railway should automatically detect the build and start commands from your `package.json`:
- **Build:** `pnpm install && pnpm build`
- **Start:** `pnpm start`

If not auto-detected, manually set them in the **"Settings"** tab:
1. Go to **"Settings"** → **"Build"**
2. Set **Build Command:** `pnpm install && pnpm build`
3. Set **Start Command:** `pnpm start`

### 5. Deploy

1. Once environment variables are configured, Railway will automatically trigger a build
2. Watch the build logs in the **"Deployments"** tab
3. When the build completes, your app will be live at the provided Railway URL

### 6. Set Up Custom Domain (Optional)

To use a custom domain:

1. In Railway dashboard, go to **"Settings"** → **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `metals.example.com`)
4. Update your domain's DNS records according to Railway's instructions
5. Railway will automatically provision an SSL certificate

## Monitoring and Logs

### View Application Logs

1. In the Railway dashboard, click on your project
2. Go to the **"Logs"** tab
3. View real-time application output and errors

### Monitor Performance

1. Go to the **"Metrics"** tab to see:
   - CPU usage
   - Memory usage
   - Network I/O
   - Request count

## Troubleshooting

### Build Fails

**Error:** `pnpm: command not found`
- Railway should auto-detect pnpm from `package.json`
- If not, set build command to: `npm install -g pnpm && pnpm install && pnpm build`

**Error:** `Cannot find module`
- Ensure all dependencies are in `package.json`
- Check that `pnpm-lock.yaml` is committed to GitHub

### Application Won't Start

**Error:** `Port already in use`
- The app tries ports 3000-3019 automatically
- Check logs for the actual port being used

**Error:** `Supabase connection failed`
- Verify `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check Supabase project is active and accessible

### Database Connection Issues

**Error:** `DATABASE_URL not set`
- Ensure `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are configured
- These are used by the app to connect to Supabase

## Environment Variables Reference

| Variable | Required | Purpose |
|----------|----------|---------|
| `NODE_ENV` | Yes | Set to `production` for deployment |
| `PORT` | No | Port to listen on (default: 3000) |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens (min 32 chars) |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (keep secret) |
| `VITE_APP_TITLE` | No | Application title for UI |
| `VITE_APP_LOGO` | No | Logo path for UI |

## Deployment Checklist

- [ ] Railway account created
- [ ] GitHub repository connected to Railway
- [ ] Environment variables configured
- [ ] Build completes successfully
- [ ] Application starts without errors
- [ ] Can access application at Railway URL
- [ ] User signup/login works
- [ ] Portfolio features work (add/edit/delete holdings)
- [ ] Live prices display correctly
- [ ] Custom domain configured (optional)

## Rollback

If something goes wrong:

1. Go to **"Deployments"** tab
2. Find a previous successful deployment
3. Click the three dots menu
4. Select **"Redeploy"**

Railway will roll back to that version instantly.

## Getting Help

- Railway Docs: https://docs.railway.app
- Railway Community: https://railway.app/community
- Supabase Docs: https://supabase.com/docs

## Next Steps

1. Monitor the application in production
2. Set up error tracking (optional: Sentry, LogRocket)
3. Configure custom domain
4. Set up automatic backups for Supabase
5. Monitor performance and optimize as needed
