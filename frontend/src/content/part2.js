/**
 * Part 2 — Building & Running Containers
 * 9 topics covering operational depth.
 */

import execIntoContainerImg from '../images/Exec-into-container.png';
import portMappingImg from '../images/port-mapping.png';
import mountsImg from '../images/Mounts.png';

export const part2 = {
  id: 2,
  title: 'Building & Running Containers',
  description: 'Operational depth — environment variables, volumes, ports, restart policies, image tagging, and debugging running containers.',
  topics: [
    // ─────────────────────────────────────────────────────────────────────────
    // Topic 1 — Container Run Options
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'run-options',
      title: 'Container Run Options',
      tag: { label: 'Command', type: 'blue' },
      body: [
        'The <code>docker run</code> command is the workhorse of container operations. It pulls an image if not already present locally, creates a container from it, and starts it. The command has dozens of flags — understanding the most important ones is essential before you run anything in production.',
        'The two most fundamental mode flags are <code>-d</code> (detached) and the absence of it (foreground). Foreground mode is useful for debugging — you see all output directly in your terminal, and the container stops when you press Ctrl+C. Detached mode (<code>-d</code>) starts the container in the background and returns you to the shell immediately, printing the container ID.',
        'The <code>--name</code> flag assigns a human-readable name to your container. Without it, Docker generates a random name like <code>quirky_einstein</code>. Named containers are easier to manage: <code>docker stop web</code> is clearer than <code>docker stop f3a2b...</code>. The <code>--rm</code> flag automatically removes the container when it exits — ideal for one-off tasks or testing where you do not want stale containers piling up.',
        'Resource limits are critical in production. <code>--memory</code> caps RAM usage and prevents one container from starving others on the same host. <code>--cpus</code> limits CPU allocation to a fraction of a core (e.g. <code>--cpus 0.5</code> gives half a CPU). Without resource limits, a runaway container can consume all available resources on the host.',
      ],
      callouts: [
        {
          kind: 'info',
          title: 'Always set resource limits in production: ',
          subtitle: 'A container without --memory or --cpus limits can consume all available host resources and bring down every other container on the machine.',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# Basic run: foreground, see output, Ctrl+C to stop
docker run nginx

# Detached mode — runs in background, prints container ID
docker run -d nginx

# Named container — easier to manage
docker run -d --name my-web nginx

# Auto-remove when stopped — great for testing
docker run --rm nginx nginx -v

# Run with resource limits
docker run -d \\
  --name my-app \\
  --memory 512m \\
  --cpus 0.5 \\
  my-image:latest

# Run interactively with a shell (great for debugging base images)
docker run -it --rm ubuntu bash

# Override the default command
docker run --rm node:22-alpine node --version

# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View logs from a running container
docker logs my-web
docker logs -f my-web        # follow (stream) logs`,
          caption: 'Core docker run options — the commands you will use every day.',
        },
      ],
      keyPoints: [
        '<code>-d</code> = detached (background). Without it = foreground (see output, Ctrl+C to stop).',
        '<code>--name</code> = human-readable container name. Always use it for long-running containers.',
        '<code>--rm</code> = auto-delete on exit. Use for one-off jobs and debugging.',
        '<code>--memory</code> and <code>--cpus</code> = resource limits. <strong>Always set in production.</strong>',
        '<code>-it</code> = interactive terminal. Use to explore images or debug running containers.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 2 — Environment Variables
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'environment-variables',
      title: 'Environment Variables',
      tag: { label: 'Configuration', type: 'teal' },
      body: [
        'Environment variables are the primary mechanism for injecting runtime configuration into containers. Rather than baking configuration values (database hostnames, API keys, feature flags) into the image, you pass them at runtime. This follows the <strong>12-Factor App</strong> principle: store config in the environment, not in the code.',
        'The <code>-e</code> or <code>--env</code> flag passes a single environment variable. For more than a handful of variables, use <code>--env-file</code> to point to a file containing <code>KEY=VALUE</code> pairs — this is far cleaner than a long list of <code>-e</code> flags.',
        'Inside the container, environment variables are accessed exactly like any other process environment — <code>process.env.MY_VAR</code> in Node.js, <code>os.environ[\'MY_VAR\']</code> in Python, <code>System.getenv("MY_VAR")</code> in Java. The Open Liberty server in this repository uses MicroProfile Config, which automatically reads environment variables with the highest precedence.',
        'Be careful with secrets in environment variables. While env vars are more secure than hardcoding in code or image, they are visible to anyone who can run <code>docker inspect</code> on the container. For truly sensitive values (database passwords, API tokens), consider Docker secrets, HashiCorp Vault, or your cloud provider\'s secrets manager — and never put them in your <code>Dockerfile</code> with <code>ENV</code>.',
      ],
      callouts: [
        {
          kind: 'warning',
          title: 'Never use ENV for secrets in Dockerfile: ',
          subtitle: 'ENV in a Dockerfile bakes the value into an image layer visible to anyone with docker history. Pass secrets only at runtime via --env-file or a secrets manager.',
        },
        {
          kind: 'info',
          title: 'Podman equivalent: ',
          subtitle: 'podman run -e and podman run --env-file work identically to the Docker equivalents.',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# Pass a single environment variable at runtime
docker run -d -e NODE_ENV=production my-app:latest

# Pass multiple variables inline
docker run -d \\
  -e NODE_ENV=production \\
  -e DB_HOST=db.internal \\
  -e DB_PORT=5432 \\
  my-app:latest

# Pass all variables from a .env file (best practice for many vars)
docker run -d --env-file .env my-app:latest

# Inspect environment variables inside a running container
docker exec my-app env | sort

# Or via docker inspect
docker inspect my-app | grep -A 10 '"Env"'

# Read an env var from inside the container
docker exec my-app sh -c 'echo $NODE_ENV'`,
          caption: 'Injecting runtime configuration with environment variables.',
        },
      ],
      keyPoints: [
        'Never hardcode config — pass it via environment variables at runtime.',
        '<code>-e KEY=VALUE</code> for single vars, <code>--env-file .env</code> for many vars.',
        'Inside the container, env vars are available to any process just like a normal shell.',
        '<code>ENV</code> in Dockerfile is baked into the image — never use it for secrets.',
        '<code>docker inspect mycontainer</code> shows all env vars — limit who can run this command.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 3 — The .dockerignore File
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'dockerignore',
      title: 'The .dockerignore File',
      tag: { label: 'Best Practice', type: 'green' },
      body: [
        'When you run <code>docker build</code>, Docker first collects everything in the current directory into a <strong>build context</strong> and sends it to the Docker daemon. This happens before any Dockerfile instruction is processed. Without a <code>.dockerignore</code> file, Docker sends your entire project directory — including <code>node_modules</code>, compiled artefacts, <code>.git</code> history, log files, and worst of all, your <code>.env</code> file with real credentials.',
        'The <code>.dockerignore</code> file uses the same syntax as <code>.gitignore</code> and tells Docker which files to exclude from the build context. This has two benefits: it keeps secrets out of the image, and it significantly speeds up builds by reducing the amount of data transferred to the daemon. On a project with a large <code>node_modules</code> directory, a <code>.dockerignore</code> can reduce build context from gigabytes to kilobytes.',
        'Even if your <code>Dockerfile</code> never explicitly <code>COPY</code>s a sensitive file, it can still end up in the image if you use <code>COPY . .</code> without a <code>.dockerignore</code>. And even if you delete the file in a later <code>RUN</code> step, it is still readable in the intermediate layer. The <code>.dockerignore</code> prevents the file from ever entering the build context in the first place.',
        'This repository ships a <code>.dockerignore</code> (and an identical <code>.containerignore</code> for Podman compatibility) that excludes: all <code>.env</code> files except <code>.env.example</code>, the <code>target/</code> Maven output directory, <code>node_modules/</code>, <code>.git/</code>, log files, markdown files, and editor noise like <code>.DS_Store</code> and <code>.vscode/</code>.',
      ],
      callouts: [
        {
          kind: 'warning',
          title: 'Forgetting .dockerignore is how secrets leak into images: ',
          subtitle: 'If you COPY . . without a .dockerignore, your .env file and git history go into the image. Anyone who can docker pull your image can read your database password.',
        },
        {
          kind: 'info',
          title: 'Podman note: ',
          subtitle: 'Podman reads .containerignore first, then falls back to .dockerignore. This repo ships both files with identical content.',
        },
      ],
      codeBlocks: [
        {
          language: 'text',
          code: `# .dockerignore — exclude from Docker build context

# ── Secrets (NEVER in image) ──────────────────────────────────────────────
.env
.env.*
!.env.example          # exception: the example file is safe to include

# ── Build artefacts (already compiled, no need to re-copy) ───────────────
target/
node_modules/
dist/
build/
*.class
*.jar

# ── Version control ───────────────────────────────────────────────────────
.git/
.gitignore

# ── Documentation (not needed in runtime image) ──────────────────────────
*.md
!README.md             # exception: keep the README if desired

# ── OS / editor noise ─────────────────────────────────────────────────────
.DS_Store
Thumbs.db
.idea/
.vscode/
*.swp

# ── Test files ────────────────────────────────────────────────────────────
*.test.js
__tests__/
coverage/
.github/`,
          caption: 'A comprehensive .dockerignore for a Node.js + Java project (from this repo).',
        },
        {
          language: 'bash',
          code: `# See what Docker WOULD send as build context (dry run)
docker build --no-cache --dry-run . 2>&1 | head -20

# Or measure the context size by watching the output line:
# "Sending build context to Docker daemon  X.XXkB"
docker build -t myapp . 2>&1 | head -3`,
          caption: 'Check how large your build context is — it should be kilobytes, not megabytes.',
        },
      ],
      keyPoints: [
        '<code>.dockerignore</code> prevents files from entering the build context entirely.',
        '<strong>Always exclude</strong>: <code>.env</code>, <code>node_modules/</code>, <code>.git/</code>, compiled artefacts.',
        'Even if you never <code>COPY</code> the file, without <code>.dockerignore</code> it enters the context.',
        'Reduces build time by sending less data to the Docker daemon.',
        'Podman uses <code>.containerignore</code> — create both for compatibility.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 4 — Volume Mounts
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'volume-mounts',
      title: 'Volume Mounts: Persisting Data',
      tag: { label: 'Storage', type: 'purple' },
      image: {
        src: mountsImg,
        alt: 'Diagram comparing Docker storage types: Volumes (managed by Docker on host filesystem), Bind Mounts (any file or directory on host), and tmpfs mounts (in host system memory only).',
        caption: 'Types of mounts in Docker — Volumes stored in a Docker-managed part of the host filesystem (/var/lib/docker/volumes/), Bind mounts anywhere on host, and tmpfs stored in host memory only.',
        maxWidth: '680px',
      },
      body: [
        'Container filesystems are ephemeral — when a container is removed, everything written to its filesystem disappears. For most stateless applications this is fine and desirable. But databases, file uploads, log archives, and configuration files that must survive container restarts need to live somewhere that outlasts the container. That is what volumes are for.',
        'Docker provides three types of storage mounts. <strong>Named volumes</strong> are managed by Docker — Docker creates and manages a directory on the host and mounts it into the container. They are the recommended approach for application data because Docker handles lifecycle, permissions, and backups. <strong>Bind mounts</strong> mount a specific host directory or file directly into the container — useful for development (mount your source code so changes are reflected immediately) but trickier in production because they depend on the exact host path. <strong>tmpfs mounts</strong> exist only in memory and are never written to disk — useful for sensitive temporary data like session tokens.',
        '<h3>A Volume\'s Lifecycle</h3>',
        'A volume\'s contents exist outside the lifecycle of a given container. When a container is destroyed, the writable layer is destroyed with it. Using a volume ensures that the data is persisted even if the container using it is removed.',
        'A given volume can be mounted into multiple containers simultaneously. When no running container is using a volume, the volume is still available to Docker and isn\'t removed automatically. You can remove unused volumes using <code>docker volume prune</code>.',
        '<h3>Mounting a Volume Over Existing Data</h3>',
        'If you mount a <strong>non-empty volume</strong> into a directory in the container in which files or directories exist, the pre-existing files are obscured by the mount. This is similar to if you were to save files into <code>/mnt</code> on a Linux host, and then mounted a USB drive into <code>/mnt</code>. The contents of <code>/mnt</code> would be obscured by the contents of the USB drive until the USB drive was unmounted.',
        'With containers, there\'s no straightforward way of removing a mount to reveal the obscured files again. Your best option is to recreate the container without the mount.',
        'If you mount an <strong>empty volume</strong> into a directory in the container in which files or directories exist, these files or directories are propagated (copied) into the volume by default. Similarly, if you start a container and specify a volume which does not already exist, an empty volume is created for you. This is a good way to pre-populate data that another container needs.',
        'To prevent Docker from copying a container\'s pre-existing files into an empty volume, use the <code>volume-nocopy</code> option with <code>--mount</code>.',
        '<h3>Volume Drivers & Remote Storage</h3>',
        'When storing data on remote hosts or cloud storage (such as NFS, AWS EBS, Azure File, or Ceph), you can use <a href="https://docs.docker.com/engine/storage/volumes/#use-a-volume-driver" target="_blank" rel="noopener noreferrer">Volume Drivers</a>. Volume drivers allow you to abstract the underlying storage system so applications can write to shared or clustered storage transparently across multiple hosts without changing application logic.',
        'The <code>-v</code> shorthand is the classic syntax. The newer <code>--mount</code> flag is more verbose but explicit and less error-prone — it requires you to specify the type, source, and target separately, which prevents common mistakes like accidentally creating a named volume when you meant a bind mount.',
        'Permissions are a common gotcha. If your container runs as a non-root user (as it should), the mounted directory on the host needs to be writable by that user\'s UID. The Open Liberty container in this repository runs as UID 1001 — if you mount a host directory, ensure it is owned by UID 1001 or has world-writable permissions.',
      ],
      callouts: [
        {
          kind: 'info',
          title: 'Volume Lifecycle: ',
          subtitle: 'A volume\'s contents exist outside container lifecycles and can be mounted into multiple containers at once. Docker never deletes unused volumes automatically — clean them up with "docker volume prune".',
        },
        {
          kind: 'warning',
          title: 'Mounting over existing data: ',
          subtitle: 'Mounting a non-empty volume obscures existing files in the container destination directory. Mounting an empty volume copies existing container files into the volume by default (unless volume-nocopy is set).',
        },
        {
          kind: 'warning',
          title: 'Permission gotcha: ',
          subtitle: 'If the container runs as a non-root UID and the mounted directory is owned by root, the container process cannot write to it. Match UID ownership or use chmod 777 (not recommended for sensitive data).',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# ── Named volume (Docker-managed, recommended for persistent data) ───────
# Create a named volume
docker volume create my-data

# Mount it into a container
docker run -d \\
  --name my-db \\
  -v my-data:/var/lib/postgresql/data \\
  postgres:16-alpine

# ── Bind mount (host path → container path) ──────────────────────────────
# Mount current directory for live development
docker run -d \\
  --name my-app \\
  -v $(pwd)/src:/app/src \\        # host path : container path
  my-app:dev

# Bind mount with explicit --mount syntax (preferred for clarity)
docker run -d \\
  --name my-app \\
  --mount type=bind,source=$(pwd)/src,target=/app/src \\
  my-app:dev

# ── tmpfs mount (memory only, never written to disk) ──────────────────────
docker run -d \\
  --name secure-app \\
  --mount type=tmpfs,destination=/run/secrets \\
  my-app:latest

# ── Volume management ─────────────────────────────────────────────────────
docker volume ls                   # list all volumes
docker volume inspect my-data      # inspect a volume
docker volume rm my-data           # delete a named volume
docker volume prune                # remove all unused volumes`,
          caption: 'Three types of Docker volume mounts and their use cases.',
        },
        {
          title: 'Advanced Volume Options: volume-nocopy & Multi-Container Sharing',
          description: 'Control how pre-existing container data interacts with volumes using the explicit <code>--mount</code> flag.',
          language: 'bash',
          code: `# ── 1. Prevent copying pre-existing container files into empty volume ───
docker run -d \\
  --name my-app \\
  --mount type=volume,source=my-vol,target=/app/data,volume-nocopy \\
  my-image:latest

# ── 2. Mount one volume across multiple containers simultaneously ────────
# Container A (writer)
docker run -d --name service-a -v shared-data:/var/shared producer-image

# Container B (read-only consumer)
docker run -d --name service-b -v shared-data:/var/shared:ro consumer-image`,
          caption: 'Using volume-nocopy and sharing volumes between containers.',
        },
      ],
      keyPoints: [
        '<strong>A Volume\'s Lifecycle</strong>: Contents exist outside the container lifecycle and persist after the container is destroyed.',
        'Volumes can be mounted into <strong>multiple containers simultaneously</strong>.',
        'Unused volumes are <strong>not removed automatically</strong> — use <code>docker volume prune</code>.',
        '<strong>Mounting over existing data</strong>: Non-empty volume obscures container files; empty volume copies container files into the volume by default.',
        'Use <code>volume-nocopy</code> with <code>--mount</code> to prevent copying container files into an empty volume.',
        'Non-root containers need matching UID ownership on the host directory.',
        '<a href="https://docs.docker.com/engine/storage/volumes/#use-a-volume-driver" target="_blank" rel="noopener noreferrer" style="color:var(--cds-link-primary)">Docker Documentation: Use a Volume Driver & Advanced Mounts ↗</a>',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 5 — Using a .env File (Best Practice)
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'env-file-best-practice',
      title: 'Using a .env File: The Right Way',
      tag: { label: 'Best Practice', type: 'green' },
      body: [
        'For applications with more than a few configuration values, managing them as individual <code>-e</code> flags quickly becomes unwieldy and error-prone. The <code>--env-file</code> pattern solves this: you create a <code>.env</code> file containing all your runtime configuration as <code>KEY=VALUE</code> pairs, and pass the file to <code>docker run</code> in one clean flag.',
        'The pattern works best as a three-file convention: <code>.env.example</code> is a template with all keys listed and placeholder or safe default values — this file IS committed to git. <code>.env</code> is the real file with actual secrets and environment-specific values — this file is NEVER committed to git. <code>.dockerignore</code> explicitly excludes <code>.env</code> (but not <code>.env.example</code>) from ever entering the build context.',
        'This repository follows exactly this pattern. The <code>.env.example</code> file documents every required configuration value — Liberty HTTP and HTTPS ports, app environment, JWT secret, database host, port, name, user, and password. When a developer (or deployment pipeline) sets up the application, they copy <code>.env.example</code> to <code>.env</code>, fill in real values, and run <code>run.sh</code> which passes <code>--env-file .env</code> to the container.',
        'The double-defence pattern is critical: <code>.env</code> must appear in both <code>.gitignore</code> (to prevent committing it to source control) AND in <code>.dockerignore</code> (to prevent it from entering the Docker build context). Forgetting either one is a common source of credential leaks.',
      ],
      callouts: [
        {
          kind: 'warning',
          title: 'Double defence: ',
          subtitle: '.env must be in BOTH .gitignore AND .dockerignore. Forgetting .dockerignore means the secret enters the image even if it never hits git.',
        },
        {
          kind: 'info',
          title: 'The .env.example pattern: ',
          subtitle: '.env.example is a safe, committed template. Every developer copies it to .env and fills in real values. This is self-documenting infrastructure — anyone can see what config is needed by reading the example file.',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# From this repository's .env.example:
# LIBERTY_HTTP_PORT=9080
# LIBERTY_HTTPS_PORT=9443
# APP_ENV=development
# API_BASE_URL=http://localhost:9080
# JWT_SECRET=replace-with-a-secure-random-string-min-32-chars
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=launch_next_chapter
# DB_USER=appuser
# DB_PASSWORD=changeme

# Set up your environment (do once per developer machine / deployment):
cp .env.example .env
# Edit .env with your real values:
nano .env

# Run the container with all config injected from .env
docker run -d \\
  --name my-app \\
  --env-file .env \\
  -p 9080:9080 \\
  my-app:latest

# The run.sh script in this repo does exactly this:
./run.sh`,
          caption: 'The .env pattern from this repository — setup and usage.',
        },
        {
          language: 'bash',
          code: `# .gitignore — prevent .env from being committed
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore
echo "!.env.example" >> .gitignore   # exception: keep the example

# .dockerignore — prevent .env from entering the build context
echo ".env" >> .dockerignore
echo ".env.*" >> .dockerignore
echo "!.env.example" >> .dockerignore`,
          caption: 'The double-defence setup — exclude .env from both git and Docker.',
        },
      ],
      keyPoints: [
        '<code>.env.example</code> = committed template with placeholder values.',
        '<code>.env</code> = real secrets — <strong>never commit, never copy into image</strong>.',
        '<code>--env-file .env</code> injects all variables in one clean flag.',
        '<code>.env</code> must be in <strong>both</strong> <code>.gitignore</code> AND <code>.dockerignore</code>.',
        'Self-documenting: anyone can read <code>.env.example</code> to know what config is needed.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 6 — Port Mapping
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'port-mapping',
      title: 'Port Mapping',
      tag: { label: 'Networking', type: 'blue' },
      image: {
        src: portMappingImg,
        alt: 'Diagram showing host port 8080 forwarding to container port 80 via the -p 8080:80 Docker flag, with the container isolated inside a private Docker network.',
        caption: 'The -p HOST_PORT:CONTAINER_PORT flag bridges traffic from your machine into the container\'s private network — without it, the port is completely unreachable.',
        maxWidth: '660px',
      },
      body: [
        'By default, a container is connected to a private Docker network and its ports are not accessible from the outside world — not even from your local machine running Docker. To make a container\'s port reachable, you must explicitly <strong>publish</strong> it using the <code>-p</code> (or <code>--publish</code>) flag.',
        'The syntax is <code>-p HOST_PORT:CONTAINER_PORT</code>. For example, <code>-p 8080:80</code> means: forward traffic arriving on port 8080 of your host machine to port 80 inside the container. The host port and container port do not need to match — and often should not, to avoid conflicts. The <code>EXPOSE</code> instruction in the Dockerfile is documentation only and does NOT automatically publish the port.',
        'By default, Docker binds to all network interfaces on the host (<code>0.0.0.0</code>), which means the port is accessible from any network interface — including external ones. In development you should bind to <code>127.0.0.1</code> only to prevent accidental external exposure: <code>-p 127.0.0.1:8080:80</code>.',
        'For containers that need to communicate with each other, the cleanest approach is to put them on a shared Docker network using <code>--network</code>. On a shared network, containers can reach each other by name (the container name acts as a DNS hostname), without exposing any ports to the host machine at all. This is the foundation of Docker Compose networking.',
      ],
      callouts: [
        {
          kind: 'info',
          title: 'EXPOSE does not publish: ',
          subtitle: 'EXPOSE in a Dockerfile is documentation. Ports are only accessible after you use -p at runtime. Docker Desktop shows a warning if EXPOSE is present but -p is not used.',
        },
        {
          kind: 'warning',
          title: 'Binding to 0.0.0.0: ',
          subtitle: 'The default -p 8080:80 binds to all interfaces, including external ones. In development, use -p 127.0.0.1:8080:80 to restrict to localhost only.',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# Map host port 8080 to container port 80
docker run -d -p 8080:80 nginx
# Access at: http://localhost:8080

# Map multiple ports (HTTP and HTTPS)
docker run -d \\
  -p 9080:9080 \\
  -p 9443:9443 \\
  --env-file .env \\
  --name my-liberty-app \\
  my-app:latest

# Bind to localhost only (development — not externally accessible)
docker run -d -p 127.0.0.1:8080:80 nginx

# Let Docker choose a random available host port
docker run -d -p 80 nginx
docker port my-container 80    # find out which host port was assigned

# Connect two containers via a shared network (no host port exposure needed)
docker network create my-net
docker run -d --name db --network my-net postgres:16-alpine
docker run -d --name app --network my-net -e DB_HOST=db my-app:latest
# 'app' can reach 'db' via hostname 'db' on port 5432

# List all port mappings for a running container
docker port my-container`,
          caption: 'Port mapping — controlling what is reachable from outside the container.',
        },
      ],
      keyPoints: [
        '<code>-p HOST:CONTAINER</code> publishes a container port to the host.',
        '<code>EXPOSE</code> in Dockerfile is documentation only — it does not publish anything.',
        'Default binding is <code>0.0.0.0</code> (all interfaces) — use <code>127.0.0.1:HOST:CONTAINER</code> for localhost-only in dev.',
        'Use Docker networks for container-to-container communication — no host ports needed.',
        'Host port and container port do not need to match.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 7 — Restart Policies
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'restart-policies',
      title: 'Restart Policies',
      tag: { label: 'Operations', type: 'teal' },
      body: [
        'By default, when a container exits — whether cleanly or because of a crash — Docker does nothing. It stays stopped until you manually restart it. For short-lived tasks this is fine. For long-running services (web servers, databases, background workers) you almost certainly want automatic restart behaviour.',
        'Docker provides four restart policies, set with the <code>--restart</code> flag. <code>no</code> (the default) never restarts. <code>on-failure</code> restarts only if the container exits with a non-zero exit code — useful for batch jobs that should retry on failure but not on clean exit. <code>always</code> restarts regardless of exit code, including after a Docker daemon restart — the container will start automatically when the system boots. <code>unless-stopped</code> behaves like <code>always</code> except it does NOT restart if you manually stopped the container — this is the most practical option for production services.',
        'The difference between <code>always</code> and <code>unless-stopped</code> matters when you deliberately stop a container for maintenance. With <code>always</code>, your maintenance stop is overridden if the Docker daemon restarts (e.g. after a host reboot). With <code>unless-stopped</code>, the container remembers that you stopped it and stays stopped through daemon restarts.',
        'Restart policies work together with health checks. If a container\'s health check starts failing, Docker marks it as unhealthy but does NOT automatically restart it based on health alone (that is Swarm and Kubernetes territory). Restart policies only trigger on process exit.',
      ],
      callouts: [
        {
          kind: 'info',
          title: 'Use unless-stopped for production services: ',
          subtitle: '"unless-stopped" starts automatically on host reboot, but respects manual stops for maintenance. It is the most practical policy for long-running containers outside of an orchestrator.',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# No restart (default) — stays stopped after exit
docker run -d --restart no nginx

# Restart only on failure (non-zero exit code)
docker run -d --restart on-failure my-job:latest

# Restart on failure with a max retry limit
docker run -d --restart on-failure:5 my-job:latest

# Always restart — including after Docker daemon restart / host reboot
docker run -d --restart always nginx

# Unless-stopped — restart automatically, but respect manual stops (recommended)
docker run -d \\
  --name my-web \\
  --restart unless-stopped \\
  -p 80:80 \\
  nginx

# Update restart policy on a running container (no stop needed)
docker update --restart unless-stopped my-web

# Check current restart policy
docker inspect my-web | grep -A 3 '"RestartPolicy"'`,
          caption: 'Docker restart policies — controlling recovery from container exits.',
        },
      ],
      keyPoints: [
        '<code>no</code>: never restart (default).',
        '<code>on-failure</code>: restart only on non-zero exit — good for batch jobs.',
        '<code>always</code>: always restart, including after daemon/host restart.',
        '<code>unless-stopped</code>: like <code>always</code> but respects manual <code>docker stop</code> — <strong>recommended for production</strong>.',
        'You can update restart policy live with <code>docker update --restart</code>.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 8 — Privileged Mode & Security
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'privileged-mode',
      title: 'Privileged Mode & Container Security',
      tag: { label: 'Security', type: 'red' },
      body: [
        'When you run a container with <code>--privileged</code>, Docker grants the container <em>all</em> Linux capabilities and disables the seccomp and AppArmor security profiles. The container can mount filesystems, change kernel parameters, load kernel modules, and access all host devices. Effectively, a privileged container has nearly the same access to the host as root running directly on the machine.',
        'Privileged mode is occasionally legitimate: running Docker-in-Docker (DinD) for CI pipelines, managing hardware devices from inside a container, or certain system-level tooling. It is almost never appropriate for application containers. Many security audits and compliance frameworks (SOC 2, PCI-DSS) explicitly prohibit privileged containers.',
        'The better approach is <strong>capability addition</strong> with <code>--cap-add</code>. Linux capabilities break root\'s powers into fine-grained units. If your container only needs to bind to a port below 1024, you need <code>NET_BIND_SERVICE</code>, not full root. If it needs to change system time, you need <code>SYS_TIME</code>. Grant only the specific capability required — nothing more.',
        'The most important security setting is also the simplest: <strong>run as a non-root user</strong>. The Dockerfile for this repository switches to UID 1001 before starting the application server. If a vulnerability allows an attacker to escape the container, they escape as UID 1001 — a non-privileged user with no special host permissions. If the container ran as root, the attacker would escape as root on the host.',
        '<strong>Real-world example:</strong> For a working project demonstrating containerized device access, camera control, and privileged requirements on embedded hardware (Raspberry Pi), see the <a href="https://github.com/kriersd/EyesInTheSkyWithPi" target="_blank" rel="noopener noreferrer" style="color:var(--cds-link-primary);font-weight:600;">EyesInTheSkyWithPi GitHub Repository ↗</a>.',
      ],
      callouts: [
        {
          kind: 'warning',
          title: '--privileged is a significant security risk: ',
          subtitle: 'A privileged container can escape to the host, load kernel modules, mount host filesystems, and read any file on the system. Treat it like running as root without a container at all.',
        },
        {
          kind: 'info',
          title: 'Principle of least privilege: ',
          subtitle: 'Use --cap-add to grant only the specific capability needed, and USER in Dockerfile to run as non-root. Never use --privileged for application containers.',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# AVOID — full privileged mode (only for very specific tooling)
docker run --privileged my-tool:latest

# BETTER — add only the specific capability needed
# Allow binding to ports < 1024 without root
docker run --cap-add NET_BIND_SERVICE my-web:latest

# Allow changing system time
docker run --cap-add SYS_TIME my-time-sync:latest

# Start with no capabilities, add back only what is needed
docker run \\
  --cap-drop ALL \\
  --cap-add NET_BIND_SERVICE \\
  --cap-add CHOWN \\
  my-web:latest

# Run as a specific non-root user (UID 1001)
docker run --user 1001 my-app:latest

# Docker Scout can check for privilege escalation risks
docker scout cves --only-severity critical my-app:latest`,
          caption: 'Least-privilege container security — never use --privileged for application containers.',
        },
        {
          language: 'dockerfile',
          code: `FROM node:22-alpine

WORKDIR /app
COPY --chown=node:node . .
RUN npm ci --omit=dev

# Drop all capabilities (they are inherited from the parent process)
# NOTE: This is handled at runtime with --cap-drop ALL
# In the Dockerfile, the critical step is switching to a non-root user:

USER node       # UID 65534 on Alpine's 'node' user
# OR use a numeric UID for unambiguous non-root identity:
USER 1001

CMD ["node", "server.js"]`,
          caption: 'Running as non-root in a Dockerfile — the USER instruction.',
        },
      ],
      keyPoints: [
        '<code>--privileged</code> = nearly full root access to the host. <strong>Avoid for application containers.</strong>',
        'Use <code>--cap-add</code> to grant only the specific Linux capability needed.',
        'Use <code>--cap-drop ALL</code> + <code>--cap-add</code> for the most restrictive approach.',
        '<code>USER 1001</code> in Dockerfile — always run as non-root. This is the single most impactful security step.',
        'The container in this repo runs as UID 1001 — escape only yields a non-privileged host user.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 9 — Image Tagging & Sharing
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'image-tagging',
      title: 'Image Tagging & Sharing',
      tag: { label: 'Registry', type: 'purple' },
      body: [
        'A Docker image name has the form <code>registry/repository:tag</code>. The registry defaults to <code>docker.io</code> (Docker Hub) when omitted. The tag defaults to <code>latest</code> when omitted. So <code>docker pull nginx</code> is actually <code>docker pull docker.io/library/nginx:latest</code>.',
        'Tags are mutable pointers — you can move a tag to point to a different image at any time. The <code>:latest</code> tag is particularly dangerous because it moves constantly as new versions are released. Today\'s <code>nginx:latest</code> is a different image from next week\'s <code>nginx:latest</code>, but both have the same name. For repeatable builds and deployments, always pin to a specific version tag.',
        'The conventional versioning scheme for container images follows semantic versioning: <code>myapp:1.2.3</code> for a specific release, <code>myapp:1.2</code> as a floating minor version pointer, <code>myapp:1</code> as a floating major version pointer. In CI/CD pipelines it is common to additionally tag with the git commit SHA (<code>myapp:abc1234</code>) for precise traceability — you can always tell exactly what code is running from the image tag.',
        'Sharing an image involves three steps: <code>docker tag</code> (assign the registry/repository name), <code>docker login</code> (authenticate to the registry), and <code>docker push</code> (upload). The image must be tagged with the full registry path before pushing — <code>docker push myapp</code> would try to push to Docker Hub as your personal repository.',
      ],
      callouts: [
        {
          kind: 'warning',
          title: 'The :latest anti-pattern: ',
          subtitle: 'Never use :latest in production. Pin to an exact version. :latest gives you no visibility into what you are actually running and makes rollbacks ambiguous.',
        },
        {
          kind: 'info',
          title: 'Immutable tags via digest: ',
          subtitle: 'For maximum reproducibility, reference images by digest: nginx@sha256:abc123... A digest is cryptographically bound to specific image content and never changes.',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# ── Tagging ───────────────────────────────────────────────────────────────

# Build and tag in one step
docker build -t myregistry.io/myorg/myapp:1.2.3 .

# Tag an existing image with a new name/registry
docker tag myapp:local myregistry.io/myorg/myapp:1.2.3

# Apply multiple tags to the same image (they share the same image ID)
docker tag myapp:1.2.3 myapp:1.2
docker tag myapp:1.2.3 myapp:latest          # only for latest stable
docker tag myapp:1.2.3 myapp:$(git rev-parse --short HEAD)  # git SHA tag

# ── Pushing to a registry ──────────────────────────────────────────────────

# Log in to Docker Hub
docker login

# Log in to a private registry
docker login myregistry.io

# Push a specific tag
docker push myregistry.io/myorg/myapp:1.2.3

# Push all tags for a repository
docker push myregistry.io/myorg/myapp --all-tags

# ── Pulling by digest (immutable reference) ────────────────────────────────
docker pull nginx@sha256:a484819eb60eeec58048ec3b352a2b1f364f07e7b09bc4d424d34f4b678c3f24

# ── Inspecting ────────────────────────────────────────────────────────────
# See all local image tags
docker images myapp

# See the image digest (SHA256 of the content)
docker inspect myapp:1.2.3 | grep '"Id"'`,
          caption: 'Tagging strategy and pushing images to registries.',
        },
      ],
      keyPoints: [
        'Full image name: <code>registry/repository:tag</code>. Defaults: <code>docker.io</code> / <code>latest</code>.',
        'Tags are <strong>mutable</strong> — <code>:latest</code> changes constantly. Pin exact versions in production.',
        'Tag with git SHA (<code>myapp:abc1234</code>) for full traceability in CI/CD.',
        'Workflow: <code>docker tag</code> → <code>docker login</code> → <code>docker push</code>.',
        'For maximum reproducibility, reference images by <strong>digest</strong> (<code>image@sha256:...</code>).',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 10 — Inspecting & Debugging Containers
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'inspect-and-debug',
      title: 'Inspecting & Debugging Running Containers',
      tag: { label: 'Operations', type: 'teal' },
      body: [
        'Once a container is running, Docker gives you a rich set of commands to look inside it, understand its configuration, and diagnose problems — all without stopping or modifying the container. These are the tools you will reach for every time something behaves unexpectedly.',
        '<code>docker inspect</code> is the single most informative command in Docker\'s toolkit. It returns a complete JSON document describing every aspect of a container\'s configuration and runtime state: its image, environment variables, port mappings, volume mounts, network settings, restart policy, health check status, resource limits, and more. When a container is not behaving as expected, <code>docker inspect</code> is almost always the first command to run — it lets you verify that every flag and setting was actually applied the way you intended.',
        '<code>docker logs</code> gives you access to everything the container has written to stdout and stderr since it started. Because containers are designed to log to stdout (not to files), this is the primary way to read application output. The <code>-f</code> flag streams logs in real time — like <code>tail -f</code> — which is invaluable when watching a service start up or tracking down an intermittent error.',
        'For deeper investigation, <code>docker exec</code> runs a command inside a running container without restarting it. The most common use is opening an interactive shell (<code>docker exec -it mycontainer sh</code>) to explore the filesystem, check running processes, test network connectivity from inside the container\'s network namespace, or manually invoke a binary. Use this for diagnosis only — remember from Part 1 that you should never make persistent changes to a running container this way.',
      ],
      secondaryImage: {
        src: execIntoContainerImg,
        alt: 'Diagram illustrating docker exec opening an interactive shell session inside a running container.',
        caption: 'docker exec -it mycontainer sh — drop directly into a running container\'s shell for live diagnosis without stopping or restarting it.',
        maxWidth: '640px',
      },
      callouts: [
        {
          kind: 'info',
          title: 'Inspect first: ',
          subtitle: 'Before digging into logs or exec-ing into a container, run "docker inspect" first. Misconfigured env vars, wrong port mappings, and missing volume mounts are all instantly visible there.',
        },
        {
          kind: 'warning',
          title: 'exec is for diagnosis, not modification: ',
          subtitle: 'Using "docker exec" to fix things in a running container violates immutability. Use it to understand what is wrong, then fix it in the Dockerfile and redeploy.',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# ── docker inspect ────────────────────────────────────────────────────────

# Full JSON dump of everything about a container
docker inspect my-app

# Filter to specific fields with --format (Go template syntax)
docker inspect --format '{{.State.Status}}' my-app          # running / exited / paused
docker inspect --format '{{.State.Health.Status}}' my-app   # healthy / unhealthy / starting
docker inspect --format '{{.RestartCount}}' my-app          # how many times it has restarted

# See all environment variables
docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' my-app

# See port mappings
docker inspect --format '{{json .NetworkSettings.Ports}}' my-app | python3 -m json.tool

# See volume mounts
docker inspect --format '{{json .Mounts}}' my-app | python3 -m json.tool

# See resource limits
docker inspect --format 'Memory: {{.HostConfig.Memory}} CPU: {{.HostConfig.NanoCpus}}' my-app

# Inspect an image (not a container) — shows layers, architecture, config
docker inspect nginx:1.27-alpine`,
          caption: 'docker inspect — the most complete view of a container\'s state and configuration.',
        },
        {
          language: 'bash',
          code: `# ── docker logs ───────────────────────────────────────────────────────────

# Print all logs since the container started
docker logs my-app

# Follow (stream) logs in real time — like tail -f
docker logs -f my-app

# Show only the last N lines
docker logs --tail 50 my-app

# Follow the last 50 lines (most common combo for live debugging)
docker logs -f --tail 50 my-app

# Add timestamps to each log line
docker logs -t my-app

# Show logs since a specific time
docker logs --since 2024-01-15T10:00:00 my-app

# Show logs from the last 10 minutes
docker logs --since 10m my-app

# Show only stderr
docker logs my-app 2>&1 1>/dev/null

# Podman equivalent — identical syntax
podman logs -f --tail 50 my-app`,
          caption: 'docker logs — reading and streaming container output.',
        },
        {
          language: 'bash',
          code: `# ── docker exec — running commands inside a container ────────────────────

# Open an interactive shell (use sh if bash is not available, e.g. Alpine images)
docker exec -it my-app sh
docker exec -it my-app bash

# Run a one-off command without opening a shell
docker exec my-app ps aux                    # see running processes
docker exec my-app env | sort                # see all environment variables
docker exec my-app ls -la /app               # explore filesystem
docker exec my-app cat /etc/hosts            # check container's /etc/hosts
docker exec my-app df -h                     # check disk usage inside container

# Test network connectivity from inside the container's network namespace
docker exec my-app wget -qO- http://db:5432  # can it reach the database?
docker exec my-app nslookup db               # DNS resolution from inside the container
docker exec my-app curl -s http://localhost:3000/health   # test internal endpoints

# ── docker stats — live resource usage ────────────────────────────────────
# Real-time CPU, memory, network I/O, and disk I/O per container
docker stats

# Single snapshot (no streaming)
docker stats --no-stream

# Stats for a specific container
docker stats --no-stream my-app

# ── docker top — processes inside a container ──────────────────────────────
docker top my-app`,
          caption: 'docker exec and docker stats — deep inspection of running containers.',
        },
        {
          language: 'bash',
          code: `# ── Common debugging workflow ─────────────────────────────────────────────

# 1. Container not starting? Check what happened:
docker ps -a                                 # is it in "Exited" state?
docker inspect my-app | grep -A 3 '"ExitCode"'   # what exit code did it return?
docker logs my-app                           # what did it print before dying?

# 2. Container starts but behaves wrong? Verify configuration:
docker inspect my-app | grep -A 20 '"Env"'  # are env vars correct?
docker inspect my-app | grep -A 10 '"Ports"' # are ports mapped as expected?
docker inspect my-app | grep -A 10 '"Mounts"' # are volumes mounted correctly?

# 3. Container healthy but app not responding? Check from inside:
docker exec -it my-app sh
  # then inside:
  wget -qO- http://localhost:3000/health     # does the app respond internally?
  env | grep DB_                             # do database env vars exist?
  cat /app/config.json                       # is the config file present?

# 4. Container keeps restarting? Check restart count and reason:
docker inspect --format 'Restarts: {{.RestartCount}}' my-app
docker logs --tail 20 my-app                 # last 20 lines before latest restart`,
          caption: 'A practical debugging workflow — the 4-step sequence for diagnosing container issues.',
        },
      ],
      keyPoints: [
        '<code>docker inspect</code> — full JSON config dump. Always run this first when something is wrong.',
        '<code>docker logs -f --tail 50</code> — stream live output. The primary way to read application logs.',
        '<code>docker exec -it mycontainer sh</code> — open a shell for diagnosis. Never make persistent changes here.',
        '<code>docker stats</code> — real-time CPU, memory, and network usage per container.',
        '<code>docker inspect --format</code> — Go template filtering for scripted health checks and automation.',
        'Most container problems are: wrong env vars, wrong port mapping, missing volume, or app crash on startup — <code>inspect</code> + <code>logs</code> will reveal all of these.',
      ],
    },
  ],
};
