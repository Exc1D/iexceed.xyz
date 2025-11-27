#!/usr/bin/env node
/**
 * scripts/make-post.js
 * Simple Node helper to scaffold a new Markdown post and update posts/index.json
 * Usage: node scripts/make-post.js "My Post Title" --open
 */

const fs = require("fs");
const path = require("path");

function slugify(title) {
  return title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const title = process.argv[2] || "Untitled Post";
const openOpt = process.argv.includes("--open");

const date = new Date();
const yyyy = date.getFullYear();
const mm = String(date.getMonth() + 1).padStart(2, "0");
const dd = String(date.getDate()).padStart(2, "0");
const slug = `${yyyy}-${mm}-${dd}-${slugify(title)}`;
const filename = `${slug}.md`;
const postsDir = path.join(__dirname, "..", "posts");
const filePath = path.join(postsDir, filename);

const frontmatter = `---\ntitle: "${title}"\ndate: "${yyyy}-${mm}-${dd}"\ndescription: "A short description for ${title}"\ntags: []\n---\n\n# ${title}\n\nWrite your post here...\n`;

try {
  if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });
  if (fs.existsSync(filePath)) {
    console.error("Post already exists:", filePath);
    process.exit(1);
  }
  fs.writeFileSync(filePath, frontmatter, "utf8");
  // update index.json
  const indexPath = path.join(postsDir, "index.json");
  let index = [];
  if (fs.existsSync(indexPath)) {
    index = JSON.parse(fs.readFileSync(indexPath, "utf8")) || [];
  }
  index.unshift({
    slug,
    title,
    date: `${yyyy}-${mm}-${dd}`,
    description: `A short description for ${title}`,
    path: filename,
  });
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), "utf8");
  console.log("Created new post at", filePath);
  if (openOpt) {
    const editor = process.env.EDITOR || "vi";
    const { spawn } = require("child_process");
    spawn(editor, [filePath], { stdio: "inherit" });
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}
