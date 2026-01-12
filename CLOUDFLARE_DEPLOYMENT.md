# Cloudflare Deployment Guide for MetalsTracker

Deploy MetalsTracker completely free using Cloudflare Pages (frontend) and Cloudflare Workers (backend API), with Supabase for database and authentication.

## Architecture

- **Frontend:** Cloudflare Pages (React/Vite static files)
- **Backend API:** Cloudflare Workers (Express/tRPC)
- **Database:** Supabase (PostgreSQL) - free tier
- **Authentication:** Supabase Auth + JWT

## Prerequisites

1. **Cloudflare Account** - Free tier at https://dash.cloudflare.com
2. **GitHub Repository** - https://github.com/Marten213/metals-portfolio
3. **Supabase Project** - Already configured with:
   - Project URL: `https://mccsiaujlmoeklarjnpy.supabase.co`
   - Anon Key: Your public key
   - Service Role Key: Your secret key

## Step 1: Deploy Backend to Cloudflare Workers

### 1.1 Install Wrangler CLI

```bash
npm install -g wrangler
```

### 1.2 Authenticate with Cloudflare

```bash
wrangler login
```

This opens a browser to authorize Wrangler with your Cloudflare account.

### 1.3 Deploy to Workers

Navigate to your project directory:

```bash
cd ~/metals-portfolio
```

Deploy the backend:

```bash
wrangler deploy --env production
```

This will:
1. Build your backend code
2. Deploy to Cloudflare Workers
3. Provide you with a URL like `https://metals-portfolio-api.your-account.workers.dev`

### 1.4 Set Environment Variables in Cloudflare Dashboard

1. Go to https://dash.cloudflare.com
2. Navigate to **Workers & Pages** → **metals-portfolio-api**
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `VITE_SUPABASE_URL` | Your Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key (secret) |
| `JWT_SECRET` | Generate a strong random string (32+ chars) |

**Getting Supabase Credentials:**
1. Go to https://app.supabase.com
2. Select your project
3. Click **Settings** → **API**
4. Copy the values

### 1.5 Redeploy with Environment Variables

```bash
wrangler deploy --env production
```

Note the Workers URL: `https://metals-portfolio-api.your-account.workers.dev`

## Step 2: Deploy Frontend to Cloudflare Pages

### 2.1 Connect GitHub Repository

1. Go to https://dash.cloudflare.com
2. Click **Pages** in the left sidebar
3. Click **Create a project** → **Connect to Git**
4. Select **GitHub** and authorize
5. Select your repository: `metals-portfolio`
6. Click **Begin setup**

### 2.2 Configure Build Settings

In the build configuration:

- **Project name:** `metals-portfolio`
- **Production branch:** `main`
- **Build command:** `pnpm build`
- **Build output directory:** `dist/public`
- **Node.js version:** `20.x` (or latest)

### 2.3 Set Environment Variables

In the Pages project settings:

1. Go to **Settings** → **Environment variables**
2. Add for **Production** environment:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_API_BASE` | Your Workers URL (from Step 1.5) |

Example:
```
VITE_API_BASE=https://metals-portfolio-api.your-account.workers.dev
```

### 2.4 Deploy

1. Click **Save and Deploy**
2. Wait for the build to complete
3. You'll get a URL like `https://metals-portfolio.pages.dev`

## Step 3: Connect Frontend to Backend

The frontend is now deployed at `https://metals-portfolio.pages.dev` and will communicate with your backend at `https://metals-portfolio-api.your-account.workers.dev`.

### Verify the Connection

1. Open your Pages URL: `https://metals-portfolio.pages.dev`
2. Try to sign up with an email
3. Check that the request goes to your Workers API
4. Verify the user is created in Supabase

## Step 4: Set Up Custom Domain (Optional)

### 4.1 For Cloudflare Pages

1. In Pages project, go to **Custom domains**
2. Click **Add custom domain**
3. Enter your domain (e.g., `metals.example.com`)
4. Follow the DNS setup instructions

### 4.2 For Cloudflare Workers

