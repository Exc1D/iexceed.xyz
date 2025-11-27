#!/usr/bin/env node
/**
 * scripts/sync-index.js
 * Regenerates posts/index.json by scanning posts/*.md and extracting frontmatter metadata
 */
const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '..', 'posts');
const indexPath = path.join(postsDir, 'index.json');

function readPostMetadata(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  // attempt to parse frontmatter
  let title = null;
  let date = null;
  let description = null;
  const fmMatch = raw.match(/^---\s*([\s\S]*?)\s*---/);
  if (fmMatch) {
    const fm = fmMatch[1];
    const titleMatch = fm.match(/^\s*title:\s*["']?(.+?)["']?\s*$/m);
    const dateMatch = fm.match(/^\s*date:\s*["']?(.+?)["']?\s*$/m);
    const descMatch = fm.match(/^\s*description:\s*["']?(.+?)["']?\s*$/m);
    if (titleMatch) title = titleMatch[1].trim();
    if (dateMatch) date = dateMatch[1].trim();
    if (descMatch) description = descMatch[1].trim();
  }
  // fallback: detect H1 title in body
  if (!title) {
    const body = raw.replace(/^---[\s\S]*?---/, '').trim();
    const h1Match = body.match(/^\s*#\s+(.+)(?:\r?\n|\r)/);
    if (h1Match) title = h1Match[1].trim();
  }
  return { title, date, description };
}

function slugFromFile(filename) {
  return filename.replace(/\.md$/, '');
}

function buildIndex() {
  if (!fs.existsSync(postsDir)) {
    console.warn('posts directory not found, skipping index generation');
    return;
  }
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  const posts = files.map(f => {
    const filePath = path.join(postsDir, f);
    const meta = readPostMetadata(filePath);
    const slug = slugFromFile(f);
    const date = meta.date || slug.split('-').slice(0,3).join('-') || null;
    return {
      slug,
      title: meta.title || 'Untitled Post',
      date,
      description: meta.description || '',
      path: f
    };
  });
  // sort by date desc if date available
  posts.sort((a,b) => {
    if (a.date && b.date) return new Date(b.date) - new Date(a.date);
    return 0;
  });
  fs.writeFileSync(indexPath, JSON.stringify(posts, null, 2), 'utf8');
  console.log('Wrote', indexPath);
}

buildIndex();
