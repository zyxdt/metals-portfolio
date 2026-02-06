# Railway Backend Deployment Guide

This guide will help you deploy the MetalsTracker backend to Railway in 5 minutes.

## Prerequisites

- Railway account (free at https://railway.app)
- GitHub repository (already set up at https://github.com/zyxdt/metals-portfolio)

## Step 1: Create Railway Project

1. Go to https://railway.app
2. Click **New Project**
3. Select **Deploy from GitHub**
4. Authorize GitHub and select `zyxdt/metals-portfolio`
5. Click **Deploy Now**

## Step 2: Configure Environment Variables

Railway will automatically detect the Node.js application. You need to add environment variables:

1. In Railway dashboard, go to your project
2. Click **Variables** tab
3. Add these variables:

```
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
VITE_SUPABASE_URL=https://mccsiaujlmoeklarjnpy.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 3: Get Your Backend URL

1. In Railway dashboard, click your service
2. Look for the **Public URL** (will be something like `https://metals-portfolio-production.up.railway.app`)
3. Copy this URL

## Step 4: Update Frontend Configuration

1. Go to Cloudflare Pages project settings
2. Add environment variable:
   - `VITE_API_BASE` = your Railway backend URL (e.g., `https://metals-portfolio-production.up.railway.app`)
3. Trigger a redeploy by pushing a commit to GitHub

## Step 5: Test

1. Visit https://metals-portfolio.pages.dev
2. Prices should now load
3. Login/signup should work
4. Portfolio tracking should be functional

## Troubleshooting

- **Prices not loading**: Check that `VITE_API_BASE` is set correctly in Cloudflare Pages
- **Login not working**: Verify `DATABASE_URL` and `JWT_SECRET` are set in Railway
- **CORS errors**: The backend should handle CORS automatically

## Getting Your Supabase Credentials

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

5. For `DATABASE_URL`, go to **Settings** → **Database** and copy the connection string

## Cost

- Railway free tier includes: 500 hours/month + $5 credit
- This project will use ~20-50 hours/month, so it's completely free!
