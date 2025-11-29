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

    const checks = await Promise.all(
      posts.map(async (p) => {
        const ok = await window.utils.exists(`posts/${p.path}`);
        return ok ? p : null;
      })
    );

    const existingPosts = checks.filter(Boolean);

    const postsWithMeta = await Promise.all(
      existingPosts.map(async (p) => {
        if (!p.title || p.title === "Untitled Post") {
          try {
            const raw = await window.utils.fetchText(`posts/${p.path}`);
            const parsed = window.utils.parseFrontmatter(raw);
            if (parsed?.meta?.title) p.title = parsed.meta.title;
            if (parsed?.meta?.description)
              p.description = parsed.meta.description;
          } catch (e) {}
        }
        return p;
      })
    );

    if (postsWithMeta.length === 0) {
      container.textContent = "No posts found";
      return;
    }

    postsWithMeta.forEach((p) => {
      const card = document.createElement("a");
      card.className = "post-card";
      card.href = `post.html?slug=${encodeURIComponent(p.slug)}`;

      const title = document.createElement("h3");
      title.textContent = p.title;

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
  setInterval(loadPosts, 60_000);
});
