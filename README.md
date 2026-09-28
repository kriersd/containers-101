# Containers 101

A professional education session site for walking customers through the basics of containerised application development.

## What is This?

A guided, presenter-friendly web application covering three parts of container education:

| Part | Title | Topics |
|------|-------|--------|
| 1 | Introduction to Containers | What is a Container, Architecture & OS, Layered Filesystem, Podman vs Docker, Dockerfile Deep Dive, Containers vs VMs, Immutability, Docker Hub |
| 2 | Building & Running Containers | Run Options, Environment Variables, .dockerignore, Volume Mounts, .env Best Practice, Port Mapping, Restart Policies, Privileged Mode, Image Tagging |
| 3 | Hands-On Examples | First Container, Ghost Blog, Build from Scratch, This Repo's Dockerfile |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + React Native Web + IBM Carbon Design System v11 |
| Frontend Build | Webpack 5 + Babel 7 + SCSS |
| Backend | IBM Open Liberty + Jakarta EE 10 + MicroProfile 6.1 |
| Backend Runtime | Java 17 (OpenJ9 JVM) |
| Container Runtime | Docker or Podman (auto-detected) |

## Quick Start

### Prerequisites

- Docker or Podman installed
- Java 17+ and Maven 3.9+ (for local backend development only)
- Node.js 22+ (for local frontend development only)

### Run with Docker / Podman

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_ORG/containers-101.git
cd containers-101

# 2. Set up environment configuration
cp .env.example .env
# Edit .env if needed — defaults work for local development

# 3. Build the container image (detects Docker or Podman automatically)
./build.sh

# 4. Run the container
./run.sh

# 5. Open in browser
open http://localhost:9080
```

### Frontend Development (hot reload)

```bash
cd frontend
npm install
npm start
# Opens at http://localhost:3000
```

## Project Structure

```
containers-101/
├── Dockerfile              # Multi-stage build: Maven → Node.js → Liberty
├── .env.example            # Environment variable template (copy to .env)
├── .dockerignore           # Excludes secrets, build artefacts, VCS from image
├── .containerignore        # Podman equivalent of .dockerignore
├── build.sh                # Builds the container image (Docker or Podman)
├── run.sh                  # Starts the container with --env-file .env
├── rebuild.sh              # Full teardown-and-rebuild cycle
├── frontend/
│   ├── src/
│   │   ├── App.js          # Navigation shell (Home ↔ Part 1/2/3)
│   │   ├── components/
│   │   │   ├── HomePage.js      # Landing page with 3 Part cards
│   │   │   ├── PartPage.js      # Part layout with sticky header + TOC
│   │   │   ├── TopicSection.js  # Rich content section component
│   │   │   └── CopyCodeBlock.js # Code block with copy-to-clipboard
│   │   └── content/
│   │       ├── part1.js    # Part 1: Introduction to Containers (8 topics)
│   │       ├── part2.js    # Part 2: Building & Running Containers (9 topics)
│   │       └── part3.js    # Part 3: Hands-On Examples (4 topics)
│   └── package.json
└── backend/
    ├── pom.xml             # Maven: Jakarta EE 10 + MicroProfile 6.1
    └── src/main/liberty/config/server.xml
```

## Features

- **3-part education session** covering all essential container concepts
- **Copy-to-clipboard** on every command and code block (Carbon CodeSnippet)
- **Sticky navigation** with table of contents and active section highlighting
- **Dark / light theme** toggle (IBM Carbon Design System)
- **Fully self-contained** — runs as a single container with both frontend and backend
- **Production-quality Dockerfile** — multi-stage build, non-root user, health check
