#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const tutorialsRoot = path.join(repoRoot, "tutorials");
const dataRoot = path.join(repoRoot, "assets", "data");
const jsRoot = path.join(repoRoot, "assets", "js");
const learnRoot = path.join(repoRoot, "learn");

const categoryLabels = {
  graphs: "Graphs",
  paradigms: "Paradigms",
  "data-structures": "Data Structures",
  geometry: "Geometry",
};

const categoryDescriptions = {
  Graphs: "Traversal, shortest paths, connectivity, spanning trees, and graph modeling.",
  Paradigms: "Greedy, backtracking, dynamic programming, divide and conquer, and search patterns.",
  "Data Structures": "STL, ordered sets, Fenwick trees, segment trees, treaps, sparse tables, and query tools.",
  Geometry: "Orientation, intersections, circles, polygons, convex hulls, and mixed geometry tasks.",
};

const titleOverrides = {
  "01-graph-intro": "Intro to Graphs",
  "02-graph-classification": "Graph Classification",
  "03-graph-terminology": "Graph Terminologies",
  "04-graph-data-structures": "Graph Data Structures",
  "05-sp-intro": "Intro to Shortest Path",
  "06-bfs": "BFS",
  "07-dfs": "DFS",
  "08-dijkstra": "Dijkstra",
  "09-bellman-ford-spfa": "Bellman-Ford and SPFA",
  "10-floyd-johnson-apsp": "Floyd-Warshall and Johnson APSP",
  "11-dsu": "DSU",
  "12-dsu-complexity": "DSU Complexity",
  "13-mst-prim-kruskal": "Minimum Spanning Tree MST",
  "14-euler-path": "Euler Path and Tour",
  "15-scc-tarjan-2sat": "Strongly Connected Components & 2-SAT",
  "16-lowlink-bridges-ap": "Low-Link, Bridges, and Articulation Points",
  "17-graph-misc": "Graph Miscellaneous",
  "18-greedy-adhoc": "Greedy and Ad Hoc",
  "19-backtracking": "Backtracking",
  "20-dp": "DP",
  "21-dp-advanced": "Advanced DP",
  "22-dp-hirschberg": "Hirschberg DP",
  "23-divide-conquer": "Divide and Conquer",
  "24-binary-ternary-search": "Binary Search and Ternary Search",
  "25-stl-cpp": "STL in C++",
  "26-stl-valarray": "std::valarray",
  "27-pbds": "PBDS",
  "28-monotonic-stack-deque": "Monotonic Stack and Deque",
  "29-fenwick-bit": "Fenwick Tree / BIT",
  "30-segtree-recursive": "Segment Tree Recursive",
  "31-segtree-composite": "Segment Tree Composite",
  "32-segtree-iterative": "Segment Tree Iterative",
  "33-segtree-lazy": "Segment Tree Lazy Propagation",
  "34-segtree-persistent": "Segment Tree Persistent",
  "35-segtree-mergesort": "Merge Sort Tree",
  "36-segtree-dynamic": "Dynamic Segment Tree",
  "37-segtree-beats": "Segment Tree Beats",
  "38-segtree-merging": "Segment Tree Merging",
  "39-segtree-xor": "XOR Segment Tree",
  "40-segtree-persistent-lazy": "Persistent Lazy Segment Tree",
  "41-segtree-2d": "2D Segment Tree",
  "42-segtree-2d-dynamic": "Dynamic 2D Segment Tree",
  "43-tree-queries": "Tree Queries",
  "44-sparse-table": "Sparse Table",
  "45-sqrt-decomposition": "Square Root Decomposition",
  "46-mo-classic": "Mo's Algorithm Classic",
  "47-mo-on-tree": "Mo's Algorithm on Tree",
  "48-mo-with-updates": "Mo's Algorithm with Updates",
  "49-mo-other-variants": "Mo's Algorithm Variants",
  "50-bst-bbst-avl-rb": "BST, BBST, AVL, and Red-Black Trees",
  "51-key-treap": "Key Treap",
  "52-implicit-treap": "Implicit Treap",
  "53-persistent-treap": "Persistent Treap",
  "54-splay-tree": "Splay Tree",
  "55-distance-comparison-tasks": "Distance Comparison Tasks",
  "56-point-location-orientation": "Point Location and Orientation",
  "57-line-conversion-point-on-segment": "Line Conversion and Point on Segment",
  "58-segment-intersection": "Segment Intersection",
  "59-triangle-construction": "Triangle Construction",
  "60-circle-intersection-tangents": "Circle Intersection and Tangents",
  "61-circle-cover-ellipse-utilities": "Circle Cover, Ellipse, and Utilities",
  "62-picks-theorem-problems": "Pick's Theorem Problems",
  "63-polygon-cut-convex-hull": "Polygon Cut and Convex Hull",
  "64-closest-pair-mixed-geometry": "Closest Pair and Mixed Geometry",
};

