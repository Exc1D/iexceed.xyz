/*
  script.js — client-side index page script
  - loads `posts/index.json`
  - renders a list of posts into #posts
  - each post links to `post.html?slug=<slug>`
*/

async function loadPosts() {
  try {
    const resp = await fetch("posts/index.json");
    if (!resp.ok) throw new Error("Could not load posts");
    const posts = await resp.json();
    const container = document.getElementById("posts");
    if (!container) return;
    container.innerHTML = "";
    posts.forEach((p) => {
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
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadPosts();
});
