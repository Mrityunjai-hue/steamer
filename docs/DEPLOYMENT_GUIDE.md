# Steamer Production Deployment & Operations Guide (v1.0)

This guide documents the production deployment architecture for **Steamer**, detailing containerization, Cloudflare WAF & Turnstile configuration, PostgreSQL & Redis setup, and backup/restore procedures.

---

## 1. Production Architecture Overview

```
                                  [ INTERNET ]
                                        │
                                        ▼
                  ┌───────────────────────────────────────────┐
                  │          CLOUDFLARE EDGE NETWORK          │
                  │  - DDoS Protection & Edge Caching         │
                  │  - WAF Rules & Security Headers           │
                  │  - Cloudflare Turnstile Bot Detection     │
                  │  - SSL/TLS Full (Strict) Termination      │
                  └─────────────────────┬─────────────────────┘
                                        │ HTTPS (Origin Port 443/3000)
                                        ▼
                  ┌───────────────────────────────────────────┐
                  │             REVERSE PROXY / NGINX         │
                  │  - SSL Offloading & Keep-Alive Pooling    │
                  │  - Rate Limiting (IP / Path)              │
                  └─────────────────────┬─────────────────────┘
                                        │
                        ┌───────────────┴───────────────┐
                        │                               │
                        ▼                               ▼
       ┌─────────────────────────────────┐   ┌─────────────────────────────────┐
       │     STEAMER APP CONTAINER 1     │   │     STEAMER APP CONTAINER 2     │
       │     Next.js 14 (App Router)     │   │     Next.js 14 (App Router)     │
       │     Port 3000 (Node.js runtime) │   │     Port 3000 (Node.js runtime) │
       └────────────────┬────────────────┘   └────────────────┬────────────────┘
                        │                                     │
                        ├──────────────────┬──────────────────┤
                        │                  │                  │
                        ▼                  ▼                  ▼
       ┌────────────────────────┐  ┌───────────────┐  ┌────────────────────────┐
       │   POSTGRESQL (PRIMARY) │  │  REDIS 7 (HA) │  │   TRANSACTION LOGS     │
       │   - Relational Models  │  │  - Slot Locks │  │   - Append-Only Audit  │
       │   - ACID Transactions  │  │  - Cache      │  │   - Daily GCS/S3 Dumps │
       │   - Prisma ORM         │  │  - Rate Limit │  │                        │
       └────────────────────────┘  └───────────────┘  └────────────────────────┘
```

---

## 2. Cloudflare Edge & Security Configuration

### A. SSL / TLS Settings
- **Encryption Mode:** `Full (Strict)`
- **Edge Certificates:** Require TLS 1.3 minimum. Enable Automatic HTTPS Rewrites and HSTS (`max-age=31536000; includeSubDomains; preload`).

### B. Cloudflare Turnstile Integration
1. Create a Turnstile widget in the Cloudflare Dashboard for domain `steamer.live`.
2. Mode: **Managed** (non-interactive challenge for normal users).
3. Copy **Site Key** and **Secret Key** into `.env.production`:
   ```env
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAxxxxxxxxxx
   TURNSTILE_SECRET_KEY=0x4AAAAAAyyyyyyyyyy
   ```

### C. Web Application Firewall (WAF) Rules
Configure custom WAF expressions:
1. **Block Malicious Query Strings:** Block attempts at SQL injection (`UNION SELECT`, `OR 1=1`) and path traversal (`../`).
2. **Rate Limit Auth Endpoints:** Max 10 requests per minute per IP on `/api/auth/login` and `/api/auth/register`.
3. **Block Threat Scores:** Challenge requests with Cloudflare Threat Score > 15.

---

## 3. Environment Variables Reference (`.env.production`)

```bash
# Node Runtime & Environment
NODE_ENV=production
PORT=3000

# Base URLs
NEXT_PUBLIC_APP_URL=https://steamer.live

# Database & Cache
# Production uses PostgreSQL connection string
DATABASE_URL=postgresql://steamer_user:SecurePasswordHere@postgres:5432/steamer_db?schema=public&sslmode=prefer
REDIS_URL=redis://:RedisPasswordHere@redis:6379/0

# Security Secrets (Must be 32+ characters, high entropy)
JWT_SECRET=super-secure-production-jwt-token-secret-change-this-now-12345
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAA...
TURNSTILE_SECRET_KEY=0x4AAAAAA...

# Addendum 6: UPI & Personal Admin Contact Settings
NEXT_PUBLIC_UPI_ID=admin@okaxis
NEXT_PUBLIC_PAYEE_NAME=Steamer Business
ADMIN_PHONE=+919876543210
ADMIN_WHATSAPP=+919876543210
ADMIN_EMAIL=admin@steamer.live

# Optional SMTP for transactional admin emails
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@steamer.live
SMTP_PASSWORD=smtp_password_here
SMTP_FROM=Steamer Platform <noreply@steamer.live>
```

---

## 4. Docker Production Build

### Dockerfile (Multi-stage build)
The provided `Dockerfile` leverages Alpine Linux with multi-stage caching:
1. **Deps stage:** Installs exact production and development dependencies.
2. **Builder stage:** Generates Prisma client, compiles TypeScript, and runs `next build`.
3. **Runner stage:** Minimal Alpine runtime containing only standalone bundle output and static assets, running as an unprivileged user (`nextjs:nodejs`).

### Running with Docker Compose:
```bash
# 1. Clone repository to production host
git clone https://github.com/steamer/steamer.git /opt/steamer
cd /opt/steamer

# 2. Populate environment secrets
cp .env.example .env.production
nano .env.production

# 3. Build and launch services
docker-compose -f docker-compose.yml up -d --build

# 4. Run Prisma database migrations and initial seed
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npm run seed
```

---

## 5. Database Backup & Disaster Recovery

### Automated Daily Backup Script (`/scripts/backup-db.sh`):
```bash
#!/bin/bash
set -e
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/steamer"
mkdir -p "$BACKUP_DIR"

# Run PostgreSQL dump inside container
docker-compose exec -T postgres pg_dump -U steamer_user steamer_db | gzip > "$BACKUP_DIR/steamer_db_$TIMESTAMP.sql.gz"

# Retain last 30 daily backups locally
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/steamer_db_$TIMESTAMP.sql.gz"
```

### Database Restore Procedure:
```bash
# Decompress and restore into PostgreSQL
gunzip < /var/backups/steamer/steamer_db_YYYYMMDD_HHMMSS.sql.gz | docker-compose exec -T postgres psql -U steamer_user -d steamer_db
```

---

## 6. Zero-Downtime Deployment Flow

1. **Pull Latest Code:** `git pull origin main`
2. **Build New App Image:** `docker-compose build app`
3. **Apply Database Migrations:** `docker-compose run --rm app npx prisma migrate deploy`
4. **Reload Service Containers:** `docker-compose up -d --no-deps app`
5. **Verify Origin Health:** Check `https://steamer.live/api/capacity/slots` for `200 OK`.

