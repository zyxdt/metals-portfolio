# Railway CLI Deployment (Alternative Method)

If you prefer to deploy using the Railway CLI instead of the web dashboard, follow this guide.

## Prerequisites

- Node.js and npm installed
- Railway CLI installed
- GitHub repository pushed: https://github.com/Marten213/metals-portfolio

## Installation

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

Or using Homebrew (macOS):
```bash
brew install railway
```

### 2. Login to Railway

```bash
railway login
```

This will open a browser window to authenticate. Follow the prompts.

## Deployment Steps

### 1. Initialize Railway Project

Navigate to your project directory:
```bash
cd ~/metals-portfolio
```

Initialize Railway:
```bash
railway init
```

Follow the prompts:
- **Project name:** `metals-portfolio`
- **Environment:** `production`

### 2. Add Environment Variables

Set each environment variable:

```bash
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your_strong_random_secret_here
railway variables set VITE_SUPABASE_URL=https://your-project.supabase.co
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
railway variables set VITE_APP_TITLE=MetalsTracker
```

**Getting Supabase Credentials:**
- Go to https://app.supabase.com
- Select your project
- Click **"Settings"** → **"API"**
- Copy the values and use them above

### 3. Deploy

```bash
railway up
```

This will:
1. Build your application
2. Push it to Railway
3. Start the application
4. Display the deployment URL

### 4. View Logs

```bash
railway logs
```

This shows real-time logs from your deployed application.

### 5. Get Your Application URL

```bash
railway open
```

This opens your application in the browser.

## Useful Railway CLI Commands

```bash
# View project status
railway status

# View environment variables
railway variables

# Update a variable
railway variables set KEY=value

# View logs
railway logs

# Open app in browser
railway open

# View project in dashboard
railway open --browser

# Redeploy
railway up

# View deployment history
railway deployments

# Switch environments
railway environment select
```

## Troubleshooting

### Build Fails

Check the build logs:
```bash
railway logs --service=builder
```

Common issues:
- Missing dependencies: Ensure `pnpm-lock.yaml` is committed
- Node version: Railway uses Node 18+ by default

### Application Won't Start

View application logs:
```bash
railway logs
```

Check for:
- Missing environment variables
- Database connection errors
- Port binding issues

### Environment Variables Not Working

Verify they're set:
```bash
railway variables
```

Redeploy after updating:
```bash
railway up
```

## Continuous Deployment

### Option 1: Auto-deploy from GitHub

1. In Railway dashboard, go to your project settings
2. Enable **"GitHub Auto Deploy"**
3. Select your repository and branch
4. Every push to that branch will trigger a deployment

### Option 2: Manual Deployment

After pushing to GitHub:
```bash
railway up
```

## Rollback to Previous Deployment

```bash
railway deployments
```

This shows all previous deployments. To rollback:

1. Find the deployment ID you want to restore
2. In Railway dashboard, go to **"Deployments"**
3. Click the three dots on the deployment
4. Select **"Redeploy"**

## Custom Domain

### Add a Custom Domain

1. In Railway dashboard, go to **"Settings"** → **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain
4. Update your DNS records according to Railway's instructions

### Using Railway CLI

```bash
railway domain add your-domain.com
```

## Monitoring

### View Metrics

```bash
railway metrics
```

Or in the dashboard:
- CPU usage
- Memory usage
- Network I/O
- Request count

## Next Steps

1. Test the deployed application
2. Verify user signup/login works
3. Test portfolio features
4. Monitor logs for errors
5. Set up custom domain (optional)
6. Configure automatic backups

## Getting Help

- Railway CLI Docs: https://docs.railway.app/cli
- Railway Community: https://railway.app/community
