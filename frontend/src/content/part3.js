/**
 * Part 3 — Hands-On Examples
 * 4 topics: live walkthroughs with copy-paste commands.
 */

export const part3 = {
  id: 3,
  title: 'Hands-On Examples',
  description: 'Live walkthroughs — pull your first container, run Ghost blog, build a Node.js app, and tour this repo.',
  topics: [
    // ─────────────────────────────────────────────────────────────────────────
    // Topic 1 — Pulling & Running Your First Container
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'first-container',
      title: 'Step 1 — Pulling & Running Your First Container',
      tag: { label: 'Hands-On', type: 'teal' },
      body: [
        'We will start with the simplest possible example to confirm Docker is installed and working, then step up to an interactive container. All commands below are copy-paste ready.',
        '<strong>hello-world</strong> is a minimal Docker image that does exactly one thing: prints a message confirming that Docker is installed and working correctly, then exits. It is the container equivalent of "Hello, World!" and a useful smoke test.',
        'After hello-world, we will run an interactive Ubuntu container. This gives you a full shell inside a container — you can explore the filesystem, run commands, and see that it really is isolated from your host. Type <code>exit</code> to leave the container; because we used <code>--rm</code>, the container is automatically deleted when you exit.',
      ],
      callouts: [
        {
          kind: 'info',
          title: 'Podman equivalent: ',
          subtitle: 'Replace "docker" with "podman" in every command below. The output and behaviour are identical.',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# ── Step 1: Verify Docker is installed ────────────────────────────────────
docker --version
# Expected: Docker version 26.x.x, build ...

# ── Step 2: Run hello-world ────────────────────────────────────────────────
docker run hello-world
# Docker will:
#   1. Look for hello-world image locally (not found)
#   2. Pull it from Docker Hub
#   3. Create a container from the image
#   4. Run the container (prints a message)
#   5. Container exits automatically

# ── Step 3: See the image that was downloaded ─────────────────────────────
docker images
# You should see hello-world listed

# ── Step 4: See the stopped container ─────────────────────────────────────
docker ps -a
# The hello-world container is stopped but still exists`,
          caption: 'Step 1: Verify Docker works with hello-world.',
        },
        {
          language: 'bash',
          code: `# ── Step 5: Run an interactive Ubuntu container ──────────────────────────
docker run -it --rm ubuntu bash
# Flags:
#   -it  = interactive terminal (keeps stdin open + allocates a pseudo-TTY)
#   --rm = automatically remove the container when it exits
#   ubuntu = the image
#   bash = the command to run inside the container

# You are now INSIDE the container. Try these:
cat /etc/os-release           # What OS is this? (Ubuntu)
hostname                      # A random container hostname
ps aux                        # Only a few processes — very minimal
ls /                          # Root filesystem — looks like a full Linux system
whoami                        # root (this is a demo image — production should be non-root)

# The container cannot see your host processes or files:
ls /Users                     # Empty or error — your Mac home is not visible
cat /etc/hostname             # Container's own hostname, not your Mac's

# ── Step 6: Exit the container ────────────────────────────────────────────
exit
# Container is automatically deleted (--rm flag)
# Verify it is gone:
docker ps -a                  # hello-world still there, ubuntu is gone`,
          caption: 'Step 2: Explore an interactive container shell.',
        },
        {
          language: 'bash',
          code: `# ── Cleanup ───────────────────────────────────────────────────────────────
# Remove the hello-world container that is still stopped
docker rm $(docker ps -aq --filter status=exited)

# Remove the hello-world image
docker rmi hello-world

# Nuclear option — remove ALL stopped containers, unused images, networks
docker system prune

# Confirm everything is clean
docker ps -a
docker images`,
          caption: 'Step 3: Clean up after the demo.',
        },
      ],
      keyPoints: [
        '<code>docker run hello-world</code> — the first thing to run on any new machine.',
        '<code>-it</code> = interactive terminal. Use to explore images and debug.',
        '<code>--rm</code> = auto-delete on exit. Always use for demo/test containers.',
        'Inside the container: isolated filesystem, network, and process space.',
        '<code>docker system prune</code> cleans up all stopped containers and unused images.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 2 — Running Ghost Blog
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'ghost-blog',
      title: 'Step 2 — Running Ghost Blog',
      tag: { label: 'Hands-On', type: 'teal' },
      body: [
        '<strong>Ghost</strong> is a popular open-source blogging platform. The official <code>ghost:5-alpine</code> image is a great demo because it is a real production-quality application with a web UI, a SQLite database, and persistent content storage — giving us a chance to demonstrate port mapping, named volumes, restart policies, and environment variables all in one command.',
        'We will run Ghost in two steps: first without a volume (to see it work), then with a named volume (to see persistence in action — data survives container removal and restart).',
        'Notice the URL once Ghost is running: <code>http://localhost:2368</code>. Docker mapped the container\'s internal port 2368 to your local machine\'s port 2368 via <code>-p 2368:2368</code>. The container\'s web server is not directly accessible — all traffic goes through Docker\'s port mapping layer.',
      ],
      callouts: [
        {
          kind: 'info',
          title: 'Official image — safe to pull: ',
          subtitle: 'ghost is an official Docker Hub image, maintained by the Ghost Foundation and regularly scanned for CVEs. Notice we pin to ghost:5-alpine rather than :latest.',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# ── Step 1: Run Ghost (no persistence) ────────────────────────────────────
docker run -d \\
  --name ghost-demo \\
  -p 2368:2368 \\
  -e url=http://localhost:2368 \\
  ghost:5-alpine

# Wait ~10 seconds for Ghost to start, then visit:
# http://localhost:2368         ← public blog
# http://localhost:2368/ghost   ← admin panel (set up on first visit)

# Watch the startup logs
docker logs -f ghost-demo
# Ctrl+C to stop following logs (does NOT stop the container)

# ── Observe: where is the data? ──────────────────────────────────────────
# Ghost writes its SQLite database and content to /var/lib/ghost/content
# inside the container. If we remove the container, all data is lost.
docker exec ghost-demo ls /var/lib/ghost/content

# ── Step 2: Stop and delete ────────────────────────────────────────────────
docker stop ghost-demo && docker rm ghost-demo
# Data is gone — if you restart, Ghost asks you to set up again`,
          caption: 'Step 1: Run Ghost without persistence to see it in action.',
        },
        {
          language: 'bash',
          code: `# ── Step 3: Run Ghost WITH a named volume (data persists) ────────────────
docker volume create ghost-content

docker run -d \\
  --name ghost-blog \\
  -p 2368:2368 \\
  -e url=http://localhost:2368 \\
  -v ghost-content:/var/lib/ghost/content \\
  --restart unless-stopped \\
  ghost:5-alpine

# Visit http://localhost:2368/ghost and complete setup
# Create a post, upload an image — create some test content

# ── Test persistence ──────────────────────────────────────────────────────
docker stop ghost-blog
docker rm ghost-blog        # container is gone...

# Restart from the same image + same volume — all content is still there!
docker run -d \\
  --name ghost-blog \\
  -p 2368:2368 \\
  -e url=http://localhost:2368 \\
  -v ghost-content:/var/lib/ghost/content \\
  --restart unless-stopped \\
  ghost:5-alpine

# Visit http://localhost:2368 — your posts and images are still there!
# This is the power of named volumes.`,
          caption: 'Step 2: Run Ghost with a named volume — data survives container removal.',
        },
        {
          language: 'bash',
          code: `# ── Inspect what we built ────────────────────────────────────────────────
docker inspect ghost-blog | grep -A 5 '"Mounts"'
docker inspect ghost-blog | grep -A 5 '"RestartPolicy"'
docker inspect ghost-blog | grep -A 10 '"Ports"'

# See the volume on the host
docker volume inspect ghost-content

# ── Cleanup ────────────────────────────────────────────────────────────────
docker stop ghost-blog && docker rm ghost-blog
docker volume rm ghost-content
docker rmi ghost:5-alpine`,
          caption: 'Step 3: Inspect and clean up.',
        },
      ],
      keyPoints: [
        'Ghost is a full production application — a real demo, not a toy.',
        '<code>-p 2368:2368</code> maps the container port to your local machine.',
        '<code>-v ghost-content:/var/lib/ghost/content</code> externalises persistent data.',
        '<code>--restart unless-stopped</code> means Ghost survives host reboots.',
        'Without a volume, removing the container destroys all data. With a volume, data survives.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 3 — Building a Container from Scratch
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'build-from-scratch',
      title: 'Step 3 — Build a Container from Scratch',
      tag: { label: 'Hands-On', type: 'teal' },
      body: [
        'Now we build our own container image. We will write a simple Node.js HTTP server, create a Dockerfile for it, build the image, run it, and then push it to a registry. This walkthrough covers everything a developer needs to containerise their own application.',
        'The application itself is intentionally minimal — ten lines of Node.js that respond to every HTTP request with a JSON message. The entire point is the containerisation workflow, not the application logic.',
        'Follow each step in order. By the end you will have a locally-built, running container that you can visit in your browser — and the confidence to containerise any application following the same pattern.',
      ],
      callouts: [
        {
          kind: 'info',
          title: 'Before you begin: ',
          subtitle: 'Create a new empty directory for this demo (e.g. mkdir ~/container-demo && cd ~/container-demo). All files will be created in that directory.',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# ── Step 1: Create a working directory ────────────────────────────────────
mkdir ~/container-demo && cd ~/container-demo`,
          caption: 'Create a clean working directory.',
        },
        {
          language: 'javascript',
          code: `// app.js — a minimal HTTP server (save this as ~/container-demo/app.js)
const http = require('http');

const PORT = process.env.PORT || 3000;
const MESSAGE = process.env.GREETING || 'Hello from inside a container!';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: MESSAGE, url: req.url, time: new Date() }));
});

server.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
          caption: 'app.js — paste this into ~/container-demo/app.js',
        },
        {
          language: 'dockerfile',
          code: `# Dockerfile — save this as ~/container-demo/Dockerfile

# Stage 1: Use an official, minimal Node.js base image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy application files into the image
# (no package.json needed — we only use the built-in 'http' module)
COPY app.js .

# Document the port the app listens on (does NOT publish it)
EXPOSE 3000

# Switch to non-root user (node user is built into the node:alpine image)
USER node

# Start the application
CMD ["node", "app.js"]`,
          caption: 'Dockerfile — paste this into ~/container-demo/Dockerfile',
        },
        {
          language: 'bash',
          code: `# ── Step 2: Build the image ────────────────────────────────────────────────
cd ~/container-demo

docker build -t my-hello-app:1.0.0 .
# Output will show each layer being built:
# [1/2] FROM node:22-alpine
# [2/2] COPY app.js .
# Successfully built abc123...
# Successfully tagged my-hello-app:1.0.0

# Confirm the image exists locally
docker images my-hello-app`,
          caption: 'Step 2: Build the image from the Dockerfile.',
        },
        {
          language: 'bash',
          code: `# ── Step 3: Run the container ──────────────────────────────────────────────
docker run -d \\
  --name my-hello \\
  -p 3000:3000 \\
  -e GREETING="Hello from Containers 101!" \\
  my-hello-app:1.0.0

# Visit: http://localhost:3000
# You should see: {"message":"Hello from Containers 101!","url":"/","time":"..."}

# Check it is running
docker ps

# See logs
docker logs my-hello

# Test with curl
curl http://localhost:3000`,
          caption: 'Step 3: Run the container and test it.',
        },
        {
          language: 'bash',
          code: `# ── Step 4: Explore the running container ────────────────────────────────
# See the processes inside the container
docker exec my-hello ps aux

# See environment variables
docker exec my-hello env

# Explore the filesystem
docker exec my-hello ls /app
docker exec my-hello cat /app/app.js

# See layer history
docker image history my-hello-app:1.0.0

# ── Step 5: Tag and (optionally) push to Docker Hub ──────────────────────
# Replace YOUR_DOCKERHUB_USERNAME with your actual username
docker tag my-hello-app:1.0.0 YOUR_DOCKERHUB_USERNAME/my-hello-app:1.0.0
docker login
docker push YOUR_DOCKERHUB_USERNAME/my-hello-app:1.0.0

# Anyone can now pull and run your image:
docker pull YOUR_DOCKERHUB_USERNAME/my-hello-app:1.0.0`,
          caption: 'Step 4 & 5: Explore the container, tag, and push to a registry.',
        },
        {
          language: 'bash',
          code: `# ── Cleanup ────────────────────────────────────────────────────────────────
docker stop my-hello && docker rm my-hello
docker rmi my-hello-app:1.0.0
rm -rf ~/container-demo`,
          caption: 'Cleanup — remove the container, image, and working directory.',
        },
      ],
      keyPoints: [
        'Any application can be containerised with a Dockerfile — the process is always the same.',
        'Build: <code>docker build -t name:tag .</code>',
        'Run: <code>docker run -d -p HOST:CONTAINER name:tag</code>',
        'Explore: <code>docker exec mycontainer command</code>',
        'Push: <code>docker tag</code> → <code>docker login</code> → <code>docker push</code>',
        'Always use a non-root <code>USER</code> and pin your base image to an exact version.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 4 — Exploring This Repository's Dockerfile
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'repo-dockerfile',
      title: 'Step 4 — Touring This Repository\'s Dockerfile',
      tag: { label: 'Hands-On', type: 'blue' },
      body: [
        'Everything we covered in Parts 1 and 2 comes together in the <code>Dockerfile</code> at the root of this repository. It is a real-world, production-quality multi-stage build that compiles a Java backend (Open Liberty / Jakarta EE) and a React frontend (React Native Web with Carbon Design System) and packages both into a single container image.',
        'Let\'s walk through it section by section, then build and run it. The <code>build.sh</code> and <code>run.sh</code> scripts handle all the flags — they detect whether you have Docker or Podman, read configuration from <code>.env</code>, and orchestrate the build and run commands.',
      ],
      callouts: [
        {
          kind: 'info',
          title: 'Prerequisites: ',
          subtitle: 'Clone this repository, copy .env.example to .env, and fill in any values. Then run ./build.sh followed by ./run.sh.',
        },
      ],
      codeBlocks: [
        {
          language: 'dockerfile',
          code: `# ── PREAMBLE ─────────────────────────────────────────────────────────────
# syntax=docker/dockerfile:1
# Works with both Docker BuildKit and Podman.

# ARG declared BEFORE any FROM makes it available as a build-time parameter.
# The value can be overridden with --build-arg at build time.
ARG LIBERTY_HTTP_PORT=9080
ARG LIBERTY_HTTPS_PORT=9443`,
          caption: 'Lines 1–10: Syntax directive and build-time ARGs.',
        },
        {
          language: 'dockerfile',
          code: `# ── STAGE 1: Backend Build ───────────────────────────────────────────────
FROM maven:3.9.9-eclipse-temurin-17 AS backend-build
# ↑ Full Maven + JDK image — only used during build, NOT in final image
# ↑ Named stage "backend-build" so we can COPY from it later

WORKDIR /build/backend

# pom.xml copied FIRST → Maven dependency download cached separately from source
COPY backend/pom.xml .
RUN mvn dependency:go-offline --no-transfer-progress -q
# ↑ Cache-optimised layer: deps only re-downloaded when pom.xml changes

COPY backend/src ./src
RUN mvn package --no-transfer-progress -q -DskipTests
# ↑ Compiles Java → produces launch-next-chapter.war`,
          caption: 'Lines 15–29: Stage 1 — Maven compiles the Java backend.',
        },
        {
          language: 'dockerfile',
          code: `# ── STAGE 2: Frontend Build ──────────────────────────────────────────────
FROM node:22.9.0-alpine3.20 AS frontend-build
# ↑ Alpine variant — minimal, fast. Exact version pinned for reproducibility.

WORKDIR /build/frontend

# package.json + package-lock.json copied FIRST → npm ci cached until lockfile changes
COPY frontend/package.json frontend/package-lock.json* ./
COPY frontend/babel.config.json frontend/webpack.config.js ./
RUN npm ci --ignore-scripts
# ↑ --ignore-scripts: install without running untrusted lifecycle hooks

COPY frontend/src ./src
RUN npm run build
# ↑ Webpack production build → outputs minified assets to ./dist`,
          caption: 'Lines 34–51: Stage 2 — Node.js builds the React frontend.',
        },
        {
          language: 'dockerfile',
          code: `# ── STAGE 3: Final Runtime Image ─────────────────────────────────────────
FROM icr.io/appcafe/open-liberty:kernel-slim-java17-openj9-ubi AS runtime
# ↑ IBM Container Registry — enterprise-grade, CVE-patched base image
# ↑ kernel-slim: only the Liberty kernel; features installed on demand
# ↑ java17-openj9: IBM's optimised JVM (faster startup, lower memory vs HotSpot)
# ↑ ubi: Red Hat Universal Base Image — compatible with OpenShift

# Re-declare ARGs after FROM to bring them into this stage's scope
ARG LIBERTY_HTTP_PORT=9080
ARG LIBERTY_HTTPS_PORT=9443

# Bake port numbers into the image as ENV vars (runtime-overridable via --env-file)
ENV LIBERTY_HTTP_PORT=\${LIBERTY_HTTP_PORT} \\
    LIBERTY_HTTPS_PORT=\${LIBERTY_HTTPS_PORT}

# Copy server.xml and pre-install Liberty features (cached layer)
COPY --chown=1001:0 backend/src/main/liberty/config/server.xml /config/server.xml
RUN features.sh
# ↑ features.sh: Liberty utility that reads server.xml and installs declared features

# Copy compiled WAR from Stage 1 — ONLY the output, not the JDK or Maven
COPY --chown=1001:0 \\
     --from=backend-build \\
     /build/backend/target/launch-next-chapter.war \\
     /config/apps/launch-next-chapter.war

# Copy frontend static assets from Stage 2 — ONLY the dist bundle
COPY --chown=1001:0 \\
     --from=frontend-build \\
     /build/frontend/dist \\
     /config/apps/static

# ↑ --chown=1001:0 sets ownership to Liberty's non-root UID (1001) and GID 0

USER 1001
# ↑ Explicitly switch to non-root. Even if base image does this, stating it
#   here ensures scanners and OPA policies can verify it.

EXPOSE \${LIBERTY_HTTP_PORT}
EXPOSE \${LIBERTY_HTTPS_PORT}

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \\
  CMD curl -f http://localhost:\${LIBERTY_HTTP_PORT}/health || exit 1
# ↑ MicroProfile Health endpoint — polls /health
# ↑ --start-period=60s: Liberty needs ~60s cold start — don't count early failures`,
          caption: 'Lines 56–104: Stage 3 — The final production image with all best practices.',
        },
        {
          language: 'bash',
          code: `# ── Build and run this repository ────────────────────────────────────────

# 1. Clone the repo (if not already done)
git clone https://github.com/YOUR_ORG/containers-101.git
cd containers-101

# 2. Set up your .env file
cp .env.example .env
# Edit .env if needed (default values work for local dev)

# 3. Build the image (build.sh detects Docker or Podman automatically)
./build.sh
# This runs a 3-stage Docker build:
#   Stage 1: Maven compiles the Java WAR
#   Stage 2: Webpack bundles the React frontend
#   Stage 3: Both outputs copied into the Liberty runtime image

# 4. Run the container
./run.sh
# This runs docker run with --env-file .env and the configured port mappings

# 5. Open the application
open http://localhost:9080

# 6. Check the health endpoint (MicroProfile Health)
curl http://localhost:9080/health

# 7. View logs
docker logs -f launch-next-chapter`,
          caption: 'Build and run the full application from this repository.',
        },
        {
          language: 'bash',
          code: `# ── What did we just use from Parts 1 & 2? ───────────────────────────────

# FROM Part 1:
# ✓ Multi-stage build (3 stages: Maven → Node.js → Liberty)
# ✓ Layer caching (manifests copied before source)
# ✓ Architecture awareness (IBM ICR + UBI = OpenShift-ready)
# ✓ Immutability (rebuild + redeploy, never patch in place)
# ✓ Enterprise registry (icr.io, not Docker Hub community image)

# FROM Part 2:
# ✓ .env file for all runtime config (build.sh + run.sh)
# ✓ .dockerignore excludes secrets and build artefacts
# ✓ Port mapping (LIBERTY_HTTP_PORT:LIBERTY_HTTP_PORT)
# ✓ Non-root USER (UID 1001)
# ✓ HEALTHCHECK endpoint
# ✓ ENV for runtime-overridable defaults
# ✓ ARG for build-time parameters

echo "That's Containers 101!"`,
          caption: 'Everything from Parts 1 & 2 in one real-world Dockerfile.',
        },
      ],
      keyPoints: [
        'Three-stage multi-stage build: Maven → Node.js → Liberty runtime.',
        'Only compiled artefacts (WAR + frontend dist) make it into the final image — no build tools.',
        '<code>icr.io/appcafe/open-liberty</code> is an IBM-maintained, CVE-patched enterprise base image.',
        '<code>USER 1001</code> + <code>--chown=1001:0</code> throughout — non-root from start to finish.',
        '<code>HEALTHCHECK</code> polls MicroProfile Health — orchestrators use this to manage container lifecycle.',
        'All configuration from <code>.env</code> via <code>--env-file</code> — nothing hardcoded in the image.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 5 — IBM MQ Advanced for Developers
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'ibm-mq-advanced',
      title: 'Step 5 — IBM MQ Advanced for Developers',
      tag: { label: 'Try It', type: 'purple' },
      body: [
        '<strong>IBM MQ</strong> is an enterprise messaging middleware that enables applications, systems, and services to communicate reliably across platforms and networks. IBM provides an official <strong>MQ Advanced for Developers</strong> container image — a fully functional MQ queue manager that you can run on your laptop for free, making it ideal for learning, development, and integration testing.',
        'The image is published on Docker Hub (<code>ibmcom/mq</code>) and on the IBM Container Registry. It ships with a pre-configured queue manager (<code>QM1</code>), a default queue (<code>DEV.QUEUE.1</code>), and the MQ Console web UI so you can browse and manage your queues through a browser without installing any additional tools.',
        'Running MQ in a container is a perfect demonstration of everything covered in this session: an enterprise-grade application, an official vendor image, port mapping (two ports — one for MQ listeners, one for the web console), environment variables for configuration, and a named volume to persist queue manager data across container restarts.',
        'Once the container is running you can connect any MQ client application to <code>localhost:1414</code>, open the MQ Console at <code>https://localhost:9443/ibmmq/console</code>, and browse queue activity in real time — all from a single <code>docker run</code> command.',
      ],
      callouts: [
        {
          kind: 'info',
          title: 'Free for development: ',
          subtitle: 'MQ Advanced for Developers is free to use for development and testing. It includes all MQ Advanced features. It must not be used in production — for production use a licensed MQ installation.',
        },
        {
          kind: 'warning',
          title: 'Accept the licence: ',
          subtitle: 'The container will not start unless you pass -e LICENSE=accept. This is IBM\'s way of ensuring you have acknowledged the developer licence terms.',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# ── Step 1: Pull the IBM MQ Advanced for Developers image ────────────────
docker pull icr.io/ibm-messaging/mq:latest

# Or from Docker Hub:
docker pull ibmcom/mq:latest

# Confirm the image is local
docker images | grep mq`,
          caption: 'Pull the IBM MQ developer image from IBM Container Registry or Docker Hub.',
        },
        {
          language: 'bash',
          code: `# ── Running with the default configuration ───────────────────────────────
# From the official GitHub repo: https://github.com/ibm-messaging/mq-container
#
# Creates and starts a queue manager called QM1.
# Maps port 1414 on the host to the MQ listener on port 1414 inside the container,
# and port 9443 on the host to the web console on port 9443 inside the container.

docker run \\
  --env LICENSE=accept \\
  --env MQ_QMGR_NAME=QM1 \\
  --publish 1414:1414 \\
  --publish 9443:9443 \\
  --detach \\
  icr.io/ibm-messaging/mq`,
          caption: 'Default configuration — minimal run command straight from the GitHub documentation.',
        },
        {
          language: 'bash',
          code: `# ── Running with the default configuration and a volume ──────────────────
# The above example will not persist any configuration data or messages
# across container runs. To persist data, use a named volume.

# Step 1: Create the volume
docker volume create qm1data

# Step 2: Run with the volume mounted
docker run \\
  --env LICENSE=accept \\
  --env MQ_QMGR_NAME=QM1 \\
  --publish 1414:1414 \\
  --publish 9443:9443 \\
  --detach \\
  --volume qm1data:/mnt/mqm \\
  icr.io/ibm-messaging/mq`,
          caption: 'Default configuration with a named volume — queue manager data and messages persist across container restarts.',
        },
        {
          language: 'bash',
          code: `# ── Step 2: Create a named volume for MQ data persistence ────────────────
docker volume create qm1data

# ── Step 3: Run MQ Advanced for Developers ────────────────────────────────
docker run -d \\
  --name mq-dev \\
  --env LICENSE=accept \\
  --env MQ_QMGR_NAME=QM1 \\
  --env MQ_APP_PASSWORD=passw0rd \\
  --env MQ_ADMIN_PASSWORD=passw0rd \\
  -p 1414:1414 \\
  -p 9443:9443 \\
  -v qm1data:/mnt/mqm \\
  --restart unless-stopped \\
  icr.io/ibm-messaging/mq:latest

# Port mapping:
#   1414 → MQ listener (clients connect here)
#   9443 → MQ Console HTTPS (web UI)`,
          caption: 'Run MQ with a named volume, port mapping, and environment variable configuration.',
        },
        {
          language: 'bash',
          code: `# ── Step 4: Verify MQ is running ─────────────────────────────────────────
docker logs mq-dev
# Look for: "IBM MQ Queue Manager QM1 is now fully running"

docker ps
# mq-dev should show status "Up"

# ── Step 5: Open the MQ Console ───────────────────────────────────────────
# Visit in your browser (accept the self-signed cert warning):
# https://localhost:9443/ibmmq/console
#
# Log in with:
#   Username: admin
#   Password: passw0rd  (set via MQ_ADMIN_PASSWORD above)
#
# You will see QM1 and its pre-configured queues:
#   DEV.QUEUE.1    ← application queue
#   DEV.DEAD.LETTER.QUEUE ← dead-letter queue`,
          caption: 'Verify MQ is running and log in to the MQ Console.',
        },
        {
          language: 'bash',
          code: `# ── Step 6: Inspect the running container ────────────────────────────────
# Check environment variables (confirms licence + queue manager name)
docker inspect mq-dev | grep -A 15 '"Env"'

# Check port bindings
docker inspect mq-dev | grep -A 10 '"Ports"'

# Check volume mount
docker inspect mq-dev | grep -A 8 '"Mounts"'

# Check restart policy
docker inspect mq-dev | grep -A 3 '"RestartPolicy"'

# Tail the MQ logs in real time
docker logs -f mq-dev`,
          caption: 'Inspect the MQ container — confirming env vars, ports, volume, and restart policy.',
        },
        {
          language: 'bash',
          code: `# ── Step 7: Exec into the container (optional) ───────────────────────────
docker exec -it mq-dev bash

# Inside the container — run MQ admin commands:
dspmq                         # display queue managers
runmqsc QM1                   # open MQ command line for QM1

# Inside runmqsc — try these MQ commands:
DISPLAY QLOCAL(DEV.QUEUE.1)   # show queue attributes
DISPLAY CHSTATUS(*)           # show channel status
DISPLAY CONN(*)               # show active connections
END                           # exit runmqsc

exit                          # exit the container shell`,
          caption: 'Exec into the MQ container and run native MQ admin commands.',
        },
        {
          language: 'bash',
          code: `# ── Cleanup ────────────────────────────────────────────────────────────────
docker stop mq-dev && docker rm mq-dev

# Remove the volume (this deletes all queue manager data)
docker volume rm qm1data

# Remove the image
docker rmi icr.io/ibm-messaging/mq:latest`,
          caption: 'Cleanup — stop and remove the MQ container, volume, and image.',
        },
      ],
      keyPoints: [
        'IBM MQ Advanced for Developers is free for dev/test — pull and run in one command.',
        '<code>LICENSE=accept</code> is required — the container refuses to start without it.',
        'Two ports: <code>1414</code> (MQ listener for clients) and <code>9443</code> (MQ Console HTTPS).',
        'Named volume <code>qm1data:/mnt/mqm</code> persists the queue manager across container restarts.',
        'MQ Console at <code>https://localhost:9443/ibmmq/console</code> — full GUI queue manager management.',
        '<code>docker exec -it mq-dev bash</code> then <code>runmqsc QM1</code> for native MQ CLI access.',
        `<a href="https://www.ibm.com/docs/en/ibm-mq/10.0.x?topic=reference-mq-advanced-developers-container-image" target="_blank" rel="noopener noreferrer" style="color:var(--cds-link-primary)">MQ Advanced for Developers — container image docs ↗</a>`,
        `<a href="https://www.ibm.com/docs/en/ibm-mq/10.0.x?topic=reference-mq-advanced-container-image" target="_blank" rel="noopener noreferrer" style="color:var(--cds-link-primary)">MQ Advanced container image reference ↗</a>`,
        `<a href="https://www.ibm.com/docs/en/ibm-mq/10.0.x?topic=planning-support" target="_blank" rel="noopener noreferrer" style="color:var(--cds-link-primary)">Support for MQ in containers ↗</a>`,
        `<a href="https://github.com/ibm-messaging/mq-container" target="_blank" rel="noopener noreferrer" style="color:var(--cds-link-primary)">ibm-messaging/mq-container — GitHub ↗</a>`,
      ],
    },
  ],
};