1. In Workers project, go to **Settings** → **Domains & Routes**
2. Click **Add route**
3. Enter your domain pattern (e.g., `api.metals.example.com`)
4. Select your Workers service

## Monitoring and Logs

### View Workers Logs

```bash
wrangler tail --env production
```

Or in the dashboard:
1. Go to **Workers & Pages** → **metals-portfolio-api**
2. Click **Logs**

### View Pages Build Logs

1. Go to **Pages** → **metals-portfolio**
2. Click on a deployment
3. View build logs

## Troubleshooting

### Build Fails on Pages

**Error:** `pnpm: command not found`
- Pages should auto-detect pnpm from `package.json`
- If not, set build command to: `npm install -g pnpm && pnpm build`

**Error:** `Cannot find module`
- Ensure `pnpm-lock.yaml` is committed to GitHub
- Check all dependencies are in `package.json`

### Workers API Not Responding

**Error:** `502 Bad Gateway`
- Check Workers logs: `wrangler tail --env production`
- Verify environment variables are set correctly
- Check Supabase connection

### Frontend Can't Connect to Backend

**Error:** `CORS error` or `Failed to fetch`
- Verify `VITE_API_BASE` is set correctly in Pages environment
- Check Workers CORS headers are configured
- Verify Workers URL is accessible

### Supabase Connection Failed

**Error:** `Connection refused` or `Auth failed`
- Verify `VITE_SUPABASE_URL` is correct
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check Supabase project is active

## Deployment Checklist

- [ ] Cloudflare account created
- [ ] Wrangler CLI installed and authenticated
- [ ] Backend deployed to Workers
- [ ] Workers environment variables configured
- [ ] GitHub repository connected to Pages
- [ ] Pages build settings configured
- [ ] Pages environment variables configured
- [ ] Frontend deployed to Pages
- [ ] Custom domain configured (optional)
- [ ] User signup/login works
- [ ] Portfolio features work
- [ ] Live prices display

## Continuous Deployment

### Auto-Deploy on GitHub Push

Both Pages and Workers support automatic deployments:

**Cloudflare Pages:**
- Automatically deploys on push to `main` branch
- View deployments in Pages dashboard

**Cloudflare Workers:**
- Deploy manually with `wrangler deploy`
- Or set up GitHub Actions for automatic deployment

### GitHub Actions for Workers

Create `.github/workflows/deploy-workers.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          environment: production
```

Set GitHub secrets:
- `CLOUDFLARE_API_TOKEN` - From Cloudflare dashboard
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

## Rollback

### Rollback Pages Deployment

1. Go to **Pages** → **metals-portfolio**
2. Click on a previous deployment
3. Click **Rollback to this deployment**

### Rollback Workers Deployment

```bash
wrangler rollback --env production
```

## Performance Optimization

### Cloudflare Pages

- Automatically cached and served from edge locations
- Gzip compression enabled by default
- HTTP/2 and HTTP/3 support

### Cloudflare Workers

- Runs on Cloudflare's global network
- Sub-millisecond latency
- Automatic scaling

## Security

- **SSL/TLS:** Automatic with Cloudflare
- **DDoS Protection:** Free tier included
- **Rate Limiting:** Configurable in Cloudflare dashboard
- **Environment Variables:** Stored securely in Cloudflare

## Cost

- **Cloudflare Pages:** Free tier (unlimited deployments)
- **Cloudflare Workers:** Free tier (100,000 requests/day)
- **Supabase:** Free tier (500 MB storage, unlimited API calls)

**Total Cost:** $0/month

## Getting Help

- Cloudflare Docs: https://developers.cloudflare.com
- Wrangler Docs: https://developers.cloudflare.com/workers/wrangler
- Cloudflare Community: https://community.cloudflare.com
- Supabase Docs: https://supabase.com/docs

## Next Steps

1. Deploy backend to Workers
2. Deploy frontend to Pages
3. Test all features
4. Set up custom domain
5. Monitor performance
6. Configure AdSense for monetization

---

**Your deployed application will be completely free and online!** 🚀
