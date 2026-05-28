# Podman Container Deployment

QC Manufacturing System containerized deployment using Podman.

## Directory Structure

```
docker/
├── docker-compose.yml      # Compose file (uses pre-built images)
├── README.md               # This file
├── BackEnd/
│   ├── Containerfile       # Backend build instructions
│   ├── .env                # Runtime environment
│   ├── dist/               # Compiled TypeScript
│   ├── src/                # Source code
│   └── package.json        # Dependencies
└── FrontEnd/
    ├── Containerfile       # Frontend build instructions
    ├── dist/               # Built React app
    ├── nginx.conf          # Nginx main config
    └── sampling-inspection.conf  # Nginx site config
```

## Quick Start

### Step 1: Build Images

> **Version-bump rule.** Tag, Containerfile default `ARG BUILD_VERSION`, and this README must stay in lockstep. Always pass `--build-arg BUILD_VERSION=<tag>` so the image's `org.opencontainers.image.version` LABEL matches the tag in `podman images`. A mismatch is how stale-image drift hides (see `br/FIX_PRODUCTION_API_PROXY_404.md`).

```bash
cd docker

# Build Frontend
podman build --build-arg BUILD_VERSION=1.0.3 \
  -t localhost/oqa-qc-frontend:1.0.3 -f FrontEnd/Containerfile FrontEnd/

# Build Backend
podman build --build-arg BUILD_VERSION=1.0.3 \
  -t localhost/oqa-qc-backend:1.0.3 -f BackEnd/Containerfile BackEnd/
```

### Step 2: Deploy

```bash
# Start services
podman-compose up -d

# View logs
podman-compose logs -f

# Stop services
podman-compose down
```

## Services

| Service | Container Name | Internal Port | External Port | Description |
|---------|---------------|---------------|---------------|-------------|
| Frontend | oqa-qc-frontend | 80 | 8022 | Nginx serving React SPA |
| Backend | oqa-qc-backend | 8080 | 8021 | Node.js Express API + MSSQL Sync |

## Configuration

### Backend Environment (BackEnd/.env)

```bash
# Database
DB_HOST=host.containers.internal   # or tiger_postgres_db
DB_PORT=5432
DB_NAME=qcv
DB_USER=admin_tiger
DB_PASSWORD=your_password

# Server
PORT=8080
NODE_ENV=production
SESSION_SECRET=your_secret_key

# CORS
CORS_ORIGIN=http://your-server:8022
```

### Database Connection

| Scenario | DB_HOST Value |
|----------|---------------|
| Host PostgreSQL (Podman) | `host.containers.internal` |
| Named PostgreSQL container | `tiger_postgres_db` |
| Remote PostgreSQL | `192.168.x.x` |

## Common Commands

### Build Commands

```bash
# Build Frontend
podman build --build-arg BUILD_VERSION=1.0.3 \
  -t localhost/oqa-qc-frontend:1.0.3 -f FrontEnd/Containerfile FrontEnd/

# Build Backend
podman build --build-arg BUILD_VERSION=1.0.3 \
  -t localhost/oqa-qc-backend:1.0.3 -f BackEnd/Containerfile BackEnd/

# Rebuild with no cache (forces nginx config / dist refresh)
podman build --no-cache --build-arg BUILD_VERSION=1.0.2 \
  -t localhost/oqa-qc-frontend:1.0.2 -f FrontEnd/Containerfile FrontEnd/
```

### Compose Commands

```bash
# Start services
podman-compose up -d

# Stop services
podman-compose down

# Restart specific service
podman-compose restart backend

# View logs
podman-compose logs -f backend

# Check status
podman-compose ps
```

### Container Commands

```bash
# Enter container shell
podman exec -it oqa-qc-backend sh

# Check resource usage
podman stats

# List images
podman images | grep oqa-qc
```

## Health Checks

```bash
# Frontend health
curl http://localhost:8022/health

# Backend health
curl http://localhost:8021/health

# Scheduler status
curl http://localhost:8021/api/scheduler/status
```

## Volumes

| Volume | Mount Point | Purpose |
|--------|-------------|---------|
| qc-backend-logs | /app/logs | Application logs |
| qc-backend-uploads | /app/uploads | Uploaded files |
| qc-backend-reports | /app/reports | Generated reports |
| qc-backend-temp | /app/temp | Temporary files |

## Full Deployment Workflow

```bash
# 1. Navigate to docker folder
cd docker

# 2. Build images
podman build --build-arg BUILD_VERSION=1.0.2 \
  -t localhost/oqa-qc-frontend:1.0.2 -f FrontEnd/Containerfile FrontEnd/
podman build --build-arg BUILD_VERSION=1.0.2 \
  -t localhost/oqa-qc-backend:1.0.2 -f BackEnd/Containerfile BackEnd/

# 3. Verify images — tag and baked-in LABEL must match
podman images | grep oqa-qc
podman inspect localhost/oqa-qc-frontend:1.0.2 \
  --format '{{index .Labels "org.opencontainers.image.version"}}'
podman inspect localhost/oqa-qc-backend:1.0.2 \
  --format '{{index .Labels "org.opencontainers.image.version"}}'

# 4. Deploy
podman-compose up -d

# 5. Check status
podman-compose ps

# 6. Verify health
curl http://localhost:8021/health
curl http://localhost:8021/api/scheduler/status

# 7. View logs
podman-compose logs -f backend
```

## Troubleshooting

### Container won't start

```bash
podman-compose logs backend
podman-compose ps -a
```

### Database connection issues

```bash
# Test from inside container
podman exec -it oqa-qc-backend sh
nc -zv host.containers.internal 5432
```

### MSSQL Sync not working

```bash
# Check scheduler status
curl http://localhost:8021/api/scheduler/status

# Check logs
podman-compose logs backend | grep -i scheduler
```

```sql
-- Verify sysconfig
SELECT mssql_enabled, mssql_sync FROM sysconfig WHERE id = 1;
```

---

**Last Updated**: 2026-05-22 — bumped both images to **1.0.2**. Switched the nginx `/api/` upstream from `backend:8080` (container-network DNS) to `host.containers.internal:8021` (host gateway) via `extra_hosts: host-gateway` on the frontend service. This eliminates the aardvark-dns alias fragility that caused the prod outage on 2026-05-22 — frontend now proxies through the host's published backend port (8021) instead of inter-container DNS. See `br/FIX_PRODUCTION_API_PROXY_404.md`.
