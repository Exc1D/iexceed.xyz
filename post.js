/**
 * Enhanced post.js with reading time calculation and improved SEO
 */

// Calculate reading time (average 200 words per minute)
function calculateReadingTime(text) {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
}

// Update meta tags dynamically
function updateMetaTags(title, description, url) {
  // Update title
  document.title = `${title} | Exceed`;

  // Update description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && description) {
    metaDesc.setAttribute("content", description);
  }

  // Update Open Graph
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", `${title} | Exceed`);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && description) ogDesc.setAttribute("content", description);

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl && url) ogUrl.setAttribute("content", url);
}

// Add structured data for article
function addStructuredData(postMeta, title, description) {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description || "Developer insights and personal reflections",
    datePublished: postMeta.date,
    author: {
      "@type": "Person",
      name: "Exceed",
    },
    publisher: {
      "@type": "Organization",
      name: "Exceed",
      logo: {
        "@type": "ImageObject",
        url: "https://iexceed.pages.dev/assets/images/boss.webp",
      },
    },
    url: window.location.href,
  });
  document.head.appendChild(script);
}

async function loadPost() {
  const slug = window.utils.getQueryParam("slug");

  if (!slug) {
    showError("No post specified");
    return;
  }

  try {
    // Fetch posts index
    const posts = await window.utils.fetchJSON("posts/index.json");
    const postMeta = posts.find((p) => p.slug === slug);

    if (!postMeta) {
      throw new Error("Post not found in index");
    }

    // Fetch post content
    const raw = await window.utils.fetchText(`posts/${postMeta.path}`);
    const parsed = window.utils.parseFrontmatter(raw);

    // Extract title and description
    const title = parsed.meta.title || postMeta.title || "Untitled Post";
    const description = parsed.meta.description || postMeta.description || "";

    // Remove H1 from body to avoid duplicate heading
    const body = parsed.body.replace(/^\s*#\s+.*(?:\r?\n|\r)/, "").trim();

    // Calculate reading time
    const readingTime = calculateReadingTime(body);

    // Update DOM
    document.getElementById("post-title").textContent = title;

    const dateElement = document.getElementById("post-date");
    const formattedDate = new Date(postMeta.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    dateElement.textContent = formattedDate;
    dateElement.setAttribute("datetime", postMeta.date);

    const readingTimeElement = document.getElementById("reading-time");
    readingTimeElement.innerHTML = `
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: text-bottom;">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
      </svg>
      ${readingTime} min read
    `;
    readingTimeElement.setAttribute(
      "aria-label",
      `Estimated reading time: ${readingTime} minutes`
    );

    // Render markdown
    const contentElement = document.getElementById("post-content");
    contentElement.innerHTML = marked.parse(body);

    // Add aria-label to code blocks
    const codeBlocks = contentElement.querySelectorAll("pre code");
    codeBlocks.forEach((block) => {
      const pre = block.parentElement;
      pre.setAttribute("role", "region");
      pre.setAttribute("aria-label", "Code block");
      pre.setAttribute("tabindex", "0");
    });

    // Ensure all images have alt text
    const images = contentElement.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.hasAttribute("alt")) {
        img.setAttribute("alt", "");
      }
      img.setAttribute("loading", "lazy");
    });

    // Make external links accessible
    const links = contentElement.querySelectorAll('a[href^="http"]');
    links.forEach((link) => {
      if (!link.hostname.includes(window.location.hostname)) {
        link.setAttribute("rel", "noopener noreferrer");
        link.setAttribute("target", "_blank");

        // Add visual indicator for external links
        const icon = document.createElement("span");
        icon.setAttribute("aria-label", "(opens in new tab)");
        icon.innerHTML = " ↗";
        link.appendChild(icon);
      }
    });

    // Update meta tags and structured data
    updateMetaTags(title, description, window.location.href);
    addStructuredData(postMeta, title, description);
  } catch (err) {
    console.error("Error loading post:", err);
    showError("Post not found or temporarily unavailable");
  }
}

function showError(message) {
  document.getElementById("post-title").textContent = "Error";
  document.getElementById("post-content").innerHTML = `
    <p class="error" role="alert">${message}</p>
    <p><a href="blog.html">← Return to blog</a></p>
  `;
  document.title = "Error | Exceed";
}

// Load post when DOM is ready
document.addEventListener("DOMContentLoaded", loadPost);
