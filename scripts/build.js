#!/usr/bin/env node
/**
 * scripts/build.js — Minimal static build script
 * Copies necessary files into `dist/` so Wranger or Cloudflare Pages can deploy them
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

// files to copy
const files = [
  "index.html",
  "blog.html",
  "post.html",
  "styles.css",
  "script.js",
  "post.js",
  "manage.html",
  "manage.js",
  "README.md",
  "package.json",
  ".gitignore",
];
files.forEach((f) => {
  const s = path.join(srcRoot, f);
  if (fs.existsSync(s)) copyFile(s, path.join(distRoot, f));
});

// copy posts directory
const postsSrc = path.join(srcRoot, "posts");
if (fs.existsSync(postsSrc)) {
  copyRecursive(postsSrc, path.join(distRoot, "posts"));
}

console.log("Built static assets to", distRoot);
