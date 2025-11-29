/* utils.js
 * Shared client-side helpers for fetching, frontmatter parsing, and params
 */
window.utils = (function () {
  function getQueryParam(key) {
    const params = new URLSearchParams(location.search);
    return params.get(key);
  }

  async function fetchJSON(url, { cacheBust = true } = {}) {
    const u = cacheBust
      ? `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`
      : url;
    const resp = await fetch(u, { cache: "no-store" });
    if (!resp.ok) throw new Error(`Failed to fetch JSON: ${url}`);
    return resp.json();
  }

  async function fetchText(url, { cacheBust = true } = {}) {
    const u = cacheBust
      ? `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`
      : url;
    const resp = await fetch(u, { cache: "no-store" });
    if (!resp.ok) throw new Error(`Failed to fetch text: ${url}`);
    return resp.text();
  }

  async function exists(url, { cacheBust = true } = {}) {
    const u = cacheBust
      ? `${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`
      : url;
    try {
      const resp = await fetch(u, { method: "HEAD", cache: "no-store" });
      if (resp.ok) return true;
      if (resp.status === 405 || resp.status === 501) {
        const r2 = await fetch(u, { cache: "no-store" });
        return r2.ok;
      }
      return false;
    } catch (e) {
      try {
        const r3 = await fetch(u, { cache: "no-store" });
        return r3.ok;
      } catch (e2) {
        return false;
      }
    }
  }

  function parseFrontmatter(raw) {
    const result = { meta: {}, body: raw };
    const fmMatch = raw.match(/^---\s*([\s\S]*?)\s*---/);
    if (!fmMatch) return result;
    const fm = fmMatch[1];
    const meta = {};
    fm.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([^:]+):\s*(.*)$/);
      if (m) {
        const k = m[1].trim();
        let v = m[2].trim();
        // strip surrounding quotes
        v = v.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
        if (k === "tags") {
          try {
            // try parse list like [tag1, tag2]
            const arr = v
              .replace(/\[|\]/g, "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            meta[k] = arr;
          } catch (e) {
            meta[k] = [];
          }
        } else meta[k] = v;
      }
    });
    result.meta = meta;
    result.body = raw.replace(/^---[\s\S]*?---/, "").trim();
    return result;
  }

  return { getQueryParam, fetchJSON, fetchText, parseFrontmatter, exists };
})();
