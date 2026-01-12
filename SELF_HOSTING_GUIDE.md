# Self-Hosting Guide for MetalsTracker

This guide provides instructions for self-hosting the MetalsTracker application on your own server or VPS.

## Architecture Overview

MetalsTracker consists of:
- **Frontend:** React + Vite (compiled to static files)
- **Backend:** Express.js + tRPC (Node.js)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth + JWT tokens

## Prerequisites

- A VPS or server running Linux (Ubuntu 20.04+ recommended)
- Node.js 18+ and npm/pnpm
- PostgreSQL (or use Supabase)
- A domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

## Quick Start (Docker)

### 1. Create Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy files
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build
RUN pnpm build

# Expose port
EXPOSE 3000

# Start
CMD ["pnpm", "start"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      JWT_SECRET: ${JWT_SECRET}
      VITE_SUPABASE_URL: ${VITE_SUPABASE_URL}
      SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY}
      VITE_APP_TITLE: MetalsTracker
    restart: unless-stopped
```

### 3. Deploy

```bash
# Create .env file
cat > .env << EOF
JWT_SECRET=your_strong_random_secret_here
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
EOF

# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f
```

## Manual Installation (Linux VPS)

### 1. Connect to Your Server

```bash
ssh user@your-server-ip
```

### 2. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install Git
sudo apt install -y git
```

### 3. Clone Repository

```bash
cd /opt
sudo git clone https://github.com/Marten213/metals-portfolio.git
cd metals-portfolio
sudo chown -R $USER:$USER .
```

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Build Application

```bash
pnpm build
```

### 6. Configure Environment

```bash
cat > .env.production << EOF
NODE_ENV=production
PORT=3000
JWT_SECRET=your_strong_random_secret_here
VITE_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
VITE_APP_TITLE=MetalsTracker
EOF
```

### 7. Create Systemd Service

```bash
sudo tee /etc/systemd/system/metals-tracker.service > /dev/null << EOF
[Unit]
Description=MetalsTracker Application
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/metals-portfolio
Environment="NODE_ENV=production"
Environment="PORT=3000"
EnvironmentFile=/opt/metals-portfolio/.env.production
ExecStart=/home/$USER/.local/share/pnpm/pnpm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

### 8. Start Service

```bash
sudo systemctl daemon-reload
sudo systemctl enable metals-tracker
sudo systemctl start metals-tracker
sudo systemctl status metals-tracker
```

### 9. View Logs

```bash
sudo journalctl -u metals-tracker -f
```

## Nginx Reverse Proxy

### 1. Install Nginx

```bash
sudo apt install -y nginx
```

### 2. Configure Nginx

```bash
sudo tee /etc/nginx/sites-available/metals-tracker > /dev/null << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL certificates (see Let's Encrypt section below)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

### 3. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/metals-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Certificate (Let's Encrypt)

### 1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Get Certificate

```bash
sudo certbot certonly --nginx -d your-domain.com
```

### 3. Auto-Renewal

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Database Setup

### Option 1: Use Supabase (Recommended)

1. Go to https://supabase.com
2. Create a new project
3. Get credentials from **Settings** → **API**
4. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Option 2: Self-Hosted PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Create database
sudo -u postgres createdb metals_tracker

# Create user
sudo -u postgres createuser metals_user
sudo -u postgres psql -c "ALTER USER metals_user WITH PASSWORD 'strong_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE metals_tracker TO metals_user;"

# Set DATABASE_URL
export DATABASE_URL="postgresql://metals_user:strong_password@localhost:5432/metals_tracker"
```

## Monitoring and Maintenance

### View Application Logs

```bash
sudo journalctl -u metals-tracker -f
```

### Monitor System Resources

```bash
# Install htop
sudo apt install -y htop

# View system stats
htop
```

### Backup Database

```bash
# Backup Supabase database
pg_dump "postgresql://user:password@host:5432/db" > backup.sql

# Or use Supabase dashboard for automated backups
```

### Update Application

```bash
cd /opt/metals-portfolio
git pull origin main
pnpm install
pnpm build
sudo systemctl restart metals-tracker
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
sudo journalctl -u metals-tracker -n 50

# Check if port is in use
sudo lsof -i :3000

# Check environment variables
cat /opt/metals-portfolio/.env.production
```

### Nginx Not Forwarding Requests

```bash
# Check Nginx config
sudo nginx -t

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Database Connection Failed

```bash
# Test Supabase connection
curl https://your-project.supabase.co/rest/v1/

# Check environment variables
echo $VITE_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

## Performance Optimization

### 1. Enable Gzip Compression

Add to Nginx config:
```nginx
gzip on;
gzip_types text/plain text/css text/javascript application/json;
gzip_min_length 1000;
```

### 2. Enable Caching

Add to Nginx config:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Use CDN

Consider using Cloudflare or similar CDN for:
- Static asset caching
- DDoS protection
- Global distribution

## Security Checklist

- [ ] SSL certificate installed and auto-renewing
- [ ] Firewall configured (UFW recommended)
- [ ] SSH key-based authentication enabled
- [ ] Regular backups configured
- [ ] Environment variables secured
- [ ] Database backups automated
- [ ] Monitoring and alerting set up
- [ ] Rate limiting configured
- [ ] CORS properly configured

## Firewall Setup (UFW)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Check status
sudo ufw status
```

## Getting Help

- Node.js Docs: https://nodejs.org/docs
- Express Docs: https://expressjs.com
- Nginx Docs: https://nginx.org/en/docs
- Supabase Docs: https://supabase.com/docs
- Let's Encrypt: https://letsencrypt.org

## Next Steps

1. Test all features in production
2. Set up monitoring (Sentry, DataDog, etc.)
3. Configure backups
4. Set up alerting
5. Monitor performance metrics
6. Plan for scaling if needed
