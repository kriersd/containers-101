# Containers 101 — Education Session Site Plan

## Top-Level Overview

Transform the existing React + Carbon Design System frontend (`frontend/src/App.js`) into a professional, multi-part education session site for a live customer walkthrough on containers.

**Goal:** Replace the current configuration form UI with a structured, presenter-friendly education site covering three parts of container education — Introduction, Deep Dive into Build & Run, and Hands-On Examples.

**Approach:**
- Keep all existing tooling (Webpack, Babel, Carbon, React Native Web) unchanged.
- Replace `App.js` content and introduce new component/content files organised by part and topic.
- Every code/command block gets a copy-to-clipboard button.
- Navigation: a homepage with 3 Part cards → each card opens a full content page → topics rendered vertically as rich sections.
- Bob authors all written content (explanations, code blocks, callouts, diagrams-as-ASCII/SVG).

**Scope boundaries:**
- Frontend only — no backend changes.
- No new npm dependencies beyond what Carbon already provides (Carbon has `CodeSnippet`, `Tile`, `Accordion`, `Tag`, `InlineNotification` etc.).
- The `.env`, `Dockerfile`, and all scripts remain untouched.

---

## Architecture Overview

```
frontend/src/
├── App.js                    ← Replace with router/home shell
├── index.js                  ← Unchanged
├── index.html                ← Unchanged
├── components/
│   ├── HomePage.js           ← 3 Part cards
│   ├── PartPage.js           ← Generic part layout (header + topic list)
│   ├── TopicSection.js       ← Rich content section (text, code, callout)
│   └── CopyCodeBlock.js      ← Code block with copy-to-clipboard
└── content/
    ├── part1.js              ← All Part 1 topic content objects
    ├── part2.js              ← All Part 2 topic content objects
    └── part3.js              ← All Part 3 topic content objects
```

Navigation is managed with simple React state (no react-router dependency needed — 3-screen app).

---

## Sub-Tasks

---

### Sub-Task 1 — Project Structure & Routing Shell

**Status:** [ ] pending

**Intent:**
Set up the file structure, replace `App.js` with a navigation shell, and wire together the 3-screen flow (Home → Part → back to Home) using React state. No content yet — just the skeleton that all subsequent tasks fill in.

**Expected Outcomes:**
- `App.js` renders `<HomePage>` by default.
- Clicking a Part card on `<HomePage>` navigates to `<PartPage>` for that part.
- A "Back" button on `<PartPage>` returns to `<HomePage>`.
- Carbon `Theme` + `Header` with the session title remain in place.
- All new files exist with placeholder exports.

**Todo List:**
1. Create `frontend/src/components/` directory with empty placeholder files: `HomePage.js`, `PartPage.js`, `TopicSection.js`, `CopyCodeBlock.js`.
2. Create `frontend/src/content/` directory with empty placeholder files: `part1.js`, `part2.js`, `part3.js`.
3. Rewrite `App.js` to:
   - Maintain Carbon `Theme` (white/g100 toggle) and `Header`.
   - Add `currentView` state: `{ screen: 'home' }` or `{ screen: 'part', partId: 1|2|3 }`.
   - Render `<HomePage onNavigate={...}>` when `screen === 'home'`.
   - Render `<PartPage partId={...} onBack={...}>` when `screen === 'part'`.
4. Write `HomePage.js` as a stub that renders three placeholder `<Tile>` cards (Part 1, Part 2, Part 3) and calls `onNavigate(partId)` on click.
5. Write `PartPage.js` as a stub that shows the part title, a `<Button>` "Back to Overview", and an empty content area.

**Relevant Context:**
- `frontend/src/App.js` — current source to replace.
- `frontend/src/index.js` — unchanged, uses `AppRegistry`.
- Carbon components available: `Theme`, `Header`, `HeaderName`, `Grid`, `Column`, `Tile`, `Button`, `Tag`.
- No `react-router` — use React state only.

---

### Sub-Task 2 — Shared Components: CopyCodeBlock & TopicSection

**Status:** [ ] pending

**Intent:**
Build the two reusable display components used across all three parts. These must be complete and correct before any content is authored.

**Expected Outcomes:**
- `CopyCodeBlock.js` renders a styled code block using Carbon `CodeSnippet` (type `multi`) with copy-to-clipboard behaviour built in via Carbon's own clipboard support.
- `TopicSection.js` renders a single topic as: an `<h2>` heading, a `<Tag>` label (e.g. "Concept", "Command", "Best Practice"), one or more body paragraphs, optional callout boxes (`InlineNotification`), optional `<CopyCodeBlock>` blocks, and optional "key points" bullet lists.
- Both components accept data via props from the content files.

