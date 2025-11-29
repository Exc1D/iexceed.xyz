async function loadPost() {
  const slug = window.utils.getQueryParam("slug");
  if (!slug) return;
  try {
    const posts = await window.utils.fetchJSON("posts/index.json");
    const postMeta = posts.find((p) => p.slug === slug);
    if (!postMeta) throw new Error("Post not found");

    const raw = await window.utils.fetchText(`posts/${postMeta.path}`);
    const parsed = window.utils.parseFrontmatter(raw);
    const title = parsed.meta.title || postMeta.title || "Untitled Post";
    const body = parsed.body.replace(/^\s*#\s+.*(?:\r?\n|\r)/, "").trim();

    document.getElementById("post-title").textContent = title;
    document.getElementById("post-date").textContent = new Date(
      postMeta.date
    ).toLocaleDateString();
    document.getElementById("post-content").innerHTML = marked.parse(body);
    document.title = `${title} | Exceed`;

    const description = parsed.meta.description || postMeta.description;
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", description);
    }
  } catch (err) {
    console.error(err);
    document.getElementById("post-title").textContent = "Post not found";
    document.getElementById("post-content").textContent =
      "This post may have been removed or is temporarily unavailable.";
    document.title = "Post not found | Exceed";
  }
}

document.addEventListener("DOMContentLoaded", loadPost);
