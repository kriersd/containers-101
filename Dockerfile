# syntax=docker/dockerfile:1
# Compatible with both Docker BuildKit and Podman.
# Podman does not require the syntax directive but ignores it safely.

# ---------------------------------------------------------------------------
# Build args — values are passed from build.sh sourced from .env.
# Defaults mirror .env.example so the image can be built without --build-arg.
# ---------------------------------------------------------------------------
ARG LIBERTY_HTTP_PORT=9080
ARG LIBERTY_HTTPS_PORT=9443

# ============================================================================
# STAGE 1 — Maven build of the Liberty backend
# ============================================================================
FROM maven:3.9.9-eclipse-temurin-17 AS backend-build

WORKDIR /build/backend

# Copy dependency manifest first so Maven's layer cache is reused on source-only changes.
COPY backend/pom.xml .

# Download all declared dependencies into the local cache layer.
# -q suppresses download noise; --no-transfer-progress keeps CI logs clean.
RUN mvn dependency:go-offline --no-transfer-progress -q

# Copy source tree and compile.
COPY backend/src ./src

RUN mvn package --no-transfer-progress -q -DskipTests

# ============================================================================
# STAGE 2 — Node.js build of the React Native Web frontend
# ============================================================================
FROM node:22.9.0-alpine3.20 AS frontend-build

WORKDIR /build/frontend

# Copy manifests first — npm ci layer is reused until package-lock.json changes.
COPY frontend/package.json frontend/package-lock.json* ./
COPY frontend/babel.config.json ./
COPY frontend/webpack.config.js ./

# ci install uses package-lock.json for reproducible installs.
# --ignore-scripts prevents lifecycle scripts from running during install;
# legitimate build scripts are explicit (npm run build) not implicit.
RUN npm ci --ignore-scripts

COPY frontend/src ./src

# Webpack production build: minified, content-hashed, tree-shaken output in ./dist
RUN npm run build

# ============================================================================
# STAGE 3 — Final runtime image
# ============================================================================
FROM icr.io/appcafe/open-liberty:kernel-slim-java17-openj9-ubi AS runtime

# Re-declare ARGs after FROM so they are in scope for this stage.
ARG LIBERTY_HTTP_PORT=9080
ARG LIBERTY_HTTPS_PORT=9443

# Bake the port numbers and keystore defaults into the image as env vars.
# These become the effective defaults; --env-file at runtime can override them.
ENV LIBERTY_HTTP_PORT=${LIBERTY_HTTP_PORT} \
    LIBERTY_HTTPS_PORT=${LIBERTY_HTTPS_PORT} \
    LIBERTY_KEYSTORE_PASSWORD=changeit
# NOTE: LIBERTY_HTTP_PORT must match what Liberty binds to in server.xml.
# The .env.example default is 9080, which is the Liberty conventional HTTP port.
# Override at build time with --build-arg LIBERTY_HTTP_PORT=<port> if needed.

# Install only the features declared in server.xml.
# Adding server.xml before the app means feature installs are cached separately
# from app changes, dramatically speeding up iterative image builds.
COPY --chown=1001:0 backend/src/main/liberty/config/server.xml /config/server.xml

# RUN featureUtility installServerFeatures is executed automatically by the
# Open Liberty kernel-slim base image on first startup if features are not
# pre-installed. To pre-install during build (faster startup):
RUN features.sh

# Copy the compiled WAR from stage 1.
COPY --chown=1001:0 \
     --from=backend-build \
     /build/backend/target/containers101.war \
     /config/apps/containers101.war

# Copy static frontend assets from stage 2.
# Liberty's defaultHttpEndpoint will serve these from /static/ via a
# FileServlet configured in server.xml, or they can be served by a CDN.
# Placed under /config/apps/static/ so Liberty's application context can
# serve them under the same origin as the API, avoiding CORS complexity.
COPY --chown=1001:0 \
     --from=frontend-build \
     /build/frontend/dist \
     /config/apps/static

# Liberty kernel-slim runs as UID 1001 (non-root) by default.
# Explicitly setting USER ensures scanners and policy engines can verify it.
USER 1001

EXPOSE ${LIBERTY_HTTP_PORT}
EXPOSE ${LIBERTY_HTTPS_PORT}

# Health check polls the MicroProfile Health aggregate endpoint.
# --start-period gives Liberty time to start before failures are counted.
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${LIBERTY_HTTP_PORT}/health || exit 1
