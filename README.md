# Exceed - Static Blog

This is a small static blog. Posts are authored in Markdown and rendered client-side using a tiny client-side renderer (+ marked.js). The repository is intended to be hosted on Cloudflare Pages or any static host.

Quick commands:

1. Create a new post

```
npm run newpost -- "My New Post Title"
```

2. Preview locally

```
# build and preview locally
npm run build
npx serve dist -p 8000
# open http://localhost:8000 (or use `npm run preview`)
```

How it works:

- `posts/*.md` — markdown files with frontmatter (YAML) and content.
- `posts/index.json` — a JSON file listing posts (slug, title, date, etc) used by the index to render links.
- `post.html` — page that loads a markdown file and renders it with `marked.js`.
- `blog.html` — loads `posts/index.json` and renders a list with links to `post.html?slug=...`. It includes a "Refresh posts" button and auto-polls every 60s to refresh the list.
- `scripts/make-post.js` — a simple helper to scaffold a new post and update `posts/index.json`.
