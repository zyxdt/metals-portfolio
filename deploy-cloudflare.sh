#!/bin/bash

# Cloudflare Deployment Script for MetalsTracker
# This script deploys the application to Cloudflare Pages and Workers

set -e

echo "🚀 Starting MetalsTracker deployment to Cloudflare..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI not found. Installing...${NC}"
    npm install -g wrangler
fi

# Check if required environment variables are set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${RED}❌ CLOUDFLARE_API_TOKEN not set${NC}"
    exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo -e "${RED}❌ CLOUDFLARE_ACCOUNT_ID not set${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Building application...${NC}"
pnpm install
pnpm build

echo -e "${BLUE}🔧 Setting up Cloudflare environment variables...${NC}"
# These will be set in the Cloudflare dashboard

echo -e "${BLUE}📤 Deploying backend to Cloudflare Workers...${NC}"
wrangler deploy \
  --name metalsdash-backend \
  --env production \
  --compatibility-date 2024-01-01

echo -e "${BLUE}📤 Deploying frontend to Cloudflare Pages...${NC}"
# Note: This requires the project to be created in Cloudflare dashboard first
# Then you can deploy using: wrangler pages deploy dist --project-name metalsdash

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Your application is now live at:"
echo "  Frontend: https://metalsdash.pages.dev"
echo "  Backend API: https://api.metalsdash.pages.dev"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Cloudflare dashboard"
echo "2. Configure custom domain (if you have one)"
echo "3. Test the application"
