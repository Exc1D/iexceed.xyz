# Exceed — Static Markdown Blog

A small static blog that renders posts client-side from Markdown. It's designed to be easy to author posts while remaining lightweight to host on Cloudflare Pages or any static host.

Quick overview

- Posts live in `posts/` with the following structure:
  - `posts/YYYY-MM-DD-slug.md` — Markdown post with YAML frontmatter
  - `posts/index.json` — list of post metadata used by the client site
- Pages
  - `index.html` — landing/hero page
  - `blog.html` — blog listing (posts are rendered client-side)
  - `post.html` — single-post view (loads Markdown and renders it via `marked.js`)
- Helpful scripts
  - `scripts/make-post.js` — scaffold new posts and update `posts/index.json`
  - `scripts/build.js` — compile static assets to `dist/` for deployment

Getting started (local development)

1. Create a new post

```
npm run newpost -- "My New Post Title"
```

This scaffolds `posts/YYYY-MM-DD-my-post.md` and updates `posts/index.json`.

2. Build (generate `dist/`)

```
npm run build
```

3. Preview the site locally

```
# serve the generated `dist` directory
npx serve dist -p 8000
# open http://localhost:8000
```

Notes about rendering and metadata

- The site renders posts client-side with `marked.js` which is convenient and zero-build for content authors.
- `post.html` and the list in `blog.html` attempt to use the post's _frontmatter_ title and description when available. If frontmatter is missing, the script attempts to use the H1 heading from the Markdown.
- `blog.html` contains a refresh button and auto-polling to check for new/removed posts without a full redeploy. The list only shows posts whose files exist (the script verifies files are present and excludes missing ones).
- If you prefer a static pre-rendered site (for SEO or OG metadata), see the `scripts/build.js` (or consider an SSG like Eleventy or Hugo). I can scaffold that pipeline upon request.

Deploying to Cloudflare

- Option 1: Cloudflare Pages
  - Connect your repo to Cloudflare Pages and set the build command to `npm ci && npm run build` with output directory `dist`.
  - Cloudflare Pages will run the build and deploy the `dist` contents.
- Option 2: Wrangler / CLI deploy
  - We provide `wrangler.jsonc` and `npm run deploy` which runs `npm run build` then `npx wrangler deploy` (uploads the `dist` assets).

Authoring & Editing

- Example frontmatter for `posts/YYYY-MM-DD-slug.md`:

```
---
title: "My Post Title"
date: "2025-11-27"
description: "Short description"
tags: [tag1, tag2]
---

# My Post Title

Post body in markdown.
```

- `scripts/make-post.js` will generate the initial frontmatter and a placeholder H1 for you.
- For minor metadata edits to post frontmatter, update the Markdown file and optionally run `npm run sync-index` (if you add such a tool) — the client code will pull frontmatter when it renders.

Tips

- For production, consider migrating to an SSG for better SEO and static metadata handling.
- Use the `Refresh posts` button on `blog.html` or wait for the 60s poll to reflect changes to posts that were added/removed without redeploying.

If you want me to add a specific section (rss, sitemap, or automatic index syncing), tell me which and I'll implement it.