**Todo List:**
1. Implement `CopyCodeBlock.js`:
   - Use Carbon `CodeSnippet` with `type="multi"` and `feedback="Copied!"`.
   - Accept props: `code` (string), `language` (string, e.g. "bash", "dockerfile").
   - Add a small language label above the snippet.
2. Implement `TopicSection.js`:
   - Accept props: `title`, `tag` (label + type), `body` (array of paragraph strings), `callouts` (array of `{kind, title, subtitle}`), `codeBlocks` (array of `{language, code, caption}`), `keyPoints` (array of strings).
   - Render using Carbon `Grid`/`Column` for consistent layout.
   - Use Carbon `InlineNotification` for callout boxes.
   - Use Carbon `UnorderedList`/`ListItem` for key points.
   - Use a Carbon `Divider` (or `<hr>`) between sections.

**Relevant Context:**
- Carbon components: `CodeSnippet`, `InlineNotification`, `Tag`, `Grid`, `Column`, `UnorderedList`, `ListItem`.
- `@carbon/react` v1.72.0 is already installed.
- Carbon `CodeSnippet` handles copy-to-clipboard natively — no extra library needed.

---

### Sub-Task 3 — HomePage Component

**Status:** [ ] pending

**Intent:**
Build the polished homepage with three Part cards that serve as the entry point of the session. The presenter opens this page and walks the customer through what they will cover.

**Expected Outcomes:**
- Three `<ClickableTile>` cards displayed in a responsive Carbon grid row.
- Each card shows: Part number, title, short description, and a bulleted list of topic names.
- Clicking any card calls `onNavigate(partId)`.
- Page has a hero section with the session title and a brief intro paragraph.
- Carbon dark/light theme toggle remains accessible in the header.

**Todo List:**
1. Write the hero section: session title "Containers 101", subtitle, and a one-paragraph overview of the session.
2. Import topic titles from `part1.js`, `part2.js`, `part3.js` to populate card topic lists.
3. Render three `<ClickableTile>` components in a `<Grid><Row>` layout.
4. Each tile: bold part number + title, short paragraph description, `<UnorderedList>` of topic names, and a "Start →" link at the bottom.
5. Ensure the layout is readable at typical presentation laptop resolution (1280–1920px wide).

**Relevant Context:**
- Carbon components: `ClickableTile`, `Grid`, `Column`, `Tag`, `UnorderedList`, `ListItem`.
- Topic titles come from the content files authored in Sub-Tasks 4, 5, 6.
- `onNavigate(partId)` prop provided by `App.js`.

---

### Sub-Task 4 — Part 1 Content: Introduction to Containers

**Status:** [ ] pending

**Intent:**
Author all content for Part 1 and render it in `PartPage`. This is the conceptual foundation of the session.

**Expected Outcomes:**
- `part1.js` exports an array of topic objects, each consumable by `TopicSection`.
- `PartPage` renders all Part 1 topics vertically when `partId === 1`.
- Every topic has full explanatory text, at least one callout or code block where appropriate.

**Topics to author (8 topics):**

1. **What is a Container?** — Definition, analogy (shipping container), comparison to a process, images vs running containers, anatomy (namespace, cgroup, image layers). Callout: "A container is not a VM."

2. **Architecture & OS Matter** — CPU architectures (amd64 vs arm64), why `--platform` matters, base image OS choices (Alpine, UBI, Debian-slim, Scratch), what happens when you run the wrong arch. Code block: `docker buildx build --platform linux/amd64 .`

3. **The Layered Filesystem & Union File System** — How layers stack, copy-on-write, why order of Dockerfile instructions matters for cache, diagram walkthrough of UnionFS (OverlayFS). Callout: "Every RUN/COPY/ADD creates a new layer."

4. **Podman vs Docker** — Architectural differences (daemon vs daemonless), rootless containers, socket compatibility, `podman-docker` shim, when to choose each, OCI compliance. Comparison table embedded as styled content.

5. **The Dockerfile / Containerfile Deep Dive** — Every instruction explained (`FROM`, `ARG`, `ENV`, `RUN`, `COPY`, `WORKDIR`, `EXPOSE`, `CMD`, `ENTRYPOINT`, `HEALTHCHECK`, `USER`), multi-stage builds, layer caching strategy, `.dockerignore` role. Full annotated Dockerfile code block.

6. **Containers vs VMs** — What a hypervisor does, the overhead of a full OS per VM, how containers share the host kernel, startup time, density, trade-offs (security isolation). Side-by-side comparison callout.

