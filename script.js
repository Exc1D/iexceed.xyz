/*
  script.js — client-side index page script
  - loads `posts/index.json`
  - renders a list of posts into #posts
  - each post links to `post.html?slug=<slug>`
*/

async function loadPosts() {
  try {
    const posts = await window.utils.fetchJSON("posts/index.json");
    const container = document.getElementById("posts");
    if (!container) return;
    container.innerHTML = "";
    // verify that each post file actually exists (skip deleted/missing files)
    const checks = await Promise.all(
      posts.map(async (p) => {
        try {
          // try a HEAD request first to minimize bandwidth
          const ok = await window.utils.exists(`posts/${p.path}`);
          if (ok) return p;
          if (r.ok) return p;
          if (r.status === 405 || r.status === 501) {
            // HEAD not allowed - fallback GET
            const r2 = await fetch(`posts/${p.path}?t=${cacheBust}`, {
              cache: "no-store",
            });
            if (r2.ok) return p;
          }
        } catch (e) {
          // HEAD may fail or be blocked, try GET
          try {
            const r3 = await fetch(`posts/${p.path}?t=${cacheBust}`, {
              cache: "no-store",
            });
            if (r3.ok) return p;
          } catch (e2) {
            return null;
          }
        }
        return null;
      })
    );

    const existingPosts = checks.filter(Boolean);
    // For posts with no title or 'Untitled Post', try to parse frontmatter from the markdown
    const postsWithMeta = await Promise.all(
      existingPosts.map(async (p) => {
        if (!p.title || p.title === "Untitled Post") {
          try {
            const raw = await window.utils.fetchText(`posts/${p.path}`);
            const parsed = window.utils.parseFrontmatter(raw);
            if (parsed && parsed.meta && parsed.meta.title)
              p.title = parsed.meta.title;
            if (parsed && parsed.meta && parsed.meta.description)
              p.description = parsed.meta.description;
          } catch (e) {
            // ignore
          }
        }
        return p;
      })
    );
    if (existingPosts.length === 0) {
      container.textContent = "No posts found";
      return;
    }

    postsWithMeta.forEach((p) => {
      const card = document.createElement("article");
      card.className = "post-card";
      const title = document.createElement("h3");
      const link = document.createElement("a");
      link.href = `post.html?slug=${encodeURIComponent(p.slug)}`;
      link.textContent = p.title;
      title.appendChild(link);
      const date = document.createElement("time");
      date.className = "post-date";
      date.dateTime = p.date;
      date.textContent = new Date(p.date).toLocaleDateString();
      const desc = document.createElement("p");
      desc.textContent = p.description || "";
      card.appendChild(title);
      card.appendChild(date);
      card.appendChild(desc);
      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    const container = document.getElementById("posts");
    if (container) container.textContent = "No posts found";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadPosts();
  const refresh = document.getElementById("refresh-posts");
  if (refresh) refresh.addEventListener("click", loadPosts);
  // optionally poll every 60s to auto-refresh the posts list
  setInterval(loadPosts, 60_000);
});
