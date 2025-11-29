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
    const posts = await window.utils.fetchJSON("posts/index.json");
    const postMeta = posts.find((p) => p.slug === slug);
    if (!postMeta) throw new Error("Post not found");
    // load the markdown
    const raw = await window.utils.fetchText(`posts/${postMeta.path}`);
    const parsed = window.utils.parseFrontmatter(raw);
    const titleFromMd = parsed.meta.title || null;
    const finalTitle = titleFromMd || postMeta.title || "Untitled Post";
    const body = parsed.body.replace(/^\s*#\s+.*(?:\r?\n|\r)/, "").trim();
    const html = marked.parse(body);
    document.getElementById("post-title").textContent = finalTitle;
    document.getElementById("post-date").textContent = new Date(
      postMeta.date
    ).toLocaleDateString();
    document.getElementById("post-content").innerHTML = html;
    document.title = postMeta.title + " | Exceed";
    // set meta description if present in meta
    const metas = document.querySelectorAll('meta[name="description"]');
    const metaDescription =
      parsed.meta.description || postMeta.description || "";
    if (metaDescription && metas.length > 0)
      metas[0].setAttribute("content", metaDescription);
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
