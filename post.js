/*
  post.js — client-side post rendering
  - parse slug from query string
  - load posts/index.json to find path for slug
  - fetch markdown file and use marked to render
*/

function getQueryParam(key) {
  const params = new URLSearchParams(location.search);
  return params.get(key);
}

async function loadPost() {
  const slug = getQueryParam("slug");
  if (!slug) return;
  try {
    // load index to find the path to the post
    const indexResp = await fetch(`posts/index.json?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!indexResp.ok) throw new Error("Failed to load post index");
    const posts = await indexResp.json();
    const postMeta = posts.find((p) => p.slug === slug);
    if (!postMeta) throw new Error("Post not found");
    // load the markdown
    const mdResp = await fetch(`posts/${postMeta.path}?t=${Date.now()}`);
    if (!mdResp.ok) throw new Error("Failed to fetch post markdown");
    const raw = await mdResp.text();
    // parse YAML frontmatter (if any) and extract title/description
    let mdTitle = null;
    let mdDescription = null;
    const fmMatch = raw.match(/^---\s*([\s\S]*?)\s*---/);
    if (fmMatch) {
      const fm = fmMatch[1];
      const titleMatch = fm.match(/^\s*title:\s*["']?(.+?)["']?\s*$/m);
      const descMatch = fm.match(/^\s*description:\s*["']?(.+?)["']?\s*$/m);
      if (titleMatch) mdTitle = titleMatch[1].trim();
      if (descMatch) mdDescription = descMatch[1].trim();
    }
    // attempt to strip YAML frontmatter
    let body = raw.replace(/^---[\s\S]*?---/, "").trim();
    // detect leading H1 inside markdown (used if frontmatter missing)
    let h1Title = null;
    const h1Match = body.match(/^\s*#\s+(.+)(?:\r?\n|\r)/);
    if (h1Match) {
      h1Title = h1Match[1].trim();
    }
    // remove leading H1 from markdown to avoid duplicate titles in the rendered page
    // decide on final title preference: if meta from posts/index.json is missing or a generic 'Untitled Post', prefer mdTitle or h1Title
    // prefer frontmatter (mdTitle) if available, otherwise use index.json title, then H1, then fallback
    const finalTitle =
      mdTitle && mdTitle !== "Untitled Post"
        ? mdTitle
        : postMeta && postMeta.title && postMeta.title !== "Untitled Post"
        ? postMeta.title
        : h1Title || "Untitled Post";
    const html = marked.parse(
      body.replace(/^\s*#\s+.*(?:\r?\n|\r)/, "").trim()
    );
    document.getElementById("post-title").textContent = finalTitle;
    document.getElementById("post-date").textContent = new Date(
      postMeta.date
    ).toLocaleDateString();
    document.getElementById("post-content").innerHTML = html;
    document.title = finalTitle + " | Exceed";
    // set meta description if present in meta
    const metas = document.querySelectorAll('meta[name="description"]');
    // prefer the description in index.json, but fall back to frontmatter description
    const metaDescription =
      postMeta && postMeta.description
        ? postMeta.description
        : mdDescription || "";
    if (metaDescription && metas.length > 0) {
      metas[0].setAttribute("content", metaDescription);
    }
  } catch (err) {
    console.error(err);
    // Gracefully show not-found message and keep the Back button
    const titleEl = document.getElementById("post-title");
    const contentEl = document.getElementById("post-content");
    if (titleEl) titleEl.textContent = "Post not found";
    if (contentEl)
      contentEl.textContent =
        "This post may have been removed or is temporarily unavailable.";
    document.title = "Post not found | Exceed";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadPost();
});
