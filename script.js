/*
  script.js — client-side index page script
  - loads `posts/index.json`
  - renders a list of posts into #posts
  - each post links to `post.html?slug=<slug>`
*/

async function loadPosts() {
  try {
    const cacheBust = Date.now();
    const resp = await fetch(`posts/index.json?t=${cacheBust}`, {
      cache: "no-store",
    });
    if (!resp.ok) throw new Error("Could not load posts");
    const posts = await resp.json();
    const container = document.getElementById("posts");
    if (!container) return;
    container.innerHTML = "";
    // verify that each post file actually exists (skip deleted/missing files)
    const checks = await Promise.all(
      posts.map(async (p) => {
        try {
          // try a HEAD request first to minimize bandwidth
          const r = await fetch(`posts/${p.path}?t=${cacheBust}`, {
            method: "HEAD",
            cache: "no-store",
          });
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
    // For each existing post, fetch its markdown and prefer frontmatter title/desc if present
    const postsWithMeta = await Promise.all(
      existingPosts.map(async (p) => {
        try {
          const r = await fetch(`posts/${p.path}?t=${Date.now()}`, {
            cache: "no-store",
          });
          if (r.ok) {
            const raw = await r.text();
            const fmMatch = raw.match(/^---\s*([\s\S]*?)\s*---/);
            if (fmMatch) {
              const fm = fmMatch[1];
              const titleMatch = fm.match(/^\s*title:\s*["']?(.+?)["']?\s*$/m);
              const descMatch = fm.match(
                /^\s*description:\s*["']?(.+?)["']?\s*$/m
              );
              if (titleMatch) p.title = titleMatch[1].trim();
              if (descMatch) p.description = descMatch[1].trim();
            }
          }
        } catch (err) {
          /* ignore and keep index.json metadata */
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