7. **Immutability** — Why containers should never be patched in place, the rebuild-and-redeploy pattern, ephemeral containers, state separation (volumes), "cattle not pets" philosophy.

8. **Docker Hub & Public Registries** — What Docker Hub is, trusted vs community images, official vs verified publisher vs random images, CVEs in public images, IBM Container Registry and Red Hat Quay as enterprise alternatives. Warning callout: "Always inspect before you pull."

**Todo List:**
1. Write `part1.js` exporting array of 8 topic content objects matching `TopicSection` prop shape.
2. Author each topic with 2–4 paragraphs of accurate, beginner-friendly prose.
3. Include relevant code blocks (Dockerfile snippets, docker/podman commands).
4. Include callout boxes for warnings, tips, and key insights.
5. Include key point bullet lists for topics that benefit from summarisation.
6. Update `PartPage.js` to map content array to `<TopicSection>` components when `partId === 1`.

**Relevant Context:**
- `TopicSection` props: `title`, `tag`, `body`, `callouts`, `codeBlocks`, `keyPoints`.
- Accuracy standard: best practices as of 2024, Docker Engine v26+, Podman v5+.
- The Dockerfile in this repo (`Dockerfile`) is a real multi-stage example — reference it in the Dockerfile topic.

---

### Sub-Task 5 — Part 2 Content: Building & Running Containers

**Status:** [ ] pending

**Intent:**
Author all content for Part 2 — the operational depth session covering how to properly run containers in practice.

**Expected Outcomes:**
- `part2.js` exports an array of topic objects.
- All topics rendered vertically in `PartPage` when `partId === 2`.
- Heavy use of copy-to-clipboard command blocks.

**Topics to author (8 topics):**

1. **Container Run Options** — `docker run` anatomy, detached vs foreground, naming containers, `--rm` for ephemeral containers, resource limits (`--memory`, `--cpus`). Multiple command examples.

2. **Environment Variables** — `--env` / `-e` flag, `--env-file` flag, reading env inside the container, security implications of passing secrets as env vars. Code blocks with examples.

3. **The .dockerignore File** — Why it exists, what it prevents (secrets, large artifacts, VCS), performance impact on build context, walkthrough of the `.dockerignore` in this repo. Callout: "Forgetting .dockerignore is how secrets leak into images."

4. **Volume Mounts** — Bind mounts vs named volumes vs tmpfs, syntax (`-v` vs `--mount`), use cases (databases, config files, logs), persistence after container removal, permissions gotchas. Code blocks for each type.

5. **Using a .env File (Best Practice)** — The `--env-file` pattern, what the `.env.example` pattern buys you, never committing `.env` to git, the `.gitignore` + `.dockerignore` double-defence. Walkthrough of `.env.example` from this repo.

6. **Port Mapping** — Container networking basics, `-p host:container` syntax, multiple port mappings, `EXPOSE` vs actual publishing, `0.0.0.0` vs `127.0.0.1` binding, when to use `--network host`. Code blocks.

7. **Restart Policies** — `--restart` options (no, on-failure, always, unless-stopped), when to use each, how they interact with Docker daemon restarts, production use. Callout: "unless-stopped is usually what you want in production."

8. **Privileged Mode & Security** — What `--privileged` does (all Linux capabilities), when it is genuinely needed vs when it is a crutch, least-privilege alternatives (`--cap-add`), running as non-root (`--user`), why the Dockerfile in this repo uses UID 1001. Warning callout: "Privileged mode is a significant security risk."

9. **Image Tagging & Sharing** — Tagging syntax (`name:tag`), semantic versioning convention, `latest` anti-pattern, `docker push` to Docker Hub and private registries, `docker tag` to rename/alias, multi-arch manifests overview.

**Todo List:**
1. Write `part2.js` exporting array of 9 topic content objects.
2. Every command example uses `docker` and includes a `podman` equivalent in a note callout.
3. Reference the actual `.env.example` and `.dockerignore` files from this repo where relevant.
4. Include warning callouts for security-sensitive topics (privileged, secrets in env vars).
5. Update `PartPage.js` to render Part 2 topics when `partId === 2`.

**Relevant Context:**
- Repo files to reference: `.env.example`, `.dockerignore`, `run.sh`, `Dockerfile`.
- `run.sh` uses `--env-file .env` and port mapping — use as a real example.

---

### Sub-Task 6 — Part 3 Content: Hands-On Examples

**Status:** [ ] pending

**Intent:**
Author all content for Part 3 — the live walkthrough section. Step-by-step numbered instructions, all commands copy-paste ready, designed for live demo use.

**Expected Outcomes:**
- `part3.js` exports an array of topic objects.
- All code blocks have copy-to-clipboard buttons.
- Steps are clearly numbered within each topic section.
- Presenter can follow the page top-to-bottom as a live script.