const videoMatchByBaseName = {
  "01-graph-intro": "intro to graphs",
  "02-graph-classification": "graph classification",
  "03-graph-terminology": "graph terminologies",
  "04-graph-data-structures": "graph data structure",
  "05-sp-intro": "intro to shortest path",
  "06-bfs": "bfs",
  "07-dfs": "dfs",
  "08-dijkstra": "dijkstra",
  "09-bellman-ford-spfa": "bellman ford",
  "10-floyd-johnson-apsp": "all pair shortest path",
  "11-dsu": "dsu",
  "12-dsu-complexity": "dsu complexity",
  "13-mst-prim-kruskal": "minimum spanning tree mst",
  "14-euler-path": "euler tour",
  "15-scc-tarjan-2sat": "strongly connected components and 2 sat",
  "16-lowlink-bridges-ap": "low link on undirected graphs",
  "17-graph-misc": "graph miscellaneous",
  "18-greedy-adhoc": "greedy",
  "19-backtracking": "backtracking",
  "20-dp": "dp",
  "23-divide-conquer": "divide and conquer",
  "24-binary-ternary-search": "binary search and ternary search",
  "25-stl-cpp": "stls",
};

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return [fullPath];
  });
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\+/g, " plus ")
    .replace(/2sat/g, "2 sat")
    .replace(/2-sat/g, "2 sat")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function htmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toTitle(baseName) {
  if (titleOverrides[baseName]) return titleOverrides[baseName];
  return baseName
    .replace(/^\d+-/, "")
    .split("-")
    .map((part) => {
      const upper = part.toUpperCase();
      if (["BFS", "DFS", "DSU", "DP", "MST", "SCC", "STL", "PBDS", "BIT"].includes(upper)) return upper;
      if (part === "cpp") return "C++";
      if (part === "apsp") return "APSP";
      if (part === "2d") return "2D";
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

function sequenceFor(number, category) {
  if (category === "Graphs") return "Graph Foundations";
  if (category === "Paradigms") return "Algorithmic Paradigms";
  if (category === "Data Structures") return number <= 29 ? "Core Data Structures" : "Advanced Data Structures";
  if (category === "Geometry") return "Geometry Track";
  return "Library Track";
}

function inferTags(baseName, title, category) {
  const tags = new Set([
    category,
    ...baseName.replace(/^\d+-/, "").split("-"),
    ...normalize(title).split(" "),
  ]);

  const add = (...items) => items.forEach((item) => tags.add(item));
  if (baseName.includes("segtree")) add("segment", "tree", "segment tree", "range query");
  if (baseName === "05-sp-intro" || baseName.includes("dijkstra") || baseName.includes("bellman") || baseName.includes("floyd") || baseName.includes("johnson")) add("shortest path", "path", "weighted graph");
  if (baseName.includes("apsp")) add("apsp", "all pairs shortest path");
  if (baseName.includes("mst")) add("mst", "minimum spanning tree", "prim", "kruskal");
  if (baseName.includes("scc") || baseName.includes("2sat")) add("scc", "2-sat", "2 sat", "tarjan");
  if (baseName.includes("lowlink")) add("low link", "bridges", "articulation points");
  if (baseName.includes("fenwick")) add("bit", "fenwick tree", "binary indexed tree");
  if (baseName.includes("stl")) add("stl", "c++", "cpp", "standard template library");
  if (baseName.includes("pbds")) add("pbds", "policy based data structures");
  if (baseName.includes("mo-")) add("mo", "offline queries");
  if (baseName.includes("treap")) add("treap", "randomized tree");
  if (baseName.includes("geometry") || category === "Geometry") add("geometry", "computational geometry");
  return Array.from(tags).filter(Boolean).sort((a, b) => a.localeCompare(b));
}

function descriptionFor(topic) {
  return `Filename-derived ${topic.category} lesson covering ${topic.title}.`;
}

function pageShell({ page, title, description, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${htmlEscape(description)}">
  <title>${htmlEscape(title)}</title>
  <link rel="stylesheet" href="assets/css/portal.css">
</head>
<body data-page="${htmlEscape(page)}">
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="site-shell">
    ${header("")}
    <main id="main">
${body}
    </main>
    ${footer("")}
  </div>
  <script src="assets/js/topics-data.js"></script>
  <script src="assets/js/portal.js"></script>
  <script src="assets/js/search.js"></script>
</body>
</html>
`;
}

function header(prefix) {
  return `<header class="site-header">
      <div class="nav-wrap">
        <a class="brand-link" href="${prefix}index.html" aria-label="Senior 2026 CP Library home">
          <span class="brand-mark">CA</span>
          <span class="brand-name"><strong>Senior 2026 CP Library</strong><span>Coach Academy</span></span>
        </a>
        <button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false">Menu</button>
        <nav class="nav-links" data-nav-links aria-label="Primary navigation">
          <a class="nav-link" data-page="home" href="${prefix}index.html">Home</a>
          <a class="nav-link" data-page="topics" href="${prefix}topics.html">Topics</a>
          <a class="nav-link" data-page="videos" href="${prefix}videos.html">Videos</a>
          <a class="nav-link" data-page="roadmap" href="${prefix}roadmap.html">Roadmap</a>
          <a class="nav-link" data-page="about" href="${prefix}about.html">About</a>
          <button class="theme-toggle" type="button" data-theme-toggle><span data-theme-label>Dark</span> Mode</button>
        </nav>
      </div>
    </header>`;
}

function footer(prefix) {
  return `<footer class="footer">
      <div class="container footer-grid">
        <div>
          <strong>Coach Abdelwahab &amp; Ashraf Senior 2026 Competitive Programming Library</strong>
          <p>© 2026 Coach Academy. All rights reserved.</p>
        </div>
        <div>
          <strong>Contact</strong>
          <div class="footer-links">
            <a href="mailto:coach@coach-academy.net">coach@coach-academy.net</a>
            <a href="mailto:wahab@acpc.global">wahab@acpc.global</a>
            <a href="mailto:m.abdelwahab@fci-cu.edu.eg">m.abdelwahab@fci-cu.edu.eg</a>
            <a href="https://www.linkedin.com/in/cewatlac/">Ashraf / Coach Academy LinkedIn</a>
            <a href="https://www.linkedin.com/in/mohamed-mahmoud-abd-el-wahab-mohamed-abd-el-moneim-mahmoud-6944152/">Coach Abdelwahab LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>`;
}

function topicCard(topic) {
  return `<article class="topic-card" data-topic-card data-topic-id="${topic.id}" data-category="${htmlEscape(topic.category)}" data-sequence="${htmlEscape(topic.sequence)}" data-search="${htmlEscape(topic.searchText)}">
      <div class="topic-meta">
        <span class="number-badge">${topic.number}</span>
        <span>${htmlEscape(topic.category)}</span>
        <span>${htmlEscape(topic.sequence)}</span>
      </div>
      <div>
        <h3>${htmlEscape(topic.title)}</h3>
        <p>${htmlEscape(topic.description)}</p>
      </div>
      <div class="topic-meta">
        ${topic.hasVideo ? '<span class="status-badge video">Video available</span>' : '<span class="status-badge soon">Video coming soon</span>'}
      </div>
      <div class="actions">
        <a class="button primary" href="${topic.wrapperPath}">Open Tutorial</a>
        ${topic.hasVideo ? `<a class="button" href="${topic.videoUrl}">Watch Video</a>` : '<span class="button ghost" aria-label="Video slot reserved">Video Slot Reserved</span>'}
      </div>
    </article>`;
}

function videoRow(topic) {
  return `<article class="video-row" data-video-row data-search="${htmlEscape(topic.searchText)}">
      <span class="number-badge">${topic.number}</span>
      <div>
        <div class="video-meta"><span>${htmlEscape(topic.category)}</span><span>${topic.hasVideo ? "Video linked" : "Coming soon"}</span></div>
        <h3>${htmlEscape(topic.title)}</h3>
        <p>${topic.hasVideo ? htmlEscape(topic.videoTitle) : "Video slot reserved / Coming soon"}</p>
      </div>
      <div class="actions">
        <a class="button primary" href="${topic.wrapperPath}">Tutorial</a>
        ${topic.hasVideo ? `<a class="button" href="${topic.videoUrl}">Watch Video</a>` : '<span class="status-badge soon">Coming Soon</span>'}
      </div>
    </article>`;
}

function buildIndex(topics, categories) {
  const videoCount = topics.filter((topic) => topic.hasVideo).length;
  const latest = [...topics].sort((a, b) => b.order - a.order).slice(0, 6);
  const categoryCards = categories.map((category) => {
    const count = topics.filter((topic) => topic.category === category).length;
    return `<a class="category-card" href="topics.html#${category.toLowerCase().replaceAll(" ", "-")}">
      <h3>${htmlEscape(category)}</h3>
      <p>${htmlEscape(categoryDescriptions[category])}</p>
      <span class="category-count">${count} topics</span>
    </a>`;
  }).join("\n");

  return pageShell({
    page: "home",
    title: "Coach Abdelwahab & Ashraf Senior 2026 Competitive Programming Library",
    description: "Senior 2026 Competitive Programming training portal by Coach Abdelwahab and Ashraf under Coach Academy.",
    body: `      <section class="hero">
        <div class="container hero-grid">
          <div>
            <p class="eyebrow">Coach Abdelwahab · Ashraf · Coach Academy</p>
            <h1>Coach Abdelwahab &amp; Ashraf Senior 2026 Competitive Programming Library</h1>
            <p class="lead">A structured public competitive programming learning portal for Senior 2026 training, organized into navigable HTML tutorials, video slots, and expansion-ready tracks.</p>
            <div class="actions">
              <a class="button primary" href="topics.html">Browse Topics</a>
              <a class="button" href="videos.html">Watch Videos</a>
              <a class="button ghost" href="about.html">About the Program</a>
            </div>
          </div>
          <div class="search-panel" role="search">
            <label class="search-label" for="home-search">Search the library</label>
            <input class="search-input" id="home-search" data-home-search type="search" placeholder="Try BFS, DSU, shortest path, segment tree, geometry">
            <div class="quick-results" data-quick-results></div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container metrics-grid">
          <div class="metric-card"><strong>${topics.length}</strong><span>topics</span></div>
          <div class="metric-card"><strong>${categories.length}</strong><span>categories</span></div>
          <div class="metric-card"><strong>${videoCount}</strong><span>video links available</span></div>
          <div class="metric-card"><strong>${topics.length - videoCount}</strong><span>coming-soon video slots</span></div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head">
            <div><h2>Featured Categories</h2><p>Follow the same sequence used by the Senior 2026 training library.</p></div>
            <a class="button" href="topics.html">Open full browser</a>
          </div>
          <div class="category-grid">${categoryCards}</div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head">
            <div><h2>Recently Added Topics</h2><p>The newest files discovered from the uploaded tutorial archive.</p></div>
          </div>
          <div class="topic-grid">${latest.map(topicCard).join("\n")}</div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head"><div><h2>Learning Path Preview</h2><p>A compact view of the main training flow.</p></div></div>
          <div class="learning-path">
            <a class="path-step" href="topics.html#graphs"><strong>1. Graphs</strong><span>Build traversal, connectivity, and shortest-path foundations.</span></a>
            <a class="path-step" href="topics.html#paradigms"><strong>2. Paradigms</strong><span>Practice search, greedy, DP, and divide-and-conquer techniques.</span></a>
            <a class="path-step" href="topics.html#data-structures"><strong>3. Data Structures</strong><span>Move from STL and BITs into advanced segment trees and treaps.</span></a>
            <a class="path-step" href="topics.html#geometry"><strong>4. Geometry</strong><span>Finish with robust computational geometry building blocks.</span></a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container notice">
          <h2>More Topics Coming Soon</h2>
          <p>The portal is ready for new tutorials, video links, problem sheets, contests, editorials, prerequisites, and learning tracks as Senior 2026 grows.</p>
          <div class="actions"><a class="button primary" href="roadmap.html">View Roadmap</a></div>
        </div>
      </section>`
  });
}

function buildTopics(topics, categories) {
  const categoryChips = ["All", ...categories].map((category) => `<button class="chip ${category === "All" ? "active" : ""}" type="button" data-category-filter="${htmlEscape(category)}">${htmlEscape(category)}</button>`).join("\n");
  const sequences = ["All", ...Array.from(new Set(topics.map((topic) => topic.sequence)))];
  const sequenceChips = sequences.map((sequence) => `<button class="chip ${sequence === "All" ? "active" : ""}" type="button" data-sequence-filter="${htmlEscape(sequence)}">${htmlEscape(sequence)}</button>`).join("\n");

  return pageShell({
    page: "topics",
    title: "Topics | Senior 2026 CP Library",
    description: "Search and browse every Senior 2026 Competitive Programming HTML tutorial.",
    body: `      <section class="page-hero">
        <div class="container">
          <div class="crumbs"><a href="index.html">Home</a><span>/</span><span>Topics</span></div>
          <h1 class="page-title">Topic Browser</h1>
          <p class="lead">Every tutorial file imported from the uploaded HTML archive is reachable here through wrapper pages with Previous and Next navigation.</p>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="topic-toolbar">
            <div class="search-panel" role="search">
              <label class="search-label" for="topic-search">Search topics</label>
              <input class="search-input" id="topic-search" data-topic-search type="search" placeholder="BFS, DSU, shortest path, segment tree, STL, geometry">
            </div>
            <div class="metric-card"><strong data-result-count>${topics.length} topics</strong><span>matching current filters</span></div>
          </div>
          <div class="filters" aria-label="Category filters">${categoryChips}</div>
          <div class="filters" aria-label="Sequence filters" style="margin-top:10px">${sequenceChips}</div>
          <div class="empty-state card" data-empty-state><h2>No topics found</h2><p>Try a different keyword or clear the filters.</p></div>
          <div class="topic-grid" style="margin-top:22px">${topics.map(topicCard).join("\n")}</div>
          <noscript>
            <div class="card">
              <h2>All Topic Links</h2>
              <ul>
                ${topics.map((topic) => `<li><a href="${topic.wrapperPath}">${topic.number}. ${htmlEscape(topic.title)}</a></li>`).join("\n")}
              </ul>
            </div>
          </noscript>
        </div>
      </section>`
  });
}

function buildVideos(topics, categories) {
  const sections = categories.map((category) => {
    const rows = topics.filter((topic) => topic.category === category).map(videoRow).join("\n");
    return `<section class="section" id="${category.toLowerCase().replaceAll(" ", "-")}">
        <div class="container">
          <div class="section-head"><div><h2>${htmlEscape(category)}</h2><p>${htmlEscape(categoryDescriptions[category])}</p></div></div>
          <div class="video-list">${rows}</div>
        </div>
      </section>`;
  }).join("\n");

  return pageShell({
    page: "videos",
    title: "Videos | Senior 2026 CP Library",
    description: "Video catalog for the Senior 2026 Competitive Programming tutorial library.",
    body: `      <section class="page-hero">
        <div class="container">
          <div class="crumbs"><a href="index.html">Home</a><span>/</span><span>Videos</span></div>
          <h1 class="page-title">Video Catalog</h1>
          <p class="lead">Known video links are matched to tutorial topics when available. Empty slots are reserved for future recordings.</p>
          <div class="topic-toolbar">
            <div class="search-panel" role="search">
              <label class="search-label" for="video-search">Search video slots</label>
              <input class="search-input" id="video-search" data-video-search type="search" placeholder="DFS, DP, MST, Graph, Data Structures">
            </div>
            <div class="metric-card"><strong data-result-count>${topics.length} video slots</strong><span>available and reserved</span></div>
          </div>
          <div class="empty-state card" data-empty-state><h2>No video slots found</h2><p>Try a different keyword.</p></div>
        </div>
      </section>
${sections}`
  });
}

function buildAbout() {
  return pageShell({
    page: "about",
    title: "About | Senior 2026 CP Library",
    description: "About the Senior 2026 Competitive Programming Library prepared by Coach Abdelwahab and Ashraf.",
    body: `      <section class="page-hero">
        <div class="container">
          <div class="crumbs"><a href="index.html">Home</a><span>/</span><span>About</span></div>
          <h1 class="page-title">About the Senior 2026 Library</h1>
          <p class="lead">A public, structured competitive programming library prepared for Senior 2026 training by Coach Abdelwahab and Ashraf under Coach Academy.</p>
        </div>
      </section>
      <section class="section">
        <div class="container roadmap-grid">
          <article class="card"><h2>Prepared By</h2><p>Coach Abdelwahab and Ashraf for Coach Academy's Senior 2026 Competitive Programming training program.</p></article>
          <article class="card"><h2>Purpose</h2><p>The library organizes algorithm, graph, data structure, paradigm, and geometry HTML tutorials into a searchable learning portal.</p></article>
          <article class="card"><h2>Expansion</h2><p>The structure is ready for future videos, topic prerequisites, problem sets, sheets, contests, editorials, and learning tracks.</p></article>
        </div>
      </section>
      <section class="section">
        <div class="container card">
          <h2>Contact and Profiles</h2>
          <div class="footer-links">
            <a href="mailto:coach@coach-academy.net">coach@coach-academy.net</a>
            <a href="mailto:wahab@acpc.global">wahab@acpc.global</a>
            <a href="mailto:m.abdelwahab@fci-cu.edu.eg">m.abdelwahab@fci-cu.edu.eg</a>
            <a href="https://www.linkedin.com/in/cewatlac/">Ashraf / Coach Academy LinkedIn</a>
            <a href="https://www.linkedin.com/in/mohamed-mahmoud-abd-el-wahab-mohamed-abd-el-moneim-mahmoud-6944152/">Coach Abdelwahab LinkedIn</a>
          </div>
        </div>
      </section>`
  });
}

function buildRoadmap(categories) {
  return pageShell({
    page: "roadmap",
    title: "Roadmap | Senior 2026 CP Library",
    description: "Future expansion roadmap for the Senior 2026 Competitive Programming Library.",
    body: `      <section class="page-hero">
        <div class="container">
          <div class="crumbs"><a href="index.html">Home</a><span>/</span><span>Roadmap</span></div>
          <h1 class="page-title">Roadmap</h1>
          <p class="lead">The current library is stable and static, with clear places to add future Senior 2026 training materials.</p>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="section-head"><div><h2>Current Categories</h2><p>The active tutorial tracks discovered from the archive.</p></div></div>
          <div class="category-grid">
            ${categories.map((category) => `<a class="category-card" href="topics.html#${category.toLowerCase().replaceAll(" ", "-")}"><h3>${htmlEscape(category)}</h3><p>${htmlEscape(categoryDescriptions[category])}</p></a>`).join("\n")}
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container roadmap-grid">
          <article class="card"><h2>Future Topics</h2><ul><li>Additional tutorials</li><li>Topic prerequisites</li><li>Learning tracks</li></ul></article>
          <article class="card"><h2>Practice Material</h2><ul><li>Problem sets</li><li>Sheets</li><li>Contests</li><li>Solution editorials</li></ul></article>
          <article class="card"><h2>Media</h2><ul><li>More videos</li><li>Updated video links</li><li>Reserved video slots for every topic</li></ul></article>
        </div>
      </section>`
  });
}

function build404() {
  return pageShell({
    page: "404",
    title: "Not Found | Senior 2026 CP Library",
    description: "Page not found in the Senior 2026 CP Library.",
    body: `      <section class="section">
        <div class="container not-found-panel">
          <p class="eyebrow">404</p>
          <h1 class="page-title">Page Not Found</h1>
          <p class="lead" style="margin-left:auto;margin-right:auto">This page is not part of the current Senior 2026 Competitive Programming Library.</p>
          <div class="actions" style="justify-content:center">
            <a class="button primary" href="index.html">Back to Home</a>
            <a class="button" href="topics.html">Browse Topics</a>
          </div>
        </div>
      </section>`
  });
}

function buildWrapper(topic, previous, next) {
  const prevLink = previous ? `<a class="button" href="${previous.finalFileName}">Previous</a>` : "";
  const nextLink = next ? `<a class="button" href="${next.finalFileName}">Next</a>` : "";
  const videoLink = topic.hasVideo ? `<a class="button" href="${topic.videoUrl}">Watch Video</a>` : `<span class="status-badge soon">Video Coming Soon</span>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${htmlEscape(topic.number)}. ${htmlEscape(topic.title)} | Senior 2026 CP Library</title>
  <link rel="stylesheet" href="../assets/css/portal.css">
</head>
<body data-page="topics">
  <div class="site-shell">
    ${header("../")}
    <main class="tutorial-frame-shell">
      <section class="tutorial-toolbar" aria-label="Tutorial navigation">
        <div class="tutorial-toolbar-inner">
          <div class="tutorial-title">
            <span><a href="../topics.html">Topics</a> / ${htmlEscape(topic.category)} / ${htmlEscape(topic.number)}</span>
            <strong>${htmlEscape(topic.title)}</strong>
          </div>
          <div class="tutorial-actions">
            <a class="button" href="../index.html">Home</a>
            <a class="button" href="../topics.html">Back to Topics</a>
            <a class="button" href="../${topic.path}">Open Original</a>
            ${videoLink}
            ${prevLink}
            ${nextLink}
          </div>
        </div>
      </section>
      <iframe class="tutorial-frame" title="${htmlEscape(topic.title)} tutorial" src="../${topic.path}"></iframe>
    </main>
  </div>
  <script src="../assets/js/portal.js"></script>
</body>
</html>
`;
}

function main() {
  const checksumFile = path.join(dataRoot, "tutorial-checksums.json");
  if (!fs.existsSync(checksumFile)) {
    throw new Error("Run tools/import-tutorials.js before generating topic data.");
  }

  const checksums = JSON.parse(fs.readFileSync(checksumFile, "utf8"));
  const checksumByPath = new Map(checksums.map((entry) => [entry.finalPath, entry]));
  const videos = JSON.parse(fs.readFileSync(path.join(dataRoot, "videos.json"), "utf8"));
  const videoByTitle = new Map(videos.map((video) => [normalize(video.title), video]));

  const tutorialFiles = walk(tutorialsRoot)
    .filter((file) => file.toLowerCase().endsWith(".html"))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const topics = tutorialFiles.map((file) => {
    const relativePath = path.relative(repoRoot, file).split(path.sep).join("/");
    const categorySlug = relativePath.split("/")[1];
    const category = categoryLabels[categorySlug];
    const finalFileName = path.basename(file);
    const baseName = finalFileName.replace(/\.html$/i, "");
    const number = Number((baseName.match(/^(\d+)/) || [0, 0])[1]);
    const title = toTitle(baseName);
    const matchKey = videoMatchByBaseName[baseName] || normalize(title);
    const video = videoByTitle.get(normalize(matchKey));
    const checksum = checksumByPath.get(relativePath);
    const topic = {
      id: baseName,
      number,
      originalFileName: checksum ? checksum.originalFileName : finalFileName,
      originalPath: checksum ? checksum.originalPath : "",
      finalFileName,
      title,
      category,
      path: relativePath,
      wrapperPath: `learn/${finalFileName}`,
      videoTitle: video ? video.title : "",
      videoUrl: video ? video.url : "",
      hasVideo: Boolean(video),
      order: number,
      sequence: sequenceFor(number, category),
      tags: inferTags(baseName, title, category),
      status: "available",
      futureVideoSlot: !video,
    };
    topic.description = descriptionFor(topic);
    topic.searchText = normalize([
      topic.title,
      topic.category,
      topic.sequence,
      topic.originalFileName,
      topic.finalFileName,
      topic.videoTitle,
      topic.tags.join(" "),
    ].join(" "));
    return topic;
  }).sort((a, b) => a.order - b.order);

  fs.mkdirSync(dataRoot, { recursive: true });
  fs.mkdirSync(jsRoot, { recursive: true });
  fs.mkdirSync(learnRoot, { recursive: true });

  fs.writeFileSync(path.join(dataRoot, "topics.json"), `${JSON.stringify(topics, null, 2)}\n`);
  fs.writeFileSync(
    path.join(jsRoot, "topics-data.js"),
    `window.SENIOR2026_TOPICS = ${JSON.stringify(topics, null, 2)};\nwindow.SENIOR2026_VIDEOS = ${JSON.stringify(videos, null, 2)};\n`
  );

  for (const oldWrapper of fs.readdirSync(learnRoot).filter((name) => name.endsWith(".html"))) {
    fs.rmSync(path.join(learnRoot, oldWrapper));
  }
  topics.forEach((topic, index) => {
    fs.writeFileSync(
      path.join(learnRoot, topic.finalFileName),
      buildWrapper(topic, topics[index - 1], topics[index + 1])
    );
  });

  const categories = ["Graphs", "Paradigms", "Data Structures", "Geometry"];
  fs.writeFileSync(path.join(repoRoot, "index.html"), buildIndex(topics, categories));
  fs.writeFileSync(path.join(repoRoot, "topics.html"), buildTopics(topics, categories));
  fs.writeFileSync(path.join(repoRoot, "videos.html"), buildVideos(topics, categories));
  fs.writeFileSync(path.join(repoRoot, "about.html"), buildAbout());
  fs.writeFileSync(path.join(repoRoot, "roadmap.html"), buildRoadmap(categories));
  fs.writeFileSync(path.join(repoRoot, "404.html"), build404());

  const matchedVideoUrls = new Set(topics.filter((topic) => topic.hasVideo).map((topic) => topic.videoUrl));
  const unmatchedVideos = videos.filter((video) => !matchedVideoUrls.has(video.url));
  if (unmatchedVideos.length) {
    console.warn(`Warning: ${unmatchedVideos.length} videos were not matched to tutorial topics.`);
  }

  console.log(`Generated ${topics.length} topics, ${topics.filter((topic) => topic.hasVideo).length} video matches, and ${topics.length} wrapper pages.`);
}

main();
