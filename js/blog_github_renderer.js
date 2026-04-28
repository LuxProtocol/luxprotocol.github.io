// ═══════════════════════════════════════════════
//  app.js  —  Blog loader + GitHub renderer
// ═══════════════════════════════════════════════

// ─── marked.js config ───────────────────────────
marked.setOptions({
  breaks: true,
  gfm: true,
});

// ─── Blog file list ──────────────────────────────
// Add your markdown filenames here whenever you
// drop a new .md file into /blogs/
const BLOG_FILES = [
  "./blogs/getting-started-with-rust.md",
  "./blogs/scalable-apis-with-go.md",
  "./blogs/kubernetes-practical-guide.md",
];

// ─── State ───────────────────────────────────────
let allPosts = [];
let activeTag = null;

// ─── Helpers ─────────────────────────────────────
function parseFrontmatter(raw) {
  const fm = {};
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { meta: fm, body: raw };

  const block = match[1];
  const body  = raw.slice(match[0].length).trim();

  block.split("\n").forEach(line => {
    const [key, ...rest] = line.split(":");
    const val = rest.join(":").trim();
    if (!key) return;
    const k = key.trim();
    if (val.startsWith("[")) {
      fm[k] = val.replace(/[\[\]]/g, "").split(",").map(s => s.trim());
    } else {
      fm[k] = val;
    }
  });

  return { meta: fm, body };
}

function formatDate(str) {
  if (!str) return "";
  const d = new Date(str);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function timeAgo(isoStr) {
  const diff = (Date.now() - new Date(isoStr)) / 1000;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n;
}

function langColor(lang) {
  const map = {
    JavaScript: "#f7df1e", TypeScript: "#3178c6", Rust: "#ce422b",
    Go: "#00add8", Python: "#3572a5", CSS: "#563d7c",
  };
  return map[lang] || "#888";
}

function initials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Blog: Load all posts ─────────────────────────
async function loadBlogs() {
  const grid = document.getElementById("posts-grid");
  grid.innerHTML = `<div class="loading-state">Loading posts…</div>`;

  const fetched = await Promise.all(
    BLOG_FILES.map(async path => {
      try {
        const res = await fetch(path);
        if (!res.ok) throw new Error("404");
        const raw = await res.text();
        const { meta, body } = parseFrontmatter(raw);
        return { meta, body, path };
      } catch {
        return null;
      }
    })
  );

  allPosts = fetched
    .filter(Boolean)
    .sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date));

  buildTagFilter();
  renderPostGrid(allPosts);
}