**Topics to author (4 topics, expandable):**

1. **Pulling & Running Your First Container** — `docker pull hello-world`, run it, read the output, understand what happened. Then `docker run -it ubuntu bash`, explore the filesystem, exit. Commands step-by-step.

2. **Running Ghost Blog** — What Ghost is (open-source blog platform), pull the official image, run with port mapping and a volume for persistence, access it in the browser, show how the data persists across container restarts. Full command sequence with explanation of each flag.

3. **Building a Container from Scratch** — A simple Node.js "Hello World" app as the example (small, easy to understand). Walk through: write `app.js`, write `Dockerfile`, build it, run it, see output. Full Dockerfile and app code provided as copy-paste blocks.

4. **Exploring the App Container (This Repo)** — Walk through the multi-stage `Dockerfile` in this repo line by line. Build it with `build.sh`, run it with `run.sh`. Show the layering strategy, the non-root user, the health check endpoint. Tie everything from Parts 1 and 2 back to this real example.

**Todo List:**
1. Write `part3.js` with 4 topic content objects.
2. All `docker` commands include the `podman` equivalent as a note.
3. Ghost topic: use the official `ghost` image, show `-v ghost-content:/var/lib/ghost/content` volume, `-p 2368:2368`, `--name ghost-blog`, `--restart unless-stopped`.
4. Build-from-scratch topic: provide complete `app.js` (10 lines) and `Dockerfile` (8 lines) code blocks.
5. Repo walkthrough topic: annotate key lines from the actual `Dockerfile` in this workspace.
6. Update `PartPage.js` to render Part 3 topics when `partId === 3`.

**Relevant Context:**
- `Dockerfile` in this repo is the subject of Topic 4 — sub-task should read the actual file.
- Ghost official image: `ghost:5-alpine`.
- Simple Node app: `node:22-alpine` base is consistent with the repo's existing Node version (22).

---

### Sub-Task 7 — PartPage Layout & Navigation Polish

**Status:** [ ] pending

**Intent:**
Finalise the `PartPage` layout with a polished presenter-friendly UX: sticky back navigation, part progress indicator, smooth scroll to topics, and a "next part" button at the bottom.

**Expected Outcomes:**
- `PartPage` has a sticky top bar with part title and "Back to Overview" button.
- A vertical table of contents (sidebar or top anchor list) lets the presenter jump to any topic.
- "Next Part →" button at the bottom of Parts 1 and 2; "Back to Overview" on Part 3.
- All `TopicSection` components have an anchor `id` matching their title for deep linking.
- Smooth scroll behaviour.

**Todo List:**
1. Add `id` props to each `TopicSection` wrapper div derived from topic title slug.
2. Render a `<TableOfContents>`-style anchor list at the top of `PartPage` (Carbon `SideNav` or simple styled anchor list).
3. Add sticky header bar using Carbon `Header` or a fixed `div` with part title + back button.
4. Add "Next Part" / "Back to Overview" navigation at the bottom.
5. Set `scroll-behavior: smooth` in CSS.

**Relevant Context:**
- Carbon `SideNav` and `SideNavItems` could serve as the TOC.
- React state in `App.js` handles part navigation — `PartPage` calls `onNavigate` or `onBack`.

---

### Sub-Task 8 — Final Wiring, Styling & Content Review Pass

**Status:** [ ] pending

**Intent:**
Connect everything together, apply consistent Carbon spacing and typography, verify all copy-to-clipboard blocks work, and do a final readability pass on all authored content.

**Expected Outcomes:**
- App renders correctly in both light and dark theme.
- All 3 parts are fully navigable from the homepage.
- All code blocks copy correctly.
- No placeholder text remains.
- `App.js` theme toggle works across all screens.
- Page titles update to reflect current part.

**Todo List:**
1. Audit all content files — remove any placeholder text, verify accuracy of all commands and explanations.
2. Test dark/light theme toggle on all screens.
3. Verify Carbon `CodeSnippet` copy works in both themes.
4. Ensure the `Header` title changes to reflect current part (e.g. "Containers 101 — Part 1: Introduction").
5. Spot-check responsive layout at 1280px and 1920px viewport widths.
6. Update `README.md` with a brief description of the app and how to run it (`build.sh` + `run.sh`).

**Relevant Context:**
- Carbon spacing tokens: use `$spacing-05` (1rem) to `$spacing-09` (3rem) between major sections.
- Theme toggle already exists in original `App.js` — preserve it throughout.
- `webpack-dev-server` runs on port 3000 for local preview.
