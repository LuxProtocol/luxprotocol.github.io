// ═══════════════════════════════════════════════
//  github-data.js  —  Live GitHub API fetcher
//
//  CONFIG: Set your organization name below.
//  Optional: add a Personal Access Token to raise
//  the rate limit from 60 → 5,000 req/hr.
//  Generate one at: https://github.com/settings/tokens
//  (No scopes needed for public org data.)
// ═══════════════════════════════════════════════

const GITHUB_ORG    = "luxprotocol";  // ← change this
const GITHUB_TOKEN  = "";        // ← optional PAT

// How many items to show in each section
const REPO_COUNT    = 3;
const CONTRIB_COUNT = 5;
const COMMIT_COUNT  = 6;

// ─── Internal helpers ─────────────────────────
const GH_API = "https://api.github.com";

function ghHeaders() {
  const h = { "Accept": "application/vnd.github+json" };
  if (GITHUB_TOKEN) h["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

async function ghFetch(path, params = {}) {
  const url = new URL(`${GH_API}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, { headers: ghHeaders() });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${path}`);
  return res.json();
}

// ─── Public API ───────────────────────────────
// Returns the same shape that renderGitHub() expects.
async function fetchGitHubData() {
  // 1. Org profile
  const org = await ghFetch(`/orgs/${GITHUB_ORG}`);

  // 2. Top repos by stars
  const reposRaw = await ghFetch(`/orgs/${GITHUB_ORG}/repos`, {
    sort: "stargazers",
    direction: "desc",
    per_page: REPO_COUNT,
    type: "public",
  });

  const top_repos = reposRaw.map(r => ({
    name:        r.name,
    description: r.description || "",
    stars:       r.stargazers_count,
    forks:       r.forks_count,
    language:    r.language,
    url:         r.html_url,
    open_issues: r.open_issues_count,
  }));

  // 3. Contributors — aggregate across top repos
  //    GitHub has no org-wide contributors endpoint,
  //    so we pull per-repo and merge totals.
  const contribMaps = await Promise.all(
    reposRaw.slice(0, 4).map(r =>
      ghFetch(`/repos/${GITHUB_ORG}/${r.name}/contributors`, {
        per_page: 20,
        anon: false,
      }).catch(() => [])  // forks / empty repos can 403
    )
  );

  const contribTotals = {};
  contribMaps.flat().forEach(c => {
    if (c.type === "Bot") return;
    if (!contribTotals[c.login]) {
      contribTotals[c.login] = {
        login:         c.login,
        avatar_url:    c.avatar_url,
        profile:       c.html_url,
        contributions: 0,
      };
    }
    contribTotals[c.login].contributions += c.contributions;
  });

  const top_contributors = Object.values(contribTotals)
    .sort((a, b) => b.contributions - a.contributions)
    .slice(0, CONTRIB_COUNT);

  // 4. Recent commits — 5 latest from each top repo,
  //    merged, sorted globally, then trimmed.
  const commitArrays = await Promise.all(
    reposRaw.map(r =>
      ghFetch(`/repos/${GITHUB_ORG}/${r.name}/commits`, { per_page: 5 })
        .then(commits => commits.map(c => ({
          sha:       c.sha.slice(0, 7),
          message:   c.commit.message.split("\n")[0],  // subject line only
          author:    c.author?.login || c.commit.author.name,
          repo:      r.name,
          timestamp: c.commit.author.date,
          url:       c.html_url,
        })))
        .catch(() => [])
    )
  );

  const recent_commits = commitArrays
    .flat()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, COMMIT_COUNT);

  return {
    org: {
      login:        org.login,
      name:         org.name || org.login,
      description:  org.description || "",
      avatar_url:   org.avatar_url,
      public_repos: org.public_repos,
      html_url:     org.html_url,
    },
    top_repos,
    top_contributors,
    recent_commits,
  };
}
