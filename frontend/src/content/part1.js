/**
 * Part 1 — Introduction to Containers
 * 11 topics covering core concepts and technologies.
 */

import containerLayersImg from '../images/container-layers.png';
import copyOnWriteImg from '../images/container_copy_on_write_layers_blue.png';
import imageLayersImg from '../images/image-layers.png';
import containersVsVmsImg from '../images/what-are-containers-vs-vms.png';
import cattleVsPetsImg from '../images/cattle-vs-pets.png';

export const part1 = {
  id: 1,
  title: 'Introduction to Containers',
  description: 'Core concepts, technologies, and the fundamentals of containerisation.',
  topics: [
    // ─────────────────────────────────────────────────────────────────────────
    // Topic 1 — What is a Container?
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'what-is-a-container',
      title: 'What is a Container?',
      tag: { label: 'Concept', type: 'teal' },
      body: [
        'A <strong>container</strong> is a standard unit of software that packages code and all its dependencies — libraries, runtime, configuration — so the application runs quickly and reliably across different computing environments. Think of it like a shipping container: a standardised steel box that can be loaded onto any ship, train, or truck regardless of what is inside.',
        'Containers share the host machine\'s operating system kernel rather than each carrying a full OS. This makes them dramatically lighter than virtual machines — a container typically starts in milliseconds and consumes megabytes of memory instead of gigabytes.',
        'There are two closely related terms you will use constantly: an <strong>image</strong> is the static, read-only blueprint that describes everything needed to run your application. A <strong>container</strong> is the running instance of that image — like the difference between a class definition and an object in a programming language.',
        'Under the hood, a container is just a normal Linux process that is isolated from everything else using two kernel features: <strong>namespaces</strong> (which give the process its own view of the filesystem, network, and process table) and <strong>control groups (cgroups)</strong> (which limit how much CPU and memory it can consume). There is no virtualisation hardware involved — the container shares the real kernel.',
      ],
      callouts: [
        {
          kind: 'info',
          title: 'Container ≠ VM: ',
          subtitle: 'A container is a sandboxed process, not a separate operating system. This is the single most important conceptual distinction in this session.',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# Run a container from the official nginx image
docker run --name my-web -p 8080:80 nginx

# List all running containers
docker ps

# List all images on your machine
docker images

# Stop and remove the container
docker stop my-web && docker rm my-web`,
          caption: 'Your first container — download an image and run it in seconds.',
        },
      ],
      keyPoints: [
        'A container packages code + dependencies into a single portable unit.',
        'An <strong>image</strong> is the blueprint; a <strong>container</strong> is the running instance.',
        'Containers use Linux <strong>namespaces</strong> for isolation and <strong>cgroups</strong> for resource limits.',
        'No hypervisor is involved — containers share the host kernel directly.',
        'Start time: milliseconds. Size: megabytes. Density: hundreds per host.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 2 — Image vs Container
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'image-vs-container',
      title: 'Image vs Container',
      tag: { label: 'Concept', type: 'teal' },
      body: [
        'The fundamental difference is that a <strong>Docker image</strong> is a static, read-only blueprint, while a <strong>Docker container</strong> is a live, running instance of that blueprint.',
        'An easy way to understand the relationship is through programming analogies: an image is like a <strong>Class</strong>, and a container is an <strong>Object</strong> instantiated from that class. Alternatively, if an image is a recipe, the container is the cooked meal — you can make as many meals (containers) from the same recipe (image) as you like, and each one is independent.',
      ],
      comparisonTable: {
        headers: ['Feature', 'Docker Image', 'Docker Container'],
        rows: [
          ['State',         'Static, read-only, and immutable',                                             'Dynamic, active, and mutable'],
          ['Composition',   'Stacked read-only filesystem layers',                                          'The read-only layers plus a thin, temporary writable layer on top'],
          ['Resource Usage','Consumes only disk space when stored',                                         'Consumes RAM and CPU while running'],
          ['Lifespan',      'Persistent until explicitly deleted',                                          'Ephemeral; can be started, stopped, and destroyed freely'],
          ['CLI Commands',  '<code>docker build</code>, <code>docker pull</code>, <code>docker images</code>', '<code>docker run</code>, <code>docker ps</code>, <code>docker stop</code>, <code>docker rm</code>'],
        ],
      },
      callouts: [
        {
          kind: 'info',
          title: 'One image, many containers: ',
          subtitle: 'You can run dozens of containers from a single image simultaneously. Each gets its own isolated writable layer — the shared read-only image layers are never modified.',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# An image is the blueprint — pull it once, run it many times
docker pull nginx:1.27-alpine

# Each "docker run" creates a new, independent container from the same image
docker run -d --name web-1 -p 8081:80 nginx:1.27-alpine
docker run -d --name web-2 -p 8082:80 nginx:1.27-alpine
docker run -d --name web-3 -p 8083:80 nginx:1.27-alpine

# List running containers (instances)
docker ps

# List images (blueprints) — only one nginx image on disk despite 3 containers
docker images nginx

# Stop and remove a container — the image is unaffected
docker stop web-1 && docker rm web-1`,
          caption: 'Three independent containers running from one shared image — the blueprint is never modified.',
        },
      ],
      keyPoints: [
        'An <strong>image</strong> is static and read-only — the blueprint stored on disk.',
        'A <strong>container</strong> is a running process — a live instance of the image.',
        'Think of it as: image = Class, container = Object (or image = recipe, container = meal).',
        'Many containers can run from the same image simultaneously, each fully isolated.',
        'Deleting a container does not delete the image; deleting an image does not stop running containers.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 3 — Architecture & OS Matter
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'architecture-and-os',
      title: 'Architecture & OS: Why They Matter',
      tag: { label: 'Concept', type: 'teal' },
      body: [
        'Container images are compiled for a specific CPU architecture. The two you will encounter most are <strong>amd64</strong> (also called x86_64 — Intel/AMD processors, most cloud VMs and data-centre servers) and <strong>arm64</strong> (also called aarch64 — Apple Silicon Macs, AWS Graviton instances, Raspberry Pi). An image built for amd64 will not run natively on arm64, and vice versa.',
        'This matters enormously in practice. If you build on an Apple M-series laptop and push to a Linux server running on Intel, the image will fail at runtime with a cryptic "exec format error". The solution is to always build images targeting the deployment architecture using the <code>--platform</code> flag, or to create multi-architecture manifest lists that bundle both variants.',
        'The <strong>base image OS</strong> also matters. Your options range from a full OS like Ubuntu or Debian, to minimal variants like Alpine Linux (about 5 MB), to <a href="https://catalog.redhat.com/en/software/base-images#base-images-overview" target="_blank" rel="noopener noreferrer">Red Hat Universal Base Image (UBI)</a>, fully supported for enterprise deployments, to Distroless or Scratch images that contain literally nothing except your application binary. The choice affects image size, available tooling, and your security attack surface.',
        'A good rule of thumb: choose the smallest base that still ships the runtime your application needs. Alpine with <code>node:22-alpine</code> is a great choice for Node.js apps. UBI is the right choice when running on Red Hat OpenShift. Scratch is for statically compiled Go binaries that need no OS at all.',
      ],
      callouts: [
        {
          kind: 'warning',
          title: '"exec format error": ',
          subtitle: 'This runtime error almost always means you are trying to run an image compiled for the wrong CPU architecture. Always match --platform to your deployment target.',
        },
        {
          kind: 'info',
          title: 'Enterprise tip: ',
          subtitle: '<a href="https://catalog.redhat.com/en/software/base-images#base-images-overview" target="_blank" rel="noopener noreferrer">Red Hat Universal Base Image (UBI)</a> images are freely redistributable and receive CVE patches on the Red Hat errata cycle — a strong choice for enterprise and OpenShift deployments.',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# Build explicitly for amd64 (Intel/AMD — most cloud servers)
docker build --platform linux/amd64 -t myapp:latest .

# Build explicitly for arm64 (Apple Silicon, AWS Graviton)
docker build --platform linux/arm64 -t myapp:latest .

# Build a multi-arch manifest for both platforms at once
docker buildx build \\
  --platform linux/amd64,linux/arm64 \\
  -t myregistry/myapp:latest \\
  --push .

# Check what architecture an image was built for
docker inspect myapp:latest | grep Architecture`,
          caption: 'Using --platform to target specific CPU architectures.',
        },
        {
          language: 'dockerfile',
          code: `# Minimal Node.js — Alpine Linux (~5 MB base)
FROM node:22-alpine

# Red Hat Universal Base Image — enterprise grade
FROM registry.access.redhat.com/ubi9/nodejs-22

# Distroless — no shell, no package manager, minimal attack surface
FROM gcr.io/distroless/nodejs22-debian12

# Scratch — nothing at all (only for statically compiled binaries)
FROM scratch`,
          caption: 'Common base image choices and their trade-offs.',
        },
      ],
      keyPoints: [
        '<strong>amd64</strong> = Intel/AMD (most cloud VMs). <strong>arm64</strong> = Apple Silicon, AWS Graviton.',
        'Building on a Mac (arm64) and deploying to a Linux server (amd64) requires explicit <code>--platform linux/amd64</code>.',
        'Use <code>docker buildx</code> to create multi-arch images that run on both architectures.',
        'Smaller base images (Alpine, Distroless) = smaller attack surface and faster pulls.',
        '<a href="https://catalog.redhat.com/en/software/base-images#base-images-overview" target="_blank" rel="noopener noreferrer">UBI</a> is the right base for Red Hat OpenShift and enterprise environments.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 4 — The Layered Filesystem & Union File System
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'layered-filesystem',
      title: 'The Layered Filesystem & Union File System',
      tag: { label: 'Concept', type: 'teal' },
      image: {
        src: containerLayersImg,
        alt: 'Diagram showing two containers (blue and orange) each with a writable layer on top, built on their respective image layers (Debian+emacs+Apache and BusyBox), all sharing the same host kernel at the base.',
        caption: 'Two containers sharing the host kernel — each has its own image layers and a thin writable layer on top. Changes written at runtime go into the writable layer only; the image layers beneath are never modified.',
        maxWidth: '480px',
      },
      body: [
        'Every container image is made up of a stack of read-only <strong>layers</strong>. Each instruction in your Dockerfile that modifies the filesystem (<code>RUN</code>, <code>COPY</code>, <code>ADD</code>) produces a new layer. Layers are identified by a content hash (SHA256), so if the layer content hasn\'t changed, Docker reuses the cached version. This is what makes incremental builds fast.',
        'The technology that makes this possible is called a <strong>Union File System</strong> — most commonly OverlayFS on modern Linux kernels. UnionFS merges multiple directory trees into a single coherent view. You see one flat filesystem, but underneath it is a stack of layers where upper layers can shadow (override) files in lower layers without modifying them.',
        'When you run a container, Docker adds one final <strong>writable layer</strong> on top of all the read-only image layers. Any files the container creates or modifies are written into this top layer only. When the container is stopped and deleted, that writable layer is discarded. The underlying image layers are never changed — this is what makes containers <strong>immutable</strong> at the image level.',
        '<strong>Copy-on-Write (CoW)</strong> is the mechanism that makes this efficient. When a running container needs to modify a file that exists in a lower read-only layer, the Union File System does not touch that layer. Instead it <em>copies</em> the file up into the writable layer first, then modifies the copy there. The original in the read-only layer is untouched. This means two containers from the same image share all the read-only layers in memory and on disk — only their small writable layers differ.',
        'The practical consequence for you as a developer is that <strong>the order of instructions in your Dockerfile directly controls your build cache</strong>. Instructions that change rarely (installing OS packages, copying <code>package.json</code>) should come first. Instructions that change frequently (copying your source code) should come last. This way a source code change only invalidates the last few layers, and earlier layers are served from cache in seconds.',
      ],
      images: [
        {
          src: imageLayersImg,
          position: 'top',
          alt: 'Three-step diagram showing how each Dockerfile instruction builds a new layer: FROM debian produces the base layer, RUN apt-get install emacs adds an emacs layer on top, and RUN apt-get install apache2 adds an apache2 layer on top of that.',
          caption: 'Each Dockerfile instruction that modifies the filesystem adds a new read-only layer — FROM creates the base, each RUN stacks on top. This is the image you distribute.',
          maxWidth: '560px',
        },
      ],
      secondaryImage: {
        src: copyOnWriteImg,
        alt: 'Diagram illustrating Copy-on-Write: a file from a read-only image layer is copied up into the writable container layer before being modified, leaving the original layer unchanged.',
        caption: 'Copy-on-Write in action — the container copies a file from a read-only layer into its writable layer before modifying it. The original is never touched.',
        maxWidth: '540px',
      },
      callouts: [
        {
          kind: 'info',
          title: 'Cache invalidation rule: ',
          subtitle: 'When any layer changes, ALL layers below it are rebuilt from scratch. Put stable things first (base image, OS deps, package manifests) and frequently-changing code last.',
        },
        {
          kind: 'warning',
          title: 'Secrets in layers: ',
          subtitle: 'If you copy a secret into an image and delete it in a later RUN step, the secret is still visible in the earlier layer. Use build args, secrets mounts, or multi-stage builds to avoid leaking credentials into image history.',
        },
      ],
      codeBlocks: [
        {
          language: 'dockerfile',
          code: `# BAD — copying all source first invalidates cache on every code change
FROM node:22-alpine
COPY . /app               # ← changes every time any file changes
RUN npm ci                # ← reinstalls all deps every build
RUN npm run build

# GOOD — copy manifests first, install, then copy source
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./   # ← only changes when deps change
RUN npm ci                               # ← cached unless package.json changed
COPY . .                                 # ← changes every build, but npm ci is cached
RUN npm run build`,
          caption: 'Layer ordering for optimal Docker build cache utilisation.',
        },
        {
          language: 'bash',
          code: `# Inspect the layers of any image
docker image history myapp:latest

# See layer sizes and commands that created them
docker image history --no-trunc myapp:latest

# Dive is a popular third-party tool for layer exploration
docker run --rm -it \\
  -v /var/run/docker.sock:/var/run/docker.sock \\
  wagoodman/dive:latest myapp:latest`,
          caption: 'Tools to inspect image layers.',
        },
      ],
      keyPoints: [
        'Every <code>RUN</code>, <code>COPY</code>, <code>ADD</code> instruction creates a new read-only layer.',
        '<strong>OverlayFS</strong> merges layers into a single filesystem view — upper layers shadow lower ones.',
        'A thin writable layer is added at runtime; it is discarded when the container is removed.',
        'Put rarely-changing instructions (base image, OS packages, dependencies) <strong>early</strong> in the Dockerfile.',
        'Put frequently-changing instructions (source code copy, final build) <strong>late</strong> in the Dockerfile.',
        'Secrets deleted in a later layer are still readable in the earlier layer\'s history.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 5 — Podman vs Docker
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'podman-vs-docker',
      title: 'Podman vs Docker',
      tag: { label: 'Technology', type: 'purple' },
      body: [
        '<strong>Docker</strong> is the original container platform and still the most widely used. Its architecture revolves around a central background daemon (<code>dockerd</code>) that runs as root and manages all containers, images, and networks. Your <code>docker</code> CLI commands communicate with this daemon over a Unix socket.',
        '<strong>Podman</strong> is a daemonless container engine developed by Red Hat. Instead of a long-running daemon, Podman forks a new process for each operation directly from your CLI. There is no root-owned background service. This means Podman can run in <strong>rootless mode</strong> — containers managed entirely by your normal user account, without any privileged daemon, which is a meaningful security improvement.',
        'Both tools are <strong>OCI-compliant</strong> (Open Container Initiative). Images built with Docker run on Podman and vice versa. Podman even ships a <code>podman-docker</code> compatibility package that installs a <code>docker</code> alias pointing to Podman, so existing scripts and CI pipelines work without modification.',
        'On Red Hat Enterprise Linux, CentOS Stream, and Fedora, Podman is the default and Docker is not available in the standard repos. On macOS and Windows the picture is reversed — Docker Desktop is the dominant choice for development, though Podman Desktop is a capable alternative. In OpenShift, container images are built and run by the platform itself using CRI-O, not Docker or Podman directly.',
      ],
      callouts: [
        {
          kind: 'info',
          title: 'Rootless by default: ',
          subtitle: 'Podman runs containers as your own user account. Even if a process inside the container escapes its sandbox, it has no more host privileges than you do.',
        },
        {
          kind: 'info',
          title: 'Drop-in replacement: ',
          subtitle: 'alias docker=podman works in most cases. The command syntax is identical because both conform to the same OCI standard.',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# Docker — daemon-based (daemon must be running)
docker run -d --name web nginx
docker build -t myapp .
docker push myregistry/myapp:latest

# Podman — daemonless, identical syntax
podman run -d --name web nginx
podman build -t myapp .
podman push myregistry/myapp:latest

# Run Podman in rootless mode (no sudo required)
podman run --rm hello-world

# Check if Docker daemon is running (Docker-specific)
docker info | grep "Server Version"

# Podman has no daemon to check — it just works
podman info | grep "version"`,
          caption: 'Docker and Podman commands are interchangeable in most situations.',
        },
      ],
      keyPoints: [
        '<strong>Docker</strong>: daemon-based, root-owned service, most widely used.',
        '<strong>Podman</strong>: daemonless, rootless capable, default on RHEL/Fedora/OpenShift.',
        'Both are OCI-compliant — images are fully interchangeable.',
        '<code>alias docker=podman</code> works in most cases without script changes.',
        'Rootless Podman is more secure — container escapes cannot gain host root access.',
        'For OpenShift deployments, neither Docker nor Podman runs the containers — CRI-O does.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 6 — The Dockerfile Deep Dive
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'dockerfile-deep-dive',
      title: 'The Dockerfile / Containerfile Deep Dive',
      tag: { label: 'Build', type: 'blue' },
      body: [
        'A <strong>Dockerfile</strong> (or <code>Containerfile</code> in Podman terminology — they are identical in syntax) is a plain-text recipe that describes how to build a container image. It is a sequence of instructions, each of which either modifies the filesystem or sets metadata. When you run <code>docker build</code>, Docker reads this file top to bottom and produces a layered image.',
        'The most important instructions are: <code>FROM</code> (sets the base image — every Dockerfile must start here), <code>RUN</code> (executes a shell command, produces a new layer), <code>COPY</code> (copies files from your local machine into the image), <code>WORKDIR</code> (sets the working directory for subsequent instructions), <code>ENV</code> (sets environment variables baked into the image), <code>ARG</code> (defines build-time variables passed with <code>--build-arg</code>), <code>EXPOSE</code> (documents which port the app listens on — it does NOT publish the port), <code>CMD</code> (the default command to run when the container starts — can be overridden), <code>ENTRYPOINT</code> (the executable that always runs — harder to override), <code>USER</code> (switches to a non-root user for security), and <code>HEALTHCHECK</code> (tells Docker how to test whether the container is healthy).',
        '<strong>Multi-stage builds</strong> are one of the most powerful Dockerfile patterns. You use multiple <code>FROM</code> instructions, each starting a new stage. The first stage might install a full build toolchain and compile your app. The final stage copies only the compiled output into a clean minimal base image — discarding all build tools, intermediate files, and any secrets used during compilation. This keeps the production image small and secure.',
        'The Dockerfile in this repository is a real multi-stage example: Stage 1 uses a full Maven JDK image to compile the Java backend; Stage 2 uses Node.js to build the React frontend; Stage 3 copies both compiled artefacts into a minimal Open Liberty runtime image and runs as a non-root user. Nothing from the build stages makes it into the final image except the compiled code.',
      ],
      callouts: [
        {
          kind: 'info',
          title: 'EXPOSE does not publish: ',
          subtitle: 'EXPOSE is documentation only. The port is not accessible from outside the container until you explicitly publish it with -p when running the container.',
        },
        {
          kind: 'info',
          title: 'CMD vs ENTRYPOINT: ',
          subtitle: 'ENTRYPOINT defines the executable; CMD provides default arguments. Together they form: ENTRYPOINT + CMD = final run command. CMD alone is the most common pattern for application containers.',
        },
      ],
      codeBlocks: [
        {
          language: 'dockerfile',
          code: `# ── Stage 1: Build the application ─────────────────────────────────────
FROM node:22-alpine AS builder

# Set working directory for all subsequent instructions
WORKDIR /app

# Copy dependency manifests first (cache-friendly layer order)
COPY package.json package-lock.json ./

# Install dependencies — this layer is cached until package.json changes
RUN npm ci --ignore-scripts

# Copy application source — this layer rebuilds on every code change
COPY src/ ./src/

# Compile / bundle the application
RUN npm run build

# ── Stage 2: Production runtime ──────────────────────────────────────────
FROM node:22-alpine AS runtime

# Build-time argument — can be passed with --build-arg
ARG NODE_ENV=production

# Environment variable baked into the image
ENV NODE_ENV=\${NODE_ENV}

WORKDIR /app

# Copy ONLY the compiled output from the build stage — not node_modules or src
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Document the port (does NOT publish it)
EXPOSE 3000

# Switch to non-root user for security
USER node

# Health check — Docker polls this to know if the container is healthy
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD wget -qO- http://localhost:3000/health || exit 1

# Default startup command
CMD ["node", "dist/server.js"]`,
          caption: 'A fully annotated multi-stage Dockerfile with all key instructions explained.',
        },
      ],
      keyPoints: [
        '<code>FROM</code> sets the base image — every Dockerfile starts here.',
        '<code>RUN</code>, <code>COPY</code>, <code>ADD</code> each create a new image layer.',
        '<strong>Multi-stage builds</strong> keep production images small by discarding build tooling.',
        '<code>EXPOSE</code> is documentation only — publish ports with <code>-p</code> at runtime.',
        '<code>USER</code> — always finish with a non-root user; UID 1001 is a common convention.',
        '<code>HEALTHCHECK</code> — enables Docker/orchestrators to detect and restart unhealthy containers.',
        'Layer order matters: stable things first, frequently-changing things last.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 7 — Containers vs VMs
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'containers-vs-vms',
      title: 'Containers vs Virtual Machines',
      tag: { label: 'Concept', type: 'teal' },
      image: {
        src: containersVsVmsImg,
        alt: 'Side-by-side architecture diagram comparing Virtual Machines (app + guest OS + hypervisor stack) with Containers (app + libs sharing a single host OS kernel via a container runtime).',
        caption: 'Virtual Machines carry a full guest OS per app — containers share the host kernel directly, removing the hypervisor and guest OS overhead entirely.',
        maxWidth: '700px',
      },

      body: [
        'Virtual Machines have been the foundation of cloud infrastructure for two decades. A hypervisor (such as VMware ESXi, KVM, or Hyper-V) creates virtualised hardware for each VM — virtual CPU, RAM, disk, network card. Each VM then runs a complete guest operating system on top of this virtual hardware. The isolation is strong: a compromised VM cannot directly access another VM\'s kernel.',
        'Containers take a fundamentally different approach. There is no hypervisor, no virtualised hardware, and no guest operating system. Instead, the host kernel itself provides isolation through namespaces and cgroups. Every container on the same host shares the same kernel — they are just differently constrained views of the same running OS.',
        'This difference has profound practical consequences. A VM must boot an entire OS, which takes 30–90 seconds and consumes hundreds of megabytes of RAM just for the OS baseline. A container starts in milliseconds because there is no OS to boot — it is just another process. You can run hundreds of containers on the same host that could only host a handful of VMs.',
        'The trade-off is isolation depth. If there is a kernel vulnerability, it potentially affects all containers on that host. VMs provide a harder boundary because exploiting one requires breaking through the hypervisor as well. Modern container runtimes (like gVisor, Kata Containers) address this by adding a lightweight VM layer underneath containers when stronger isolation is needed.',
      ],
      callouts: [
        {
          kind: 'info',
          title: 'Containers vs VMs — not either/or: ',
          subtitle: 'In production cloud environments, containers typically run inside VMs. You get the density and speed of containers AND the isolation boundary of virtualisation. These technologies are complementary.',
        },
      ],
      codeBlocks: [
        {
          language: 'text',
          code: `┌──────────────────────────────────┐  ┌──────────────────────────────────┐
│         Virtual Machines          │  │           Containers              │
├──────────────────────────────────┤  ├──────────────────────────────────┤
│  App A  │  App B  │   App C       │  │ App A │ App B │ App C            │
├─────────┼─────────┼───────────────┤  ├───────┼───────┼──────────────────┤
│ Guest   │ Guest   │  Guest        │  │ Libs  │ Libs  │  Libs            │
│   OS    │   OS    │    OS         │  ├───────┴───────┴──────────────────┤
├─────────┴─────────┴───────────────┤  │    Container Runtime (Docker)    │
│           Hypervisor              │  ├──────────────────────────────────┤
├───────────────────────────────────┤  │           Host OS Kernel         │
│         Host OS + Hardware        │  ├──────────────────────────────────┤
└───────────────────────────────────┘  │            Hardware              │
                                       └──────────────────────────────────┘
  Start time: 30-90 seconds               Start time: < 1 second
  Size: GB per VM                         Size: MB per container
  Density: ~10-50 per host               Density: hundreds per host
  Isolation: strong (hypervisor)         Isolation: kernel-level namespaces`,
          caption: 'Side-by-side architecture comparison: VMs vs Containers.',
        },
      ],
      keyPoints: [
        'VMs virtualise <strong>hardware</strong>. Containers virtualise <strong>the OS process space</strong>.',
        'Containers share the host kernel — no guest OS to boot, start in &lt; 1 second.',
        'VM: 30–90s start, GBs RAM. Container: &lt;1s start, MBs RAM.',
        'VMs offer stronger isolation (hypervisor boundary). Containers are faster and denser.',
        'In practice: containers run <em>inside</em> VMs in the cloud — you get both benefits.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 8 — Immutability
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'immutability',
      title: 'Container Immutability',
      tag: { label: 'Best Practice', type: 'green' },
      body: [
        'One of the most important principles in container operations is <strong>immutability</strong>: once a container image is built, it should never be modified. If you need to update your application, you rebuild the image from scratch and deploy the new version. You do not patch the running container, you do not <code>ssh</code> into it and install packages, you do not edit config files in place.',
        'This is sometimes summarised as <strong>"cattle, not pets"</strong>. In traditional operations, servers were treated like pets — individually named, carefully maintained, nursed through outages. Containers should be treated like cattle — interchangeable, identical units that are replaced rather than repaired. If a container misbehaves, you kill it and start a new one from the same image.',
        'Immutability has several important practical benefits. Every running container is guaranteed to be identical to every other container started from the same image — no configuration drift, no "works on my machine" problems. Rolling back a bad deployment means running the previous image tag, which is instant. Auditing what is in production is trivial: look at the image digest.',
        'Immutability does NOT mean your application cannot have persistent state. It means that state must be <strong>externalised</strong> — stored in a database, object store, or mounted volume that lives outside the container. The container itself is ephemeral. Its filesystem is thrown away when it stops. If your application needs to write data that must survive a container restart, that data must go to a volume or an external service.',
      ],
      secondaryImage: {
        src: cattleVsPetsImg,
        alt: 'Illustration contrasting "pets" (individually named, carefully maintained servers) with "cattle" (identical, numbered, replaceable units) — used to explain the container immutability mindset.',
        caption: '"Cattle, not pets" — when a container misbehaves, you replace it with a fresh one from the same image. You do not nurse it back to health.',
        maxWidth: '620px',
      },
      callouts: [
        {
          kind: 'warning',
          title: 'Do not exec into production: ',
          subtitle: 'Running "docker exec -it mycontainer bash" to make changes in a running production container defeats the entire purpose of immutability. If the container is replaced, those changes vanish. Fix it in the Dockerfile and redeploy.',
        },
        {
          kind: 'info',
          title: 'Cattle, not pets: ',
          subtitle: 'Name your containers after their role, not their personality. If container "web-1" crashes, spin up "web-2" from the same image — do not try to repair "web-1".',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# WRONG — modifying a running container (changes are lost on restart)
docker exec my-app apt-get install -y curl   # never do this
docker exec my-app vi /etc/config.yaml       # never do this

# RIGHT — fix it in the Dockerfile, rebuild, redeploy
# 1. Edit your Dockerfile to include the change
# 2. Rebuild the image with a new tag
docker build -t myapp:v2 .
# 3. Stop the old container and start the new one
docker stop my-app && docker rm my-app
docker run -d --name my-app myapp:v2

# RIGHT — rollback by simply running the previous image
docker stop my-app && docker rm my-app
docker run -d --name my-app myapp:v1`,
          caption: 'The immutable container workflow: rebuild and replace, never patch.',
        },
      ],
      keyPoints: [
        'Images are read-only. Never modify a running container — rebuild the image instead.',
        '"<strong>Cattle, not pets</strong>" — containers are disposable, interchangeable units.',
        'Every running container from the same image is <strong>identical</strong> — no drift.',
        'Rollback = run the previous image tag. It is instant and reliable.',
        '<strong>Externalise state</strong>: databases, volumes, object storage. The container filesystem is ephemeral.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 9 — Docker Hub & Public Registries
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'docker-hub-and-registries',
      title: 'Docker Hub & Public Registries: Tread Carefully',
      tag: { label: 'Security', type: 'red' },
      body: [
        '<strong>Docker Hub</strong> (hub.docker.com) is the default public registry — the npm of the container world. When you run <code>docker pull nginx</code>, Docker contacts Docker Hub and downloads the image. It hosts millions of images contributed by vendors, open-source projects, and individual developers.',
        'Docker Hub has a tiered trust system. <strong>Official Images</strong> (marked with a blue badge) are curated by Docker Inc. and maintained by upstream vendors — <code>nginx</code>, <code>node</code>, <code>postgres</code>, <code>python</code> are official images. They are regularly scanned for CVEs and follow consistent conventions. <strong>Verified Publisher</strong> images are from companies that have verified their identity with Docker. <strong>Community images</strong> — everything else — carry no guarantee and should be treated with significant caution.',
        'The risk is real. Malicious or abandoned community images can contain cryptocurrency miners, backdoors, or simply years of unpatched vulnerabilities. An image that was perfectly safe when pulled two years ago may be full of critical CVEs today. Running <code>docker pull someuser/sometool:latest</code> without investigation is equivalent to <code>curl | bash</code> — you are executing untrusted code with whatever privileges you give the container.',
        'For enterprise use, consider <strong>IBM Container Registry</strong> (icr.io), <strong>Red Hat Quay</strong> (quay.io), or your cloud provider\'s private registry (AWS ECR, GCP Artifact Registry, Azure ACR). These provide image scanning, role-based access control, and a private namespace for your own images. The Open Liberty image used in this repository (<code>icr.io/appcafe/open-liberty</code>) is pulled from IBM Container Registry.',
      ],
      callouts: [
        {
          kind: 'warning',
          title: 'Always inspect before you pull: ',
          subtitle: 'Check the image source, number of pulls, last updated date, and scan results before using any public image in production. "docker scout cves image:tag" shows known vulnerabilities.',
        },
        {
          kind: 'warning',
          title: 'The "latest" tag is dangerous: ',
          subtitle: 'Using :latest means you might get a completely different image tomorrow. Always pin to a specific version tag (e.g. node:22.9.0-alpine3.20) in production.',
        },
      ],
      codeBlocks: [
        {
          language: 'bash',
          code: `# Pull only official or verified-publisher images
docker pull nginx:1.27-alpine         # Official image, pinned version
docker pull node:22.9.0-alpine3.20    # Official image, specific patch version

# Scan an image for known CVEs with Docker Scout
docker scout cves nginx:1.27-alpine

# Or with Trivy (popular open-source scanner)
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \\
  aquasec/trivy:latest image nginx:1.27-alpine

# Pull from IBM Container Registry (enterprise grade)
docker pull icr.io/appcafe/open-liberty:kernel-slim-java17-openj9-ubi

# Pull from Red Hat Quay
docker pull quay.io/redhat-appstudio/hacbs-jvm-build-tools:latest

# Log in to a private registry before pushing your own images
docker login myregistry.example.com`,
          caption: 'Safe image practices — pinned versions, scanning, enterprise registries.',
        },
      ],
      keyPoints: [
        '<strong>Official Images</strong> are curated by Docker/vendors. <strong>Community images</strong> are untrusted by default.',
        'Pin to specific version tags (e.g. <code>nginx:1.27-alpine</code>), not <code>:latest</code>.',
        'Scan images for CVEs with <strong>Docker Scout</strong> or <strong>Trivy</strong> before production use.',
        'Enterprise registries (IBM ICR, Red Hat Quay, AWS ECR) offer scanning and access control.',
        'An old public image is not a safe public image — CVEs accumulate over time.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 10 — Multi-Container Apps with Docker Compose
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'docker-compose',
      title: 'Multi-Container Apps with Docker Compose',
      tag: { label: 'Tool', type: 'cyan' },
      body: [
        'Real-world applications rarely run as a single container in isolation. A typical modern web application requires a frontend UI, an API backend, a database (such as PostgreSQL or MySQL), and perhaps a cache (like Redis). Running each of these individually with <code>docker run</code> commands quickly becomes error-prone and tedious: you have to manually configure shared bridge networks, wire up port mappings, pass environment variables, mount volumes, and start the containers in the exact right order.',
        '<strong>Docker Compose</strong> is a tool for defining and running multi-container Docker applications. With Compose, you define your entire application stack — services, networks, volumes, environment variables, and build configurations — declaratively in a single YAML file (typically named <code>compose.yaml</code> or <code>docker-compose.yml</code>).',
        'The <a href="https://docs.docker.com/compose/intro/compose-application-model/" target="_blank" rel="noopener noreferrer">Compose application model</a> is built on three core computing concepts: <strong>Services</strong> (computing components that run container images, with replicas, ports, and environment settings), <strong>Networks</strong> (virtual networks that connect services together and allow them to discover each other by service name via built-in DNS), and <strong>Volumes</strong> (persistent storage shared across containers or preserved through service restarts).',
        'When should you use Docker Compose? It is the de facto standard tool for <strong>local development and testing environments</strong> (spin up your entire microservice dependencies with a single command), <strong>automated CI/CD testing pipelines</strong> (start isolated test environments and tear them down after test suites finish), and <strong>single-host deployments</strong>. Instead of typing lengthy, repetitive <code>docker run</code> commands, you manage the complete application lifecycle with simple commands like <code>docker compose up</code>, <code>docker compose down</code>, and <code>docker compose logs</code>.',
      ],
      callouts: [
        {
          kind: 'info',
          title: 'V2 CLI syntax: ',
          subtitle: 'Modern Docker Compose is integrated into the Docker CLI as "docker compose" (with a space), replacing the legacy standalone Python tool "docker-compose" (with a hyphen).',
        },
        {
          kind: 'info',
          title: 'Automatic service discovery: ',
          subtitle: 'Compose creates a dedicated default network for your application. Services can communicate with each other directly using their service name as the hostname (e.g., your backend connects to "db:5432" without needing hardcoded IP addresses).',
        },
      ],
      codeBlocks: [
        {
          language: 'yaml',
          code: `# compose.yaml — A full-stack web application with database and cache
services:
  # Frontend web app (React / Nginx)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - API_URL=http://backend:8080

  # Backend REST API
  backend:
    image: my-backend-api:1.0.0
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=db
      - DB_USER=appuser
      - DB_PASSWORD=secretpassword
      - REDIS_HOST=cache
    depends_on:
      - db
      - cache

  # PostgreSQL Database with persistent volume
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: secretpassword
    volumes:
      - db-data:/var/lib/postgresql/data

  # In-memory Redis Cache
  cache:
    image: redis:7-alpine

# Named volumes for persistent storage
volumes:
  db-data:`,
          caption: 'compose.yaml: Declarative specification for services, environment, ports, and persistent volumes.',
        },
        {
          language: 'bash',
          code: `# Start all services defined in compose.yaml in the background
docker compose up -d

# View the status of all managed containers in the stack
docker compose ps

# Follow aggregated logs from all services (or specify a service: docker compose logs -f backend)
docker compose logs -f

# Execute a command inside a running service container
docker compose exec db psql -U appuser -d appdb

# Stop and remove all containers, networks, and recreate state cleanly
docker compose down

# Stop containers AND delete persistent volumes (clean slate)
docker compose down -v`,
          caption: 'Essential Docker Compose CLI commands for managing multi-container stacks.',
        },
      ],
      keyPoints: [
        '<strong>Docker Compose</strong> defines and runs multi-container applications using a single <code>compose.yaml</code> file.',
        'Compose Application Model: <strong>Services</strong> (containers), <strong>Networks</strong> (internal DNS communication), and <strong>Volumes</strong> (persistent data).',
        '<strong>When to use</strong>: Local development environments, CI/CD test pipelines, and multi-service development stacks.',
        'Built-in <strong>service discovery</strong>: containers reach each other by service name (e.g., <code>db:5432</code>) over an isolated virtual network.',
        'Core workflow: <code>docker compose up -d</code> to start the full stack, <code>docker compose down</code> to tear it down.',
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Topic 11 — Dave's Personal Tips
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: 'daves-personal-tips',
      title: "Dave's Personal Tips",
      tag: { label: 'Tips & Tricks', type: 'magenta' },
      body: [
        'After working with containers day in and day out, you quickly develop a core rotation of commands that you reach for 95% of the time. While Docker and Podman have extensive command suites, mastering these essential top commands gives you total control over building, running, inspecting, debugging, and cleaning up your container environments.',
        'Here is the visual card deck of my top daily commands with quick practical tips for each.',
        '<h3>Running Containers as System Services (Podman Quadlets)</h3>',
        'I use Podman for the most part, and for important persistent applications (databases, continuous backend services, web proxies), I run them directly as system processes managed by Linux <strong>systemd</strong> using <a href="https://podman-desktop.io/blog/podman-quadlet" target="_blank" rel="noopener noreferrer">Podman Quadlets</a>.',
        '<strong>What is this INI file?</strong> Quadlet files use standard systemd INI syntax with a <code>.container</code> extension (instead of writing complex 50-line shell scripts or standard unit files). When placed in <code>~/.config/containers/systemd/</code> (for rootless users) or <code>/etc/containers/systemd/</code> (system-wide), the Podman Quadlet systemd generator automatically reads this INI file on <code>systemctl daemon-reload</code> and converts it into a full, production-ready systemd service unit. This gives you automatic startup on host boot, auto-restarts on failure, dependency ordering (e.g. waiting for the network), and unified management via <code>systemctl</code> and <code>journalctl</code> — completely rootless!',
      ],
      commandCards: [
        {
          command: 'docker build',
          badge: 'Build',
          badgeType: 'blue',
          description: 'Builds an image from a Dockerfile and context path.',
          tip: 'Always tag with <code>-t name:tag</code> and don\'t forget the trailing context dot (<code>.</code>).',
        },
        {
          command: 'docker run',
          badge: 'Create & Start',
          badgeType: 'teal',
          description: 'Creates a brand new container instance and starts it immediately.',
          tip: 'Use <code>-d</code> for background, <code>-p 8080:80</code> for ports, and <code>--name</code> for clean naming.',
        },
        {
          command: 'docker start',
          badge: 'Lifecycle',
          badgeType: 'green',
          description: 'Resumes execution of one or more existing stopped containers.',
          tip: 'Does <em>not</em> create a new container — resumes where the stopped container left off.',
        },
        {
          command: 'docker stop',
          badge: 'Lifecycle',
          badgeType: 'warm-gray',
          description: 'Gracefully stops running containers.',
          tip: 'Sends <code>SIGTERM</code> first to allow safe exit before sending <code>SIGKILL</code> after 10s.',
        },
        {
          command: 'docker ps -a',
          badge: 'Inspect',
          badgeType: 'purple',
          description: 'Lists all containers on the host, including stopped and crashed ones.',
          tip: 'Without <code>-a</code>, you only see running containers and will miss crashed or exited ones.',
        },
        {
          command: 'docker logs',
          badge: 'Debug',
          badgeType: 'red',
          description: 'Fetches stdout and stderr streams from a container.',
          tip: 'Use <code>docker logs -f --tail 100 &lt;name&gt;</code> to stream live output and debug crashes.',
        },
        {
          command: 'docker inspect',
          badge: 'Debug',
          badgeType: 'purple',
          description: 'Returns low-level JSON details for containers, images, volumes, or networks.',
          tip: 'Pipe to <code>grep "IPAddress"</code> or use <code>--format</code> to extract runtime metadata.',
        },
        {
          command: 'docker images',
          badge: 'Storage',
          badgeType: 'cyan',
          description: 'Lists all local images stored on disk with repository, tag, and size.',
          tip: 'Useful for spotting untagged images (<code>&lt;none&gt;</code>) taking up disk space.',
        },
        {
          command: 'docker rm',
          badge: 'Cleanup',
          badgeType: 'magenta',
          description: 'Removes one or more stopped containers from disk.',
          tip: 'Pass <code>-f</code> to force-remove running containers or <code>--volumes</code> for associated data.',
        },
        {
          command: 'docker rmi',
          badge: 'Cleanup',
          badgeType: 'magenta',
          description: 'Removes one or more local container images.',
          tip: 'Must delete any container referencing the image first before Docker allows image deletion.',
        },
        {
          command: 'docker prune',
          badge: 'Maintenance',
          badgeType: 'high-contrast',
          description: 'One-shot cleanup of all stopped containers, unused networks, and dangling images.',
          tip: 'Run <code>docker system prune -a --volumes</code> to reclaim maximum disk space.',
        },
      ],
      callouts: [
        {
          kind: 'info',
          title: 'Podman aliases: ',
          subtitle: 'Every single one of these commands maps directly to "podman" with the exact same flags and arguments.',
        },
        {
          kind: 'info',
          title: 'Podman Quadlets & systemd: ',
          subtitle: 'I use Podman for the most part, and for important apps I run them directly as system processes with Podman Quadlets! Files in ~/.config/containers/systemd/ are automatically converted to native systemd service units.',
        },
        {
          kind: 'warning',
          title: 'Run vs Start: ',
          subtitle: '"docker run" creates a brand new container every time it is called. "docker start" resumes a container that was previously stopped. If you keep calling "docker run", you will create dozens of duplicate containers.',
        },
      ],
      codeBlocks: [
        {
          title: 'Podman Quadlet INI Unit File (my-web.container)',
          description: 'This INI file defines your container specification declaratively. Systemd translates the <code>[Container]</code> directives directly into rootless podman executions under the hood.',
          language: 'ini',
          code: `# File: ~/.config/containers/systemd/my-web.container
# Systemd INI format parsed by the Podman Quadlet generator

[Unit]
Description=My Production Web Application
After=network-online.target

[Container]
# The container image to pull and run
Image=docker.io/library/nginx:1.27-alpine

# Expose port 8080 on the host mapped to port 80 inside the container
PublishPort=8080:80

# Attach a persistent volume for static web content
Volume=web-data.volume:/usr/share/nginx/html:ro

# Auto-restart policy if the container process crashes
Restart=always

[Install]
# Enable this service to start automatically when the user session / host starts
WantedBy=default.target`,
          caption: 'my-web.container: INI-formatted Quadlet file that systemd automatically converts into a service unit.',
        },
        {
          title: 'Managing Quadlet Services with Standard systemctl & journalctl',
          description: 'Once the INI file is in place, you manage the container exactly like any native Linux system service.',
          language: 'bash',
          code: `# ── 1. Create the rootless systemd Quadlet directory ──────────────────────
mkdir -p ~/.config/containers/systemd/

# ── 2. Copy the .container INI file into place ───────────────────────────
cp my-web.container ~/.config/containers/systemd/

# ── 3. Tell systemd to re-read definitions (runs the Quadlet generator) ──
systemctl --user daemon-reload

# ── 4. Start the container service and enable it to run on host boot ─────
systemctl --user start my-web.service
systemctl --user enable my-web.service

# ── 5. Check service health, process status, and live logs ───────────────
systemctl --user status my-web.service
journalctl --user -u my-web.service -f`,
          caption: 'Controlling your Quadlet container using native systemd commands.',
        },
      ],
      keyPoints: [
        '<code>docker build</code> & <code>docker run</code>: The core loop for creating blueprints and starting instances.',
        '<code>docker run</code> (new container) vs <code>docker start</code> (resume existing container).',
        '<code>docker ps -a</code>: Your radar — always use <code>-a</code> to see exited containers.',
        '<code>docker logs -f --tail 100</code>: The first place to look whenever something fails.',
        '<code>docker inspect</code>: Unlocks deep runtime details like IP addresses, mounts, and environment variables.',
        '<code>docker system prune</code>: Frees up gigabytes of reclaimed disk space when developing locally.',
        '<strong>Podman Quadlets</strong>: Run important apps declaratively as rootless <code>systemd</code> system services with auto-restart on boot.',
      ],
    },
  ],
};
