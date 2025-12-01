#!/usr/bin/env node
/**
 * scripts/build.js — Minimal static build script
 * Copies necessary files into `dist/` so Wrangler or Cloudflare Pages can deploy them
 */
const fs = require("fs");
const path = require("path");

const srcRoot = path.resolve(__dirname, "..");
const distRoot = path.join(srcRoot, "dist");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    ensureDir(dest);
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      const s = path.join(src, entry);
      const d = path.join(dest, entry);
      copyRecursive(s, d);
    }
  } else {
    copyFile(src, dest);
  }
}

// Clean dist
if (fs.existsSync(distRoot)) {
  fs.rmSync(distRoot, { recursive: true, force: true });
}
ensureDir(distRoot);

// Files to copy - UPDATED to include new files
const files = [
  "index.html",
  "blog.html",
  "post.html",
  "about.html",
  "styles.css",
  "script.js",
  "utils.js",
  "post.js",
  "theme.js", // NEW: Dark mode toggle
  "_headers", // NEW: Security headers
  "sitemap.xml", // NEW: SEO sitemap
  "robots.txt", // NEW: Search engine instructions
  "manage.html",
  "manage.js",
  "README.md",
  "package.json",
  ".gitignore",
];

files.forEach((f) => {
  const s = path.join(srcRoot, f);
  if (fs.existsSync(s)) {
    copyFile(s, path.join(distRoot, f));
    console.log(`✓ Copied ${f}`);
  } else {
    console.log(`⚠ Skipped ${f} (not found)`);
  }
});

// Copy posts directory
const postsSrc = path.join(srcRoot, "posts");
if (fs.existsSync(postsSrc)) {
  copyRecursive(postsSrc, path.join(distRoot, "posts"));
  console.log("✓ Copied posts directory");
}

// Copy assets directory (if exists)
const assetsSrc = path.join(srcRoot, "assets");
if (fs.existsSync(assetsSrc)) {
  copyRecursive(assetsSrc, path.join(distRoot, "assets"));
  console.log("✓ Copied assets directory");
}

console.log("\n✅ Built static assets to", distRoot);