function buildTagFilter() {
  const allTags = [...new Set(allPosts.flatMap(p => p.meta.tags || []))];
  const container = document.getElementById("tag-filters");
  container.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.className = "tag-filter-btn active";
  allBtn.textContent = "All";
  allBtn.addEventListener("click", () => {
    activeTag = null;
    document.querySelectorAll(".tag-filter-btn").forEach(b => b.classList.remove("active"));
    allBtn.classList.add("active");
    renderPostGrid(allPosts);
  });
  container.appendChild(allBtn);

  allTags.forEach(tag => {
    const btn = document.createElement("button");
    btn.className = "tag-filter-btn";
    btn.textContent = tag;
    btn.addEventListener("click", () => {
      activeTag = tag;
      document.querySelectorAll(".tag-filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderPostGrid(allPosts.filter(p => p.meta.tags?.includes(tag)));
    });
    container.appendChild(btn);
  });
}

function renderPostGrid(posts) {
  const grid = document.getElementById("posts-grid");
  if (!posts.length) {
    grid.innerHTML = `<div class="loading-state">No posts found.</div>`;
    return;
  }
  grid.innerHTML = "";

  posts.forEach((post, i) => {
    const card = document.createElement("div");
    card.className = "post-card";
    card.style.animationDelay = `${i * 60}ms`;

    const tags = (post.meta.tags || [])
      .map(t => `<span class="tag">${t}</span>`)
      .join("");

    card.innerHTML = `
      <div class="card-tags">${tags}</div>
      <h3 class="card-title">${post.meta.title || "Untitled"}</h3>
      <div class="card-meta">
        <span class="card-author">${post.meta.author || "Unknown"}</span>
        <span class="card-date">${formatDate(post.meta.date)}</span>
      </div>
      <div class="card-arrow">→</div>
    `;

    card.addEventListener("click", () => openPost(post));
    grid.appendChild(card);
  });
}

// ─── Blog: Open detail view ───────────────────────
function openPost(post) {
  const list   = document.getElementById("blog-list");
  const detail = document.getElementById("blog-detail");

  // Populate detail
  document.getElementById("detail-title").textContent  = post.meta.title || "Untitled";
  document.getElementById("detail-author").textContent = post.meta.author || "";
  document.getElementById("detail-date").textContent   = formatDate(post.meta.date);
  document.getElementById("detail-avatar").textContent = initials(post.meta.author || "?");

  // Tags
  const tagsEl = document.getElementById("detail-tags");
  tagsEl.innerHTML = (post.meta.tags || [])
    .map(t => `<span class="tag">${t}</span>`).join("");

  // Gallery
  const gallery = document.getElementById("detail-gallery");
  const images  = post.meta.images || [];
  if (images.length) {
    gallery.innerHTML = images
      .map((src, i) => `
        <div class="gallery-item ${i === 0 ? "gallery-main" : ""}">
          <img src="${src}" alt="Image ${i + 1}" loading="lazy" />
        </div>
      `).join("");
    gallery.style.display = "";
  } else {
    gallery.innerHTML = "";
    gallery.style.display = "none";
  }

  // Markdown → HTML
  // Strip frontmatter header from rendered output (it's in h1)
  const bodyWithoutH1 = post.body.replace(/^#[^\n]*\n/, "");
  document.getElementById("detail-content").innerHTML = marked.parse(bodyWithoutH1);

  // Swap views with animation
  list.classList.add("slide-out");
  setTimeout(() => {
    list.classList.add("hidden");
    list.classList.remove("slide-out");
    detail.classList.remove("hidden");
    detail.classList.add("slide-in");
    detail.scrollTop = 0;
    setTimeout(() => detail.classList.remove("slide-in"), 400);
  }, 200);
}

function closePost() {
  const list   = document.getElementById("blog-list");
  const detail = document.getElementById("blog-detail");

  detail.classList.add("slide-out");
  setTimeout(() => {
    detail.classList.add("hidden");
    detail.classList.remove("slide-out");
    list.classList.remove("hidden");
    list.classList.add("slide-in");
    setTimeout(() => list.classList.remove("slide-in"), 400);
  }, 200);
}

document.getElementById("back-btn").addEventListener("click", closePost);

// ─── GitHub: Skeleton placeholders ───────────────
function renderGitHubSkeleton() {
  document.getElementById("org-logo").src = "";
  document.getElementById("org-name").textContent = "Loading…";
  document.getElementById("org-desc").textContent = "";
  document.getElementById("badge-repos").textContent   = "";
  document.getElementById("badge-members").textContent = "";

  const skeletonItem = `<li class="loading-state" style="padding:12px 0">Fetching from GitHub…</li>`;
  document.getElementById("repo-list").innerHTML        = skeletonItem;
  document.getElementById("contributor-list").innerHTML = skeletonItem;
  document.getElementById("commit-list").innerHTML      = skeletonItem;
}

// ─── GitHub: Render live data ─────────────────────
function renderGitHub({ org, top_repos, top_contributors, recent_commits }) {
  // Org header
  document.getElementById("org-logo").src = org.avatar_url;
  document.getElementById("org-logo").alt = org.name;
  document.getElementById("org-name").textContent       = org.name;
  document.getElementById("org-desc").textContent       = org.description;
  document.getElementById("badge-repos").textContent    = `${org.public_repos} repos`;
  document.getElementById("badge-members").textContent  = `${GITHUB_ORG}`;

  // Top Repos
  document.getElementById("repo-list").innerHTML = top_repos.map(repo => `
    <li class="repo-item">
      <a href="${repo.url}" target="_blank" rel="noopener" class="repo-name">${repo.name}</a>
      <p class="repo-desc">${repo.description}</p>
      <div class="repo-stats">
        ${repo.language ? `<span class="lang-dot" style="--c:${langColor(repo.language)}"></span><span class="lang-label">${repo.language}</span>` : ""}
        <span class="stat-item">★ ${formatNum(repo.stars)}</span>
        <span class="stat-item">⑂ ${formatNum(repo.forks)}</span>
        ${repo.open_issues ? `<span class="stat-item issue-count">◎ ${repo.open_issues}</span>` : ""}
      </div>
    </li>
  `).join("");

  // Top Contributors
  document.getElementById("contributor-list").innerHTML = top_contributors.map((c, i) => `
    <li class="contrib-item">
      <span class="contrib-rank">${i + 1}</span>
      <a href="${c.profile}" target="_blank" rel="noopener">
        <img src="${c.avatar_url}" alt="${c.login}" class="contrib-avatar" />
      </a>
      <div class="contrib-info">
        <a href="${c.profile}" target="_blank" rel="noopener" class="contrib-name">${c.name || c.login}</a>
        <span class="contrib-handle">@${c.login}</span>
      </div>
      <span class="contrib-count">${formatNum(c.contributions)} commits</span>
    </li>
  `).join("");

  // Recent Commits
  document.getElementById("commit-list").innerHTML = recent_commits.map(cm => `
    <li class="commit-item">
      <div class="commit-top">
        <a href="${cm.url}" target="_blank" rel="noopener" class="commit-sha">${cm.sha}</a>
        <span class="commit-repo">${cm.repo}</span>
        <span class="commit-time">${timeAgo(cm.timestamp)}</span>
      </div>
      <p class="commit-msg">${cm.message}</p>
      <span class="commit-author">@${cm.author}</span>
    </li>
  `).join("");
}

// ─── GitHub: Error state ──────────────────────────
function renderGitHubError(err) {
  const msg = err.message.includes("403")
    ? "Rate limit hit — add a GITHUB_TOKEN in github-data.js to increase it."
    : err.message.includes("404")
    ? `Organization "${GITHUB_ORG}" not found. Check GITHUB_ORG in github-data.js.`
    : `Failed to load GitHub data: ${err.message}`;

  const errorHtml = `<li class="loading-state" style="color:var(--accent3);padding:12px 0">${msg}</li>`;
  document.getElementById("org-name").textContent = "GitHub Error";
  document.getElementById("org-desc").textContent = msg;
  document.getElementById("repo-list").innerHTML        = errorHtml;
  document.getElementById("contributor-list").innerHTML = errorHtml;
  document.getElementById("commit-list").innerHTML      = errorHtml;
}

// ─── Init ─────────────────────────────────────────
loadBlogs();

renderGitHubSkeleton();
fetchGitHubData()
  .then(data => renderGitHub(data))
  .catch(err  => renderGitHubError(err));
