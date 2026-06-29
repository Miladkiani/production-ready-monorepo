# 🐳 Docker Guide for Fullstack Turborepo Starter

## 📚 Learning Resources

### What is Docker?

Docker packages your app and all its dependencies into a **container** - a lightweight, standalone executable package. Think of it as a shipping container for code: works the same everywhere!

### Key Concepts

**Image vs Container:**

- **Image**: Blueprint (recipe for your app)
- **Container**: Running instance (the actual app running)
- Analogy: Class vs Object in programming

**Layers:**

- Docker builds images in layers
- Each instruction in Dockerfile creates a layer
- Layers are cached → faster rebuilds!

**Volumes:**

- Persistent storage outside container
- Survives container restarts/deletions
- Use for: databases, uploads, logs

---

## 🚀 Quick Start

### Prerequisites

```bash
# Install Docker Desktop
# Windows/Mac: https://www.docker.com/products/docker-desktop
# Linux: https://docs.docker.com/engine/install/

# Verify installation
docker --version
docker-compose --version
```

### Development Mode (Hot Reload)

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your values

# 2. Build and start all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# 3. Initialize database (first time only)
docker-compose exec backend pnpm prisma migrate dev
docker-compose exec backend pnpm prisma db seed

# 4. Access your apps:
# - Backend GraphQL: http://localhost:3001/graphql
# - Admin Panel:     http://localhost:3000
# - Website:         http://localhost:3002
```

**What's happening:**

- ✅ Source code is mounted (changes reflected instantly)
- ✅ Hot reload enabled for all apps
- ✅ node_modules stay in container (fast!)
- ✅ Debugger available on port 9229

### Production Mode

```bash
# Build optimized images
docker-compose build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

---

## 🎓 Docker Commands Cheat Sheet

### Container Management

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Start specific service
docker-compose up backend

# Stop specific service
docker-compose stop backend

# Restart service
docker-compose restart backend

# Remove containers
docker-compose down

# Remove containers AND volumes (⚠️ deletes data!)
docker-compose down -v
```

### Logs & Debugging

```bash
# View logs
docker-compose logs backend
docker-compose logs -f admin  # Follow logs

# Execute commands in running container
docker-compose exec backend sh
docker-compose exec backend pnpm prisma studio

# Check container resource usage
docker stats
```

### Images

```bash
# List images
docker images

# Remove unused images
docker image prune

# Remove specific image
docker rmi <image-id>

# Build without cache (fresh build)
docker-compose build --no-cache
```

### Volumes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect <volume-name>

# Remove unused volumes
docker volume prune

# Backup database
docker run --rm -v app-backend-db:/data -v $(pwd):/backup \
  alpine tar czf /backup/db-backup.tar.gz /data
```

---

## 🏗️ Architecture Explained

### Multi-Stage Builds

Our Dockerfiles use **multi-stage builds** to optimize image size:

```
Stage 1: BASE        → Common setup (Node.js, pnpm)
Stage 2: DEPENDENCIES → Install all packages
Stage 3: BUILDER     → Build the application
Stage 4: PRODUCTION  → Minimal runtime image
```

**Why?**

- Stage 2 installs dev dependencies (needed for building)
- Stage 4 only includes production dependencies
- Final image is ~200MB instead of ~1GB!

### Monorepo Challenges

**Problem:** TurboRepo needs full workspace context to build.

**Solution:**

1. Copy ALL package.json files first (workspace resolution)
2. Install dependencies for entire monorepo
3. Build shared packages (`@repo/*`)
4. Build target app
5. Copy only necessary files to final stage

### Next.js Standalone Mode

**What is it?**
Next.js can output a minimal server bundle that includes only necessary files.

**Enable it:**

```typescript
// next.config.ts
const config = {
  output: "standalone",
  // ...
};
```

**Result:**

- `.next/standalone` folder has everything to run
- Includes only used dependencies
- ~100MB instead of ~500MB

---

## 🔧 Customization

### Change Ports

Edit `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "4000:3001" # Host:Container
```

### Add Environment Variables

1. Add to `.env` file
2. Reference in `docker-compose.yml`:

```yaml
environment:
  MY_VAR: ${MY_VAR}
```

### Database Migration

```bash
# Create migration
docker-compose exec backend pnpm prisma migrate dev --name my-migration

# Apply migrations
docker-compose exec backend pnpm prisma migrate deploy

# Seed database
docker-compose exec backend pnpm prisma db seed
```

---

## 🚢 CI/CD Integration

### GitHub Actions Example

```yaml
name: Build Docker Images

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Backend
        run: docker build -f Dockerfile.backend -t backend:latest .

      - name: Build Admin
        run: docker build -f Dockerfile.admin -t admin:latest .

      - name: Build Website
        run: docker build -f Dockerfile.website -t website:latest .
```

### Docker Hub Push

```bash
# Login
docker login

# Tag images
docker tag app-backend:latest yourusername/app-backend:latest

# Push
docker push yourusername/app-backend:latest
```

---

## 🐛 Troubleshooting

### Build Fails: "ENOENT: no such file"

**Cause:** Missing files in context.
**Fix:** Check `.dockerignore` isn't excluding needed files.

### Container Exits Immediately

```bash
# Check logs
docker-compose logs backend

# Common causes:
# - Missing environment variables
# - Port already in use
# - Database connection failed
```

### Hot Reload Not Working (Dev Mode)

**Cause:** Volume mount issues.
**Fix:**

```bash
# Rebuild containers
docker-compose down
docker-compose up --build
```

### Database Locked Error

**Cause:** SQLite is in use by another process.
**Fix:**

```bash
# Stop all containers
docker-compose down

# Remove volume
docker volume rm app-backend-db

# Restart
docker-compose up
```

### Large Image Size

**Check layer sizes:**

```bash
docker history app-backend:latest
```

**Optimize:**

- Use `.dockerignore`
- Multi-stage builds (already implemented!)
- Use alpine base images (already done!)

---

## 📊 Performance Tips

1. **Layer Caching**: Order Dockerfile commands from least to most frequently changing
2. **Build Cache**: Use `docker-compose build` (don't use `--no-cache` unless needed)
3. **Volumes**: Use named volumes for node_modules (faster than bind mounts)
4. **Network**: Use `host` network mode for faster localhost communication (Linux only)

---

## 🎯 Next Steps

### Learning Path:

1. ✅ Understand Dockerfiles (you are here!)
2. ⬜ Learn Docker Compose
3. ⬜ Understand volumes & networking
4. ⬜ Implement health checks
5. ⬜ Setup reverse proxy (nginx)
6. ⬜ Container orchestration (Kubernetes basics)

### Recommended Reading:

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Compose Docs](https://docs.docker.com/compose/)

---

## 💡 Pro Tips

**Faster Builds:**

```bash
# Use BuildKit (modern Docker builder)
export DOCKER_BUILDKIT=1
docker-compose build
```

**Interactive Debugging:**

```bash
# Start shell in running container
docker-compose exec backend sh

# Run container with shell (if container exits)
docker run -it --rm app-backend sh
```

**Clean Everything:**

```bash
# Remove all stopped containers, networks, dangling images
docker system prune -a

# Free up space (removes everything not in use)
docker system prune -a --volumes
```

---

## 📞 Support

Issues? Check:

1. Docker logs: `docker-compose logs -f`
2. Container status: `docker ps -a`
3. Disk space: `docker system df`

Happy Dockerizing! 🐳
