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
    // attempt to strip YAML frontmatter
    const body = raw.replace(/^---[\s\S]*?---/, "").trim();
    const html = marked.parse(body);
    document.getElementById("post-title").textContent = postMeta.title;
    document.getElementById("post-date").textContent = new Date(
      postMeta.date
    ).toLocaleDateString();
    document.getElementById("post-content").innerHTML = html;
    document.title = postMeta.title + " | Exceed";
    // set meta description if present in meta
    const metas = document.querySelectorAll('meta[name="description"]');
    if (postMeta.description && metas.length > 0) {
      metas[0].setAttribute("content", postMeta.description);
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
